/* ============================================================
   UTIL: reveal on scroll
   ============================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ============================================================
   UTIL: header scrolled state
   ============================================================ */
(function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   UTIL: mobile menu (simples)
   ============================================================ */
(function initMenu() {
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-links');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.style.display === 'flex';
    nav.style.display = open ? '' : 'flex';
    nav.style.flexDirection = 'column';
    nav.style.position = 'absolute';
    nav.style.top = '4rem';
    nav.style.left = '0';
    nav.style.right = '0';
    nav.style.background = '#fff';
    nav.style.padding = '1rem 1.5rem';
    nav.style.borderBottom = '1px solid var(--border)';
    btn.setAttribute('aria-expanded', String(!open));
  });
})();

/* ============================================================
   HERO: crossfade entre 4 imagens
   ============================================================ */
(function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const imgs = hero.querySelectorAll('.hero-bg img');
  const dots = hero.querySelectorAll('.hero-dots button');
  if (imgs.length < 2 || dots.length !== imgs.length) return;

  let current = 0;
  let timer = null;
  const DELAY = 5500;

  function go(i) {
    current = (i + imgs.length) % imgs.length;
    imgs.forEach((img, idx) => img.classList.toggle('active', idx === current));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
  }

  function next() { go(current + 1); }

  function start() {
    stop();
    timer = setInterval(next, DELAY);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  dots.forEach((d, idx) => {
    d.addEventListener('click', () => { go(idx); start(); });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    start();
  }
})();

/* ============================================================
   CASE 3 — toggle Raw MT / Post-edited (highlight)
   ============================================================ */
(function initMtpeToggle() {
  const toggle = document.querySelector('#mtpe-toggle');
  const card = document.querySelector('#mtpe-proof');
  if (!toggle || !card) return;
  const body = card.querySelector('.proof-body');
  const label = toggle.querySelector('span');
  const badge = card.querySelector('.proof-foot');
  let hl = true;

  toggle.setAttribute('aria-pressed', 'true');
  body.classList.add('hl');

  toggle.addEventListener('click', () => {
    hl = !hl;
    body.classList.toggle('hl', hl);
    toggle.setAttribute('aria-pressed', String(hl));
    if (label) label.textContent = hl ? 'Hide edits' : 'Show edits';
    if (badge) {
      const tag = badge.querySelector('.mqm-badge');
      if (tag) tag.textContent = hl ? 'MQM 100 · 0 errors · native reviewer' : 'MQM 100 · native reviewer';
    }
  });
})();

/* ============================================================
   CASE 4 — timeline QC: clique para corrigir cue
   ============================================================ */
(function initQcTimeline() {
  const cues = document.querySelectorAll('.cue[data-fix]');
  if (!cues.length) return;

  const counter = document.querySelector('#qc-counter');
  let fixed = 0;

  cues.forEach(cue => {
    cue.addEventListener('click', () => {
      if (cue.classList.contains('ok')) return;
      const fix = cue.dataset.fix;
      cue.classList.remove('err');
      cue.classList.add('ok');
      if (fix === 'left') cue.style.left = 'calc(' + cue.style.left + ' - 8%)';
      if (fix === 'right') cue.style.left = 'calc(' + cue.style.left + ' + 8%)';
      if (fix === 'shrink') cue.style.width = 'calc(' + cue.style.width + ' * 0.6)';
      fixed++;
      if (counter) counter.textContent = `3 issues · ${fixed} fixed`;
    });
  });
})();

/* ============================================================
   CASE 2 — template tabs (Netflix / Amazon / Generic)
   ============================================================ */
(function initTemplateTabs() {
  const tabs = document.querySelectorAll('.template-tab');
  const panels = document.querySelectorAll('.template-content');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
      panels.forEach(p => p.classList.toggle('active', p.id === id));
    });
  });
})();

/* ============================================================
   CASE 1 — timeline de spotting: toggle source/subtitle
   ============================================================ */
(function initSpotting() {
  const toggle = document.querySelector('#spotting-toggle');
  const cueList = document.querySelector('#spotting-cues');
  if (!toggle || !cueList) return;

  const source = cueList.querySelector('.cue-source');
  const target = cueList.querySelector('.cue-target');
  let showTarget = false;

  toggle.addEventListener('click', () => {
    showTarget = !showTarget;
    source.style.display = showTarget ? 'none' : 'block';
    target.style.display = showTarget ? 'block' : 'none';
    toggle.setAttribute('aria-pressed', String(showTarget));
    toggle.textContent = showTarget ? 'Show source' : 'Show subtitles';
  });
})();
