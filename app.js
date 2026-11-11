document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     HEADER SCROLL
     ============================================================ */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });


  /* ============================================================
     HERO CAROUSEL
     ============================================================ */
  const slides = document.querySelectorAll('.hero-slide');
  const imgs = document.querySelectorAll('.hero-bg img');
  const dots = document.querySelectorAll('.hero-dots button');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const playBtn = document.getElementById('heroPlay');

  if (slides.length) {
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
      
      // Reinicia animação do dot
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
  }


  /* ============================================================
     PROMISE — STRIKE & TYPE ANIMATION
     ============================================================ */
  const promiseCards = document.querySelectorAll('.promise-card h3');
  
  if (promiseCards.length) {
    const replacements = {
      'Accurate': 'uthentic',
      'Localized': 'inguistic',
      'Careful': 'onsistent'
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        
        const h3 = entry.target;
        if (h3.dataset.animated) return;
        h3.dataset.animated = 'true';

        const originalWord = h3.dataset.word; // "Accurate"
        const firstLetter = originalWord[0];   // "A"
        const newRest = replacements[originalWord] || 'xpert'; // "uthentic"

        const firstSpan = h3.querySelector('.first');
        const restSpan = h3.querySelector('.rest');

        if (!firstSpan || !restSpan) return;

        // 1. Aplica o strike no resto da palavra
        restSpan.classList.add('strike');
        
        // 2. Após 800ms, esconde o resto
        setTimeout(() => {
          restSpan.classList.add('hide');
          
          // 3. Após 400ms, começa a digitar a nova palavra
          setTimeout(() => {
            restSpan.classList.remove('strike', 'hide');
            restSpan.textContent = '';
            
            let i = 0;
            const typeInterval = setInterval(() => {
              if (i < newRest.length) {
                restSpan.textContent += newRest.charAt(i);
                i++;
              } else {
                clearInterval(typeInterval);
              }
            }, 80);
          }, 400);
        }, 800);

        obs.unobserve(h3);
      });
    }, { threshold: 0.5 });

    promiseCards.forEach(card => observer.observe(card));
  }

});
