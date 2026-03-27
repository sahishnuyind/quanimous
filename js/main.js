'use strict';

/* ── Custom cursor ── */
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  const DOT_LERP  = 0.28;   // dot responsiveness (0–1, higher = snappier)
  const STIFFNESS = 0.16;   // spring pull strength
  const DAMPING   = 0.74;   // spring energy retention (lower = more bounce)
  const DOT_R     = 4;      // half of dot width (8px)
  const RING_R    = 18;     // half of ring width (36px)

  // Positions
  let mouseX = -200, mouseY = -200;
  let dotX   = -200, dotY   = -200;
  let ringX  = -200, ringY  = -200;
  let ringVX = 0,    ringVY = 0;

  // Scale (lerped in rAF loop)
  let dotScale  = 1;
  let ringScale = 1;

  // State flags
  let isHover = false;
  let isClick = false;
  let isDark  = false;
  let visible = false;

  // Dark-background sections
  const darkSections = document.querySelectorAll('.cta-section, .footer');

  /* Track mouse */
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!visible) {
      visible = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }

    // Check if over a dark section
    const el = document.elementFromPoint(mouseX, mouseY);
    const onDark = el && [...darkSections].some(s => s.contains(el));
    if (onDark !== isDark) {
      isDark = onDark;
      dot.classList.toggle('is-dark',  isDark);
      ring.classList.toggle('is-dark', isDark);
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
    visible = false;
  });
  document.addEventListener('mouseenter', () => {
    if (visible) {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
  });

  /* Hover on interactive elements */
  const HOVER_SEL = 'a, button, [role="button"], input, textarea, select, label';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(HOVER_SEL)) {
      isHover = true;
      ring.classList.add('is-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOVER_SEL)) {
      isHover = false;
      ring.classList.remove('is-hover');
    }
  });

  /* Click */
  document.addEventListener('mousedown', () => {
    isClick = true;
    ring.classList.add('is-click');
  });
  document.addEventListener('mouseup', () => {
    isClick = false;
    ring.classList.remove('is-click');
  });

  /* Animation loop */
  function tick() {
    // Dot: lerp
    dotX += (mouseX - dotX) * DOT_LERP;
    dotY += (mouseY - dotY) * DOT_LERP;

    // Ring: spring physics
    const fx = (mouseX - ringX) * STIFFNESS;
    const fy = (mouseY - ringY) * STIFFNESS;
    ringVX = (ringVX + fx) * DAMPING;
    ringVY = (ringVY + fy) * DAMPING;
    ringX += ringVX;
    ringY += ringVY;

    // Scale targets
    const tDot  = isClick ? 0.5  : isHover ? 0   : 1;
    const tRing = isClick ? 0.82 : isHover ? 1.6 : 1;
    dotScale  += (tDot  - dotScale)  * 0.14;
    ringScale += (tRing - ringScale) * 0.12;

    dot.style.transform  = `translate3d(${dotX  - DOT_R}px, ${dotY  - DOT_R}px, 0) scale(${dotScale})`;
    ring.style.transform = `translate3d(${ringX - RING_R}px, ${ringY - RING_R}px, 0) scale(${ringScale})`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();


/* ── Nav: frosted glass on scroll ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });


/* ── Reveal on scroll with sibling stagger ── */
const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .reveal'));
    const idx = siblings.indexOf(el);
    el.style.transitionDelay = `${Math.min(idx * 90, 360)}ms`;
    el.classList.add('visible');
    revealObserver.unobserve(el);
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -48px 0px',
});

reveals.forEach(el => revealObserver.observe(el));


/* ── Testimonials ticker with drag-to-scrub ── */
(function () {
  const wrap  = document.querySelector('.ticker-wrap');
  const track = document.querySelector('.ticker-track');
  if (!wrap || !track) return;

  const BASE_SPEED = 0.7;  // px/frame auto-scroll
  const LERP       = 0.05; // how quickly vel eases back to BASE_SPEED after a drag

  let x            = 0;
  let vel          = BASE_SPEED;
  let dragging     = false;
  let lastClientX  = 0;
  let pendingDelta = 0; // accumulates drag between rAF frames
  let halfWidth    = 0;

  function measure() { halfWidth = track.scrollWidth / 2; }
  measure();
  window.addEventListener('resize', measure, { passive: true });

  function tick() {
    if (dragging) {
      // Apply all drag movement accumulated since last frame
      vel = pendingDelta;
      x  += pendingDelta;
      pendingDelta = 0;
    } else {
      // Smoothly ease vel back to BASE_SPEED (handles momentum + auto-scroll)
      vel += (BASE_SPEED - vel) * LERP;
      x   += vel;
    }

    // Seamless loop
    x = ((x % halfWidth) + halfWidth) % halfWidth;
    track.style.transform = `translateX(${-x}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function dragStart(clientX) {
    dragging    = true;
    lastClientX = clientX;
    pendingDelta = 0;
    wrap.classList.add('dragging');
  }

  function dragMove(clientX) {
    if (!dragging) return;
    pendingDelta += lastClientX - clientX;
    lastClientX   = clientX;
  }

  function dragEnd() {
    // vel was set to pendingDelta on last tick — lerp takes it back to BASE_SPEED
    dragging = false;
    wrap.classList.remove('dragging');
  }

  // Mouse
  wrap.addEventListener('mousedown',  e => { e.preventDefault(); dragStart(e.clientX); });
  window.addEventListener('mousemove', e => dragMove(e.clientX));
  window.addEventListener('mouseup',   dragEnd);

  // Touch
  wrap.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), { passive: true });
  wrap.addEventListener('touchmove',  e => { e.preventDefault(); dragMove(e.touches[0].clientX); }, { passive: false });
  wrap.addEventListener('touchend',   dragEnd);
})();


/* ── FAQ accordion ── */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-item__q');
  const answer   = item.querySelector('.faq-item__a');

  const inner = document.createElement('div');
  while (answer.firstChild) inner.appendChild(answer.firstChild);
  answer.appendChild(inner);

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    faqItems.forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});


/* ── Contact form — Web3Forms ── */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const btn     = contactForm.querySelector('.form-submit');
    const notice  = contactForm.querySelector('.form-notice');

    // Loading state
    btn.disabled     = true;
    btn.textContent  = 'Sending…';

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      });
      const data = await res.json();

      if (data.success) {
        // Success
        notice.textContent  = '✓ Message sent! We\'ll be in touch within one business day.';
        notice.className    = 'form-notice form-notice--success';
        contactForm.reset();
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      notice.textContent = 'Something went wrong. Please email us directly at hello@quanimous.com';
      notice.className   = 'form-notice form-notice--error';
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Send message';
    }
  });
}


/* ── Smooth scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});
