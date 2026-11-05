/**
 * Geeking Out lead collector.
 *
 * Google Apps Script web app bound to the "geeking out landing page" spreadsheet
 * (Apps Script project "geeking out lead generation"). The contact form on
 * geekingout.net POSTs a JSON body here; this appends one row per lead.
 *
 * This file is the source of truth. To ship a change: paste it over Code.gs in the
 * Apps Script editor, save, then Deploy → Manage deployments → edit "Lead Collector"
 * → Version: New version → Deploy. Creating a *new* deployment changes the URL, which
 * would orphan the site, so always update the existing one.
 *
 * Sheet layout (Sheet1):
 *   A Timestamp (server time)   B Source      C Name     D Email
 *   E Description               F Organization
 *   G Status                    H Submission ID
 * Rows written before November 2026 only have A–E, with column E holding whichever
 * of description/organization was sent. They are never touched.
 *
 * Anything that looks like spam, repeats too fast, or trips the honeypot is written to
 * the "Needs review" sheet with a reason instead of being dropped, so nothing real is
 * lost silently. The client is told "ok" in those cases: a bot gets no signal, and a
 * mis-flagged human still gets read.
 */

var LEADS_SHEET = 'Sheet1';
var REVIEW_SHEET = 'Needs review';

var HEADERS = ['Timestamp', 'Source', 'Name', 'Email', 'Description', 'Organization', 'Status', 'Submission ID'];
var REVIEW_HEADERS = HEADERS.concat(['Reason']);
var TIMESTAMP_FORMAT = 'M/d/yyyy", "h:mm:ss am/pm';

var LIMITS = { name: 120, email: 254, organization: 200, description: 5000, source: 60, submissionId: 64 };

// A lead with the same email + description inside this window is a retry, not a new lead.
var DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
var DUPLICATE_SCAN_ROWS = 30;
// Past these, further submissions still land in "Needs review" rather than Sheet1.
var RATE_PER_EMAIL = { max: 5, windowSeconds: 3600 };
var RATE_GLOBAL = { max: 60, windowSeconds: 3600 };
// A human needs at least this long between opening the form and sending it.
var MIN_FILL_MS = 3000;
var SPAM_THRESHOLD = 2;

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

function doPost(e) {
  var result;
  try {
    var parsed = parseBody(e);
    result = parsed.error ? parsed : handleSubmission(parsed.data);
  } catch (err) {
    console.error('doPost failed: ' + (err && err.stack ? err.stack : err));
    result = { ok: false, code: 'server_error', error: 'We could not save your message. Please try again in a moment.' };
  }
  return jsonOutput(result);
}

// Health check; the form never GETs.
function doGet() {
  return jsonOutput({ ok: true, service: 'geeking-out-leads', accepts: 'POST' });
}

// ---------------------------------------------------------------------------
// Request handling
// ---------------------------------------------------------------------------

function parseBody(e) {
  var raw = e && e.postData && e.postData.contents;
  if (raw) {
    try {
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('not an object');
      return { data: data };
    } catch (err) {
      return { ok: false, code: 'bad_request', error: 'The request body was not valid JSON.' };
    }
  }
  // Fallback for application/x-www-form-urlencoded posts.
  if (e && e.parameter && Object.keys(e.parameter).length) return { data: e.parameter };
  return { ok: false, code: 'bad_request', error: 'Empty request.' };
}

