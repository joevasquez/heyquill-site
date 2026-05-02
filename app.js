/* heyquill.ai — interactions
   Plain vanilla JS. No build step, no deps.
   Modules:
     1. Hero terminal typing demo
     2. Demo prompt carousel (auto + click-to-pin)
     3. Demo video click-to-unmute
     4. Comparison tabs (with keyboard nav)
     5. Scroll-reveal for the loop section
*/

(() => {
    'use strict';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============ 1. Hero terminal typing demo ============
    const tEl     = document.querySelector('[data-terminal]');
    const tText   = document.querySelector('[data-terminal-text]');
    const tWave   = document.querySelector('[data-terminal-wave]');
    const tResult = document.querySelector('[data-terminal-result]');
    const tResTxt = document.querySelector('[data-terminal-result-text]');

    const heroLoops = [
        { prompt: 'Remind me to call Mom Friday at 3', result: 'Added to Reminders · Friday 3:00 PM' },
        { prompt: 'Lunch with Sarah Tuesday at 1',     result: 'Added to Calendar · Tue 1:00 PM' },
        { prompt: 'Email Alex with a recap',           result: 'Drafted in Mail' },
        { prompt: 'Translate this to Spanish',         result: 'Edited in place' },
    ];

    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    async function typeOut(target, text, charDelay = 45) {
        target.textContent = '';
        for (const ch of text) {
            target.textContent += ch;
            await delay(charDelay);
        }
    }

    async function runHeroLoop() {
        if (!tEl) return;
        let i = 0;
        while (true) {
            const { prompt, result } = heroLoops[i % heroLoops.length];
            tWave.classList.remove('active');
            tResult.classList.remove('active');
            await typeOut(tText, prompt);
            await delay(500);
            tWave.classList.add('active');
            await delay(1100);
            tWave.classList.remove('active');
            tResTxt.textContent = result;
            tResult.classList.add('active');
            await delay(2200);
            i++;
        }
    }

    if (tEl && !reduced) {
        // Start when section is in view
        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting) { runHeroLoop(); io.disconnect(); }
            }
        }, { threshold: 0.4 });
        io.observe(tEl);
    } else if (tEl) {
        // Reduced motion: show static state
        tText.textContent = heroLoops[0].prompt;
        tResTxt.textContent = heroLoops[0].result;
        tResult.classList.add('active');
    }

    // ============ 2. Demo prompt carousel ============
    const carousel = document.querySelector('[data-carousel]');
    const chips = carousel ? Array.from(carousel.querySelectorAll('.chip')) : [];
    const device = carousel ? carousel.querySelector('.device') : null;
    const dPrompt = carousel ? carousel.querySelector('[data-device-prompt]') : null;
    const dApp    = carousel ? carousel.querySelector('[data-device-result-app]') : null;
    const dDetail = carousel ? carousel.querySelector('[data-device-result-detail]') : null;
    const dIcon   = carousel ? carousel.querySelector('[data-device-result-icon]') : null;
    const dTitle  = carousel ? carousel.querySelector('[data-device-title]') : null;

    const promptStates = [
        { app: 'Apple Reminders', detail: 'Call Mom · Friday at 3:00 PM',          icon: 'fa-bell',     title: 'Reminders' },
        { app: 'Apple Calendar',  detail: 'Lunch with Sarah · Tue 1:00 PM · Estela', icon: 'fa-calendar', title: 'Calendar' },
        { app: 'Todoist',         detail: '2 tasks added to Inbox',                icon: 'fa-list-check', title: 'Todoist' },
        { app: 'Apple Mail',      detail: 'Draft to alex@ · subject set',          icon: 'fa-envelope', title: 'Mail' },
        { app: 'Quill · Edit',    detail: 'Texto traducido en su lugar',           icon: 'fa-language', title: 'Edit' },
        { app: 'Quill · Edit',    detail: 'Two-sentence summary written',          icon: 'fa-compress', title: 'Edit' },
        { app: 'Apple Calendar',  detail: '4:00 PM moved to Wed 9:00 AM',          icon: 'fa-clock',    title: 'Calendar' },
    ];

    let activeIdx = 0;
    let timer = null;
    let pinnedAt = 0;

    function setActive(i, fromUser = false) {
        activeIdx = i % chips.length;
        chips.forEach((c, idx) => c.setAttribute('aria-selected', idx === activeIdx ? 'true' : 'false'));
        const chip = chips[activeIdx];
        const promptText = chip.querySelector('span').textContent;
        const state = promptStates[activeIdx] || promptStates[0];

        device.classList.add('swap');
        setTimeout(() => {
            dPrompt.textContent = promptText;
            dApp.textContent = state.app;
            dDetail.textContent = state.detail;
            dTitle.textContent = state.title;
            dIcon.innerHTML = `<i class="fas ${state.icon}"></i>`;
            device.classList.remove('swap');
        }, 200);

        if (fromUser) pinnedAt = Date.now();
    }

    function startAuto() {
        if (reduced) return;
        stopAuto();
        timer = setInterval(() => {
            // If user pinned within last 8s, hold
            if (pinnedAt && Date.now() - pinnedAt < 8000) return;
            setActive(activeIdx + 1);
        }, 3500);
    }
    function stopAuto() {
        if (timer) { clearInterval(timer); timer = null; }
    }

    if (carousel && chips.length) {
        chips.forEach((chip, i) => {
            chip.addEventListener('click', () => setActive(i, true));
            chip.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    chips[(i + 1) % chips.length].focus();
                    setActive((i + 1) % chips.length, true);
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    chips[(i - 1 + chips.length) % chips.length].focus();
                    setActive((i - 1 + chips.length) % chips.length, true);
                }
            });
        });

        // Init
        setActive(0);

        // Auto-rotate only when in view
        const io2 = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting) startAuto(); else stopAuto();
            }
        }, { threshold: 0.25 });
        io2.observe(carousel);
    }

    // ============ 3. Demo video click-to-unmute ============
    const video = document.querySelector('[data-demo-video]');
    const muteBtn = document.querySelector('[data-video-mute]');

    if (video && muteBtn) {
        const updateIcon = () => {
            muteBtn.innerHTML = video.muted
                ? '<i class="fas fa-volume-mute"></i>'
                : '<i class="fas fa-volume-up"></i>';
            muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
        };
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            if (!video.muted) video.play().catch(() => {});
            updateIcon();
        });
        updateIcon();
    }

    // ============ 4. Scroll-reveal for loop section ============
    const loopGrid = document.querySelector('.loop-grid');
    if (loopGrid) {
        const io3 = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting) {
                    loopGrid.classList.add('in-view');
                    io3.disconnect();
                }
            }
        }, { threshold: 0.2 });
        io3.observe(loopGrid);
    }
})();
