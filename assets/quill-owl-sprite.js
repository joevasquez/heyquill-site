// quill-owl-sprite.js
// Framework-agnostic renderer for the Quill owl avatar.
// Pure canvas 2D — no images, no DOM, no dependencies. Extracted verbatim from
// the HTML design reference (Quill Owl.dc.html) so pixel output is identical.
//
//   import { drawOwl, cycle, SPRITE_SIZE } from './quill-owl-sprite.js';
//
//   const ctx = canvas.getContext('2d');
//   ctx.imageSmoothingEnabled = false;        // canvas must also be CSS image-rendering: pixelated
//   const px = canvas.width / SPRITE_SIZE;    // MUST be a whole number (1, 2, 3, ...)
//   function frame(ms) {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     drawOwl(ctx, px, ms / 1000, 'writing', { accent: '#c96a4b', feathers: 'Warm buff' });
//     requestAnimationFrame(frame);
//   }
//
// `t` is elapsed seconds since the avatar mounted — a single monotonic clock.
// Never reset it on a mode change; every state loops on its own period so the
// animation stays continuous when the mode switches.
//
// modes: 'ready' | 'writing' | 'working'
// opts:  { accent?: string, feathers?: 'Warm buff'|'Ash grey'|'Blue slate', pixelGrid?: boolean }
//
// cycle(mode) returns that state's loop length in seconds — use it to render a
// seamless sprite sheet: frame i of n is drawOwl(ctx, px, i * cycle(mode) / n, mode).

export const SPRITE_SIZE = 48;

const S = 48;
const TAU = Math.PI * 2;

function grid(w, h) { return Array.from({ length: h }, () => new Array(w).fill('.')); }
function put(g, x, y, c) {
  x = Math.round(x); y = Math.round(y);
  const r = g[y]; if (r && x >= 0 && x < r.length) r[x] = c;
}
function fillEll(g, cx, cy, rx, ry, c, only) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy > 1) continue;
      if (only) { const r = g[y]; if (!r || only.indexOf(r[x]) < 0) continue; }
      put(g, x, y, c);
    }
  }
}
function fillBox(g, x0, y0, x1, y1, c) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, c);
}
function ringEll(g, cx, cy, r0, r1, c) {
  for (let y = Math.floor(cy - r1); y <= Math.ceil(cy + r1); y++) {
    for (let x = Math.floor(cx - r1); x <= Math.ceil(cx + r1); x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= r1 && d >= r0) put(g, x, y, c);
    }
  }
}
function outline(g, c) {
  const src = g.map(r => r.slice());
  for (let y = 0; y < g.length; y++) {
    for (let x = 0; x < g[y].length; x++) {
      if (src[y][x] !== '.') continue;
      const n = [src[y][x - 1], src[y][x + 1], src[y - 1] && src[y - 1][x], src[y + 1] && src[y + 1][x]];
      if (n.some(v => v && v !== '.')) g[y][x] = c;
    }
  }
}

const EYE = { lx: 14, rx: 33, y: 25, r: 5.5 };
const PAPER = { x0: 13, x1: 34, y0: 38 };
const INK_X = 16;
const INK_ROWS = [41, 43, 45];
const INK_LEN = [13, 13, 8];
const TRANSCRIPT = 'Move the Thursday draft into the archive and flag it for review.';
const LINE_DUR = 1.15, PAUSE_DUR = 0.7;
const WRITE_CYCLE = INK_ROWS.length * LINE_DUR + PAUSE_DUR;
const WORK_CYCLE = 2.4;
const READY_CYCLE = 3.6;

const BODY = (() => {
  const g = grid(S, S);
  fillEll(g, 23.5, 47, 18, 14, 'f');
  fillEll(g, 8, 45, 5.5, 10, 'd', ['f']);
  fillEll(g, 39, 45, 5.5, 10, 'd', ['f']);
  put(g, 17, 36, 'd'); put(g, 30, 36, 'd'); put(g, 23.5, 35, 'd');
  fillBox(g, PAPER.x0, PAPER.y0, PAPER.x1, 47, 'W');
  fillBox(g, PAPER.x0 + 1, PAPER.y0 + 1, PAPER.x1 - 1, 47, 'w');
  outline(g, 'k');
  return g;
})();