function handleSubmission(data) {
  var lead = {
    source: clean(data.source, LIMITS.source) || 'Contact Form',
    name: clean(data.name, LIMITS.name),
    email: clean(data.email, LIMITS.email).toLowerCase(),
    organization: clean(data.organization, LIMITS.organization),
    description: clean(data.description, LIMITS.description) || clean(data.projectDescription, LIMITS.description) || clean(data.message, LIMITS.description),
    submissionId: clean(data.submissionId, LIMITS.submissionId),
  };
  var honeypot = clean(data.website, 200) || clean(data.company_url, 200);
  var elapsedMs = Number(data.elapsedMs);

  var fields = validate(lead);
  if (Object.keys(fields).length) {
    return { ok: false, code: 'validation', error: 'Please check the highlighted fields.', fields: fields };
  }

  if (!lead.submissionId) lead.submissionId = Utilities.getUuid();
  if (!/^[A-Za-z0-9_-]+$/.test(lead.submissionId)) lead.submissionId = Utilities.getUuid();

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return { ok: false, code: 'busy', error: 'The server is busy. Please try again in a moment.' };
  }
  try {
    var cache = CacheService.getScriptCache();

    // 1. Exact retry of a submission we already stored (e.g. the first response was lost).
    var seen = cache.get('sub:' + lead.submissionId);
    if (seen) return { ok: true, id: lead.submissionId, duplicate: true };

    // 2. Same person, same message, within the window: an accidental double send.
    var fingerprint = 'fp:' + sha256(lead.email + '\n' + lead.description + '\n' + lead.name);
    if (cache.get(fingerprint) || recentlyStored(lead)) {
      cache.put('sub:' + lead.submissionId, '1', 21600);
      return { ok: true, id: lead.submissionId, duplicate: true };
    }

    // 3. Decide where it goes.
    var reasons = [];
    if (honeypot) reasons.push('honeypot filled');
    if (!isNaN(elapsedMs) && elapsedMs >= 0 && elapsedMs < MIN_FILL_MS) reasons.push('submitted in ' + Math.round(elapsedMs) + 'ms');
    var spam = spamSignals(lead);
    if (spam.score >= SPAM_THRESHOLD) reasons.push('spam score ' + spam.score + ': ' + spam.signals.join(', '));
    if (!bump(cache, 'rate:email:' + sha256(lead.email), RATE_PER_EMAIL)) reasons.push('more than ' + RATE_PER_EMAIL.max + ' submissions from this email in an hour');
    if (!bump(cache, 'rate:global', RATE_GLOBAL)) reasons.push('more than ' + RATE_GLOBAL.max + ' submissions site-wide in an hour');

    var now = new Date();
    if (reasons.length) {
      appendLead(reviewSheet(), REVIEW_HEADERS, [now, lead.source, lead.name, lead.email, lead.description, lead.organization, 'review', lead.submissionId, reasons.join('; ')]);
    } else {
      appendLead(leadsSheet(), HEADERS, [now, lead.source, lead.name, lead.email, lead.description, lead.organization, 'ok', lead.submissionId]);
    }
    SpreadsheetApp.flush();

    cache.put('sub:' + lead.submissionId, '1', 21600);
    cache.put(fingerprint, '1', Math.ceil(DUPLICATE_WINDOW_MS / 1000));
    return { ok: true, id: lead.submissionId };
  } finally {
    lock.releaseLock();
  }
}

function validate(lead) {
  var fields = {};
  if (!lead.name) fields.name = 'Please tell us your name.';
  if (!lead.email) fields.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(lead.email)) fields.email = 'That email address does not look right.';
  if (!lead.description) fields.projectDescription = 'Please describe your project.';
  return fields;
}

// ---------------------------------------------------------------------------
// Spam heuristics. Each signal is one point; see SPAM_THRESHOLD.
// Tuned against the bot traffic this sheet actually received: a random
// mixed-case name, a random mixed-case description, and a g.m.a.i.l address.
// ---------------------------------------------------------------------------

