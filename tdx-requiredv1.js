(function () {

  var GREEN        = '#15783d';
  var CARD_BG      = '#ffffff';
  var CARD_BG_OPEN = '#f1f8f3';
  var BORDER       = '#e3e8e5';

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
    '}',
    '.tdx-cond-asterisk {',
    '  color: #d0021b;',
    '  margin-left: 4px;',
    '}'
  ].join('\n');
  document.head.appendChild(style);


  function parseConfig(el) {
    var raw = (el.textContent || '').trim();
    var tokens = raw.split('|').map(function (t) { return t.trim(); });
    var config = { _main: tokens[0] || '' };
    for (var i = 1; i < tokens.length; i++) {
      var parts = tokens[i].split(':');
      if (parts.length >= 2) {
        var k = parts[0].trim().toLowerCase();
        var v = parts.slice(1).join(':').trim();
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
    var maskType = cfg.mask    || 'dots';
    var showEye  = cfg.eye     !== 'false';
    var fmt      = cfg.format  || '';
    var minLen   = parseInt(cfg.min  || '0', 10);
    var maxLen   = parseInt(cfg.max  || '0', 10);

    var input = getById(fieldId);
    if (!input) return;

    var grpId  = fieldId + '-grp';
    var grpEl  = getById(grpId) || input.parentNode;
    var errId  = 'tdx-mask-error-' + fieldId;

    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect',  'off');
    input.setAttribute('spellcheck',   'false');
    input.setAttribute('inputmode',    'numeric');
    if (maxLen) {
      input.setAttribute('maxlength', fmt === 'ssn' ? '11' : String(maxLen));
    }
    input.setAttribute('placeholder', fmt === 'ssn' ? '###-##-####' : '');

    input.type = 'text';

    var inputParent = input.parentNode;
    var wrapper = document.createElement('div');
    wrapper.className = 'tdx-mask-wrap';
    inputParent.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    var eyeBtn = null;
    if (showEye) {
      eyeBtn = document.createElement('button');
      eyeBtn.type = 'button';
      eyeBtn.className = 'tdx-eye-btn';
      eyeBtn.setAttribute('aria-label', 'Show or hide field value');
      eyeBtn.innerHTML = EYE_OPEN;

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

    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');

      if (fmt === 'ssn') {
        input.value = formatSsn(input.value);
      } else if (maxLen) {
        input.value = digits.slice(0, maxLen);
      } else {
        input.value = digits;
      }

      var count = countDigits(input.value);

      setError(grpEl, errId, '');
      setSubmit(true);

      if (maxLen && count >= maxLen && showEye) {
        input.type = 'password';
        eyeBtn.innerHTML = EYE_OFF;
      } else if (showEye) {
        input.type = 'text';
        eyeBtn.innerHTML = EYE_OPEN;
      }
    });

    input.addEventListener('blur', function () {
      var count = countDigits(input.value);

      if (!input.value.trim()) {
        setError(grpEl, errId, '');
        setSubmit(true);
        return;
      }

      var nonDigits = input.value.replace(/[\d\-]/g, '');
      if (nonDigits.length > 0) {
        setError(grpEl, errId, 'Please enter numbers only.');
        setSubmit(false);
        return;
      }

      if (minLen && count < minLen) {
        setError(grpEl, errId,
          'Please enter a valid ' + minLen + '-digit value. ' +
          'You have entered ' + count + ' digit' + (count === 1 ? '.' : 's.'));
        setSubmit(false);
        return;
      }

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
     FEATURE 5 — CONDITIONAL REQUIRED
     ------------------------------------------------------------
     Makes a list of fields required based on a trigger field's
     current value. Supports two modes:

       when:hasvalue   - dependents become required as soon as the
                          trigger is non-blank, and revert to
                          optional when the trigger is cleared.

       when:equals      - dependents become required only when the
                          trigger matches one of the given values.
                          value: accepts a comma-separated list, so
                          ANY of the listed values triggers the rule.

     Config div text format (pipe-separated, same style as the
     other features in this file):

       triggerId | when:hasvalue | require: id1-grp, id2-grp

       triggerId | when:equals | value:United States, Canada
                 | strict:false | require: id1-grp, id2-grp

     Options:
       triggerId  = bare attribute id of the watched field
                    (the input/select itself, NOT its -grp wrapper)
       when       = "hasvalue" (default if omitted) or "equals"
       value      = required when when:equals — comma-separated
                    list of acceptable values
       strict     = "true" for exact-match comparison, "false"
                    (default) for case-insensitive + trimmed
       require    = comma-separated -grp ids that become required

     Works with text inputs, native <select> dropdowns (including
     ones skinned by a UI widget library, since the underlying
     <select> still holds the real value), and radio button groups
     (reads whichever radio in the group is currently checked).

     Uses the same TDX-style red error text as the other validations
     in this file, since TDX's own required setting cannot be
     toggled at runtime based on another field's value.
     ============================================================ */

  function readFieldValue(fieldId) {
    var el = getById(fieldId);
    if (!el) return '';

    // Radio buttons: TDX renders each option as its own <input
    // type="radio"> sharing a name, not one element with a single
    // .value. Find the group by name and read whichever is checked.
    if (el.type === 'radio') {
      var group = document.getElementsByName(el.name);
      for (var i = 0; i < group.length; i++) {
        if (group[i].checked) return group[i].value || '';
      }
      return '';
    }

    // Text inputs, native <select>, date pickers, textareas all
    // expose the current value through the standard .value property.
    return el.value || '';
  }

  function normalizeForCompare(str, strict) {
    if (strict) return str;
    return str.trim().toLowerCase();
  }

  function addAsterisk(grpEl) {
    var label = grpEl.querySelector('label');
    if (!label) return;
    if (label.querySelector('.tdx-cond-asterisk')) return;  // already added
    var mark = document.createElement('span');
    mark.className = 'tdx-cond-asterisk';
    mark.textContent = '*';
    label.appendChild(mark);
  }

  function removeAsterisk(grpEl) {
    var label = grpEl.querySelector('label');
    if (!label) return;
    var mark = label.querySelector('.tdx-cond-asterisk');
    if (mark && mark.parentNode) mark.parentNode.removeChild(mark);
  }

  function setupConditionalRequired(configEl) {
    var cfg = parseConfig(configEl);
    configEl.style.display = 'none';

    var triggerId = cfg._main;
    var when      = (cfg.when || 'hasvalue').toLowerCase();
    var strict    = cfg.strict === 'true';

    var acceptedValues = (cfg.value || '')
      .split(',')
      .map(function (v) { return normalizeForCompare(v, strict); })
      .filter(Boolean);

    var dependentIds = (cfg.require || '')
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    var triggerEl = getById(triggerId);
    if (!triggerEl || !dependentIds.length) return;

    function fieldIsEmpty(grpEl) {
      var radios = grpEl.querySelectorAll('input[type="radio"]');
      if (radios.length) {
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].checked) return false;
        }
        return true;
      }
      var input = grpEl.querySelector('input, select, textarea');
      if (!input) return false;
      return !input.value || !input.value.trim();
    }

    function fieldLabel(grpEl) {
      var label = grpEl.querySelector('label');
      return label ? label.textContent.replace('*', '').trim() : 'This';
    }

    function triggerConditionMet() {
      var currentValue = readFieldValue(triggerId);

      if (when === 'equals') {
        var normalizedCurrent = normalizeForCompare(currentValue, strict);
        return acceptedValues.indexOf(normalizedCurrent) !== -1;
      }

      return Boolean(currentValue && currentValue.trim());
    }

    // Shows/hides the asterisk only — does NOT show error text or
    // touch the submit button. Runs whenever the trigger changes.
    function syncAsteriskState() {
      var conditionMet = triggerConditionMet();

      dependentIds.forEach(function (depId) {
        var grpEl = getById(depId);
        if (!grpEl) return;

        if (conditionMet) {
          addAsterisk(grpEl);
        } else {
          removeAsterisk(grpEl);
          // Clear any leftover error from a previous submit attempt
          // once the condition no longer applies.
          setError(grpEl, 'tdx-cond-required-' + depId, '');
        }
      });
    }

    // Runs the real check — called only at submit time. Returns the
    // first invalid field group found, or null if everything is filled.
    function findFirstMissingField() {
      if (!triggerConditionMet()) return null;

      var firstMissing = null;

      dependentIds.forEach(function (depId) {
        var grpEl = getById(depId);
        if (!grpEl) return;

        var errId = 'tdx-cond-required-' + depId;

        if (fieldIsEmpty(grpEl)) {
          setError(grpEl, errId, 'The ' + fieldLabel(grpEl) + ' field is required.');
          if (!firstMissing) firstMissing = grpEl;
        } else {
          setError(grpEl, errId, '');
        }
      });

      return firstMissing;
    }

    triggerEl.addEventListener('change', syncAsteriskState);
    triggerEl.addEventListener('blur',   syncAsteriskState);
    if (window.jQuery) window.jQuery(triggerEl).on('change', syncAsteriskState);

    var triggerRadios = document.getElementsByName(triggerEl.name);
    if (triggerEl.type === 'radio' && triggerRadios.length > 1) {
      for (var r = 0; r < triggerRadios.length; r++) {
        triggerRadios[r].addEventListener('change', syncAsteriskState);
      }
    }

    // Clear a dependent field's error as soon as the person starts
    // typing into it again, so the message doesn't linger needlessly.
    dependentIds.forEach(function (depId) {
      var grpEl = getById(depId);
      if (!grpEl) return;
      var input = grpEl.querySelector('input, select, textarea');
      if (input) {
        input.addEventListener('input', function () {
          setError(grpEl, 'tdx-cond-required-' + depId, '');
        });
      }
    });

    syncAsteriskState();   // apply correct asterisk state on page load

    CONDITIONAL_REQUIRED_CHECKS.push(findFirstMissingField);
  }


  /* ============================================================
     SUBMIT-TIME VALIDATION
     ------------------------------------------------------------
     Every setupConditionalRequired() call registers its own check
     function in this list. On submit click, every check runs;
     each one returns the first missing field group it finds (or
     null). If any check finds a problem, the click is blocked and
     the page scrolls to the very first missing field overall.
     ============================================================ */
  var CONDITIONAL_REQUIRED_CHECKS = [];

  function runConditionalRequiredChecks(event) {
    var firstMissingOverall = null;

    CONDITIONAL_REQUIRED_CHECKS.forEach(function (check) {
      var missing = check();
      if (missing && !firstMissingOverall) {
        firstMissingOverall = missing;
      }
    });

    if (firstMissingOverall) {
      event.preventDefault();
      firstMissingOverall.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var focusTarget = firstMissingOverall.querySelector('input, select, textarea');
      if (focusTarget) focusTarget.focus();
    }
  }

  function initSubmitValidation() {
    var btn = getById('btnSubmit');
    if (!btn) return;
    btn.addEventListener('click', runConditionalRequiredChecks);
  }


  /* ============================================================
     INIT — wire everything up
     ============================================================ */
  function init() {
    document.querySelectorAll('.tdx-collapse').forEach(function (el) { setupCollapse(el); });
    document.querySelectorAll('.tdx-row').forEach(function (el) { setupRow(el); });
    document.querySelectorAll('.tdx-mask').forEach(function (el) { setupMask(el); });
    document.querySelectorAll('.tdx-validate-date').forEach(function (el) { setupDateValidation(el); });
    document.querySelectorAll('.tdx-conditional-required').forEach(function (el) { setupConditionalRequired(el); });
    initSubmitValidation();
    syncRowWrappers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
