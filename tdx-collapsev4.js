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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