function spamSignals(lead) {
  var signals = [];
  if (looksRandom(lead.name)) signals.push('random name');
  if (looksRandom(lead.description)) signals.push('random description');
  if (lead.organization && looksRandom(lead.organization)) signals.push('random organization');
  var local = lead.email.split('@')[0];
  if ((local.match(/\./g) || []).length >= 3) signals.push('dotted email');
  var urls = lead.description.match(/https?:\/\/\S+/gi) || [];
  if (urls.length >= 2) signals.push('multiple links');
  if (urls.length === 1 && lead.description.replace(/https?:\/\/\S+/gi, '').trim().length < 20) signals.push('link only');
  if (/\[url=|\[link=|<a\s+href/i.test(lead.description)) signals.push('markup');
  return { score: signals.length, signals: signals };
}

// One unbroken run of letters with the case flipping back and forth: "ygQMQPcoddfJvhYlMiCOfu".
function looksRandom(s) {
  if (!s || /\s/.test(s) || s.length < 12 || !/^[A-Za-z]+$/.test(s)) return false;
  var flips = 0;
  for (var i = 1; i < s.length; i++) {
    var a = s[i - 1] === s[i - 1].toUpperCase(), b = s[i] === s[i].toUpperCase();
    if (a !== b) flips++;
  }
  var vowels = (s.match(/[aeiouAEIOU]/g) || []).length;
  return flips >= 5 || vowels / s.length < 0.15;
}

// ---------------------------------------------------------------------------
// Sheet access
// ---------------------------------------------------------------------------

function leadsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(LEADS_SHEET) || ss.getSheets()[0];
}

function reviewSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(REVIEW_SHEET) || ss.insertSheet(REVIEW_SHEET);
}

// Writes any header cells that are still blank, then appends the row. Existing header
// text is left alone except the legacy "Organization/Description" label on column E,
// which is renamed and annotated so the new columns make sense.
function appendLead(sheet, headers, row) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    var existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    for (var i = 0; i < headers.length; i++) {
      if (existing[i] === '' || existing[i] === null) sheet.getRange(1, i + 1).setValue(headers[i]);
    }
    if (existing[4] === 'Organization/Description') {
      sheet.getRange(1, 5).setValue('Description')
        .setNote('Before November 2026 this column held whichever of description/organization the form sent. Since then, description only; organization is in column F.');
    }
  }
  sheet.appendRow(row);
  sheet.getRange(sheet.getLastRow(), 1).setNumberFormat(TIMESTAMP_FORMAT);
}

// Looks at the newest rows for the same email and description inside the duplicate
// window, covering the case where the cache was evicted between two quick sends.
function recentlyStored(lead) {
  var sheet = leadsSheet();
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var count = Math.min(DUPLICATE_SCAN_ROWS, last - 1);
  var rows = sheet.getRange(last - count + 1, 1, count, 5).getValues();
  var cutoff = Date.now() - DUPLICATE_WINDOW_MS;
  for (var i = rows.length - 1; i >= 0; i--) {
    var ts = rows[i][0] instanceof Date ? rows[i][0].getTime() : Date.parse(rows[i][0]);
    if (isNaN(ts) || ts < cutoff) continue;
    if (String(rows[i][3]).trim().toLowerCase() === lead.email && String(rows[i][4]).trim() === lead.description) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clean(value, max) {
  if (value === null || value === undefined) return '';
  var s = String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  return s.length > max ? s.slice(0, max) : s;
}

// Increments a counter in the cache; false once it passes limit.max in the window.
function bump(cache, key, limit) {
  var n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), limit.windowSeconds);
  return n <= limit.max;
}

function sha256(s) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// Maintenance. Run by hand from the editor, never called by the web app.
// ---------------------------------------------------------------------------

// Deletes rows whose email is @geekingout.test (a reserved domain no real lead can
// have) from both sheets, bottom-up so indexes stay valid. Logs what it removed.
function deleteTestRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var removed = 0;
  [LEADS_SHEET, REVIEW_SHEET].forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet || sheet.getLastRow() < 2) return;
    var emails = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1).getValues();
    for (var i = emails.length - 1; i >= 0; i--) {
      if (/@geekingout\.test$/i.test(String(emails[i][0]).trim())) {
        sheet.deleteRow(i + 2);
        removed++;
      }
    }
  });
  console.log('deleteTestRows removed ' + removed + ' row(s)');
  return removed;
}
