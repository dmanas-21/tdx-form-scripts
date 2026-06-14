/*
  ============================================================
  TDX COLLAPSE — shared engine. Host ONCE on GitHub.
  NEVER edit this file per form.

  Config lives in the form's HTML static content:
    <div class="tdx-collapse">Label | id1-grp, id2-grp, id3-grp</div>

  - text before "|"  = bar label
  - text after "|"   = comma-separated field -grp IDs to collapse
  - add class "tdx-open" to start expanded (optional)

  IMPORTANT: collapse hides a SECTION by wrapping it, not by
  forcing display on each field — so TDX's own attribute
  dependency (show/hide based on another field) keeps working.
  ============================================================
*/
(function () {

  var GREEN        = '#15783d';
  var CARD_BG      = '#ffffff';
  var CARD_BG_OPEN = '#f1f8f3';
  var BORDER       = '#e3e8e5';

  // Inject one stylesheet that hides collapsed sections via a class.
  // Using a class (not inline display) means we never overwrite the
  // inline display that TDX dependency sets on individual fields.
  var style = document.createElement('style');
  style.textContent = '.tdx-collapsed { display: none !important; }';
  document.head.appendChild(style);

  function setup(toggle) {
    var raw = (toggle.textContent || "").trim();
    var parts = raw.split("|");
    var label = (parts[0] || "Section").trim();
    var ids = (parts[1] || "")
                .split(",")
                .map(function (s) { return s.trim(); })
                .filter(Boolean);

    var startOpen = toggle.className.indexOf("tdx-open") !== -1;

    // Bar styling (NOVA green card)
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
        // Toggle a CLASS instead of inline display.
        // When open, we remove our class and DO NOT set display —
        // so TDX dependency's own inline display stays in control.
        if (open) {
          el.classList.remove('tdx-collapsed');
        } else {
          el.classList.add('tdx-collapsed');
        }
      });

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

  function init() {
    var toggles = document.querySelectorAll('.tdx-collapse');
    for (var i = 0; i < toggles.length; i++) {
      setup(toggles[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
