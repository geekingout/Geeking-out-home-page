/**
 * The hero's sky: an Upper East Side skyline at dusk, drawn entirely in two
 * WebGL programs. A full-screen fragment shader paints the haze and the
 * silhouette; a second pass lays a field of points over the river in front of
 * it, drifting on a wave and tilting with the pointer.
 *
 * Raw WebGL rather than three.js — two shaders and two buffers do not justify
 * a 600 kB dependency, and dropping it took three.js out of the bundle.
 *
 * Nothing here touches the DOM at import time; `mountSky` is called from an
 * effect, so the pre-render never sees it.
 */

export type Sky = {
    /** Re-measure the canvas and draw a frame. */
    kick: () => void;
    destroy: () => void;
};

export type SkyOptions = {
    reduced: boolean;
    /** 0 at the top of the hero, 1 once it has scrolled away. Read every frame. */
    scroll: () => number;
};

const NOISE = `float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}`;

const BG_VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const BG_FRAG = `precision highp float;uniform vec2 u_res;uniform float u_t;uniform vec2 u_m;${NOISE}
float box(float x,float c,float w,float hh){return abs(x-c)<w?hh:0.;}
float sky(float x){float hh=0.;
float id=floor(x/.03);hh=max(hh,hash(vec2(id,7.))*.11+.02);
float id2=floor(x/.016+.5);hh=max(hh,hash(vec2(id2,3.))*.07+.01);
hh=max(hh,box(x,.18,.045,.13));hh=max(hh,box(x,.18,.024,.23));hh=max(hh,box(x,.18,.013,.28));hh=max(hh,box(x,.18,.0035,.34));
float w=abs(x+.55);hh=max(hh,w<.03?.36-w*1.5:0.);hh=max(hh,box(x,-.55,.0025,.45));
hh=max(hh,box(x,.42,.03,.19));hh=max(hh,box(x,.42,.021,.23));hh=max(hh,box(x,.42,.013,.26));hh=max(hh,box(x,.42,.007,.29));hh=max(hh,box(x,.42,.002,.335));
hh=max(hh,box(x,-.22,.02,.2));hh=max(hh,box(x,-.22,.012,.24));
hh=max(hh,box(x,.68,.035,.17));hh=max(hh,box(x,-.8,.03,.16));hh=max(hh,box(x,.02,.018,.18));
return hh;}
void main(){vec2 uv=gl_FragCoord.xy/u_res;vec2 p=(gl_FragCoord.xy-.5*u_res)/u_res.y;float t=u_t*.045;
float asp=u_res.x/u_res.y;float xs=p.x*min(1.,1.78/asp)+u_m.x*.02;float hy=-.06;
vec2 q=vec2(fbm(p*1.5+t),fbm(p*1.5-t*.7+3.1));float f=fbm(p*2.1+q*1.5+u_m*.25);
vec3 col=vec3(.05,.033,.03);vec3 org=vec3(1.,.353,.122);vec3 red=vec3(.8,.16,.12);
float above=smoothstep(hy-.05,hy+.15,p.y);
col+=org*pow(f,2.3)*.55*above;col+=red*pow(q.y,3.)*.4*above;
col+=mix(org,red,.35)*exp(-(p.y-hy)*4.5)*.55*above;
col+=org*exp(-abs(p.x-.2)*1.2)*exp(-(p.y-hy)*7.)*.35*above;
float sh=sky(xs);float sil=step(p.y,hy+sh)*step(hy-.02,p.y);
vec3 dark=vec3(.035,.022,.02)+red*.06*smoothstep(.0,.4,sh)*(1.-smoothstep(hy,hy+sh,p.y));
col=mix(col,dark,sil);
col+=org*exp((p.y-hy)*9.)*step(p.y,hy)*.18;
col*=1.-.45*length(uv-.5);col+=(hash(gl_FragCoord.xy+fract(u_t))-.5)*.03;
gl_FragColor=vec4(col,1.);}`;

const PTS_VERT = `attribute vec2 a_g;uniform float u_t;uniform vec2 u_res;uniform vec2 u_m;uniform float u_s;varying float v_h;varying float v_d;
void main(){float x=a_g.x,z=a_g.y;
float h=sin(x*1.3+u_t*.6)*.16+sin(z*2.1-u_t*.9)*.14+sin((x+z)*3.+u_t*.5)*.07;
float pulse=exp(-pow(mod(z*4.-u_t*.55,4.)-2.,2.)*2.5);h+=pulse*.2;
vec3 P=vec3(x*6.,h-1.55,-z*12.-1.6);
float yaw=u_m.x*.22,pitch=-.14+u_m.y*.08;
P.xz=mat2(cos(yaw),-sin(yaw),sin(yaw),cos(yaw))*P.xz;P.yz=mat2(cos(pitch),-sin(pitch),sin(pitch),cos(pitch))*P.yz;
P.z-=u_s*3.;float w=-P.z;float f=1.6;float asp=u_res.x/u_res.y;
gl_Position=vec4(P.x*f/asp,P.y*f,w*.5,w);v_h=h+pulse;v_d=w;
gl_PointSize=clamp((u_res.y/320.)*(2.4+pulse*3.2)/(w*.11),1.,14.);}`;

