/*
  ============================================================
  TDX FORM ENHANCER — shared engine. Host ONCE on GitHub.
  NEVER edit this file per form.

  Two features, both configured from the form's HTML static content:

  1) COLLAPSE a section:
     <div class="tdx-collapse">Label | id1-grp, id2-grp, id3-grp</div>
     - text before "|" = bar label
     - text after "|"  = field -grp IDs to collapse
     - add class "tdx-open" to start expanded

  2) ROW — put fields side by side:
     <div class="tdx-row">id1-grp, id2-grp, id3-grp</div>
     - lists the field -grp IDs to lay out horizontally
     - hidden fields (e.g. a TDX dependency state field) take no space

  Both use a CSS class for hiding so TDX's own attribute
  dependency keeps working.
  ============================================================
*/
(function () {

  var GREEN        = '#15783d';
  var CARD_BG      = '#ffffff';
  var CARD_BG_OPEN = '#f1f8f3';
  var BORDER       = '#e3e8e5';

  var style = document.createElement('style');
  style.textContent = '.tdx-collapsed { display: none !important; }';
  document.head.appendChild(style);

  // Hide any row wrapper whose fields are all hidden, so collapsed
  // sections don't leave an empty gap. Show it again when any field returns.
  function syncRowWrappers() {
    var wraps = document.querySelectorAll('.tdx-row-wrap');
    for (var i = 0; i < wraps.length; i++) {
      var w = wraps[i];
      var anyVisible = false;
      for (var j = 0; j < w.children.length; j++) {
        if (!w.children[j].classList.contains('tdx-collapsed')) {
          anyVisible = true;
          break;
        }
      }
      w.style.display = anyVisible ? 'flex' : 'none';
    }
  }

  /* ---------- COLLAPSE ---------- */
  function setupCollapse(toggle) {
    var raw = (toggle.textContent || "").trim();
    var parts = raw.split("|");
    var label = (parts[0] || "Section").trim();
    var ids = (parts[1] || "")
                .split(",")
                .map(function (s) { return s.trim(); })
                .filter(Boolean);

    var startOpen = toggle.className.indexOf("tdx-open") !== -1;

    toggle.style.display       = 'flex';
    toggle.style.alignItems    = 'center';
    toggle.style.width         = '100%';
    toggle.style.textAlign     = 'left';
    toggle.style.padding       = '16px 20px';
    toggle.style.background     = CARD_BG;
    toggle.style.border         = '1px solid ' + BORDER;
    toggle.style.borderLeft     = '5px solid ' + GREEN;
    toggle.style.borderRadius   = '8px';
    toggle.style.boxShadow      = '0 1px 3px rgba(0,0,0,0.06)';
    toggle.style.fontSize       = '17px';
    toggle.style.fontWeight     = '500';
    toggle.style.color          = GREEN;
    toggle.style.cursor         = 'pointer';
    toggle.style.marginBottom   = '10px';
    toggle.style.userSelect     = 'none';

    function setState(open) {
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (open) {
          el.classList.remove('tdx-collapsed');
        } else {
          el.classList.add('tdx-collapsed');
        }
      });
      syncRowWrappers();
      var arrow = open ? '&#9660;' : '&#9654;';
      toggle.innerHTML =
        '<span style="display:inline-block; width:20px; font-size:13px;">' + arrow + '</span>' +
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

  /* ---------- ROW (side-by-side fields) ---------- */
  function setupRow(rowDef) {
    var ids = (rowDef.textContent || "")
                .split(",")
                .map(function (s) { return s.trim(); })
                .filter(Boolean);

    var groups = ids
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (!groups.length) {
      rowDef.style.display = 'none';
      return;
    }

    // Build a flex wrapper and move the field rows into it
    var wrap = document.createElement('div');
    wrap.className          = 'tdx-row-wrap';
    wrap.style.display      = 'flex';
    wrap.style.flexWrap     = 'wrap';
    wrap.style.gap          = '16px';
    wrap.style.alignItems   = 'flex-start';
    wrap.style.marginBottom = '16px';   // gap between this row and the next field

    var first = groups[0];
    first.parentNode.insertBefore(wrap, first);

    groups.forEach(function (g) {
      g.style.flex      = '1 1 150px';  // share width, wrap on narrow screens
      g.style.minWidth  = '0';
      g.style.marginTop = '0';          // remove top stacked spacing
      g.style.marginBottom = '0';       // wrapper handles the bottom gap
      g.style.marginLeft   = '0';
      g.style.marginRight  = '0';
    });

    groups.forEach(function (g) {
      wrap.appendChild(g);
    });

    // hide the config div itself
    rowDef.style.display = 'none';
  }

  function init() {
    // Show the loading overlay first, while the user-details banner
    // iframe renders. (Shared team utility — see overlay section below.)
    if (typeof window.nvccShowUserDetailsOverlay === 'function') {
      window.nvccShowUserDetailsOverlay();
    }

    var toggles = document.querySelectorAll('.tdx-collapse');
    for (var i = 0; i < toggles.length; i++) setupCollapse(toggles[i]);

    var rows = document.querySelectorAll('.tdx-row');
    for (var j = 0; j < rows.length; j++) setupRow(rows[j]);

    // Rows are built after collapse setup, so re-sync wrapper visibility
    // to remove empty gaps under sections that start collapsed.
    syncRowWrappers();

    // Form-specific validations (separate into their own file later)
    initBirthDateValidation();
    initSsnMask();
  }

  /* ============================================================
     FORM-SPECIFIC: BIRTH DATE VALIDATION
     ------------------------------------------------------------
     NOTE: This block is specific to this form (field attribute37352),
     not part of the generic collapse/row engine. When ready, move
     everything between these fences into its own per-form JS file
     (e.g. tdx-form-12523.js) loaded with a second <script> tag.

     Rules enforced:
       1. Date must be a real calendar date (mm/dd/yyyy)
       2. Date cannot be in the future
       3. Person must be at least 18 years old
       (No maximum age check, per requirement.)

     Behaviour:
       - Validates when the user leaves the field (change/blur),
         not on every keystroke, to avoid flashing errors mid-typing.
       - Shows a clear inline error message beneath the field.
       - Disables the Submit button while the date is invalid,
         and re-enables it once corrected or cleared.
     ============================================================ */

  // The Birth Date field's TDX attribute ID (input + its -grp wrapper)
  var BIRTHDATE_ID     = 'attribute37352';
  var BIRTHDATE_GRP_ID = 'attribute37352-grp';
  var BIRTHDATE_MIN_AGE = 18;

  // Inject the error message styling once.
  // Matches TDX's native validation error look: plain red text, no
  // background or border, so it's consistent with the platform's own
  // "field is required" messages.
  var bdStyle = document.createElement('style');
  bdStyle.textContent =
    '.tdx-date-error {' +
      'color: #d0021b;' +
      'margin-top: 4px;' +
      'font-size: 14px;' +
      'line-height: 1.4;' +
    '}';
  document.head.appendChild(bdStyle);

  // Return today's date with the time stripped, for clean comparisons.
  function bdToday() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Parse an "mm/dd/yyyy" string into a Date, or null if invalid.
  // Rejects impossible dates like 02/30/2000 by checking the month rolled over.
  function bdParse(val) {
    if (!val || !val.trim()) return null;
    var parts = val.trim().split('/');
    if (parts.length !== 3) return null;
    var m = parseInt(parts[0], 10);
    var d = parseInt(parts[1], 10);
    var y = parseInt(parts[2], 10);
    if (isNaN(m) || isNaN(d) || isNaN(y) || y < 1900) return null;
    var date = new Date(y, m - 1, d);
    date.setHours(0, 0, 0, 0);
    // If the month changed, the day overflowed (e.g. Feb 30) -> invalid.
    if (date.getMonth() !== m - 1) return null;
    return date;
  }

  // Whole years between a birth date and today.
  function bdAge(birth, today) {
    var age = today.getFullYear() - birth.getFullYear();
    var monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // Show or clear the inline error beneath the Birth Date field.
  function bdSetError(message) {
    var grp = document.getElementById(BIRTHDATE_GRP_ID);
    if (!grp) return;
    var existing = document.getElementById('tdx-birthdate-error');
    if (message) {
      if (!existing) {
        existing = document.createElement('div');
        existing.id = 'tdx-birthdate-error';
        existing.className = 'tdx-date-error';
        existing.setAttribute('role', 'alert');
        existing.setAttribute('aria-live', 'polite');
        grp.appendChild(existing);
      }
      existing.textContent = message;
    } else if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  // Enable/disable the TDX submit button.
  function bdSetSubmit(enabled) {
    var btn = document.getElementById('btnSubmit');
    if (btn) btn.disabled = !enabled;
  }

  // Validate the current value and update error + submit state.
  function bdValidate() {
    var input = document.getElementById(BIRTHDATE_ID);
    if (!input) return;

    var val = input.value;

    // Empty: not an error here. TDX's own "required" check handles
    // an empty value on submit; we just clear any prior error.
    if (!val || !val.trim()) {
      bdSetError('');
      bdSetSubmit(true);
      return;
    }

    var date = bdParse(val);

    // Unparseable / impossible calendar date.
    if (!date) {
      bdSetError('Please enter a valid date in mm/dd/yyyy format.');
      bdSetSubmit(false);
      return;
    }

    var today = bdToday();

    // Rule: no future dates.
    if (date > today) {
      bdSetError('Birth date cannot be in the future. Please enter a valid date of birth.');
      bdSetSubmit(false);
      return;
    }

    // Rule: must be at least the minimum age.
    if (bdAge(date, today) < BIRTHDATE_MIN_AGE) {
      bdSetError('The birth date entered indicates an age under ' + BIRTHDATE_MIN_AGE +
                 '. Please check the date and try again.');
      bdSetSubmit(false);
      return;
    }

    // Valid.
    bdSetError('');
    bdSetSubmit(true);
  }

  function initBirthDateValidation() {
    var input = document.getElementById(BIRTHDATE_ID);
    if (!input) return;

    // TDX datepickers fire 'change' on calendar selection and 'input'
    // on manual typing. 'blur' covers leaving the field. Listen to all
    // so we validate after the user finishes, not mid-keystroke.
    input.addEventListener('change', bdValidate);
    input.addEventListener('blur',   bdValidate);

    // Some TDX pickers update the value via jQuery; hook that too if present.
    if (window.jQuery) {
      window.jQuery(input).on('change', bdValidate);
    }
  }

  /* ============================================================
     END FORM-SPECIFIC: BIRTH DATE VALIDATION
     ============================================================ */


  /* ============================================================
     FORM-SPECIFIC: SSN INPUT MASK + CONCEALMENT
     ------------------------------------------------------------
     SSN is sensitive PII. This block does the following:

       1. FORMAT  - as the user types, auto-inserts dashes so the
                    value reads as ###-##-#### (digits only, max 9).
       2. PROGRESS- a live hint shows how many digits remain, so the
                    user knows how much is left to enter.
       3. CONCEAL - the field is VISIBLE by default (eye open) so the
                    user can see what they type; an eye icon lets them
                    hide it (dots) when they want privacy.
       4. VALIDATE- on leaving the field, requires exactly 9 digits;
                    shows a TDX-style red error and disables Submit
                    until a complete, valid SSN is entered.

     Also disables browser autofill/autocomplete so the SSN is not
     saved or suggested by the browser.

     The submitted value is the formatted ###-##-#### string.

     >>> SET THE SSN FIELD ID BELOW before deploying. <<<
     When ready, move everything between these fences into the
     per-form JS file alongside the birth date logic.
     ============================================================ */

  // TODO: replace with the SSN field's real TDX attribute id.
  var SSN_ID     = 'attribute37297';
  var SSN_GRP_ID = 'attribute37297-grp';

  // Count only the digits in the current value.
  function ssnDigits(raw) {
    return (raw || '').replace(/\D/g, '').slice(0, 9);
  }

  // Format a raw string into ###-##-#### using only its digits.
  function ssnFormat(raw) {
    var digits = ssnDigits(raw);
    var p1 = digits.slice(0, 3);
    var p2 = digits.slice(3, 5);
    var p3 = digits.slice(5, 9);
    var out = p1;
    if (p2) out += '-' + p2;
    if (p3) out += '-' + p3;
    return out;
  }

  // Small inline eye / eye-off icons (no external icon library needed).
  var EYE_OPEN =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8' +
    '-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 ' +
    '20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 ' +
    '0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 ' +
    '1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  // Show / clear the TDX-style red validation error beneath the field.
  function ssnSetError(message) {
    var grp = document.getElementById(SSN_GRP_ID);
    if (!grp) return;
    var err = document.getElementById('tdx-ssn-error');
    if (message) {
      if (!err) {
        err = document.createElement('div');
        err.id = 'tdx-ssn-error';
        err.className = 'tdx-date-error';   // reuse the TDX-style red text
        err.setAttribute('role', 'alert');
        err.setAttribute('aria-live', 'polite');
        grp.appendChild(err);
      }
      err.textContent = message;
    } else if (err && err.parentNode) {
      err.parentNode.removeChild(err);
    }
  }

  function ssnSetSubmit(enabled) {
    var btn = document.getElementById('btnSubmit');
    if (btn) btn.disabled = !enabled;
  }

  function initSsnMask() {
    var input = document.getElementById(SSN_ID);
    if (!input) return;   // field id not set / not on this form

    // Privacy: stop the browser saving or suggesting the SSN.
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('maxlength', '11');   // ###-##-####
    input.setAttribute('placeholder', '###-##-####');

    // Visible by default so the user can see digits as they type.
    input.type = 'text';

    // Build the eye toggle button inside the field wrapper FIRST,
    // so the input listener below can reference it.
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Show or hide SSN');
    btn.innerHTML = EYE_OPEN;   // starts visible, so show the open eye
    btn.style.position   = 'absolute';
    btn.style.right      = '10px';
    btn.style.top        = '50%';
    btn.style.transform  = 'translateY(-50%)';
    btn.style.background  = 'none';
    btn.style.border      = 'none';
    btn.style.cursor      = 'pointer';
    btn.style.color       = '#666';
    btn.style.padding     = '0';
    btn.style.display     = 'flex';
    btn.style.alignItems  = 'center';
    input.style.paddingRight = '38px';   // text clears the icon

    btn.addEventListener('click', function () {
      if (input.type === 'text') {
        input.type = 'password';
        btn.innerHTML = EYE_OFF;
      } else {
        input.type = 'text';
        btn.innerHTML = EYE_OPEN;
      }
    });

    if (input.parentNode) {
      input.parentNode.style.position = 'relative';
      input.parentNode.appendChild(btn);
    }

    // As the user types: format with dashes. Once all 9 digits are
    // entered, auto-conceal the value (dots) for privacy; the user can
    // tap the eye to reveal it again.
    input.addEventListener('input', function () {
      input.value = ssnFormat(input.value);
      var count = ssnDigits(input.value).length;
      ssnSetError('');   // clear error the moment they type again
      if (count === 9) {
        input.type = 'password';
        btn.innerHTML = EYE_OFF;
      } else {
        input.type = 'text';
        btn.innerHTML = EYE_OPEN;
      }
    });

    // On leaving the field, validate: must be exactly 9 digits.
    input.addEventListener('blur', function () {
      var count = ssnDigits(input.value).length;
      if (count === 0) {
        ssnSetError('');        // empty -> TDX required-check handles it
        ssnSetSubmit(true);
        return;
      }
      if (count !== 9) {
        ssnSetError('Please enter a valid 9-digit Social Security Number.');
        ssnSetSubmit(false);
        return;
      }
      ssnSetError('');
      ssnSetSubmit(true);
    });
  }

  /* ============================================================
     END FORM-SPECIFIC: SSN INPUT MASK + VALIDATION
     ============================================================ */


  /* ============================================================
     SHARED UTILITY: USER DETAILS LOADING OVERLAY
     ------------------------------------------------------------
     Shared across team forms. Shows a green progress overlay while
     the user-details banner iframe finishes rendering, then dismisses
     itself. Defines window.nvccShowUserDetailsOverlay; init() calls it.

     Detection: the banner iframe starts with a fixed inline height set
     by TDX, then is resized by the banner's own script after each state
     change. We count height changes and dismiss on the second.
     Progress: asymptotic crawl to 85% while waiting, completes to 100%
     on detection. Safety timeout at 8s removes the overlay regardless.
     ============================================================ */

  window.nvccShowUserDetailsOverlay = function () {
    var headerHeight = document.getElementById('divMstrHeader')
      ? document.getElementById('divMstrHeader').offsetHeight
      : 0;

    var overlay = document.createElement('div');
    overlay.id = 'nvcc-ud-overlay';
    overlay.style.cssText = [
      'position: fixed',
      'top: ' + headerHeight + 'px',
      'left: 0',
      'width: 100%',
      'height: calc(100% - ' + headerHeight + 'px)',
      'background: #fff',
      'z-index: 998',
      'display: flex',
      'align-items: center',
      'justify-content: center'
    ].join(';');
    overlay.innerHTML = [
      '<div style="width:320px; text-align:center;">',
        '<div style="color:#046a38; font-size:15px; font-weight:600; margin-bottom:12px;">Getting user details...</div>',
        '<div style="background:#d4e6da; border-radius:4px; height:8px; overflow:hidden; margin-bottom:6px;">',
          '<div id="nvcc-ud-bar" style="height:100%; width:0%; background:#046a38; border-radius:4px;"></div>',
        '</div>',
        '<div id="nvcc-ud-pct" style="color:#595959; font-size:13px;">0%</div>',
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
        var rounded = Math.round(displayedPct);
        barEl.style.width = rounded + '%';
        pctEl.textContent = rounded + '%';
        rafHandle = requestAnimationFrame(animatePct);
      } else {
        var rounded = Math.round(targetPct);
        barEl.style.width = rounded + '%';
        pctEl.textContent = rounded + '%';
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

    // Phase 1 — asymptotic crawl to 85%
    var phase1Value = 0;
    intervalHandle = setInterval(function () {
      phase1Value += (85 - phase1Value) * 0.08;
      setBarPct(phase1Value);
    }, 180);

    // Watch iframes for height changes. The banner iframe goes through two
    // height changes: initial (TDX hardcoded) -> loading -> final content.
    // Dismiss on the second change (heightChangeCount >= 2).
    function watchIframes() {
      document.querySelectorAll('iframe').forEach(function (iframe) {
        if (observed.indexOf(iframe) !== -1) return;
        observed.push(iframe);

        var initialHeight     = iframe.style.height || '';
        var heightChangeCount = 0;
        var lastSeenHeight    = initialHeight;
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

    // Safety timeout — remove after 8s regardless
    safetyTimeout = setTimeout(removeOverlay, 8000);
  };

  /* ============================================================
     END SHARED UTILITY: USER DETAILS LOADING OVERLAY
     ============================================================ */


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
