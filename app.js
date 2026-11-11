/* ============================================================
   HEADER — transparente → branco translúcido no scroll
   ============================================================ */
(function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   HERO — 4 slides com áreas de atuação + progresso + controles
   ============================================================ */
(function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const slides = hero.querySelectorAll('.hero-slide');
  const imgs = hero.querySelectorAll('.hero-bg img');
  const dots = hero.querySelectorAll('.hero-dots button');
  const prevBtn = hero.querySelector('#heroPrev');
  const nextBtn = hero.querySelector('#heroNext');
  const playBtn = hero.querySelector('#heroPlay');
  if (slides.length < 2) return;

  const DELAY = 5500;
  let current = 0;
  let timer = null;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    imgs.forEach((img, i) => img.classList.toggle('active', i === current));
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.classList.toggle('paused', paused);
    });
  }

  function go(i) {
    current = (i + slides.length) % slides.length;
    render();
    restart();
  }

  function next() { go(current + 1); }

  function restart() {
    if (timer) clearInterval(timer);
    timer = null;
    if (paused) return;
    // Reinicia a animação da barra de progresso
    dots.forEach(d => {
      const fill = d.querySelector('.fill');
      if (fill) {
        fill.style.animation = 'none';
        // força reflow
        void fill.offsetWidth;
        fill.style.animation = '';
      }
    });
    timer = setInterval(next, DELAY);
  }

  prevBtn && prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => go(current + 1));
  playBtn && playBtn.addEventListener('click', () => {
    paused = !paused;
    playBtn.setAttribute('aria-pressed', String(!paused));
    playBtn.innerHTML = paused
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
    dots.forEach(d => d.classList.toggle('paused', paused));
    restart();
  });

  dots.forEach((d, i) => {
    d.addEventListener('click', () => {
      go(i);
    });
  });

  hero.addEventListener('mouseenter', () => {
    if (timer) { clearInterval(timer); timer = null; }
    dots.forEach(d => d.classList.add('paused'));
  });
  hero.addEventListener('mouseleave', () => {
    dots.forEach(d => d.classList.remove('paused'));
    restart();
  });

  render();
  if (!paused) restart();
})();

/* ============================================================
   MARQUEE — pause on hover (CSS-only, mas garante o toggle)
   ============================================================ */
(function initMarquee() {
  const track = document.querySelector('.collab-track');
  if (!track) return;
  track.addEventListener('mouseenter', () => track.classList.add('paused'));
  track.addEventListener('mouseleave', () => track.classList.remove('paused'));
})();
