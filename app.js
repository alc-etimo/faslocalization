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
  // Mapeamento: chave = valor do data-word no HTML
  // valor = o que substitui o "resto" da palavra após o tachado
  const replacements = {
    'Ariane': 'uthentic',     
    'Lesnyak': 'ocalized',   
    'Castelló': 'ontent'    
  };

  // Executa o ciclo em loop infinito para um único h3
  function runLoop(h3) {
    const originalWord = h3.dataset.word;
    if (!originalWord || !replacements[originalWord]) return;

    const firstSpan = h3.querySelector('.first');
    const restSpan = h3.querySelector('.rest');
    if (!firstSpan || !restSpan) return;

    const originalRest = originalWord.slice(1); // "riane"
    const newRest = replacements[originalWord]; // "uthentic"

    function cycle() {
      // 1. Reset: palavra original visível
      restSpan.textContent = originalRest;
      restSpan.classList.remove('strike', 'hide');
      restSpan.style.color = '';

      // 2. Tacha o resto (strike)
      setTimeout(() => {
        restSpan.classList.add('strike');
      }, 600);

      // 3. Esconde o resto
      setTimeout(() => {
        restSpan.classList.add('hide');
      }, 1400);

      // 4. Digita a nova palavra (typewriter)
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
        }, 100);
      }, 2000);

      // 5. Aguarda e reinicia o ciclo
      setTimeout(cycle, 5000);
    }

    // Inicia uma vez
    cycle();
  }

  // Dispara o loop quando o card entra na tela (só uma vez por card)
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const h3 = entry.target;
        if (h3.dataset.started) return;
        h3.dataset.started = 'true';
        runLoop(h3);
        obs.unobserve(h3); // já iniciou o loop, pode parar de observar
      });
    }, { threshold: 0.4 });

    promiseCards.forEach(card => observer.observe(card));
  } else {
    // Fallback: dispara tudo direto se o navegador não suportar
    promiseCards.forEach(runLoop);
  }
}
