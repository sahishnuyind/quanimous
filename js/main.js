'use strict';

/* ── Lucide icons ── */
lucide.createIcons();

/* ── GSAP ── */
gsap.registerPlugin(ScrollTrigger);


/* ═══════════════════════════════════════════════
   HERO CANVAS  —  floating gradient orbs
═══════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  const orbs = [
    { x: 0.20, y: 0.40, r: 320, vx:  0.00022, vy:  0.00015, phase: 0.0 },
    { x: 0.72, y: 0.62, r: 280, vx: -0.00018, vy:  0.00020, phase: 1.8 },
    { x: 0.50, y: 0.18, r: 240, vx:  0.00014, vy: -0.00012, phase: 3.5 },
    { x: 0.82, y: 0.22, r: 200, vx: -0.00016, vy:  0.00018, phase: 5.1 },
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    orbs.forEach(orb => {
      orb.x = ((orb.x + orb.vx) + 1) % 1;
      orb.y = ((orb.y + orb.vy) + 1) % 1;
      const pulse = Math.sin(t * 0.0008 + orb.phase);
      const alpha = 0.055 + pulse * 0.018;
      const r     = orb.r  + pulse * 28;
      const cx = orb.x * W, cy = orb.y * H;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0, `rgba(74,93,115,${alpha})`);
      grd.addColorStop(1, 'rgba(74,93,115,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();


/* ═══════════════════════════════════════════════
   PAGE LOAD ANIMATION
═══════════════════════════════════════════════ */
(function initPageLoad() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;

  // Pin hero content off-screen until loader exits
  gsap.set(
    ['.hero-eyebrow', '.hero__h1', '.hero__sub', '.hero__ctas', '.hero__scroll-hint'],
    { opacity: 0, y: 30 }
  );

  const tl = gsap.timeline();

  tl
    .to('.loader-circle', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })
    .to('.loader-line',   { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to(loader, {
      opacity: 0, duration: 0.55, ease: 'power2.inOut', delay: 0.4,
      onComplete() { loader.style.display = 'none'; },
    })
    .to('.hero-eyebrow',       { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.1')
    .to('.hero__h1',           { opacity: 1, y: 0, duration: 0.9,  ease: 'power3.out' }, '-=0.55')
    .to('.hero__sub',          { opacity: 1, y: 0, duration: 0.8,  ease: 'power3.out' }, '-=0.65')
    .to('.hero__ctas',         { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' }, '-=0.55')
    .to('.hero__scroll-hint',  { opacity: 1,       duration: 1.0,  ease: 'power2.out' }, '-=0.3');
})();


/* ═══════════════════════════════════════════════
   SPLIT-LINE TEXT  —  line-by-line reveal
═══════════════════════════════════════════════ */
(function initSplitText() {
  document.querySelectorAll('[data-split="lines"]').forEach(el => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines
      .map(line => `<span class="split-line"><span class="split-line__inner">${line.trim()}</span></span>`)
      .join('');

    const inners = el.querySelectorAll('.split-line__inner');
    gsap.set(inners, { y: '108%' });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter() {
        gsap.to(inners, {
          y: '0%',
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.12,
        });
      },
    });
  });
})();


/* ═══════════════════════════════════════════════
   COUNT-UP NUMBERS
═══════════════════════════════════════════════ */
(function initCounters() {
  document.querySelectorAll('.count[data-count]').forEach(el => {
    const target = +el.dataset.count;
    let fired = false;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      onEnter() {
        if (fired) return;
        fired = true;
        const obj = { n: 0 };
        gsap.to(obj, {
          n: target,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(obj.n); },
        });
      },
    });
  });
})();


/* ═══════════════════════════════════════════════
   PARALLAX IMAGES
═══════════════════════════════════════════════ */
(function initParallax() {
  document.querySelectorAll('.parallax-wrap').forEach(wrap => {
    const img = wrap.querySelector('.parallax-img');
    if (!img) return;
    gsap.fromTo(img,
      { y: '-8%' },
      {
        y: '8%',
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      }
    );
  });
})();


