/*
  ============================================================
  TDX FORM ENHANCER — shared engine. Host ONCE on GitHub.
  NEVER edit this file per form. All config lives in the
  form's HTML static content blocks.

  FEATURES — all configured from static content:

  1) COLLAPSE a section:
     <div class="tdx-collapse">Label | id1-grp, id2-grp, id3-grp</div>
     - text before "|" = bar label
     - text after "|"  = comma-separated field -grp IDs to collapse
     - add class "tdx-open" to start that section expanded

  2) ROW — put fields side by side:
     <div class="tdx-row">id1-grp, id2-grp, id3-grp</div>
     - lists the field -grp IDs to lay out horizontally
     - hidden fields (TDX dependency) take no space automatically

  3) MASKED INPUT — SSN or any sensitive field:
     <div class="tdx-mask"
          data-field="attribute37204"
          data-mask="dots"
          data-eye="true"
          data-minlength="9"
          data-maxlength="9"
          data-format="ssn">
     </div>

     Options:
       data-field      = the TDX attribute id of the input (required)
       data-mask       = "dots" (•••) or "x" (XXX) — how to conceal
       data-eye        = "true" | "false" — show/hide eye toggle
       data-format     = "ssn" (auto-inserts ### - ## - ####)
                         omit for plain masked input with no formatting
       data-minlength  = minimum digit count before validation passes
       data-maxlength  = maximum digits allowed (hard cap while typing)

     NOTE: TDX strips data-* attributes. The config above goes in the
     div's TEXT content instead (pipe-separated), like the collapse:
     <div class="tdx-mask">attribute37204 | dots | eye:true | format:ssn | min:9 | max:9</div>

  4) BIRTHDATE VALIDATION:
     <div class="tdx-validate-date"
          data-field="attribute37352"
          data-minage="18">
     </div>
     Same constraint — use text content:
     <div class="tdx-validate-date">attribute37352 | minage:18</div>

  All features use CSS classes for hiding so TDX's own attribute
  dependency (show/hide fields based on other values) keeps working.
  ============================================================
*/
(function () {

  var GREEN        = '#15783d';
  var CARD_BG      = '#ffffff';
  var CARD_BG_OPEN = '#f1f8f3';
  var BORDER       = '#e3e8e5';

  /* ============================================================
     SHARED STYLES
     ============================================================ */
  var style = document.createElement('style');
  style.textContent = [
    '.tdx-collapsed { display: none !important; }',
    '.tdx-field-error {',
    '  color: #d0021b;',
    '  margin-top: 4px;',
    '  font-size: 14px;',
    '  line-height: 1.4;',
    '  display: block;',
    '}',
    '.tdx-mask-wrap {',
    '  position: relative;',
    '  display: block;',
    '}',
    '.tdx-mask-wrap input {',
    '  padding-right: 38px !important;',
    '}',
    '.tdx-eye-btn {',
    '  position: absolute;',
    '  right: 10px;',
    '  top: 50%;',
    '  transform: translateY(-50%);',
    '  background: none;',
    '  border: none;',
    '  cursor: pointer;',
    '  color: #666;',
    '  padding: 0;',
    '  display: flex;',
    '  align-items: center;',
    '  line-height: 1;',
    '}'
  ].join('\n');
  document.head.appendChild(style);


  /* ============================================================
     UTILITY — parse config text content from a div
     Format: "value1 | key:value2 | key:value3"
     First token (no colon) = the main value (e.g. field ID)
     Remaining tokens = key:value pairs
     ============================================================ */
  function parseConfig(el) {
    var raw = (el.textContent || '').trim();
    var tokens = raw.split('|').map(function (t) { return t.trim(); });
    var config = { _main: tokens[0] || '' };
    for (var i = 1; i < tokens.length; i++) {
      var parts = tokens[i].split(':');
      if (parts.length >= 2) {
        var k = parts[0].trim().toLowerCase();
        var v = parts.slice(1).join(':').trim().toLowerCase();
        config[k] = v;
      }
    }
    return config;
  }

  function getById(id) { return document.getElementById(id); }

  function setError(groupEl, errorId, message) {
    if (!groupEl) return;
    var el = document.getElementById(errorId);
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

  function setSubmit(enabled) {
    var btn = getById('btnSubmit');
    if (btn) btn.disabled = !enabled;
  }


  /* ============================================================
     FEATURE 1 — COLLAPSE
     ============================================================ */
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

  function setupCollapse(toggle) {
    var raw   = (toggle.textContent || '').trim();
    var parts = raw.split('|');
    var label = (parts[0] || 'Section').trim();
    var ids   = (parts[1] || '')
                  .split(',')
                  .map(function (s) { return s.trim(); })
                  .filter(Boolean);

    var startOpen = toggle.className.indexOf('tdx-open') !== -1;

    toggle.style.display      = 'flex';
    toggle.style.alignItems   = 'center';
    toggle.style.width        = '100%';
    toggle.style.textAlign    = 'left';
    toggle.style.padding      = '16px 20px';
    toggle.style.background   = CARD_BG;
    toggle.style.border       = '1px solid ' + BORDER;
    toggle.style.borderLeft   = '5px solid ' + GREEN;
    toggle.style.borderRadius = '8px';
    toggle.style.boxShadow    = '0 1px 3px rgba(0,0,0,0.06)';
    toggle.style.fontSize     = '17px';
    toggle.style.fontWeight   = '500';
    toggle.style.color        = GREEN;
    toggle.style.cursor       = 'pointer';
    toggle.style.marginBottom = '10px';
    toggle.style.userSelect   = 'none';

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

    toggle.addEventListener('mouseenter', function () { toggle.style.background = CARD_BG_OPEN; });
    toggle.addEventListener('mouseleave', function () { toggle.style.background = isOpen ? CARD_BG_OPEN : CARD_BG; });
    toggle.addEventListener('click', function () { isOpen = !isOpen; setState(isOpen); });
  }


  /* ============================================================
     FEATURE 2 — ROW (side-by-side fields)
     ============================================================ */
  function setupRow(rowDef) {
    var ids    = (rowDef.textContent || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var groups = ids.map(function (id) { return getById(id); }).filter(Boolean);

    if (!groups.length) { rowDef.style.display = 'none'; return; }

    var wrap = document.createElement('div');
    wrap.className          = 'tdx-row-wrap';
    wrap.style.display      = 'flex';
    wrap.style.flexWrap     = 'wrap';
    wrap.style.gap          = '16px';
    wrap.style.alignItems   = 'flex-start';
    wrap.style.marginBottom = '16px';

    var first = groups[0];
    first.parentNode.insertBefore(wrap, first);

    groups.forEach(function (g) {
      g.style.flex         = '1 1 150px';
      g.style.minWidth     = '0';
      g.style.marginTop    = '0';
      g.style.marginBottom = '0';
      g.style.marginLeft   = '0';
      g.style.marginRight  = '0';
      wrap.appendChild(g);
    });

    rowDef.style.display = 'none';
  }


  /* ============================================================
     FEATURE 3 — MASKED INPUT
     Config div text format:
       fieldId | mask:dots|x | eye:true|false | format:ssn | min:9 | max:9
     ============================================================ */

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

  function formatSsn(raw) {
    // Keep only digits, cap at 9
    var digits = raw.replace(/\D/g, '').slice(0, 9);
    var p1 = digits.slice(0, 3);
    var p2 = digits.slice(3, 5);
    var p3 = digits.slice(5, 9);
    var out = p1;
    if (p2.length) out += '-' + p2;
    if (p3.length) out += '-' + p3;
    return out;
  }

  function countDigits(val) {
    return (val || '').replace(/\D/g, '').length;
  }

  function setupMask(configEl) {
    var cfg = parseConfig(configEl);
    configEl.style.display = 'none';

    var fieldId  = cfg._main;
    var maskType = cfg.mask    || 'dots';     // "dots" or "x"
    var showEye  = cfg.eye     !== 'false';   // default true
    var fmt      = cfg.format  || '';         // "ssn" or ""
    var minLen   = parseInt(cfg.min  || '0', 10);
    var maxLen   = parseInt(cfg.max  || '0', 10);

    var input = getById(fieldId);
    if (!input) return;   // field not found — safe exit

    var grpId  = fieldId + '-grp';
    var grpEl  = getById(grpId) || input.parentNode;
    var errId  = 'tdx-mask-error-' + fieldId;

    // Browser privacy settings
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect',  'off');
    input.setAttribute('spellcheck',   'false');
    input.setAttribute('inputmode',    'numeric');
    if (maxLen) {
      // SSN with dashes = 9 digits + 2 dashes = 11 chars
      input.setAttribute('maxlength', fmt === 'ssn' ? '11' : String(maxLen));
    }
    input.setAttribute('placeholder', fmt === 'ssn' ? '###-##-####' : '');

    // Start visible so they can see what they type
    input.type = 'text';

    // Wrap the input's direct parent for positioning the eye button
    var inputParent = input.parentNode;
    var wrapper = document.createElement('div');
    wrapper.className = 'tdx-mask-wrap';
    inputParent.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Build the eye button (if enabled)
    var eyeBtn = null;
    if (showEye) {
      eyeBtn = document.createElement('button');
      eyeBtn.type = 'button';
      eyeBtn.className = 'tdx-eye-btn';
      eyeBtn.setAttribute('aria-label', 'Show or hide field value');
      eyeBtn.innerHTML = EYE_OPEN;   // visible by default = open eye shown

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

    // As the user types
    input.addEventListener('input', function () {
      // Validate: integers only — reject any non-digit (except dashes from format)
      var digits = input.value.replace(/\D/g, '');

      // Format if needed
      if (fmt === 'ssn') {
        input.value = formatSsn(input.value);
      } else if (maxLen) {
        input.value = digits.slice(0, maxLen);
      } else {
        input.value = digits;
      }

      var count = countDigits(input.value);

      // Clear any prior error while typing
      setError(grpEl, errId, '');
      setSubmit(true);

      // Auto-conceal once all digits are entered
      if (maxLen && count >= maxLen && showEye) {
        input.type = 'password';
        eyeBtn.innerHTML = EYE_OFF;
      } else if (showEye) {
        input.type = 'text';
        eyeBtn.innerHTML = EYE_OPEN;
      }
    });

    // Validate on blur
    input.addEventListener('blur', function () {
      var count = countDigits(input.value);

      if (!input.value.trim()) {
        // Empty — TDX required-check handles this at submit
        setError(grpEl, errId, '');
        setSubmit(true);
        return;
      }

      // Must be integers only (no letters or special chars other than dashes from format)
      var nonDigits = input.value.replace(/[\d\-]/g, '');
      if (nonDigits.length > 0) {
        setError(grpEl, errId, 'Please enter numbers only.');
        setSubmit(false);
        return;
      }

      // Min length check
      if (minLen && count < minLen) {
        setError(grpEl, errId,
          'Please enter a valid ' + minLen + '-digit value. ' +
          'You have entered ' + count + ' digit' + (count === 1 ? '.' : 's.'));
        setSubmit(false);
        return;
      }

      // Max length check
      if (maxLen && count > maxLen) {
        setError(grpEl, errId,
          'Please enter no more than ' + maxLen + ' digits.');
        setSubmit(false);
        return;
      }

      setError(grpEl, errId, '');
      setSubmit(true);
    });
  }


  /* ============================================================
     FEATURE 4 — BIRTHDATE VALIDATION
     Config div text format:
       fieldId | minage:18
     ============================================================ */
  function parseDate(val) {
    if (!val || !val.trim()) return null;
    var parts = val.trim().split('/');
    if (parts.length !== 3) return null;
    var m = parseInt(parts[0], 10);
    var d = parseInt(parts[1], 10);
    var y = parseInt(parts[2], 10);
    if (isNaN(m) || isNaN(d) || isNaN(y) || y < 1900) return null;
    var date = new Date(y, m - 1, d);
    date.setHours(0, 0, 0, 0);
    if (date.getMonth() !== m - 1) return null;
    return date;
  }

  function getAge(birth, today) {
    var age = today.getFullYear() - birth.getFullYear();
    var md  = today.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function setupDateValidation(configEl) {
    var cfg = parseConfig(configEl);
    configEl.style.display = 'none';

    var fieldId = cfg._main;
    var minAge  = parseInt(cfg.minage || '0', 10);

    var input  = getById(fieldId);
    if (!input) return;

    var grpId  = fieldId + '-grp';
    var grpEl  = getById(grpId) || input.parentNode;
    var errId  = 'tdx-date-error-' + fieldId;

    function validate() {
      var val = input.value;

      if (!val || !val.trim()) {
        setError(grpEl, errId, '');
        setSubmit(true);
        return;
      }

      var date = parseDate(val);
      if (!date) {
        setError(grpEl, errId, 'Please enter a valid date in mm/dd/yyyy format.');
        setSubmit(false);
        return;
      }

      var today = new Date(); today.setHours(0, 0, 0, 0);

      if (date > today) {
        setError(grpEl, errId, 'Birth date cannot be in the future. Please enter a valid date of birth.');
        setSubmit(false);
        return;
      }

      if (minAge && getAge(date, today) < minAge) {
        setError(grpEl, errId,
          'The birth date entered indicates an age under ' + minAge +
          '. Please check the date and try again.');
        setSubmit(false);
        return;
      }

      setError(grpEl, errId, '');
      setSubmit(true);
    }

    input.addEventListener('change', validate);
    input.addEventListener('blur',   validate);
    if (window.jQuery) window.jQuery(input).on('change', validate);
  }


  /* ============================================================
     INIT — wire everything up
     ============================================================ */
  function init() {
    document.querySelectorAll('.tdx-collapse').forEach(function (el) { setupCollapse(el); });
    document.querySelectorAll('.tdx-row').forEach(function (el) { setupRow(el); });
    document.querySelectorAll('.tdx-mask').forEach(function (el) { setupMask(el); });
    document.querySelectorAll('.tdx-validate-date').forEach(function (el) { setupDateValidation(el); });
    syncRowWrappers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
