/*
  ============================================================
  TDX COLLAPSE — shared engine. Host ONCE on GitHub.
  NEVER edit this file per form.

  All configuration lives in the form's HTML static content:
    <div class="tdx-collapse">Label | id1-grp, id2-grp, id3-grp</div>

  - text before the "|"  = the bar label
  - text after the "|"   = comma-separated field -grp IDs to collapse
  - add class "tdx-open" to start expanded (optional)
  ============================================================
*/
(function () {

  function setup(toggle) {
    var raw = (toggle.textContent || "").trim();
    var parts = raw.split("|");
    var label = (parts[0] || "Section").trim();
    var fields = (parts[1] || "")
                   .split(",")
                   .map(function (s) { return s.trim(); })
                   .filter(Boolean);

    var startOpen = toggle.className.indexOf("tdx-open") !== -1;

    toggle.style.display      = 'block';
    toggle.style.width        = '100%';
    toggle.style.textAlign    = 'left';
    toggle.style.padding      = '10px 14px';
    toggle.style.border       = '1px solid #ccc';
    toggle.style.borderRadius = '6px';
    toggle.style.fontSize     = '14px';
    toggle.style.fontWeight   = 'bold';
    toggle.style.cursor       = 'pointer';
    toggle.style.marginBottom = '6px';
    toggle.style.userSelect   = 'none';

    function setState(open) {
      fields.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = open ? '' : 'none';
      });
      toggle.innerHTML = (open ? '&#9660; ' : '&#9654; ') + label +
                         (open ? ' &mdash; click to collapse' : ' &mdash; click to expand');
      toggle.style.background = open ? '#e8f0fe' : '#f0f0f0';
    }

    var isOpen = startOpen;
    setState(isOpen);

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
