/**
 * Andrej Karpathy — site animations and interactions
 * Dependencies: GSAP 3, ScrollTrigger plugin
 */

(function () {
  'use strict';

  // ─── Reduced motion check ────────────────────────────────────────────────
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // ─── Register plugins ────────────────────────────────────────────────────
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ─── Bottom nav active state ─────────────────────────────────────────────
  const navLinks = document.querySelectorAll('.bnav-link');
  const sections = document.querySelectorAll('main section[id]');

  if (navLinks.length && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('active'));
            const active = document.querySelector(`.bnav-link[data-section="${entry.target.id}"]`);
            if (active) active.classList.add('active');
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
  }

  // ─── Email reveal (ROT13) ────────────────────────────────────────────────
  const rot13 = (str) => {
    const alpha =
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLM';
    return str.replace(/[a-zA-Z]/g, (c) => alpha[alpha.indexOf(c) + 13]);
  };

  const emailBtn = document.getElementById('iemail');
  const emailEl  = document.getElementById('demail');
  let emailRevealed = false;

  if (emailBtn && emailEl) {
    emailBtn.addEventListener('click', () => {
      if (!emailRevealed) {
        // Encoded: andrej.karpathy@gmail.com
        const encoded = 'naqerw.xnecngul@tznvy.pbz';
        emailEl.textContent = rot13(encoded);
        emailEl.classList.add('visible');
        emailRevealed = true;
      } else {
        emailEl.classList.remove('visible');
        emailRevealed = false;
      }
    });
  }

  // ─── Grid / List view toggle ─────────────────────────────────────────────
  function initViewToggles() {
    const toggleGroups = document.querySelectorAll('.view-toggle');

    toggleGroups.forEach((group) => {
      const btns = group.querySelectorAll('.view-btn');

      // Restore persisted state
      const firstBtn = btns[0];
      if (firstBtn) {
        const targetId = firstBtn.dataset.target;
        let savedView = 'grid';
        try { savedView = localStorage.getItem('view-' + targetId) || 'grid'; } catch (e) {}

        if (savedView === 'list') {
          const grid = document.getElementById(targetId);
          if (grid) {
            grid.classList.add('is-list');
            btns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === 'list' ? 'true' : 'false'));
          }
        }
      }

      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetId = btn.dataset.target;
          const view     = btn.dataset.view;
          const grid     = document.getElementById(targetId);
          if (!grid) return;

          btns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
          btn.setAttribute('aria-pressed', 'true');

          if (view === 'list') {
            grid.classList.add('is-list');
          } else {
            grid.classList.remove('is-list');
          }

          try { localStorage.setItem('view-' + targetId, view); } catch (e) {}
        });
      });
    });
  }

  initViewToggles();

  // ─── Skip all animations if reduced motion ───────────────────────────────
  if (prefersReducedMotion) return;

  // ─── Wait for fonts + DOM ready ──────────────────────────────────────────
  document.fonts.ready.then(initAnimations);

  function initAnimations() {
    heroEntrance();
    sectionHeadings();
    genericReveals();
    cardGrids();
  }

  // ─── Hero entrance sequence ──────────────────────────────────────────────
  function heroEntrance() {
    const tl = gsap.timeline({ delay: 0.15 });

    tl.to('.anim-hero-photo', {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: 'power3.out',
    })
    .to('.anim-hero-name', {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: 'power2.out',
    }, '-=0.4')
    .to('.anim-hero-tagline', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.35')
    .to('.anim-hero-social', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.25');
  }

  // ─── Section heading underline draw + fade ───────────────────────────────
  function sectionHeadings() {
    document.querySelectorAll('.section-heading').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power2.out',
            onComplete: () => {
              el.classList.add('heading-revealed');
            },
          });
        },
      });
    });
  }

  // ─── Generic .anim-reveal elements ───────────────────────────────────────
  function genericReveals() {
    document.querySelectorAll('.anim-reveal').forEach((el) => {
      if (el.classList.contains('section-heading')) return;

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      });
    });
  }

  // ─── Card grids: staggered entrance ──────────────────────────────────────
  function cardGrids() {
    document.querySelectorAll('.grid, .yt-grid').forEach((grid) => {
      const cards = grid.querySelectorAll('.anim-card, .yt-card');
      if (!cards.length) return;

      gsap.to(cards, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: {
          amount: 0.35,
          from: 'start',
        },
        scrollTrigger: {
          trigger: grid,
          start: 'top 88%',
          once: true,
        },
      });
    });
  }

})();
