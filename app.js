// app.js — heyquill.ai
//
// The owl on this page is the same owl the app opens into: quill-owl-sprite.js
// is the artwork itself, shipped verbatim from the design handoff and ported
// literally to Swift as QuillOwlSprite.swift. Nothing here re-draws it.

import { drawOwl, SPRITE_SIZE } from './assets/quill-owl-sprite.js';
import { pixelIcon, mountPixelIcons } from './assets/pixel-icons.js';

/* --------------------------------------------------------------------------
   Mode palette — QuillDesign.ModePalette, converted from OKLCH to sRGB with
   the same Ottosson maths the app uses. Hex rather than oklch() because these
   are handed to canvas fillStyle, where hex support is universal.
   -------------------------------------------------------------------------- */

const MODE_COLOR = {
  auto:     '#a791fa',  // oklch(0.72 0.15 292) — also the brand hue
  dictate:  '#4ab1ff',  // oklch(0.74 0.16 248)
  edit:     '#faab3f',  // oklch(0.80 0.15  70)
  act:      '#25d2c7',  // oklch(0.78 0.13 188)
  resolved: '#6ed889',  // oklch(0.80 0.15 150)
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   Canvas sizing
   `px` (canvas pixels per sprite pixel) MUST be a whole number or the pixel art
   shimmers. So we pick the nearest integer px for the requested size and then
   derive the CSS size from it, rather than letting CSS stretch by a fraction.
   -------------------------------------------------------------------------- */

function sizeCanvas(canvas, targetCssPx) {
  const dpr = window.devicePixelRatio || 1;
  const px = Math.max(1, Math.round((targetCssPx / SPRITE_SIZE) * dpr));
  const backing = SPRITE_SIZE * px;
  canvas.width = backing;
  canvas.height = backing;
  const css = backing / dpr;
  canvas.style.width = css + 'px';
  canvas.style.height = css + 'px';
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { ctx, px };
}

/* --------------------------------------------------------------------------
   The stage
   A bubble, an owl, a mode pill, and a result card — the app's overlay, minus
   the desktop. Beats drive it: ready → writing → working → resolved.
   -------------------------------------------------------------------------- */

const PHASE = {
  READY:    { owl: 'ready',   hold: 0.55 },
  WRITING:  { owl: 'writing' },
  SETTLE:   { owl: 'writing', hold: 0.35 },
  WORKING:  { owl: 'working', hold: 1.35 },
  RESOLVED: { owl: 'ready',   hold: 2.4 },
};

function createStage(root, beats, opts = {}) {
  const canvas = root.querySelector('[data-owl]');
  const bubble = root.querySelector('[data-bubble]');
  const line = root.querySelector('[data-line]');
  const pill = root.querySelector('[data-pill]');
  const bars = Array.from(root.querySelectorAll('[data-wave] span'));
  const card = root.querySelector('[data-card]');
  const cardTile = root.querySelector('[data-card-tile]');
  const cardApp = root.querySelector('[data-card-app]');
  const cardDetail = root.querySelector('[data-card-detail]');

  const { ctx, px } = sizeCanvas(canvas, opts.size || 96);

  let beatIndex = 0;
  let phase = 'READY';
  let phaseStart = 0;
  // One monotonic clock for the sprite, never reset on a mode change — each
  // state loops on its own period, so a shared clock keeps the motion
  // continuous through the cut. Resetting it produces a visible jump.
  let t0 = null;
  let running = false;
  let rafId = null;
  let typed = 0;

  function beat() { return beats[beatIndex]; }

  function applyAccent() {
    const color = MODE_COLOR[beat().mode];
    root.style.setProperty('--stage-accent', color);
    pill.textContent = beat().label;
  }

  function setPhase(next, now) {
    phase = next;
    phaseStart = now;
    if (next === 'READY') {
      bubble.classList.remove('is-visible');
      card.classList.remove('is-visible');
      typed = 0;
      line.textContent = '';
    }
    if (next === 'WRITING') {
      applyAccent();
      bubble.classList.add('is-visible');
      // Also clear here, not just on READY: jumpTo() enters WRITING directly,
      // and without this the previous beat's result card stays on screen
      // underneath the new command.
      card.classList.remove('is-visible');
      typed = 0;
      line.textContent = '';
    }
    if (next === 'RESOLVED') {
      const r = beat().result;
      cardTile.innerHTML = pixelIcon(r.icon, MODE_COLOR[beat().mode], 20);
      cardApp.textContent = r.app;
      cardDetail.textContent = r.detail;
      card.classList.add('is-visible');
    }
  }

  function advance(now) {
    const order = ['READY', 'WRITING', 'SETTLE', 'WORKING', 'RESOLVED'];
    const i = order.indexOf(phase);
    if (i === order.length - 1) {
      beatIndex = (beatIndex + 1) % beats.length;
      setPhase('READY', now);
    } else {
      setPhase(order[i + 1], now);
    }
  }

  function frame(ms) {
    if (t0 === null) t0 = ms;
    const t = (ms - t0) / 1000;
    const elapsed = t - phaseStart;
    const b = beat();

    // Typing drives the WRITING phase's length: ~34 chars/sec, floor 1.1s.
    if (phase === 'WRITING') {
      const dur = Math.max(1.1, b.text.length / 34);
      typed = Math.min(b.text.length, Math.round((elapsed / dur) * b.text.length));
      line.innerHTML =
        escapeHtml(b.text.slice(0, typed)) +
        (typed < b.text.length ? '<i class="stage-caret"></i>' : '');
      if (elapsed >= dur) advance(t);
    } else {
      const hold = PHASE[phase].hold;
      if (hold != null && elapsed >= hold) advance(t);
    }

    // Waveform — the handoff's geometry and its deliberately unsynced delays,
    // so it reads as speech rather than a metronome. In the app these are
    // driven by the real mic level.
    const live = phase === 'WRITING' || phase === 'SETTLE';
    const DELAYS = [0, 0.13, 0.27, 0.07];
    bars.forEach((bar, i) => {
      const s = live
        ? 0.22 + 0.78 * (0.5 - 0.5 * Math.cos((2 * Math.PI * (t - DELAYS[i])) / 0.62))
        : 0.22;
      bar.style.transform = `scaleY(${s.toFixed(3)})`;
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawOwl(ctx, px, t, PHASE[phase].owl, { accent: MODE_COLOR[b.mode] });

    if (running) rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function jumpTo(index) {
    beatIndex = index;
    // phaseStart is in the sprite clock's timebase, so read "now" from it
    // rather than from performance.now().
    const now = t0 === null ? 0 : (performance.now() - t0) / 1000;
    setPhase('WRITING', now);
    applyAccent();
  }

  // Reduced motion: render one complete frame and stop. The app does the same
  // thing (TimelineView(.animation(paused: reduceMotion))) — the owl stays on
  // screen, it just holds still. Picking a prompt still works; it swaps the
  // frame instead of playing to it, so the section isn't inert.
  if (prefersReducedMotion) {
    const renderStatic = (index) => {
      beatIndex = index;
      const b = beats[index];
      applyAccent();
      bubble.classList.add('is-visible');
      line.textContent = b.text;
      cardTile.innerHTML = pixelIcon(b.result.icon, MODE_COLOR[b.mode], 20);
      cardApp.textContent = b.result.app;
      cardDetail.textContent = b.result.detail;
      card.classList.add('is-visible');
      bars.forEach((bar) => { bar.style.transform = 'scaleY(0.62)'; });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawOwl(ctx, px, 1.2, 'writing', { accent: MODE_COLOR[b.mode] });
    };
    renderStatic(0);
    return { start() {}, stop() {}, jumpTo: renderStatic, el: root };
  }

  applyAccent();
  return { start, stop, jumpTo, el: root };
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* Only animate what's on screen — an idle rAF loop over a blurred, shadowed
   canvas is exactly the CPU burn the app had to fix in its own orb. */
function runWhenVisible(stage) {
  if (!('IntersectionObserver' in window)) { stage.start(); return; }
  // threshold 0, not a fraction: on a laptop-height viewport only the top edge
  // of the hero stage is above the fold at load, and a 0.15 threshold left the
  // owl frozen until the user scrolled — on the one element that most needs to
  // be moving when the page lands.
  new IntersectionObserver((entries) => {
    entries[0].isIntersecting ? stage.start() : stage.stop();
  }, { threshold: 0 }).observe(stage.el);
}

/* --------------------------------------------------------------------------
   Content
   -------------------------------------------------------------------------- */

const HERO_BEATS = [
  {
    mode: 'auto', label: 'Auto',
    text: 'Remind me to send the board deck Friday at 3.',
    result: { icon: 'check', app: 'Apple Reminders', detail: 'Send the board deck · Fri 3:00 PM' },
  },
  {
    mode: 'dictate', label: 'Dictate',
    text: 'Yes — the deck looks great. Two notes: fix slide four, and add the Q3 numbers.',
    result: { icon: 'mic', app: 'Mail', detail: 'Pasted into your reply, cleaned up' },
  },
  {
    mode: 'edit', label: 'Edit',
    text: 'Tighten this by twenty percent and make it more formal.',
    result: { icon: 'quill', app: 'Rewritten in place', detail: 'Accept or undo — your call' },
  },
  {
    mode: 'act', label: 'Act',
    text: 'Find Joe in Dex, then draft him a birthday email in Gmail.',
    result: { icon: 'plug', app: 'Dex → Gmail', detail: '2 steps · looked up, then drafted' },
  },
];

const TRY_BEATS = [
  {
    mode: 'auto', label: 'Auto',
    text: 'Lunch with Sarah Tuesday at 1 at Estela.',
    result: { icon: 'clock', app: 'Apple Calendar', detail: 'Lunch with Sarah · Tue 1:00 PM · Estela' },
  },
  {
    mode: 'act', label: 'Act',
    text: 'Add oat milk and eggs to my groceries note.',
    result: { icon: 'notepad', app: 'Notes', detail: 'Appended to "Groceries" · 2 items' },
  },
  {
    mode: 'edit', label: 'Edit',
    text: 'Translate this to Spanish and keep the bullet formatting.',
    result: { icon: 'quill', app: 'Rewritten in place', detail: 'Selection replaced · undo available' },
  },
  {
    mode: 'act', label: 'Act',
    text: 'Open the Linear ticket for the paste bug and mark it done.',
    result: { icon: 'plug', app: 'Linear · via MCP', detail: 'QU-412 → Done' },
  },
  {
    mode: 'dictate', label: 'Dictate',
    text: 'Draft a reply to this thread saying I can make Thursday but not Wednesday.',
    result: { icon: 'check', app: 'Draft ready', detail: 'Nothing sent — copy or paste it yourself' },
  },
];

/* --------------------------------------------------------------------------
   Theme
   Auto / Light / Dark, mirroring the app's Appearance setting. The inline
   script in <head> has already resolved and stamped the theme before first
   paint; this only handles the toggle and keeps Auto tracking the system if
   the user changes it while the page is open.
   -------------------------------------------------------------------------- */

const THEME_ORDER = ['auto', 'light', 'dark'];
const THEME_META = {
  auto:  { icon: 'contrast', label: 'Theme: Auto (follows your system)' },
  light: { icon: 'sun',      label: 'Theme: Light' },
  dark:  { icon: 'moon',     label: 'Theme: Dark' },
};
const THEME_KEY = 'quill-theme';

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(pref, button) {
  const resolved = pref === 'auto' ? (systemPrefersDark() ? 'dark' : 'light') : pref;
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themePref = pref;
  try { localStorage.setItem(THEME_KEY, pref); } catch (e) { /* private mode */ }

  if (!button) return;
  const meta = THEME_META[pref];
  button.querySelector('[data-theme-icon]').innerHTML = pixelIcon(meta.icon, 'currentColor', 18);
  button.setAttribute('aria-label', meta.label);
  button.setAttribute('title', meta.label);
}

function mountThemeToggle() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  let pref = document.documentElement.dataset.themePref || 'auto';
  applyTheme(pref, button);

  button.addEventListener('click', () => {
    pref = THEME_ORDER[(THEME_ORDER.indexOf(pref) + 1) % THEME_ORDER.length];
    applyTheme(pref, button);
  });

  // Only matters while the preference is Auto, but the listener is cheap and
  // re-resolving is a no-op otherwise.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (pref === 'auto') applyTheme('auto', button);
  });
}

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */

function boot() {
  mountPixelIcons();
  mountThemeToggle();

  // Nav mark — the 12x12 owl face rather than the 48x48 sprite: at 22px the
  // full sprite would need a fractional `px` and shimmer, and its detail
  // wouldn't survive the downscale anyway.
  const mark = document.querySelector('[data-owl-mark]');
  if (mark) mark.innerHTML = pixelIcon('owl', MODE_COLOR.auto, 20);

  // Hero
  const heroRoot = document.querySelector('[data-stage="hero"]');
  if (heroRoot) runWhenVisible(createStage(heroRoot, HERO_BEATS, { size: 96 }));

  // Try it — same component, driven by the prompt list instead of a timer.
  const tryRoot = document.querySelector('[data-stage="try"]');
  if (tryRoot) {
    const stage = createStage(tryRoot, TRY_BEATS, { size: 72 });
    runWhenVisible(stage);

    const list = document.querySelector('[data-prompts]');
    if (list) {
      const buttons = Array.from(list.querySelectorAll('.pr'));
      buttons.forEach((btn, i) => {
        btn.addEventListener('click', () => {
          buttons.forEach((b) => {
            b.classList.toggle('active', b === btn);
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });
          stage.start();
          stage.jumpTo(i);
        });
      });
      if (buttons[0]) {
        buttons[0].classList.add('active');
        buttons[0].setAttribute('aria-pressed', 'true');
      }
    }
  }

  // Final CTA — the owl waiting, which is what it does when you're not talking.
  const finalOwl = document.querySelector('[data-owl-final]');
  if (finalOwl) {
    const { ctx, px } = sizeCanvas(finalOwl, 72);
    if (prefersReducedMotion) {
      drawOwl(ctx, px, 0.9, 'ready', { accent: MODE_COLOR.auto });
    } else {
      let f0 = null;
      let live = false;
      const loop = (ms) => {
        if (f0 === null) f0 = ms;
        ctx.clearRect(0, 0, finalOwl.width, finalOwl.height);
        drawOwl(ctx, px, (ms - f0) / 1000, 'ready', { accent: MODE_COLOR.auto });
        if (live) requestAnimationFrame(loop);
      };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((e) => {
          if (e[0].isIntersecting && !live) { live = true; requestAnimationFrame(loop); }
          else if (!e[0].isIntersecting) { live = false; }
        }, { threshold: 0.2 }).observe(finalOwl);
      } else {
        live = true;
        requestAnimationFrame(loop);
      }
    }
  }

  // Video sound toggle
  const muteBtn = document.getElementById('videoMute');
  if (muteBtn) {
    const video = document.querySelector('[data-demo-video]');
    const speakerOff = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
    const speakerOn = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      muteBtn.innerHTML = video.muted ? speakerOff : speakerOn;
      muteBtn.setAttribute('aria-label', video.muted ? 'Unmute demo' : 'Mute demo');
      if (!video.muted) video.play();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
