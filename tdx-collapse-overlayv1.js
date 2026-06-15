/*
  ============================================================
  TDX FORM ENHANCER — shared engine
  Host ONCE on GitHub via jsDelivr CDN.
  NEVER edit this file per form.

  All configuration lives in the form's HTML static content.
  See tdx-collapse-snippet.html for the full config reference.
  ============================================================
*/
(function () {

  var GREEN        = '#15783d';
  var CARD_BG      = '#ffffff';
  var CARD_BG_OPEN = '#f1f8f3';
  var BORDER       = '#e3e8e5';


  /* ----------------------------------------------------------
     SHARED STYLES
  ---------------------------------------------------------- */
  var style = document.createElement('style');
  style.textContent = [
    /* Hides collapsed fields. !important beats TDX's own inline display. */
    '.tdx-collapsed { display: none !important; }',

    /* Error message matches TDX's own native validation style. */
    '.tdx-field-error {',
    '  color: #d0021b;',
    '  margin-top: 4px;',
    '  font-size: 14px;',
    '  line-height: 1.4;',
    '  display: block;',
    '}',

    /* Wrapper for masked fields — positions the eye button. */
    '.tdx-mask-wrap { position: relative; display: block; }',
    '.tdx-mask-wrap input { padding-right: 38px !important; }',
    '.tdx-eye-btn {',
    '  position: absolute; right: 10px; top: 50%;',
    '  transform: translateY(-50%);',
    '  background: none; border: none; cursor: pointer;',
    '  color: #666; padding: 0;',
    '  display: flex; align-items: center; line-height: 1;',
    '}'
  ].join('\n');
  document.head.appendChild(style);


  /* ----------------------------------------------------------
     UTILITY — parse pipe-separated key:value config from a div
     e.g. "field:attribute37204 | format:ssn | min-digits:9"
     Returns a plain object: { field: "attribute37204", format: "ssn", ... }
  ---------------------------------------------------------- */
  function parseConfig(el) {
    var tokens = (el.textContent || '').trim().split('|');
    var config = {};
    tokens.forEach(function (token) {
      var parts = token.trim().split(':');
      if (parts.length >= 2) {
        var key = parts[0].trim().toLowerCase();
        var val = parts.slice(1).join(':').trim().toLowerCase();
        config[key] = val;
      }
    });
    return config;
  }

  function getById(id) {
    return document.getElementById(id);
  }

  /* Show or clear a TDX-style inline error below a field group. */
  function setFieldError(groupEl, errorId, message) {
    if (!groupEl) return;
    var el = getById(errorId);
    if (message) {
      if (!el) {
        el = document.createElement('span');
        el.id = errorId;
        el.className = 'tdx-field-error';
        el.setAttribute('role', 'alert');
        el.setAttribute('aria-live', 'polite');
        groupEl.appendChild(el);
      }
      el.textContent = message;
    } else if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  /* Enable or disable the TDX submit button. */
  function setSubmit(enabled) {
    var btn = getById('btnSubmit');
    if (btn) btn.disabled = !enabled;
  }

  /* Count only the digits in a string. */
  function countDigits(val) {
    return (val || '').replace(/\D/g, '').length;
  }


  /* ----------------------------------------------------------
     FEATURE 1 — COLLAPSE
     Hides a group of fields behind a clickable green bar.
     Config: <div class="tdx-collapse">Label | grp-id, grp-id</div>
  ---------------------------------------------------------- */

  /* After fields are shown/hidden, also hide any row wrapper
     whose children are all hidden — prevents empty gaps. */
  function syncRowWrappers() {
    document.querySelectorAll('.tdx-row-wrap').forEach(function (wrap) {
      var anyVisible = false;
      for (var i = 0; i < wrap.children.length; i++) {
        if (!wrap.children[i].classList.contains('tdx-collapsed')) {
          anyVisible = true;
          break;
        }
      }
      wrap.style.display = anyVisible ? 'flex' : 'none';
    });
  }

  function setupCollapse(toggle) {
    var raw   = (toggle.textContent || '').trim();
    var parts = raw.split('|');
    var label = (parts[0] || 'Section').trim();
    var ids   = (parts[1] || '').split(',')
                  .map(function (s) { return s.trim(); })
                  .filter(Boolean);

    var startOpen = toggle.classList.contains('tdx-open');

    /* Style the bar */
    toggle.style.cssText = [
      'display:flex', 'align-items:center', 'width:100%',
      'text-align:left', 'padding:16px 20px',
      'background:' + CARD_BG,
      'border:1px solid ' + BORDER,
      'border-left:5px solid ' + GREEN,
      'border-radius:8px',
      'box-shadow:0 1px 3px rgba(0,0,0,0.06)',
      'font-size:17px', 'font-weight:500',
      'color:' + GREEN,
      'cursor:pointer', 'margin-bottom:10px', 'user-select:none'
    ].join(';');

    function setState(open) {
      ids.forEach(function (id) {
        var el = getById(id);
        if (!el) return;
        if (open) { el.classList.remove('tdx-collapsed'); }
        else      { el.classList.add('tdx-collapsed'); }
      });
      syncRowWrappers();
      toggle.innerHTML =
        '<span style="display:inline-block;width:20px;font-size:13px;">' +
        (open ? '&#9660;' : '&#9654;') + '</span>' +
        '<span style="flex:1;">' + label + '</span>';
      toggle.style.background = open ? CARD_BG_OPEN : CARD_BG;
    }

    var isOpen = startOpen;
    setState(isOpen);

    toggle.addEventListener('mouseenter', function () {
      toggle.style.background = CARD_BG_OPEN;
    });
    toggle.addEventListener('mouseleave', function () {
      toggle.style.background = isOpen ? CARD_BG_OPEN : CARD_BG;
    });
    toggle.addEventListener('click', function () {
      isOpen = !isOpen;
      setState(isOpen);
    });
  }


  /* ----------------------------------------------------------
     FEATURE 2 — ROW
     Places fields side by side instead of stacked.
     Config: <div class="tdx-row">grp-id, grp-id, grp-id</div>
  ---------------------------------------------------------- */
  function setupRow(rowDef) {
    var ids    = (rowDef.textContent || '').split(',')
                   .map(function (s) { return s.trim(); })
                   .filter(Boolean);
    var groups = ids.map(getById).filter(Boolean);

    rowDef.style.display = 'none';
    if (!groups.length) return;

    var wrap = document.createElement('div');
    wrap.className = 'tdx-row-wrap';
    wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;margin-bottom:16px;';

    groups[0].parentNode.insertBefore(wrap, groups[0]);
    groups.forEach(function (g) {
      g.style.flex   = '1 1 150px';
      g.style.minWidth = '0';
      g.style.margin = '0';
      wrap.appendChild(g);
    });
  }


  /* ----------------------------------------------------------
     FEATURE 3 — MASKED INPUT
     Formats and optionally conceals a sensitive field.
     Config: <div class="tdx-mask">field:attrXXX | format:ssn | ...</div>

     Keys (all optional except field):
       field        TDX attribute id of the input — REQUIRED
       format       ssn = auto-insert dashes ###-##-####
       min-digits   minimum digit count for validation
       max-digits   hard cap on digits; triggers auto-conceal if conceal:true
       conceal      true = hide to dots when max-digits reached (default: false)
       eye-toggle   true = show eye icon to reveal/hide (default: false)
                    Only meaningful when conceal:true
  ---------------------------------------------------------- */

  var EYE_OPEN =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8' +
    '-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';

  var EYE_OFF =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 ' +
    '20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 ' +
    '0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 ' +
    '1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  function formatSsn(val) {
    var d = val.replace(/\D/g, '').slice(0, 9);
    var out = d.slice(0, 3);
    if (d.length > 3) out += '-' + d.slice(3, 5);
    if (d.length > 5) out += '-' + d.slice(5, 9);
    return out;
  }

  function setupMask(configEl) {
    var cfg = parseConfig(configEl);
    configEl.style.display = 'none';

    var fieldId   = cfg['field'];
    var fmt       = cfg['format']     || '';          /* 'ssn' or '' */
    var minDigits = parseInt(cfg['min-digits'] || '0', 10);
    var maxDigits = parseInt(cfg['max-digits'] || '0', 10);
    var conceal   = cfg['conceal']    === 'true';     /* default false */
    var showEye   = cfg['eye-toggle'] === 'true';     /* default false */

    if (!fieldId) return;  /* field key is required */
    var input = getById(fieldId);
    if (!input) return;    /* field not found on this form — safe exit */

    var grpEl = getById(fieldId + '-grp') || input.parentNode;
    var errId = 'tdx-mask-err-' + fieldId;

    /* Browser privacy — prevent autofill and autocorrect */
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect',  'off');
    input.setAttribute('spellcheck',   'false');
    input.setAttribute('inputmode',    'numeric');
    if (maxDigits) {
      /* SSN: 9 digits + 2 dashes = 11 visible chars */
      input.setAttribute('maxlength', fmt === 'ssn' ? '11' : String(maxDigits));
    }
    input.setAttribute('placeholder', fmt === 'ssn' ? '###-##-####' : '');

    /* Start visible — user can see digits as they type */
    input.type = 'text';

    /* Wrap input for eye-button positioning */
    var wrapper = document.createElement('div');
    wrapper.className = 'tdx-mask-wrap';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    /* Build eye toggle (only if conceal AND eye-toggle are both true) */
    var eyeBtn = null;
    if (conceal && showEye) {
      eyeBtn = document.createElement('button');
      eyeBtn.type = 'button';
      eyeBtn.className = 'tdx-eye-btn';
      eyeBtn.setAttribute('aria-label', 'Show or hide value');
      eyeBtn.innerHTML = EYE_OPEN;  /* visible by default = open eye */

      eyeBtn.addEventListener('click', function () {
        if (input.type === 'text') {
          input.type = 'password';
          eyeBtn.innerHTML = EYE_OFF;
        } else {
          input.type = 'text';
          eyeBtn.innerHTML = EYE_OPEN;
        }
      });

      wrapper.appendChild(eyeBtn);
    }

    /* Format and auto-conceal as user types */
    input.addEventListener('input', function () {
      /* Integers only — strip anything that isn't a digit */
      if (fmt === 'ssn') {
        input.value = formatSsn(input.value);
      } else {
        input.value = input.value.replace(/\D/g, '').slice(0, maxDigits || 999);
      }

      /* Clear any prior error while typing */
      setFieldError(grpEl, errId, '');
      setSubmit(true);

      /* Auto-conceal once all digits are entered (only if conceal:true) */
      if (conceal && maxDigits && countDigits(input.value) >= maxDigits) {
        input.type = 'password';
        if (eyeBtn) eyeBtn.innerHTML = EYE_OFF;
      } else if (conceal && eyeBtn) {
        input.type = 'text';
        eyeBtn.innerHTML = EYE_OPEN;
      }
    });

    /* Validate on blur (when user leaves the field) */
    input.addEventListener('blur', function () {
      var val   = input.value.trim();
      var count = countDigits(val);

      /* Empty — let TDX's own required check fire on submit */
      if (!val) {
        setFieldError(grpEl, errId, '');
        setSubmit(true);
        return;
      }

      /* Integers only — reject letters or special chars */
      if (val.replace(/[\d\-]/g, '').length > 0) {
        setFieldError(grpEl, errId, 'Please enter numbers only.');
        setSubmit(false);
        return;
      }

      /* Min-digits check */
      if (minDigits && count < minDigits) {
        setFieldError(grpEl, errId,
          'Please enter a valid ' + minDigits + '-digit value. ' +
          'You entered ' + count + ' digit' + (count === 1 ? '.' : 's.'));
        setSubmit(false);
        return;
      }

      /* All good */
      setFieldError(grpEl, errId, '');
      setSubmit(true);
    });
  }


  /* ----------------------------------------------------------
     FEATURE 4 — DATE VALIDATION
     Validates a TDX date-picker field.
     Config: <div class="tdx-validate-date">field:attrXXX | min-age:18</div>

     Rules always enforced:
       - Must be a real calendar date (rejects e.g. Feb 30)
       - Cannot be in the future
     Optional:
       min-age   minimum age in whole years (omit for no age check)
  ---------------------------------------------------------- */
  function parseDate(val) {
    if (!val || !val.trim()) return null;
    var p = val.trim().split('/');
    if (p.length !== 3) return null;
    var m = parseInt(p[0], 10), d = parseInt(p[1], 10), y = parseInt(p[2], 10);
    if (isNaN(m) || isNaN(d) || isNaN(y) || y < 1900) return null;
    var date = new Date(y, m - 1, d);
    date.setHours(0, 0, 0, 0);
    if (date.getMonth() !== m - 1) return null; /* day overflowed month */
    return date;
  }

  function getAge(birth, today) {
    var age = today.getFullYear() - birth.getFullYear();
    var md  = today.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function setupDateValidation(configEl) {
    var cfg    = parseConfig(configEl);
    configEl.style.display = 'none';

    var fieldId = cfg['field'];
    var minAge  = parseInt(cfg['min-age'] || '0', 10);

    if (!fieldId) return;
    var input = getById(fieldId);
    if (!input) return;

    var grpEl = getById(fieldId + '-grp') || input.parentNode;
    var errId = 'tdx-date-err-' + fieldId;

    function validate() {
      var val = input.value;

      if (!val || !val.trim()) {
        setFieldError(grpEl, errId, '');
        setSubmit(true);
        return;
      }

      var date = parseDate(val);
      if (!date) {
        setFieldError(grpEl, errId,
          'Please enter a valid date in mm/dd/yyyy format.');
        setSubmit(false);
        return;
      }

      var today = new Date(); today.setHours(0, 0, 0, 0);

      if (date > today) {
        setFieldError(grpEl, errId,
          'Birth date cannot be in the future. Please enter a valid date of birth.');
        setSubmit(false);
        return;
      }

      if (minAge && getAge(date, today) < minAge) {
        setFieldError(grpEl, errId,
          'The birth date entered indicates an age under ' + minAge +
          '. Please check the date and try again.');
        setSubmit(false);
        return;
      }

      setFieldError(grpEl, errId, '');
      setSubmit(true);
    }

    input.addEventListener('change', validate);
    input.addEventListener('blur',   validate);
    if (window.jQuery) window.jQuery(input).on('change', validate);
  }


  /* ----------------------------------------------------------
     INIT — find all config divs and wire each feature up
  ---------------------------------------------------------- */
  function init() {
    // Overlay runs FIRST — only if this form has a tdx-overlay div.
    // That div's presence is the on/off switch. No div = no overlay.
    var overlayConfig = document.querySelector('.tdx-overlay');
    if (overlayConfig) {
      overlayConfig.style.display = 'none';   // hide the config div itself
      nvccShowUserDetailsOverlay();
    }

    document.querySelectorAll('.tdx-collapse').forEach(setupCollapse);
    document.querySelectorAll('.tdx-row').forEach(setupRow);
    document.querySelectorAll('.tdx-mask').forEach(setupMask);
    document.querySelectorAll('.tdx-validate-date').forEach(setupDateValidation);
    syncRowWrappers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }


  /* ============================================================
     SHARED UTILITY: USER DETAILS LOADING OVERLAY
     ────────────────────────────────────────────
     Shared team utility — DO NOT MODIFY. Consistent across all
     forms that use it. Controlled per-form via static content:

       TURN ON:  <div class="tdx-overlay"></div>
       TURN OFF: simply omit the div (or remove it)

     The JS checks for the presence of .tdx-overlay on init.
     If found: overlay runs. If absent: nothing happens.
     This means the script can be loaded on any page safely —
     only forms that explicitly opt in will show the overlay.

     Detection: watches the user-details banner iframe for two
     height changes (TDX sets initial height, banner resizes
     twice as it loads). Dismisses on the second change.
     Safety timeout at 8s removes the overlay regardless.
  ============================================================ */

  function nvccShowUserDetailsOverlay() {
    var headerHeight = document.getElementById('divMstrHeader')
      ? document.getElementById('divMstrHeader').offsetHeight
      : 0;

    var overlay = document.createElement('div');
    overlay.id = 'nvcc-ud-overlay';
    overlay.style.cssText = [
      'position:fixed',
      'top:' + headerHeight + 'px',
      'left:0',
      'width:100%',
      'height:calc(100% - ' + headerHeight + 'px)',
      'background:#fff',
      'z-index:998',
      'display:flex',
      'align-items:center',
      'justify-content:center'
    ].join(';');
    overlay.innerHTML = [
      '<div style="width:320px;text-align:center;">',
        '<div style="color:#046a38;font-size:15px;font-weight:600;margin-bottom:12px;">',
          'Getting user details...',
        '</div>',
        '<div style="background:#d4e6da;border-radius:4px;height:8px;overflow:hidden;margin-bottom:6px;">',
          '<div id="nvcc-ud-bar" style="height:100%;width:0%;background:#046a38;border-radius:4px;"></div>',
        '</div>',
        '<div id="nvcc-ud-pct" style="color:#595959;font-size:13px;">0%</div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    var barEl = document.getElementById('nvcc-ud-bar');
    var pctEl = document.getElementById('nvcc-ud-pct');
    var displayedPct   = 0;
    var targetPct      = 0;
    var rafHandle      = null;
    var intervalHandle = null;
    var safetyTimeout  = null;
    var observers      = [];
    var observed       = [];

    function animatePct() {
      if (displayedPct < targetPct - 0.1) {
        var step = Math.max(0.4, (targetPct - displayedPct) * 0.08);
        displayedPct = Math.min(targetPct, displayedPct + step);
        var r = Math.round(displayedPct);
        barEl.style.width = r + '%';
        pctEl.textContent = r + '%';
        rafHandle = requestAnimationFrame(animatePct);
      } else {
        var r = Math.round(targetPct);
        barEl.style.width = r + '%';
        pctEl.textContent = r + '%';
        displayedPct = targetPct;
        rafHandle = null;
      }
    }

    function setBarPct(p) {
      targetPct = Math.min(100, Math.max(0, p));
      if (!rafHandle) rafHandle = requestAnimationFrame(animatePct);
    }

    function removeOverlay() {
      if (intervalHandle) clearInterval(intervalHandle);
      if (safetyTimeout)  clearTimeout(safetyTimeout);
      observers.forEach(function (mo) { mo.disconnect(); });
      setBarPct(100);
      function waitForComplete() {
        if (Math.round(displayedPct) >= 100) {
          setTimeout(function () {
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
          }, 300);
        } else {
          requestAnimationFrame(waitForComplete);
        }
      }
      requestAnimationFrame(waitForComplete);
    }

    // Phase 1 — asymptotic crawl to 85% while waiting
    var phase1Value = 0;
    intervalHandle = setInterval(function () {
      phase1Value += (85 - phase1Value) * 0.08;
      setBarPct(phase1Value);
    }, 180);

    // Watch iframes for two height changes = banner fully loaded
    function watchIframes() {
      document.querySelectorAll('iframe').forEach(function (iframe) {
        if (observed.indexOf(iframe) !== -1) return;
        observed.push(iframe);
        var heightChangeCount = 0;
        var lastSeenHeight    = iframe.style.height || '';
        var debounceTimer     = null;
        var mo = new MutationObserver(function () {
          var currentHeight = iframe.style.height || '';
          if (currentHeight !== lastSeenHeight && parseInt(currentHeight) > 0) {
            heightChangeCount++;
            lastSeenHeight = currentHeight;
            if (heightChangeCount >= 2) {
              if (debounceTimer) clearTimeout(debounceTimer);
              debounceTimer = setTimeout(function () {
                mo.disconnect();
                removeOverlay();
              }, 300);
            }
          }
        });
        mo.observe(iframe, { attributes: true, attributeFilter: ['style'] });
        observers.push(mo);
      });
    }

    watchIframes();
    setTimeout(watchIframes, 200);
    setTimeout(watchIframes, 500);

    // Safety: remove after 8s no matter what
    safetyTimeout = setTimeout(removeOverlay, 8000);
  }

  /* ============================================================
     END SHARED UTILITY: USER DETAILS LOADING OVERLAY
     ============================================================ */

})();