const HEAD = (() => {
  const g = grid(S, S);
  fillEll(g, 9, 18, 3.6, 5.4, 'f');
  fillEll(g, 38, 18, 3.6, 5.4, 'f');
  fillEll(g, 23.5, 26, 17, 11.5, 'f');
  fillEll(g, 23.5, 27, 14, 9.5, 'F', ['f']);
  fillEll(g, EYE.lx, EYE.y, EYE.r, EYE.r, 'e');
  fillEll(g, EYE.rx, EYE.y, EYE.r, EYE.r, 'e');
  fillBox(g, 21, 27, 26, 28, 'y');
  fillBox(g, 22, 29, 25, 29, 'y');
  fillBox(g, 23, 30, 24, 31, 'o');
  fillEll(g, 10.5, 31.5, 3, 1.8, 'c', ['F', 'f']);
  fillEll(g, 36.5, 31.5, 3, 1.8, 'c', ['F', 'f']);
  ringEll(g, EYE.rx, EYE.y, 6.3, 7.4, 'g');
  [[38, 31], [38, 32], [37, 33], [37, 34]].forEach(([x, y]) => put(g, x, y, 'g'));
  fillBox(g, 16, 3, 31, 13, 'h');
  fillBox(g, 16, 3, 31, 4, 'H');
  fillBox(g, 16, 8, 31, 10, 'b');
  fillEll(g, 23.5, 13.5, 14, 2.7, 'h');
  fillEll(g, 23.5, 12.2, 14, 0.9, 'H');
  outline(g, 'k');
  return g;
})();

const QUILL = (() => {
  const g = grid(16, 9);
  for (let i = 0; i <= 30; i++) {
    const s = i / 30;
    put(g, 1 + s * 6, 6 - s * 3, 'Z');
    put(g, 1 + s * 6, 7 - s * 3, 'Z');
  }
  fillEll(g, 11, 2.6, 4.8, 2.6, 'Q');
  fillEll(g, 11.8, 3.3, 3.9, 1.6, 'q', ['Q']);
  for (let i = 0; i <= 24; i++) { const s = i / 24; put(g, 7 + s * 8, 4 - s * 2.4, 'Z'); }
  put(g, 0, 8, 'n'); put(g, 1, 8, 'n'); put(g, 0, 7, 'n'); put(g, 1, 7, 'n');
  outline(g, 'k');
  return g;
})();
const QUILL_TIP = [0, 8];

const TONES = {
  'Warm buff': { f: '#c99a63', F: '#f3dcb4', d: '#9c7345' },
  'Ash grey': { f: '#b5ab99', F: '#ede7d9', d: '#867d6c' },
  'Blue slate': { f: '#94a1b6', F: '#dce4ef', d: '#6b7890' }
};

export function palette(opts = {}) {
    const tone = TONES[opts.feathers] || TONES['Warm buff'];
    return {
      k: '#241d2c', h: '#3a3350', H: '#544a6e', b: opts.accent || '#c96a4b',
      e: '#fffaf0', y: '#f0a83c', o: '#c0741f', g: '#ffd97a', c: '#e5a08c',
      w: '#f8f3e6', W: '#d8d0bd', Q: '#fdfaf2', q: '#d4c7ab', Z: '#7d6a4e', n: '#2b2320',
      f: tone.f, F: tone.F, d: tone.d
    };
  }

export function cycle(mode) { return mode === 'writing' ? WRITE_CYCLE : mode === 'working' ? WORK_CYCLE * 2 : READY_CYCLE; }

function blit(ctx, g, ox, oy, px, pal) {
    for (let y = 0; y < g.length; y++) {
      const row = g[y];
      for (let x = 0; x < row.length; x++) {
        const c = row[x]; if (c === '.') continue;
        const col = pal[c]; if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect((ox + x) * px, (oy + y) * px, px, px);
      }
    }
  }

function rect(ctx, x, y, w, h, px, col) { ctx.fillStyle = col; ctx.fillRect(x * px, y * px, w * px, h * px); }

function disc(ctx, cx, cy, r, px, col) {
    ctx.fillStyle = col;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      const h = r * r - (y - cy) * (y - cy);
      if (h < 0) continue;
      const hw = Math.sqrt(h);
      const x0 = Math.round(cx - hw), x1 = Math.round(cx + hw);
      ctx.fillRect(x0 * px, y * px, (x1 - x0 + 1) * px, px);
    }
  }

