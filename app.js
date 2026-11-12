/* ============================================================
   FAS Localization Portfolio — app.js
   Mantém: header scroll, hero carousel, marquee.
   Adiciona: strike & type LOOP INFINITO na seção Promise.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     HEADER SCROLL
     ============================================================ */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 24);
    }, { passive: true });
    // Estado inicial correto (caso a página carregue já com scroll)
    header.classList.toggle('scrolled', window.scrollY > 24);
  }

  /* ============================================================
     HERO CAROUSEL
     ============================================================ */
  (function initHero() {
    const slides = document.querySelectorAll('.hero-slide');
    const imgs   = document.querySelectorAll('.hero-bg img');
    const dots   = document.querySelectorAll('.hero-dots button');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    const playBtn = document.getElementById('heroPlay');
    if (!slides.length || !imgs.length) return;

    let current = 0;
    let timer = null;
    let paused = false;
    const DELAY = 5500;

    function render() {
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      imgs.forEach((img, i) => img.classList.toggle('active', i === current));
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.classList.toggle('paused', paused);
      });
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = null;
      if (paused) return;

      dots.forEach(d => {
        const fill = d.querySelector('.fill');
        if (fill) {
          fill.style.animation = 'none';
          void fill.offsetWidth;
          fill.style.animation = '';
        }
      });

      timer = setInterval(() => {
        current = (current + 1) % slides.length;
        render();
        restart();
      }, DELAY);
    }

    function go(i) {
      current = (i + slides.length) % slides.length;
      render();
      restart();
    }

    prevBtn?.addEventListener('click', () => go(current - 1));
    nextBtn?.addEventListener('click', () => go(current + 1));
    playBtn?.addEventListener('click', () => {
      paused = !paused;
      playBtn.innerHTML = paused
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
      dots.forEach(d => d.classList.toggle('paused', paused));
      restart();
    });
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

    render();
    restart();
  })();

  /* ============================================================
     PROMISE — STRIKE & TYPE ANIMATION (LOOP INFINITO)
     ============================================================ */
  (function initPromiseAnimation() {
    const promiseCards = document.querySelectorAll('.promise-card h3');
    if (!promiseCards.length) return;

    // Mapeamento: valor do data-word → o que substitui o "resto" da palavra
    const replacements = {
      'Ariane':   'uthentic',   // A + riane  →  A + uthentic  = Authentic
      'Lesnyak':  'ocalized',   // L + esnyak →  L + ocalized = Localized
      'Castelló': 'ontent'      // C + astelló → C + ontent   = Content
    };

    function runLoop(h3) {
      const originalWord = h3.dataset.word;
      if (!originalWord || !replacements[originalWord]) return;

      const firstSpan = h3.querySelector('.first');
      const restSpan  = h3.querySelector('.rest');
      if (!firstSpan || !restSpan) return;

      const originalRest = originalWord.slice(1);   // "riane" / "esnyak" / "astelló"
      const newRest      = replacements[originalWord]; // "uthentic" / "ocalized" / "ontent"

      let typeTimer = null;

      function cycle() {
        // 1. Reset
        if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
        restSpan.textContent = originalRest;
        restSpan.classList.remove('strike', 'hide');
        restSpan.style.opacity = '';
        restSpan.style.color = '';

        // 2. Strike
        setTimeout(() => {
          restSpan.classList.add('strike');
        }, 600);

        // 3. Hide
        setTimeout(() => {
          restSpan.classList.add('hide');
        }, 1400);

        // 4. Typewriter
        setTimeout(() => {
          restSpan.classList.remove('strike', 'hide');
          restSpan.textContent = '';
          let i = 0;
          typeTimer = setInterval(() => {
            if (i < newRest.length) {
              restSpan.textContent += newRest.charAt(i);
              i++;
            } else {
              clearInterval(typeTimer);
              typeTimer = null;
            }
          }, 100);
        }, 2000);

        // 5. Reinicia o ciclo
        setTimeout(cycle, 5500);
      }

      cycle();
    }

    // Dispara o loop quando o card entra na tela (uma vez por card)
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const h3 = entry.target;
          if (h3.dataset.started) return;
          h3.dataset.started = 'true';
          runLoop(h3);
          obs.unobserve(h3);
        });
      }, { threshold: 0.4 });

      promiseCards.forEach(card => observer.observe(card));
    } else {
      promiseCards.forEach(runLoop);
    }
  })();

  /* ============================================================
     MARQUEE — hover pause (redundância segura com o CSS)
     ============================================================ */
  (function initMarquee() {
    const track = document.querySelector('.collab-track');
    if (!track) return;
    track.addEventListener('mouseenter', () => track.classList.add('paused'));
    track.addEventListener('mouseleave', () => track.classList.remove('paused'));
  })();

});
