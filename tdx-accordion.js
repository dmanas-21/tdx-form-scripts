(function () {

  // The exact field labels in your Contact Information section
  var contactLabels = [
    'Full Name',
    'Personal Email Address',
    'Primary Phone',
    'Secondary Phone'
  ];

  function findFieldRowByLabel(labelText) {
    // TDX wraps each field in a container — we find the label then go up to the row
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim().replace('*', '').trim() === labelText) {
        // Walk up until we find the field's outer wrapper div
        var el = labels[i];
        while (el && el.tagName !== 'DIV') {
          el = el.parentElement;
        }
        // Go one more level up to get the full field row
        if (el && el.parentElement) {
          return el.parentElement;
        }
      }
    }
    return null;
  }

  function init() {
    var toggle = document.querySelector('.tdx-toggle');
    if (!toggle) return;

    // Find and hide all contact field rows on page load
    var rows = [];
    contactLabels.forEach(function (labelText) {
      var row = findFieldRowByLabel(labelText);
      if (row) {
        row.style.display = 'none';
        rows.push(row);
      }
    });

    var isOpen = false;

    toggle.addEventListener('click', function () {
      isOpen = !isOpen;
      rows.forEach(function (row) {
        row.style.display = isOpen ? '' : 'none';
      });
      toggle.innerHTML = isOpen
        ? '&#9660; Contact Information — click to collapse'
        : '&#9654; Contact Information — click to expand';
      toggle.style.background = isOpen ? '#e8f0fe' : '#f0f0f0';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
