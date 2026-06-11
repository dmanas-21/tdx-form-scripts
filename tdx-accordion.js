(function () {
 
  function initAccordions() {
    var toggles = document.querySelectorAll('.tdx-toggle');
 
    toggles.forEach(function (toggle) {
      var body = toggle.nextElementSibling;
 
      toggle.addEventListener('click', function () {
        var isOpen = body.style.display === 'block';
 
        if (isOpen) {
          body.style.display = 'none';
          toggle.style.background = '#f0f0f0';
          toggle.innerHTML = toggle.innerHTML.replace('&#9660;', '&#9654;').replace('▼', '▶');
        } else {
          body.style.display = 'block';
          toggle.style.background = '#e8f0fe';
          toggle.innerHTML = toggle.innerHTML.replace('&#9654;', '&#9660;').replace('▶', '▼');
        }
      });
    });
  }
 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccordions);
  } else {
    initAccordions();
  }
 
})();
 
