document.addEventListener('DOMContentLoaded', () => {
  /* HEADER */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });
  }

  /* ============================================================
     CASE 1 — Spotting: toggle source / subtitle
     ============================================================ */
  const spottingToggle = document.getElementById('spotting-toggle');
  if (spottingToggle) {
    const sourceList = document.getElementById('spotting-source');
    const targetList = document.getElementById('spotting-target');
    let showTarget = false;
    spottingToggle.addEventListener('click', () => {
      showTarget = !showTarget;
      sourceList.style.display = showTarget ? 'none' : 'block';
      targetList.style.display = showTarget ? 'block' : 'none';
      spottingToggle.textContent = showTarget ? 'Show source' : 'Show subtitles';
      spottingToggle.setAttribute('aria-pressed', String(showTarget));
    });
  }

  /* ============================================================
     CASE 2 — Template tabs + CPS validation
     ============================================================ */
  const tabs = document.querySelectorAll('.template-tab');
  const panels = document.querySelectorAll('.template-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
      panels.forEach(p => p.classList.toggle('active', p.id === id));
    });
  });

  const cpsBox = document.getElementById('cps-box');
  if (cpsBox) {
    const lines = cpsBox.querySelectorAll('.line');
    const duration = 2.6; // segundos do cue de exemplo
    let totalChars = 0;
    let maxLineChars = 0;
    lines.forEach(line => {
      const chars = line.textContent.replace(/\s/g, '').length;
      totalChars += chars;
      if (chars > maxLineChars) maxLineChars = chars;
    });
    const cps = (totalChars / duration).toFixed(1);
    const cpsEl = document.getElementById('cps-value');
    const cplEl = document.getElementById('cpl-value');
    const linesEl = document.getElementById('lines-value');
    if (cpsEl) cpsEl.textContent = cps;
    if (cplEl) cplEl.textContent = maxLineChars;
    if (linesEl) linesEl.textContent = lines.length;
    const cpsMetric = document.getElementById('cps-metric');
    if (cpsMetric) cpsMetric.classList.toggle('bad', parseFloat(cps) > 17);
    const cplMetric = document.getElementById('cpl-metric');
    if (cplMetric) cplMetric.classList.toggle('bad', maxLineChars > 42);
  }

  /* ============================================================
     CASE 3 — MTPE toggle (raw MT vs post-edited)
     ============================================================ */
  const mtpeToggle = document.getElementById('mtpe-toggle');
  if (mtpeToggle) {
    const proofBody = document.getElementById('mtpe-body');
    const mqm = document.getElementById('mtpe-mqm');
    let hl = true;
    mtpeToggle.setAttribute('aria-pressed', 'true');
    proofBody.classList.add('hl');

    mtpeToggle.addEventListener('click', () => {
      hl = !hl;
      proofBody.classList.toggle('hl', hl);
      mtpeToggle.setAttribute('aria-pressed', String(hl));
      mtpeToggle.textContent = hl ? 'Hide edits' : 'Show edits';
      if (mqm) mqm.textContent = hl ? 'MQM 100 · 0 errors · native reviewer' : 'MQM 100 · native reviewer';
    });
  }

  /* ============================================================
     CASE 4 — QC timeline: clique para corrigir cue
     ============================================================ */
  const cues = document.querySelectorAll('.cue[data-fix]');
  if (cues.length) {
    const counter = document.getElementById('qc-counter');
    const status = document.getElementById('qc-status');
    let fixed = 0;
    const total = cues.length;

    cues.forEach(cue => {
      cue.addEventListener('click', () => {
        if (cue.classList.contains('ok')) return;
        const fix = cue.dataset.fix;
        cue.classList.remove('err');
        cue.classList.add('ok');
        if (fix === 'left') cue.style.left = (parseFloat(cue.style.left) + 6) + '%';
        if (fix === 'right') cue.style.left = (parseFloat(cue.style.left) - 6) + '%';
        if (fix === 'shrink') cue.style.width = (parseFloat(cue.style.width) * 0.6) + '%';
        fixed++;
        if (counter) counter.textContent = `${total} issues · ${fixed} fixed`;
        if (status) status.textContent = fixed === total ? '✓ All fixed' : 'Click each cue to fix';
      });
    });
  }
});