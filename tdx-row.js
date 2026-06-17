(function () {

  function getById(id) {
    return document.getElementById(id);
  }

  function setupRow(rowDef) {
    var ids = (rowDef.textContent || '')
                .split(',')
                .map(function (s) { return s.trim(); })
                .filter(Boolean);

    var groups = ids.map(getById).filter(Boolean);

    rowDef.style.display = 'none';

    if (!groups.length) return;

    var wrap = document.createElement('div');
    wrap.className = 'tdx-row-wrap';
    wrap.style.cssText =
      'display:flex;' +
      'flex-wrap:wrap;' +
      'gap:16px;' +
      'align-items:flex-start;' +
      'margin-bottom:16px;';

    groups[0].parentNode.insertBefore(wrap, groups[0]);

    groups.forEach(function (g) {
      g.style.flex     = '1 1 150px';
      g.style.minWidth = '0';
      g.style.margin   = '0';
      wrap.appendChild(g);
    });
  }

  function init() {
    document.querySelectorAll('.tdx-row').forEach(setupRow);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
