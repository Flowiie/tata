/* Tata Productions — interactions (vanilla, no dependencies) */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ── Content ── */
  const marqueeA = ['Post-production', 'Motion graphics', 'Color grading', 'Sound design', 'VFX', 'Full production'];
  const marqueeB = ['agency partner', 'white-label', 'event coverage', 'corporate films', 'bilingual', 'Dallas · Texas'];
  const clients = ['Microsoft', 'Amazon', 'Google', 'Meta', 'Apple', 'Tesla'];
  const projects = [
    { title: 'Tech Startup Launch', category: 'Corporate Film', client: 'Fortune 500', year: '2025',
      src: 'https://images.unsplash.com/photo-1705107958696-a7f73c749ab3?w=1200&q=70' },
    { title: 'Executive Leadership', category: 'Interview Series', client: 'Enterprise', year: '2025',
      src: 'https://images.unsplash.com/photo-1628571201562-cf216865f739?w=900&q=70' },
    { title: 'Annual Conference', category: 'Event Coverage', client: 'Global Brand', year: '2024',
      src: 'https://images.unsplash.com/photo-1764068866740-506ba4cf64e4?w=1000&q=70' },
    { title: 'Product Innovation', category: 'Brand Film', client: 'SMB', year: '2024',
      src: 'https://images.unsplash.com/photo-1704580116048-cff8a7f72d47?w=1100&q=70' },
    { title: 'Recruitment Campaign', category: 'Employer Branding', client: 'Tech Company', year: '2024',
      src: 'https://images.unsplash.com/photo-1762028894947-427157955fea?w=1100&q=70' },
    { title: 'Thought Leadership', category: 'Documentary', client: 'Consultancy', year: '2023',
      src: 'https://images.unsplash.com/photo-1641671668696-f5061907290f?w=900&q=70' },
  ];

  /* ── Build dynamic markup ── */
  const marqueeHTML = (items) =>
    items.map((t) => `<span class="marquee__item"><span>${t}</span><i class="star"></i></span>`).join('');
  ['marqueeA', 'marqueeB'].forEach((id, i) => {
    const el = document.getElementById(id);
    const html = marqueeHTML(i ? marqueeB : marqueeA);
    el.innerHTML = html + html + html;
  });
  $('#logosTrack').innerHTML = [...clients, ...clients, ...clients, ...clients].map((c) => `<span>${c}</span>`).join('');
  $('#workGrid').innerHTML = projects.map((p) => `
    <a class="project" href="#contact" data-cursor="View" data-reveal>
      <div class="project__media">
        <span class="project__badge">${p.client}</span>
        <img src="${p.src}" alt="${p.title}" loading="lazy" onerror="this.remove()">
      </div>
      <div class="project__meta">
        <h3 class="project__title">${p.title}</h3>
        <span class="project__cat">${p.category} · <em>${p.year}</em></span>
      </div>
    </a>`).join('');
  $('#year').textContent = new Date().getFullYear();

  /* Split the about statement into words for scroll-scrubbed reveal */
  const statement = $('#statement');
  const highlight = new Set(['post-production', 'english', 'spanish,', 'world.']);
  statement.innerHTML = statement.textContent.trim().split(/\s+/)
    .map((w) => `<span class="w${highlight.has(w.toLowerCase()) ? ' hl' : ''}">${w}</span>`).join(' ');
  const words = $$('.w', statement);

  /* Split display headings into masked lines (split on <br>) */
  $$('[data-split]').forEach((el) => {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((l) => `<span class="sl"><span>${l.trim()}</span></span>`).join('');
  });

  /* Wrap testimonial words for the blur-in effect */
  $$('.quote blockquote').forEach((q) => {
    let i = 0;
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span');
            s.className = 'qw'; s.textContent = part; s.style.transitionDelay = `${(i++) * 0.025}s`;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    wrap(q);
  });

  /* ── Preloader ── */
  const loaderCount = $('#loaderCount');
  const loaderBar = $('#loaderBar');
  const heroVideo = $('#heroVideo');
  let progress = 0;
  let assetsReady = false;
  const markReady = () => { assetsReady = true; };
  if (heroVideo.readyState >= 3) markReady();
  heroVideo.addEventListener('canplay', markReady, { once: true });
  heroVideo.addEventListener('error', markReady, { once: true });
  window.addEventListener('load', markReady, { once: true });
  setTimeout(markReady, 3500); // never block the site on a slow video

  const startTime = performance.now();
  (function tickLoader(now) {
    const minDone = now - startTime > (reduceMotion ? 200 : 1600);
    const target = assetsReady && minDone ? 100 : Math.min(90, (now - startTime) / 22);
    progress += (target - progress) * 0.08;
    if (target === 100 && progress > 99.4) progress = 100;
    loaderCount.textContent = String(Math.round(progress)).padStart(3, '0');
    loaderBar.style.transform = `scaleX(${progress / 100})`;
    if (progress < 100) return requestAnimationFrame(tickLoader);
    setTimeout(() => {
      $('#loader').classList.add('is-done');
      body.classList.remove('is-loading');
      body.classList.add('is-ready');
      heroVideo.play().catch(() => {});
    }, 200);
  })(startTime);

  /* ── Timecode (HH:MM:SS:FF @ 24fps) ── */
  const tc = $('#timecode');
  const tcStart = performance.now();
  const pad = (n) => String(n).padStart(2, '0');
  setInterval(() => {
    const f = Math.floor(((performance.now() - tcStart) / 1000) * 24);
    tc.textContent = `${pad(Math.floor(f / 86400) % 24)}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
  }, 1000 / 24);

  /* ── Sound toggle ── */
  const soundBtn = $('#soundBtn');
  soundBtn.addEventListener('click', () => {
    heroVideo.muted = !heroVideo.muted;
    const on = !heroVideo.muted;
    soundBtn.classList.toggle('is-on', on);
    soundBtn.setAttribute('aria-pressed', on);
    $('.sound__txt', soundBtn).textContent = on ? 'Sound on' : 'Sound off';
    if (on) heroVideo.play().catch(() => {});
  });

  /* ── Showreel modal ── */
  const modal = $('#modal');
  const modalVideo = $('#modalVideo');
  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
    heroVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.muted = false;
    modalVideo.play().catch(() => {});
    $('#modalClose').focus();
  };
  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
    modalVideo.pause();
    heroVideo.play().catch(() => {});
  };
  $('#reelBtn').addEventListener('click', openModal);
  $('#reelFrame').addEventListener('click', openModal);
  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  /* ── Menu ── */
  const burger = $('#burger');
  const menu = $('#menu');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', !open);
  };
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (modal.classList.contains('is-open')) closeModal();
    if (body.classList.contains('menu-open')) setMenu(false);
  });

  /* ── Smooth anchors ── */
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.documentElement : $(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ── Services accordion + floating preview ── */
  const preview = $('#svcPreview');
  const previewImg = $('img', preview);
  $$('.svc').forEach((svc) => {
    const row = $('.svc__row', svc);
    row.addEventListener('click', () => {
      const open = !svc.classList.contains('is-open');
      $$('.svc.is-open').forEach((o) => { o.classList.remove('is-open'); $('.svc__row', o).setAttribute('aria-expanded', 'false'); });
      svc.classList.toggle('is-open', open);
      row.setAttribute('aria-expanded', open);
    });
    if (finePointer) {
      row.addEventListener('mouseenter', () => {
        if (previewImg.getAttribute('src') !== svc.dataset.img) { previewImg.classList.remove('is-loaded'); previewImg.src = svc.dataset.img; }
        preview.classList.add('is-on');
      });
      row.addEventListener('mouseleave', () => preview.classList.remove('is-on'));
    }
  });
  previewImg.addEventListener('load', () => previewImg.classList.add('is-loaded'));

  /* ── Testimonials ── */
  const quotes = $$('.quote');
  let qi = 0;
  let qTimer;
  const showQuote = (n) => {
    qi = (n + quotes.length) % quotes.length;
    quotes.forEach((q, i) => q.classList.toggle('is-active', i === qi));
    $('#qIdx').textContent = pad(qi + 1);
    clearInterval(qTimer);
    qTimer = setInterval(() => showQuote(qi + 1), 7000);
  };
  $('#qPrev').addEventListener('click', () => showQuote(qi - 1));
  $('#qNext').addEventListener('click', () => showQuote(qi + 1));
  showQuote(0);

  /* ── Reveal on scroll + counters ── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  $$('[data-reveal],[data-split]').forEach((el, i) => {
    if (el.matches('.stat,.pillar,.partner,.award')) el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    io.observe(el);
  });

  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = +el.dataset.count;
      const t0 = performance.now();
      const dur = reduceMotion ? 1 : 1800;
      (function step(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ── Local time in Dallas ── */
  const localTime = $('#localTime');
  const updateTime = () => {
    try {
      localTime.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' }).format(new Date()) + ' CT';
    } catch (_) { localTime.textContent = 'Central Time'; }
  };
  updateTime(); setInterval(updateTime, 30000);

  /* ── Contact form (front-end validation; wire to your backend / Formspree) ── */
  const form = $('#form');
  const rules = {
    fname: (v) => (v.trim() ? '' : 'Please tell us your name'),
    femail: (v) => (!v.trim() ? 'Email is required' : /\S+@\S+\.\S+/.test(v) ? '' : 'Enter a valid email'),
    fphone: (v) => (v.trim() ? '' : 'Phone is required'),
    fmessage: (v) => (v.trim() ? '' : 'Tell us about your project'),
  };
  const check = (id) => {
    const el = document.getElementById(id);
    const msg = rules[id](el.value);
    const field = el.closest('.field');
    field.classList.toggle('has-error', !!msg);
    $('small', field).textContent = msg;
    return !msg;
  };
  Object.keys(rules).forEach((id) => document.getElementById(id).addEventListener('input', () => check(id)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = Object.keys(rules).map(check).every(Boolean);
    if (!ok) return;
    $$('.field, .btn--big', form).forEach((el) => { el.style.display = 'none'; });
    $('#formOk').hidden = false;
  });

  /* ── Custom cursor ── */
  if (finePointer && !reduceMotion) {
    body.classList.add('has-cursor');
    const cursor = $('#cursor');
    const dot = $('#cursorDot');
    const label = $('#cursorLabel');
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, px = mx, py = my;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('mouseover', (e) => {
      const lab = e.target.closest('[data-cursor]');
      const hov = e.target.closest('a,button,[data-hover],label');
      cursor.classList.toggle('is-label', !!lab);
      cursor.classList.toggle('is-hover', !lab && !!hov);
      label.textContent = lab ? lab.dataset.cursor : '';
    });
    (function loop() {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      px += (mx - px) * 0.1; py += (my - py) * 0.1;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      preview.style.transform = ''; // class-driven scale; position via left/top
      preview.style.left = `${px + 40}px`;
      preview.style.top = `${py - 165}px`;
      requestAnimationFrame(loop);
    })();

    /* magnetic buttons */
    $$('.reel-btn, .qbtn, .btn--big').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`;
      });
      el.addEventListener('mouseleave', () => { el.style.translate = ''; });
    });
  }

  /* ── Scroll-driven effects (single rAF loop) ── */
  const nav = $('#nav');
  const hero = $('#hero');
  const heroContent = $('.hero__content');
  const reelSec = $('#reel');
  const reelSticky = $('.reel__sticky', reelSec);
  const reelVideo = $('.reel__video', reelSec);
  const processSec = $('#process');
  const processTrack = $('#processTrack');
  const processBar = $('#processBar');
  const marqueeRows = $$('.marquee__row');
  const navLinks = $$('.nav__links a');
  const sections = navLinks.map((a) => $(a.getAttribute('href')));

  let lastY = window.scrollY;
  let velocity = 0;
  const marqueeX = [0, 0];

  const sectionProgress = (el) => {
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  };

  function frame() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const dy = y - lastY;
    velocity += (dy - velocity) * 0.1;

    // nav
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', dy > 4 && y > vh * 0.8 && !body.classList.contains('menu-open'));
    if (dy < -4) nav.classList.remove('is-hidden');

    if (!reduceMotion) {
      // hero parallax
      if (y < vh * 1.2) {
        heroContent.style.transform = `translate3d(0,${y * 0.25}px,0)`;
        heroContent.style.opacity = String(clamp(1 - y / (vh * 0.75), 0, 1));
        if (y > 0 || heroVideo.style.transform) heroVideo.style.transform = `scale(${1 + y / vh * 0.12})`;
      }

      // marquee: constant drift + scroll velocity
      marqueeRows.forEach((row, i) => {
        const track = row.firstElementChild;
        const w = track.scrollWidth / 3;
        const dir = +row.dataset.speed;
        marqueeX[i] -= dir * (0.6 + Math.abs(velocity) * 0.25);
        if (marqueeX[i] <= -w) marqueeX[i] += w;
        if (marqueeX[i] > 0) marqueeX[i] -= w;
        track.style.transform = `translate3d(${marqueeX[i]}px,0,0) skewX(${clamp(-velocity * 0.4, -12, 12)}deg)`;
      });

      // expanding reel
      const rp = sectionProgress(reelSec);
      const eased = clamp(rp / 0.65, 0, 1);
      reelSticky.style.setProperty('--p', (1 - Math.pow(1 - eased, 3)).toFixed(4));
      const reelVisible = reelSec.getBoundingClientRect();
      if (reelVisible.top < vh && reelVisible.bottom > 0) { if (reelVideo.paused) reelVideo.play().catch(() => {}); }
      else if (!reelVideo.paused) reelVideo.pause();

      // horizontal process
      if (window.innerWidth > 720) {
        const pp = sectionProgress(processSec);
        const max = processTrack.scrollWidth - window.innerWidth;
        processTrack.style.transform = `translate3d(${-pp * max}px,0,0)`;
        processBar.style.transform = `scaleX(${pp})`;
      } else {
        processTrack.style.transform = '';
      }
    }

    // about statement word scrub
    const sr = statement.getBoundingClientRect();
    const sp = clamp((vh * 0.85 - sr.top) / (sr.height + vh * 0.35), 0, 1);
    const lit = Math.floor(sp * words.length * 1.05);
    words.forEach((w, i) => w.classList.toggle('is-on', i < lit));

    // active nav link
    let active = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * 0.4) active = i; });
    navLinks.forEach((a, i) => a.classList.toggle('is-active', i === active));

    lastY = y;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
