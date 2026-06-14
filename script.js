/* =====================================================
   NEXUS CYBORG LANDING — script.js
   Production-ready | Vanilla JS | No dependencies
   ===================================================== */

'use strict';

// ─── PARTICLE SYSTEM ──────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;
  const PARTICLE_COUNT = 80;
  const COLORS = ['rgba(0,212,255,', 'rgba(0,255,255,', 'rgba(123,44,191,', 'rgba(255,0,110,'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + .3,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * .5 + .1,
      life: Math.random() * 200 + 100,
      age: 0,
      // connection lines
      connected: [],
    };
  }

  function init() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
  }

  function drawLines() {
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * .12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,212,255,${opacity})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    drawLines();
    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.age++;

      // Wrap edges
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Fade in/out
      const progress = p.age / p.life;
      const a = progress < .1 ? progress / .1 : progress > .9 ? (1 - progress) / .1 : 1;
      const alpha = p.alpha * a;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha + ')';
      ctx.fill();

      if (p.age >= p.life) particles[idx] = createParticle();
    });
    animId = requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(canvas.parentElement);
  resize();
  init();

  // Respect reduced motion
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tick();
  }
})();


// ─── NAV: scroll class + hamburger ────────────────────
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    lastY = y;
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      mobileMenu.setAttribute('aria-hidden', true);
    });
  });
})();


// ─── COUNTER ANIMATION ────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat__num[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const duration = 1800;
    const start = performance.now();
    const isDecimal = String(target).includes('.');

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = eased * target;
      el.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = isDecimal ? target.toFixed(2) : target;
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .5 });

  counters.forEach(c => io.observe(c));
})();


// ─── SCROLL REVEAL ────────────────────────────────────
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        // Stagger children in the same parent
        const delay = e.target.dataset.delay || 0;
        setTimeout(() => {
          e.target.classList.add('visible');
        }, delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

  // Add stagger delay to grid children
  document.querySelectorAll('.features__grid, .testi__grid').forEach(grid => {
    grid.querySelectorAll('.reveal, article').forEach((el, i) => {
      el.dataset.delay = i * 100;
      // Ensure class is present
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
      }
    });
  });

  // Re-query after we added classes
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();


// ─── DASHBOARD BAR ANIMATION ──────────────────────────
(function initDashboard() {
  const bars = document.querySelectorAll('.db-bar-fill');
  if (!bars.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('animated');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .5 });

  bars.forEach(b => io.observe(b));
})();


// ─── TIMELINE ACTIVE STATE ────────────────────────────
(function initTimeline() {
  const items = document.querySelectorAll('.timeline__item');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('active');
    });
  }, { threshold: .4 });

  items.forEach(item => io.observe(item));
})();


// ─── FEAT CARD GLOW FOLLOW ────────────────────────────
(function initCardGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

  document.querySelectorAll('.feat-card, .testi-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--gx', x + '%');
      card.style.setProperty('--gy', y + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--gx');
      card.style.removeProperty('--gy');
    });
  });
})();


// ─── SMOOTH SCROLL FOR ANCHOR LINKS ───────────────────
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
      const y = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();


// ─── CTA ORB PARALLAX ─────────────────────────────────
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const orbs = document.querySelectorAll('.cta-orb');
  if (!orbs.length) return;

  window.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 15;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }, { passive: true });
})();


// ─── TYPEWRITER BADGE ─────────────────────────────────
(function initTypewriter() {
  const badge = document.querySelector('.hero__badge .mono');
  if (!badge) return;
  const messages = [
    'NEXUS CORTEX v4.1 — ONLINE',
    'NEURAL MESH ACTIVE',
    'QUANTUM CORE SYNCHRONIZED',
    'BIOSYNC CALIBRATED',
    'ALL SYSTEMS NOMINAL',
  ];
  let msgIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = messages[msgIdx];
    if (!deleting) {
      badge.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      badge.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        msgIdx = (msgIdx + 1) % messages.length;
      }
    }
    setTimeout(type, deleting ? 40 : 70);
  }

  // Start after a brief delay
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTimeout(type, 1500);
  }
})();


// ─── GLITCH HEADLINE EFFECT ───────────────────────────
(function initGlitchHeadline() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const headline = document.querySelector('.hero__headline');
  if (!headline) return;

  setInterval(() => {
    headline.style.textShadow = `2px 0 ${Math.random() > .5 ? '#FF006E' : '#00FFFF'}`;
    setTimeout(() => { headline.style.textShadow = 'none'; }, 80);
  }, 5000);
})();