const PTS_FRAG = `precision mediump float;varying float v_h;varying float v_d;
void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=smoothstep(.5,.12,d);
float k=clamp(v_h*1.4+.3,0.,1.5);vec3 col=mix(vec3(.42,.26,.22),vec3(1.,.5,.2),clamp(k,0.,1.));col=mix(col,vec3(1.,.82,.55),clamp(k-1.,0.,1.)*1.2);
float fog=clamp(1.-(v_d-2.)/12.5,.05,1.);gl_FragColor=vec4(col*a*fog*(.45+k*.28),1.);}`;

const NX = 170;
const NZ = 80;

/** How many points the river field carries — shown as a caption in the hero. */
export const SKY_POINTS = NX * NZ;

/**
 * Mounts the sky on a canvas. Returns null when WebGL is unavailable, and throws
 * if a shader fails to compile; the caller hides the canvas in either case and
 * the CSS gradient behind it carries the hero.
 */
export const mountSky = (cv: HTMLCanvasElement, opts: SkyOptions): Sky | null => {
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl || gl.isContextLost()) return null;

    const compile = (type: number, src: string) => {
        const sh = gl.createShader(type)!;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
        return sh;
    };
    const program = (v: string, f: string) => {
        const p = gl.createProgram()!;
        gl.attachShader(p, compile(gl.VERTEX_SHADER, v));
        gl.attachShader(p, compile(gl.FRAGMENT_SHADER, f));
        gl.linkProgram(p);
        return p;
    };

    const bg = program(BG_VERT, BG_FRAG);
    const pts = program(PTS_VERT, PTS_FRAG);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const grid = new Float32Array(NX * NZ * 2);
    let k = 0;
    for (let j = 0; j < NZ; j++) {
        for (let i = 0; i < NX; i++) {
            grid[k++] = (i / (NX - 1)) * 2 - 1;
            grid[k++] = j / (NZ - 1);
        }
    }
    const gbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gbuf);
    gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW);

    const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
    const ub = { res: U(bg, 'u_res'), t: U(bg, 'u_t'), m: U(bg, 'u_m') };
    const up = { res: U(pts, 'u_res'), t: U(pts, 'u_t'), m: U(pts, 'u_m'), s: U(pts, 'u_s') };
    const ab = gl.getAttribLocation(bg, 'a');
    const ap = gl.getAttribLocation(pts, 'a_g');

    let W = 0, H = 0, mx = 0, my = 0, tx = 0, ty = 0;
    let visible = true;
    let raf = 0;
    const t0 = performance.now();

    const size = () => {
        const dpr = Math.min(1.5, window.devicePixelRatio || 1);
        W = Math.floor(cv.clientWidth * dpr);
        H = Math.floor(cv.clientHeight * dpr);
        if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    };

    const frame = () => {
        raf = 0;
        if (!visible && !opts.reduced) return;
        size();
        mx += (tx - mx) * 0.05;
        my += (ty - my) * 0.05;
        const t = opts.reduced ? 12 : (performance.now() - t0) / 1000;

        gl.viewport(0, 0, W, H);
        gl.disable(gl.BLEND);
        gl.useProgram(bg);
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.enableVertexAttribArray(ab);
        gl.vertexAttribPointer(ab, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(ub.res, W, H);
        gl.uniform1f(ub.t, t);
        gl.uniform2f(ub.m, mx, my);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.useProgram(pts);
        gl.bindBuffer(gl.ARRAY_BUFFER, gbuf);
        gl.enableVertexAttribArray(ap);
        gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(up.res, W, H);
        gl.uniform1f(up.t, t);
        gl.uniform2f(up.m, mx, my);
        gl.uniform1f(up.s, opts.scroll());
        gl.drawArrays(gl.POINTS, 0, NX * NZ);

        if (!opts.reduced && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const wake = () => { if (!raf && visible && !document.hidden && !opts.reduced) raf = requestAnimationFrame(frame); };

    const onMove = (e: PointerEvent) => {
        const r = cv.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // Idle when scrolled out of view or the tab is in the background.
    const io = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; wake(); }, { threshold: 0 });
    io.observe(cv);
    document.addEventListener('visibilitychange', wake);

    frame();

    return {
        kick: () => { size(); if (!raf) raf = requestAnimationFrame(frame); },
        destroy: () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('visibilitychange', wake);
            io.disconnect();
            // The context is left alone on purpose: React's development double-mount reuses
            // the same canvas, and a context that was forced lost cannot compile a shader.
            // The canvas itself is discarded with the page on navigation.
        },
    };
};
