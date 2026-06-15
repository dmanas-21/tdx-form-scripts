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
    var toggles = document.querySelectorAll('.tdx-collapse');
    for (var i = 0; i < toggles.length; i++) setupCollapse(toggles[i]);

    var rows = document.querySelectorAll('.tdx-row');
    for (var j = 0; j < rows.length; j++) setupRow(rows[j]);

    // Rows are built after collapse setup, so re-sync wrapper visibility
    // to remove empty gaps under sections that start collapsed.
    syncRowWrappers();

    // Form-specific validations (separate into their own file later)
    initBirthDateValidation();
    initBirthDatePrivacy();
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
     FORM-SPECIFIC: BIRTH DATE PRIVACY
     ------------------------------------------------------------
     Birth date is PII. It is a TDX date-PICKER (a calendar widget),
     so it cannot be password-masked the way a text field can without
     breaking the calendar. The realistic protection here is to stop
     the browser from saving/suggesting the value via autofill, and
     to disable spell-check/auto-correct on it.

     If stronger concealment is ever required, the field type would
     need to change from a date picker to a masked text input, which
     is a larger change to discuss with the team.
     ============================================================ */

  function initBirthDatePrivacy() {
    var input = document.getElementById(BIRTHDATE_ID);
    if (!input) return;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('spellcheck', 'false');
  }

  /* ============================================================
     END FORM-SPECIFIC: BIRTH DATE PRIVACY
     ============================================================ */


  /* ============================================================
     FORM-SPECIFIC: SSN INPUT MASK + CONCEALMENT
     ------------------------------------------------------------
     SSN is highly sensitive PII. This block does three things:

       1. FORMAT  - as the user types, auto-inserts dashes so the
                    value reads as ###-##-#### (digits only, max 9).
       2. CONCEAL - the field is hidden by default (shown as dots,
                    like a password) to protect against shoulder-
                    surfing, screen-shares and screenshots.
       3. REVEAL  - an eye icon lets the user briefly reveal the
                    value to verify it, then hide it again.

     Also disables browser autofill/autocomplete so the SSN is not
     saved or suggested by the browser.

     The actual submitted value is the formatted ###-##-#### string.
     Concealment is display-only and does not change what is stored.

     >>> SET THE SSN FIELD ID BELOW before deploying. <<<
     When ready, move everything between these fences into the
     per-form JS file alongside the birth date logic.
     ============================================================ */

  // TODO: replace with the SSN field's real TDX attribute id.
  var SSN_ID     = 'attribute37297';
  var SSN_GRP_ID = 'attribute37297-grp';

  // Format a raw string into ###-##-#### using only its digits.
  function ssnFormat(raw) {
    var digits = (raw || '').replace(/\D/g, '').slice(0, 9);
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

  function initSsnMask() {
    var input = document.getElementById(SSN_ID);
    if (!input) return;   // field id not set / not on this form

    // Privacy: stop the browser saving or suggesting the SSN.
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('maxlength', '11');   // ###-##-####
    input.setAttribute('placeholder', '•••-••-••••');

    // Concealed by default.
    input.type = 'password';

    // Format the value as the user types.
    input.addEventListener('input', function () {
      input.value = ssnFormat(input.value);
    });

    // Build the eye toggle button and place it inside the field wrapper.
    var grp = document.getElementById(SSN_GRP_ID) || input.parentNode;
    if (grp) { grp.style.position = 'relative'; }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Show or hide SSN');
    btn.innerHTML = EYE_OFF;   // starts concealed, so offer "show"
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

    // Sit the button over the input; pad the input so text clears the icon.
    input.style.paddingRight = '38px';

    btn.addEventListener('click', function () {
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = EYE_OPEN;
      } else {
        input.type = 'password';
        btn.innerHTML = EYE_OFF;
      }
    });

    // Place the button next to the input within the field group.
    if (input.parentNode) {
      input.parentNode.style.position = 'relative';
      input.parentNode.appendChild(btn);
    }
  }

  /* ============================================================
     END FORM-SPECIFIC: SSN INPUT MASK + CONCEALMENT
     ============================================================ */


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
