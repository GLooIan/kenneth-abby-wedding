// ============================================================
// details.js — countdown + scroll-reveal animations
// Drop this in to replace your existing details.js. It finds
// the elements already in details.html and animates them; no
// HTML changes needed.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initScrollReveal();
});

/* ---------------------------------------------------------
   COUNTDOWN
   Ceremony start — Tuesday, November 24, 2026 at 2:00 PM.
--------------------------------------------------------- */
function initCountdown() {
  const WEDDING_DATE = new Date('2026-11-24T14:00:00+08:00');

  const els = {
    days:    document.getElementById('cd-days'),
    hours:   document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds'),
  };

  if (!els.days || !els.hours || !els.minutes || !els.seconds) return;

  const last = { days: null, hours: null, minutes: null, seconds: null };

  function tick() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      setValue(els.days, 0, last, 'days');
      setValue(els.hours, 0, last, 'hours');
      setValue(els.minutes, 0, last, 'minutes');
      setValue(els.seconds, 0, last, 'seconds');
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setValue(els.days, days, last, 'days');
    setValue(els.hours, hours, last, 'hours');
    setValue(els.minutes, minutes, last, 'minutes');
    setValue(els.seconds, seconds, last, 'seconds');
  }

  function setValue(el, value, lastMap, key) {
    const padded = String(value).padStart(2, '0');
    if (lastMap[key] !== value) {
      el.textContent = padded;
      lastMap[key] = value;
      // brief pulse animation whenever a digit actually changes
      el.classList.remove('tick');
      // force reflow so the animation can re-trigger
      void el.offsetWidth;
      el.classList.add('tick');
    }
  }

  tick();
  setInterval(tick, 1000);
}

/* ---------------------------------------------------------
   SCROLL REVEAL
   Adds .reveal / .reveal-scale to key elements and staggers
   them in with IntersectionObserver as the user scrolls down.
--------------------------------------------------------- */
function initScrollReveal() {
  const staggerGroups = [
    { selector: '.venue-card',    className: 'reveal',       step: 0.15 },
    { selector: '.map-card',      className: 'reveal',       step: 0.15 },
    { selector: '.timeline-item', className: 'reveal',       step: 0.08 },
    { selector: '.dress-column',  className: 'reveal',       step: 0.1  },
    { selector: '.countdown-box', className: 'reveal-scale', step: 0.1  },
  ];

  const singleReveals = [
    '.venues .section-title',
    '.directions .section-title',
    '.timeline .section-title',
    '.dress-code .section-title',
    '.dress-swatches',
    '.rsvp-reminder',
    '.pika-pika-note',
  ];

  staggerGroups.forEach(group => {
    document.querySelectorAll(group.selector).forEach((el, i) => {
      el.classList.add(group.className);
      el.style.setProperty('--delay', `${(i * group.step).toFixed(2)}s`);
    });
  });

  singleReveals.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('reveal');
    });
  });

  // Respect users who've asked their OS/browser for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal, .reveal-scale').forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.reveal, .reveal-scale').forEach(el => observer.observe(el));
}