function sparkle(ctx, cx, cy, px, pal, big) {
    const x = Math.round(cx), y = Math.round(cy);
    ctx.fillStyle = pal.g;
    ctx.fillRect(x * px, (y - 1) * px, px, 3 * px);
    ctx.fillRect((x - 1) * px, y * px, 3 * px, px);
    if (big) {
      ctx.fillRect(x * px, (y - 2) * px, px, px);
      ctx.fillRect(x * px, (y + 2) * px, px, px);
      ctx.fillRect((x - 2) * px, y * px, px, px);
      ctx.fillRect((x + 2) * px, y * px, px, px);
    }
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(x * px, y * px, px, px);
  }

export function drawOwl(ctx, px, t, mode, opts = {}) {
    const pal = palette(opts);
    const R = Math.round;
    const cyc = cycle(mode);

    // --- blink ---
    const bp = (t % cyc) / cyc;
    const bw = 0.16 / cyc;
    let blink = bp < bw ? Math.sin((bp / bw) * Math.PI) : 0;
    if (mode === 'ready') {
      const bp2 = bp - 0.22;
      if (bp2 > 0 && bp2 < bw) blink = Math.max(blink, Math.sin((bp2 / bw) * Math.PI));
    }

    let gy = 0, hx = 0, hy = 0, lx = 0, ly = 0, squint = 0;
    let inkFull = 0, inkPartial = -1, inkP = 0, progress = -1;
    let tip = [28, 43], quillRot = 0, sparkA = null;

    if (mode === 'ready') {
      const w = t * TAU / READY_CYCLE;
      gy = R(Math.sin(w) * 0.9);
      hy = gy + R(Math.sin(w - 0.55) * 0.9);
      hx = R(Math.sin(w * 2) * 1.3);
      lx = Math.max(-1.8, Math.min(1.8, hx * 1.1));
      tip = [28 + hx * 0.5, 43 + gy];
      quillRot = Math.sin(w * 2 + 1) * 0.7;
    } else if (mode === 'writing') {
      const ct = t % WRITE_CYCLE;
      let li = Math.floor(ct / LINE_DUR);
      let lp = (ct - li * LINE_DUR) / LINE_DUR;
      const paused = li >= INK_ROWS.length;
      if (paused) { li = INK_ROWS.length - 1; lp = 1; }
      inkFull = li; inkPartial = li; inkP = lp;
      squint = 0.26;
      ly = 1.7; lx = -0.6;
      hy = 1 + R(Math.sin(ct * 9) * 0.5);
      gy = R(Math.sin(ct * 9 + 1) * 0.4);
      if (paused) {
        const pp = (ct - INK_ROWS.length * LINE_DUR) / PAUSE_DUR;
        tip = [28, 43 - Math.sin(pp * Math.PI) * 3];
        ly = 1.2 - Math.sin(pp * Math.PI) * 2.6;
        squint = 0.26 - Math.sin(pp * Math.PI) * 0.26;
        hy = 1 - R(Math.sin(pp * Math.PI) * 1.4);
      } else {
        tip = [INK_X + lp * (INK_LEN[li] - 0.4), INK_ROWS[li] + (Math.sin(t * 32) > 0 ? 0 : -1)];
        quillRot = Math.sin(t * 32) * 0.5;
      }
    } else {
      const ct = t % WORK_CYCLE;
      const w = t * TAU / WORK_CYCLE;
      gy = R(Math.sin(w * 2) * 0.7);
      hy = gy - 1 + R(Math.sin(w * 2 - 0.6) * 0.7);
      hx = R(Math.sin(w) * 1.2);
      lx = Math.sin(w) * 1.6;
      ly = -1.5;
      inkFull = 2;
      progress = ct / WORK_CYCLE;
      tip = [27 + Math.cos(w * 3) * 1.6, 43 + gy + Math.sin(w * 3) * 1.2];
      quillRot = Math.sin(w * 3) * 1.2;
      sparkA = w;
    }

    // --- body + paper ---
    blit(ctx, BODY, 0, gy, px, pal);
    const inkCol = '#5b4a72';
    for (let i = 0; i < INK_ROWS.length; i++) {
      let n = 0;
      if (i < inkFull) n = INK_LEN[i];
      else if (i === inkPartial) n = Math.round(inkP * INK_LEN[i]);
      if (n > 0) rect(ctx, INK_X, INK_ROWS[i] + gy, n, 1, px, inkCol);
    }
    if (progress >= 0) {
      rect(ctx, INK_X - 1, 44 + gy, 17, 3, px, pal.W);
      rect(ctx, INK_X, 45 + gy, 15, 1, px, '#c8bfa8');
      rect(ctx, INK_X, 45 + gy, Math.max(1, Math.round(progress * 15)), 1, px, pal.b);
    }

    // sparkles behind the head
    if (sparkA !== null) {
      for (let i = 0; i < 3; i++) {
        const a = sparkA + i * TAU / 3;
        if (Math.sin(a) > 0) continue;
        sparkle(ctx, 23.5 + Math.cos(a) * 16, 8 + Math.sin(a) * 3.5 + gy, px, pal, false);
      }
    }

    // --- head ---
    blit(ctx, HEAD, hx, hy, px, pal);

    // --- pupils + lids ---
    for (const ex of [EYE.lx, EYE.rx]) {
      const cx = ex + hx + lx, cy = EYE.y + hy + ly;
      disc(ctx, cx, cy, 3.7, px, '#2b2337');
      disc(ctx, cx - 1.3, cy - 1.4, 1.5, px, '#fffdf6');
      rect(ctx, Math.round(cx + 1.6), Math.round(cy + 1.6), 1, 1, px, '#6d5e86');

      const amt = Math.min(1, blink + squint);
      if (amt > 0.02) {
        const top = EYE.y - EYE.r + hy, bot = EYE.y + EYE.r + hy;
        const lidY = top - 1 + amt * (bot - top + 2);
        for (let y = Math.floor(top) - 1; y < lidY; y++) {
          const h = EYE.r * EYE.r - (y - EYE.y - hy) * (y - EYE.y - hy);
          const hw = h > 0 ? Math.sqrt(h) : 0;
          rect(ctx, Math.round(ex + hx - hw), y, Math.round(hw * 2) + 1, 1, px, pal.F);
        }
        const ly2 = Math.round(lidY);
        const h2 = EYE.r * EYE.r - (ly2 - EYE.y - hy) * (ly2 - EYE.y - hy);
        const hw2 = h2 > 0 ? Math.sqrt(h2) : 0;
        rect(ctx, Math.round(ex + hx - hw2), ly2, Math.round(hw2 * 2) + 1, 1, px, pal.d);
      }
    }

    // --- monocle glint ---
    if (mode !== 'ready') {
      const gp = (t % 2.6) / 2.6;
      if (gp < 0.3) {
        const s = gp / 0.3;
        const gx = EYE.rx + hx - 4 + s * 9;
        const gyy = EYE.y + hy + 4 - s * 9;
        if (Math.hypot(gx - EYE.rx - hx, gyy - EYE.y - hy) < EYE.r + 1.5) {
          rect(ctx, Math.round(gx), Math.round(gyy), 1, 2, px, '#ffffff');
          rect(ctx, Math.round(gx) + 1, Math.round(gyy) - 1, 1, 2, px, 'rgba(255,255,255,0.5)');
        }
      }
    }

    // --- quill ---
    const qx = Math.round(tip[0]) - QUILL_TIP[0];
    const qy = Math.round(tip[1]) - QUILL_TIP[1] + Math.round(quillRot);
    blit(ctx, QUILL, qx, qy, px, pal);
    if (mode === 'writing' && inkPartial >= 0 && inkP < 1) {
      rect(ctx, Math.round(tip[0]), INK_ROWS[inkPartial] + gy, 1, 1, px, inkCol);
    }

    // sparkles in front
    if (sparkA !== null) {
      for (let i = 0; i < 3; i++) {
        const a = sparkA + i * TAU / 3;
        if (Math.sin(a) <= 0) continue;
        sparkle(ctx, 23.5 + Math.cos(a) * 16, 8 + Math.sin(a) * 3.5 + gy, px, pal, true);
      }
    }

    if (opts.pixelGrid && px >= 6) {
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let i = 1; i < S; i++) {
        ctx.beginPath(); ctx.moveTo(i * px + 0.5, 0); ctx.lineTo(i * px + 0.5, S * px); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * px + 0.5); ctx.lineTo(S * px, i * px + 0.5); ctx.stroke();
      }
    }
  }
