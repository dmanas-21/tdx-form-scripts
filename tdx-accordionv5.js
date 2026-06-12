/*
  ============================================================
  TDX COLLAPSE  —  generic, reusable across ALL forms
  Host this ONCE on GitHub. Never edit it per-form.
  Each form configures itself via data-* attributes in its
  own HTML static content block (see tdx-collapse-snippet.html).
  ============================================================
*/
(function () {

  function makeToggle(toggle) {
    // Read this section's config from the HTML block
    var label  = toggle.getAttribute('data-tdx-label') || 'Section';
    var fields = (toggle.getAttribute('data-tdx-fields') || '')
                   .split(',')
                   .map(function (s) { return s.trim(); })
                   .filter(Boolean);
    var startOpen = toggle.getAttribute('data-tdx-open') === 'true';

    // Style the bar (so the HTML block stays tiny)
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
    // Find EVERY collapsible section on the page and wire it up
    var toggles = document.querySelectorAll('[data-tdx-collapse]');
    for (var i = 0; i < toggles.length; i++) {
      makeToggle(toggles[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