/* ═══════════════════════════════════════════════
   SCROLL ANIMATIONS
═══════════════════════════════════════════════ */
(function initScrollAnimations() {

  /* Generic .reveal elements */
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.fromTo(el,
      { y: 28, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }
    );
  });

  /* Stats strip — stagger across all four stats */
  gsap.fromTo('.stats-strip .stat',
    { y: 28, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: 0.8, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.stats-strip', start: 'top 85%' },
    }
  );

  /* Steps image — slide from right */
  gsap.fromTo('.steps-visual',
    { x: 64, opacity: 0 },
    {
      x: 0, opacity: 1,
      duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: '.steps-layout', start: 'top 80%' },
    }
  );

  /* Feature cards — stagger grid */
  gsap.fromTo('.feature-card',
    { y: 40, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: 0.7, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: '.features-grid', start: 'top 85%' },
    }
  );

  /* Showcase section */
  gsap.fromTo('.showcase__eyebrow',
    { y: 20, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.showcase__content', start: 'top 82%' },
    }
  );
  gsap.fromTo('.showcase__stats .showcase__stat',
    { y: 32, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.showcase__stats', start: 'top 88%' },
    }
  );

  /* Pricing card */
  gsap.fromTo('.pricing-card',
    { y: 50, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.pricing-card', start: 'top 85%' },
    }
  );

  /* CTA section — each child staggers in */
  gsap.fromTo('.cta-inner > *',
    { y: 28, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.cta-inner', start: 'top 80%' },
    }
  );

})();


/* ═══════════════════════════════════════════════
   CARD 3D TILT
═══════════════════════════════════════════════ */
(function initCardTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, {
        rotateX: -y * 10,
        rotateY:  x * 10,
        transformPerspective: 700,
        duration: 0.35,
        ease: 'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.65,
        ease: 'elastic.out(1, 0.55)',
      });
    });
  });
})();


