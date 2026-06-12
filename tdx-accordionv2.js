 var CONTACT_FIELD_GROUPS = [
    'attribute37204-grp',   // Full Name
    'attribute37254-grp',
    'attribute37252-grp',
    'attribute37253-grp'
  ];
 
  function hideFields() {
    CONTACT_FIELD_GROUPS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }
 
  function showFields() {
    CONTACT_FIELD_GROUPS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = '';
    });
  }
 
  function init() {
    var toggle = document.querySelector('.tdx-toggle');
    if (!toggle) return;
 
    // Hide fields on page load
    hideFields();
 
    var isOpen = false;
 
    toggle.addEventListener('click', function () {
      isOpen = !isOpen;
      if (isOpen) {
        showFields();
        toggle.innerHTML = '&#9660; Contact Information &mdash; click to collapse';
        toggle.style.background = '#e8f0fe';
      } else {
        hideFields();
        toggle.innerHTML = '&#9654; Contact Information &mdash; click to expand';
        toggle.style.background = '#f0f0f0';
      }
    });
  }
 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
 
})();
