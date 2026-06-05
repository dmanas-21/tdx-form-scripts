(function () {
  // ---- CONFIG: adjust the selector to match your SSN field ----
  // Inspect the field in DevTools. TDX custom attributes often render with
  // ids like "attribute12345" or have a label you can match on.
  var SSN_SELECTOR = 'input[id*="SSN"], input[data-fieldname="SSN"]';

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

    // Visual masking: render as dots but keep the real value in .value
    field.style.webkitTextSecurity = 'disc';
    field.style.textSecurity = 'disc';

    field.addEventListener('input', function () {
      var caretAtEnd = field.selectionStart === field.value.length;
      field.value = formatSSN(field.value);
      if (caretAtEnd) field.setSelectionRange(field.value.length, field.value.length);
    });

    // Reveal while typing, hide when they click away
    field.addEventListener('focus', function () {
      field.style.webkitTextSecurity = 'none';
      field.style.textSecurity = 'none';
    });
    field.addEventListener('blur', function () {
      field.style.webkitTextSecurity = 'disc';
      field.style.textSecurity = 'disc';

      // Optional format validation
      var valid = /^\d{3}-\d{2}-\d{4}$/.test(field.value);
      field.classList.toggle('is-invalid', field.value.length > 0 && !valid);
    });
  }

  function scan() {
    document.querySelectorAll(SSN_SELECTOR).forEach(enhance);
  }

  // Run now, and re-run as TDX injects fields dynamically
  if (document.readyState !== 'loading') scan();
  else document.addEventListener('DOMContentLoaded', scan);

  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();

Get Outlook for iOS
