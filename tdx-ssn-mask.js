(function () {
  // Parse "key: value" lines out of a config block into an object.
  function parseConfig(el) {
    var cfg = {};
    el.textContent.split('\n').forEach(function (line) {
      var i = line.indexOf(':');
      if (i === -1) return;
      var key = line.slice(0, i).trim().toLowerCase();
      var val = line.slice(i + 1).trim();
      if (key && val) cfg[key] = val;
    });
    return cfg;
  }

  function selectorFrom(cfg) {
    if (cfg.selector) return cfg.selector;
    if (cfg.id) return '[id="' + cfg.id + '"]';
    return null;
  }

  function formatSSN(digits) {
    digits = digits.replace(/\D/g, '').slice(0, 9);
    var out = digits.slice(0, 3);
    if (digits.length > 3) out += '-' + digits.slice(3, 5);
    if (digits.length > 5) out += '-' + digits.slice(5, 9);
    return out;
  }

  function enhance(field) {
    if (field.dataset.ssnEnhanced) return;   // don't double-bind
    field.dataset.ssnEnhanced = 'true';

    field.setAttribute('maxlength', '11');    // 9 digits + 2 dashes
    field.setAttribute('inputmode', 'numeric');
    field.setAttribute('autocomplete', 'off');

    field.style.webkitTextSecurity = 'disc';
    field.style.textSecurity = 'disc';

    field.addEventListener('input', function () {
      var caretAtEnd = field.selectionStart === field.value.length;
      field.value = formatSSN(field.value);
      if (caretAtEnd) field.setSelectionRange(field.value.length, field.value.length);
    });

    field.addEventListener('focus', function () {
      field.style.webkitTextSecurity = 'none';
      field.style.textSecurity = 'none';
    });
    field.addEventListener('blur', function () {
      field.style.webkitTextSecurity = 'disc';
      field.style.textSecurity = 'disc';
      var valid = /^\d{3}-\d{2}-\d{4}$/.test(field.value);
      field.classList.toggle('is-invalid', field.value.length > 0 && !valid);
    });
  }

  function scan() {
    document.querySelectorAll('.tdx-ssn-mask').forEach(function (block) {
      var sel = selectorFrom(parseConfig(block));
      if (!sel) return;
      document.querySelectorAll(sel).forEach(enhance);
    });
  }

  if (document.readyState !== 'loading') scan();
  else document.addEventListener('DOMContentLoaded', scan);

  // Script loads globally; config + fields appear per form, possibly late.
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
