// The contact form is the only data path on the site. On submit it POSTs JSON to a Google Apps
// Script web app that appends a row to a spreadsheet. Nothing else on the site talks to a server.
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwXWaVr52KdOf0bQHL21kG2vFyNZyOrsYYRv5_Bj1wIMxWx5bs7e9UuqIx7nE6G6qEkjw/exec";

export type ContactPayload = {
    source: string;
    name: string;
    email: string;
    organization: string;
    projectDescription: string;
};

// Resolves to true when the POST left the browser without a network error. Because the request
// is sent no-cors the response is opaque, so this cannot confirm the Apps Script actually wrote
// the row — it only rules out the user being offline or the endpoint being unreachable.
export async function sendToGoogleSheets(data: ContactPayload): Promise<boolean> {
    const payload = {
        timestamp: new Date().toLocaleString(),
        source: data.source,
        name: data.name,
        email: data.email,
        organization: data.organization,
        // The form field is named projectDescription; mirror it into `description` so the sheet
        // gets the text whichever of the two column names the Apps Script reads.
        description: data.projectDescription,
        projectDescription: data.projectDescription,
    };

    try {
        // mode: 'no-cors' is necessary for Google Apps Script web apps. It also restricts
        // Content-Type to the safelisted values, so send text/plain — Apps Script reads the raw
        // body via e.postData.contents either way. Declaring application/json here gets dropped.
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
        });
        return true;
    } catch (error) {
        console.error("Error sending to Google Sheets:", error);
        return false;
    }
}
