document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     HEADER
     ============================================================ */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });
  }

  /* ============================================================
     CASE 1 — Spotting toggle (mantido)
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
     CASE 3 — MTPE toggle (mantido)
     ============================================================ */
  const mtpeToggle = document.getElementById('mtpe-toggle');
  if (mtpeToggle) {
    const proofBody = document.getElementById('mtpe-body');
    const mqm = document.getElementById('mtpe-mqm');
    let hl = true;
    mtpeToggle.setAttribute('aria-pressed', 'true');
    if (proofBody) proofBody.classList.add('hl');
    mtpeToggle.addEventListener('click', () => {
      hl = !hl;
      if (proofBody) proofBody.classList.toggle('hl', hl);
      mtpeToggle.setAttribute('aria-pressed', String(hl));
      mtpeToggle.textContent = hl ? 'Hide edits' : 'Show edits';
      if (mqm) mqm.textContent = hl ? 'MQM 100 · 0 errors · native reviewer' : 'MQM 100 · native reviewer';
    });
  }

  /* ============================================================
     CASE 2 — Timed subtitle translation workspace
     ============================================================ */
  (function initSubEditor() {
    const targetText   = document.getElementById('target-text');
    if (!targetText) return;

    const videoOverlay = document.getElementById('video-overlay');
    const cueRange     = document.getElementById('cue-range');
    const cueDuration  = document.getElementById('cue-duration');
    const durationRange = document.getElementById('duration-input');
    const durationNum   = document.getElementById('duration-number');
    const tcIn  = document.getElementById('tc-in');
    const tcOut = document.getElementById('tc-out');
    const profileSelect = document.getElementById('profile-select');
    const customProfile = document.getElementById('custom-profile');
    const customCps   = document.getElementById('custom-cps');
    const customCpl   = document.getElementById('custom-cpl');
    const customLines = document.getElementById('custom-lines');
    const statusMsg   = document.getElementById('status-message');

    const profiles = {
      A: { cps: 17, cpl: 42, lines: 2, label: 'Profile A · 17 CPS · 42 CPL · 2 lines' },
      B: { cps: 20, cpl: 42, lines: 2, label: 'Profile B · 20 CPS · 42 CPL · 2 lines' }
    };

    let currentProfile = 'A';
    let custom = { cps: 17, cpl: 42, lines: 2 };

    /* unicode-aware length, spaces counted, line breaks excluded */
    function visibleLength(str) {
      return [...str.replace(/\r/g, '').replace(/\n/g, '')].length;
    }

    function maxLineLength(lines) {
      return lines.reduce((m, l) => Math.max(m, [...l].length), 0);
    }

    function getLimits() {
      if (currentProfile === 'custom') return custom;
      return profiles[currentProfile] || profiles.A;
    }

    function recalc() {
      const text = targetText.value;
      const lines = text.split('\n');
      const duration = parseFloat(durationNum.value) || 0;
      const limits = getLimits();

      const chars = visibleLength(text);
      const cpl = maxLineLength(lines);
      const lineCount = lines.length;
      const cps = duration > 0 ? chars / duration : 0;

      // update metrics
      document.getElementById('metric-cps').textContent = cps ? cps.toFixed(1) : '—';
      document.getElementById('metric-cpl').textContent = cpl || '—';
      document.getElementById('metric-lines').textContent = lineCount;
      document.getElementById('metric-chars').textContent = chars;

      // states
      setState('cps', cps && cps <= limits.cps ? 'ok' : 'bad',
               cps && cps <= limits.cps ? `≤ ${limits.cps} CPS` : `> ${limits.cps} CPS`);
      setState('cpl', cpl <= limits.cpl ? 'ok' : 'bad',
               cpl <= limits.cpl ? `≤ ${limits.cpl} CPL` : `> ${limits.cpl} CPL`);
      setState('lines', lineCount <= limits.lines ? 'ok' : 'bad',
               lineCount <= limits.lines ? `≤ ${limits.lines} lines` : `> ${limits.lines} lines`);
      setState('chars', 'ok', 'counted');

      const ready = cps <= limits.cps && cpl <= limits.cpl && lineCount <= limits.lines;
      const summary = document.getElementById('validation-summary');
      summary.textContent = ready
        ? `Ready for ${currentProfile === 'custom' ? 'custom profile' : 'demo profile ' + currentProfile}.`
        : 'Needs adjustment — one or more limits exceeded.';
      summary.dataset.state = ready ? 'ok' : 'bad';

      // video overlay + meta
      if (videoOverlay) videoOverlay.textContent = text || ' ';
      if (cueDuration) cueDuration.textContent = duration.toFixed(2) + 's';
      if (cueRange) cueRange.textContent = `${tcIn.value} → ${tcOut.value}`;
    }

    function setState(metric, state, label) {
      const wrap = document.querySelector(`.sub-metric[data-metric="${metric}"]`);
      if (wrap) wrap.dataset.state = state;
      const el = document.getElementById('state-' + metric);
      if (el) el.textContent = label;
    }

    /* events */
    targetText.addEventListener('input', recalc);

    durationRange.addEventListener('input', () => {
      durationNum.value = durationRange.value;
      recalc();
    });
    durationNum.addEventListener('input', () => {
      durationRange.value = durationNum.value;
      recalc();
    });

    tcIn.addEventListener('change', recalc);
    tcOut.addEventListener('change', recalc);

    document.querySelectorAll('[data-break]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.break;
        if (action === 'remove') {
          targetText.value = targetText.value.replace(/\n/g, ' ');
        } else if (action === 'insert') {
          // insert a line break at the last space, if any
          const v = targetText.value;
          const idx = v.lastIndexOf(' ');
          if (idx > 0) targetText.value = v.slice(0, idx) + '\n' + v.slice(idx + 1);
        }
        recalc();
      });
    });

    profileSelect.addEventListener('change', () => {
      currentProfile = profileSelect.value;
      if (currentProfile === 'custom') {
        customProfile.hidden = false;
        custom = {
          cps: parseInt(customCps.value, 10) || 17,
          cpl: parseInt(customCpl.value, 10) || 42,
          lines: parseInt(customLines.value, 10) || 2
        };
        statusMsg.textContent = `Custom profile · ${custom.cps} CPS · ${custom.cpl} CPL · ${custom.lines} lines`;
      } else {
        customProfile.hidden = true;
        statusMsg.textContent = profiles[currentProfile].label;
      }
      recalc();
    });

    [customCps, customCpl, customLines].forEach(input => {
      input.addEventListener('input', () => {
        custom = {
          cps: parseInt(customCps.value, 10) || 17,
          cpl: parseInt(customCpl.value, 10) || 42,
          lines: parseInt(customLines.value, 10) || 2
        };
        statusMsg.textContent = `Custom profile · ${custom.cps} CPS · ${custom.cpl} CPL · ${custom.lines} lines`;
        recalc();
      });
    });

    recalc();
  })();

  /* ============================================================
     CASE 4 — QC & delivery workspace
     ============================================================ */
  (function initQC() {
    const issueButtons = document.querySelectorAll('.qc-issue');
    if (!issueButtons.length) return;

    const issues = {
      1: {
        title: 'Cue overlaps a shot change',
        text: 'The cue starts before Shot 2 and ends after the cut into Shot 3. Part of the line lands on a shot the source cue does not cover.',
        category: 'Timing',
        severity: 'Major',
        cue: '#014',
        action: 'Trim the out-point to end on the shot change.',
        tcIn: '00:00:04.200',
        tcOut: '00:00:06.800',
        subtitle: 'Achei que você fosse embora.',
        timeline: { left: 18, width: 10 }
      },
      2: {
        title: 'Cue exceeds the brief\u2019s reading speed',
        text: 'At the current duration, the cue is above the demo brief\u2019s CPS limit. The correction should tighten the line, not shorten the cue.',
        category: 'Reading speed',
        severity: 'Major',
        cue: '#022',
        action: 'Tighten the target text; keep the source duration.',
        tcIn: '00:01:14.500',
        tcOut: '00:01:17.300',
        subtitle: 'Eu não acredito que você fez isso de novo, sério.',
        timeline: { left: 40, width: 22 }
      },
      3: {
        title: 'Terminology requires confirmation',
        text: 'The target term may not match the demo glossary. The reviewer should mark it as checked against the brief, not invent a spelling fix.',
        category: 'Terminology',
        severity: 'Minor',
        cue: '#027',
        action: 'Mark as checked against the demo glossary.',
        tcIn: '00:02:03.100',
        tcOut: '00:02:05.400',
        subtitle: 'A gente precisa revisar o compliance.',
        timeline: { left: 52, width: 12 }
      },
      4: {
        title: 'On-screen text not represented',
        text: 'The shot shows a hard-coded title. Depending on the brief, it should either be translated or represented as a forced narrative. This demo shows the forced-narrative option.',
        category: 'On-screen text',
        severity: 'Major',
        cue: '#031',
        action: 'Insert a forced narrative for the on-screen title.',
        tcIn: '00:03:10.000',
        tcOut: '00:03:13.600',
        subtitle: '[placa na porta: “sala de reuniões”]',
        timeline: { left: 72, width: 14 }
      }
    };

    const els = {
      severity:  document.getElementById('qc-severity'),
      title:     document.getElementById('qc-finding-title'),
      text:      document.getElementById('qc-finding-text'),
      category:  document.getElementById('qc-category'),
      cue:       document.getElementById('qc-cue'),
      action:    document.getElementById('qc-action'),
      cueText:   document.getElementById('qc-cue-text'),
      tcIn:      document.getElementById('qc-tc-in'),
      tcOut:     document.getElementById('qc-tc-out'),
      tlCue:     document.getElementById('qc-tl-cue'),
      resolve:   document.getElementById('qc-resolve'),
      recorded:  document.getElementById('qc-recorded'),
      progress:  document.getElementById('qc-progress-fill'),
      progressCount: document.getElementById('qc-progress-count'),
      status:    document.getElementById('qc-status-message'),
      reportToggle: document.getElementById('qc-report-toggle'),
      report:    document.getElementById('qc-report'),
      reportBody: document.getElementById('qc-report-body'),
      reportSummary: document.getElementById('qc-report-summary')
    };

    const resolved = { 1: false, 2: false, 3: false, 4: false };
    let active = 1;

    function selectIssue(num) {
      active = num;
      const d = issues[num];

      issueButtons.forEach(b => b.setAttribute('aria-pressed', String(parseInt(b.dataset.issue, 10) === num)));

      if (els.severity) { els.severity.textContent = d.severity; els.severity.dataset.sev = d.severity; }
      if (els.title)    els.title.textContent = d.title;
      if (els.text)     els.text.textContent = d.text;
      if (els.category) els.category.textContent = d.category;
      if (els.cue)      els.cue.textContent = d.cue;
      if (els.action)   els.action.textContent = d.action;
      if (els.cueText)  els.cueText.textContent = d.subtitle;
      if (els.tcIn)     els.tcIn.textContent = d.tcIn;
      if (els.tcOut)    els.tcOut.textContent = d.tcOut;

      if (els.tlCue) {
        els.tlCue.style.left = d.timeline.left + '%';
        els.tlCue.style.width = d.timeline.width + '%';
        els.tlCue.classList.toggle('is-resolved', resolved[num]);
      }

      if (els.resolve) {
        els.resolve.disabled = resolved[num];
        els.resolve.textContent = resolved[num] ? 'Correction recorded' : 'Record illustrative correction';
      }
      if (els.recorded) els.recorded.hidden = !resolved[num];
    }

    function updateReport() {
      const total = 4;
      const count = Object.values(resolved).filter(Boolean).length;

      if (els.progress) els.progress.style.width = (count / total * 100) + '%';
      if (els.progressCount) els.progressCount.textContent = `${count} / ${total}`;
      if (els.status) els.status.textContent = `${total} issues · ${count} fixed`;

      if (els.reportBody) {
        const rows = [
          ['01', 'Shot-change timing', 'Timing', resolved[1]],
          ['02', 'Reading speed', 'Reading speed', resolved[2]],
          ['03', 'Spelling & terminology', 'Terminology', resolved[3]],
          ['04', 'On-screen text', 'On-screen text', resolved[4]]
        ];
        els.reportBody.innerHTML = rows.map(r => `
          <tr class="${r[3] ? 'is-resolved' : ''}">
            <td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>
            <td>${r[3] ? 'Illustrative correction recorded' : 'Open'}</td>
          </tr>
        `).join('');
      }

      if (els.reportSummary) {
        const open = total - count;
        els.reportSummary.textContent = `${total} issues identified · ${count} resolved · ${open} still open.`;
      }
    }

    issueButtons.forEach(btn => {
      btn.addEventListener('click', () => selectIssue(parseInt(btn.dataset.issue, 10)));
    });

    if (els.resolve) {
      els.resolve.addEventListener('click', () => {
        if (resolved[active]) return;
        resolved[active] = true;

        // update sidebar state
        const btn = document.querySelector(`.qc-issue[data-issue="${active}"]`);
        if (btn) {
          btn.classList.add('is-resolved');
          const st = btn.querySelector('.qc-issue-state');
          if (st) { st.textContent = 'Recorded'; st.dataset.state = 'resolved'; }
        }

        // update timeline cue
        if (els.tlCue) els.tlCue.classList.add('is-resolved');

        // update resolve button
        els.resolve.disabled = true;
        els.resolve.textContent = 'Correction recorded';
        if (els.recorded) els.recorded.hidden = false;

        updateReport();
      });
    }

    if (els.reportToggle) {
      els.reportToggle.addEventListener('click', () => {
        const expanded = els.reportToggle.getAttribute('aria-expanded') === 'true';
        els.reportToggle.setAttribute('aria-expanded', String(!expanded));
        if (els.report) els.report.hidden = expanded;
        els.reportToggle.textContent = expanded ? 'Show QC report' : 'Hide QC report';
      });
    }

    selectIssue(1);
    updateReport();
  })();

  /* ============================================================
     CASE 1 (antigo) — timeline QC removida, substituída pelo Case 4
     ============================================================ */
  // A timeline QC antiga foi removida daqui — o Case 4 agora tem
  // seu próprio workspace dedicado.
});