/* ═══════════════════════════════════════════════
   CURSOR TRAIL
═══════════════════════════════════════════════ */
(function initCursorTrail() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const COUNT  = 7;
  const trails = Array.from({ length: COUNT }, () => {
    const el = document.createElement('div');
    el.className = 'cursor-trail';
    document.body.appendChild(el);
    return { el, x: -300, y: -300 };
  });

  let mx = -300, my = -300;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  // Each trail dot is a bit lazier than the previous
  const lerps = trails.map((_, i) => 0.28 / (1 + i * 0.52));

  function tick() {
    trails.forEach((t, i) => {
      t.x += (mx - t.x) * lerps[i];
      t.y += (my - t.y) * lerps[i];
      const scale   = 1 - (i / COUNT) * 0.65;
      const opacity = (1 - i / COUNT) * 0.22;
      t.el.style.transform = `translate3d(${t.x - 3}px,${t.y - 3}px,0) scale(${scale})`;
      t.el.style.opacity   = opacity;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();


/* ═══════════════════════════════════════════════
   CUSTOM CURSOR  —  spring-physics dot + ring
═══════════════════════════════════════════════ */
(function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  const DOT_LERP  = 0.28;
  const STIFFNESS = 0.16;
  const DAMPING   = 0.74;
  const DOT_R     = 4;
  const RING_R    = 18;

  let mouseX = -200, mouseY = -200;
  let dotX   = -200, dotY   = -200;
  let ringX  = -200, ringY  = -200;
  let ringVX = 0,    ringVY = 0;
  let dotScale = 1,  ringScale = 1;
  let isHover = false, isClick = false, isDark = false, visible = false;

  const darkSections = document.querySelectorAll('.cta-section, .footer');

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!visible) {
      visible = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
    const el = document.elementFromPoint(mouseX, mouseY);
    const onDark = el && [...darkSections].some(s => s.contains(el));
    if (onDark !== isDark) {
      isDark = onDark;
      dot.classList.toggle('is-dark',  isDark);
      ring.classList.toggle('is-dark', isDark);
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0'; visible = false;
  });
  document.addEventListener('mouseenter', () => {
    if (visible) { dot.style.opacity = '1'; ring.style.opacity = '1'; }
  });

  const HOVER_SEL = 'a, button, [role="button"], input, textarea, select, label';
  document.addEventListener('mouseover', e => { if (e.target.closest(HOVER_SEL)) { isHover = true;  ring.classList.add('is-hover');    } });
  document.addEventListener('mouseout',  e => { if (e.target.closest(HOVER_SEL)) { isHover = false; ring.classList.remove('is-hover'); } });
  document.addEventListener('mousedown', () => { isClick = true;  ring.classList.add('is-click');    });
  document.addEventListener('mouseup',   () => { isClick = false; ring.classList.remove('is-click'); });

  function tick() {
    dotX += (mouseX - dotX) * DOT_LERP;
    dotY += (mouseY - dotY) * DOT_LERP;

    const fx = (mouseX - ringX) * STIFFNESS;
    const fy = (mouseY - ringY) * STIFFNESS;
    ringVX = (ringVX + fx) * DAMPING;
    ringVY = (ringVY + fy) * DAMPING;
    ringX += ringVX;
    ringY += ringVY;

    const tDot  = isClick ? 0.5  : isHover ? 0   : 1;
    const tRing = isClick ? 0.82 : isHover ? 1.6 : 1;
    dotScale  += (tDot  - dotScale)  * 0.14;
    ringScale += (tRing - ringScale) * 0.12;

    dot.style.transform  = `translate3d(${dotX  - DOT_R}px,${dotY  - DOT_R}px,0) scale(${dotScale})`;
    ring.style.transform = `translate3d(${ringX - RING_R}px,${ringY - RING_R}px,0) scale(${ringScale})`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();


/* ═══════════════════════════════════════════════
   NAV  —  frosted glass on scroll
═══════════════════════════════════════════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });


/* ═══════════════════════════════════════════════
   TESTIMONIALS TICKER  —  lerp auto-scroll + drag
═══════════════════════════════════════════════ */
(function initTicker() {
  const wrap  = document.querySelector('.ticker-wrap');
  const track = document.querySelector('.ticker-track');
  if (!wrap || !track) return;

  const BASE_SPEED = 0.7;
  const LERP       = 0.05;

  let x = 0, vel = BASE_SPEED;
  let dragging = false, lastClientX = 0, pendingDelta = 0, halfWidth = 0;

  function measure() { halfWidth = track.scrollWidth / 2; }
  measure();
  window.addEventListener('resize', measure, { passive: true });

  function tick() {
    if (dragging) {
      vel = pendingDelta;
      x  += pendingDelta;
      pendingDelta = 0;
    } else {
      vel += (BASE_SPEED - vel) * LERP;
      x   += vel;
    }
    x = ((x % halfWidth) + halfWidth) % halfWidth;
    track.style.transform = `translateX(${-x}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function dragStart(clientX) { dragging = true; lastClientX = clientX; pendingDelta = 0; wrap.classList.add('dragging'); }
  function dragMove(clientX)  { if (!dragging) return; pendingDelta += lastClientX - clientX; lastClientX = clientX; }
  function dragEnd()          { dragging = false; wrap.classList.remove('dragging'); }

  wrap.addEventListener('mousedown',  e => { e.preventDefault(); dragStart(e.clientX); });
  window.addEventListener('mousemove', e => dragMove(e.clientX));
  window.addEventListener('mouseup',   dragEnd);
  wrap.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), { passive: true });
  wrap.addEventListener('touchmove',  e => { e.preventDefault(); dragMove(e.touches[0].clientX); }, { passive: false });
  wrap.addEventListener('touchend',   dragEnd);
})();


/* ═══════════════════════════════════════════════
   FAQ ACCORDION
═══════════════════════════════════════════════ */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__q');
    const answer   = item.querySelector('.faq-item__a');
    const inner    = document.createElement('div');
    while (answer.firstChild) inner.appendChild(answer.firstChild);
    answer.appendChild(inner);

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();


/* ═══════════════════════════════════════════════
   CONTACT FORM  —  Web3Forms
═══════════════════════════════════════════════ */
(function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn    = contactForm.querySelector('.form-submit');
    const notice = contactForm.querySelector('.form-notice');

    btn.disabled    = true;
    btn.textContent = 'Sending…';

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      });
      const data = await res.json();

      if (data.success) {
        notice.textContent = '✓ Message sent! We\'ll be in touch within one business day.';
        notice.className   = 'form-notice form-notice--success';
        contactForm.reset();
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch {
      notice.textContent = 'Something went wrong. Please email us directly at hello@quanimous.com';
      notice.className   = 'form-notice form-notice--error';
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Send message';
    }
  });
})();


/* ═══════════════════════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════════════════════ */
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
