// ============================================================
// faq.js — staggered scroll-reveal for the FAQ cards
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
});

function initScrollReveal() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach((el, i) => {
    el.classList.add(i % 2 === 0 ? 'reveal-slide-left' : 'reveal-slide-right');
    el.style.setProperty('--delay', `${(i * 0.15).toFixed(2)}s`);
  });

  const backLink = document.querySelector('.faq-back-link');
  if (backLink) {
    backLink.classList.add('reveal');
    backLink.style.setProperty('--delay', `${(items.length * 0.15).toFixed(2)}s`);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal, .reveal-slide-left, .reveal-slide-right').forEach(el => el.classList.add('in-view'));
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

  document.querySelectorAll('.reveal, .reveal-slide-left, .reveal-slide-right').forEach(el => observer.observe(el));
}