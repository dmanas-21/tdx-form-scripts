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
  var bdStyle = document.createElement('style');
  bdStyle.textContent =
    '.tdx-date-error {' +
      'color: #8b1a1a;' +
      'background: #fdf5f5;' +
      'border-left: 4px solid #8b1a1a;' +
      'border-radius: 4px;' +
      'padding: 8px 12px;' +
      'margin-top: 6px;' +
      'font-size: 13px;' +
      'line-height: 1.5;' +
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
