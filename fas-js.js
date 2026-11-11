/* ============================================================
   PROMISE — Animação Strike & Type
   ============================================================ */
(function initPromiseAnimation() {
  const cards = document.querySelectorAll('.promise-card h3');
  if (!cards.length) return;

  const replacements = {
    'Accurate': 'Authentic',
    'Localized': 'Linguistic',
    'Careful': 'Consistent'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const h3 = entry.target;
        const originalText = h3.textContent.replace(/^[A-Z]/, ''); // Pega o resto da palavra
        const firstLetter = h3.textContent[0]; // Pega a primeira letra
        
        // 1. Tachar o texto original
        h3.innerHTML = `<span class="first">${firstLetter}</span><span class="strike">${originalText}</span>`;
        
        setTimeout(() => {
          // 2. Substituir com efeito typewriter
          const newWord = replacements[h3.textContent.replace(/[^a-zA-Z]/g, '')] || 'Expert';
          let i = 0;
          const target = h3.querySelector('.strike');
          if (!target) return;
          
          target.style.textDecoration = 'none';
          target.style.color = 'transparent';
          target.style.borderBottom = '2px solid #9d1402';
          
          // Efeito de digitação manual simples
          const typeInterval = setInterval(() => {
            if (i < newWord.length) {
              target.textContent = newWord.substring(0, i + 1);
              target.style.color = 'var(--foreground)';
              target.style.borderBottom = 'none'; // Remove a borda após começar a digitar
              i++;
            } else {
              clearInterval(typeInterval);
            }
          }, 100); // Velocidade da digitação
        }, 800); // Delay antes de começar a digitar

        obs.unobserve(h3);
      }
    });
  }, { threshold: 0.5 });

  cards.forEach(card => observer.observe(card));
})();