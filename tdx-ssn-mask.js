function (window, document, $) {
  'use strict';

  if (!$) return;

  function parseConfigText(text) {
    var config = {};
    String(text || '').replace(/\s+/g, ' ').trim().split(';').forEach(function (part) {
      part = $.trim(part);
      if (!part) return;
      var idx = part.indexOf('=');
      if (idx < 0) return;
      config[$.trim(part.slice(0, idx))] = $.trim(part.slice(idx + 1));
    });
    return config;
  }

  function normalizeAttributeId(value) {
    value = String(value || '').trim();
    var match = value.match(/^f?(\d+)$/i);
    return match ? match[1] : null;
  }

  function formatSSN(digits) {
    digits = digits.replace(/\D/g, '').slice(0, 9);
    var out = digits.slice(0, 3);
    if (digits.length > 3) out += '-' + digits.slice(3, 5);
    if (digits.length > 5) out += '-' + digits.slice(5, 9);
    return out;
  }

  function applySSNMask($input) {
    if ($input.data('ssnMaskApplied')) return;
    $input.data('ssnMaskApplied', true);

    $input.attr('maxlength', '11');
    $input.attr('inputmode', 'numeric');
    $input.attr('autocomplete', 'off');
    $input.css({ 'webkitTextSecurity': 'disc', 'text-security': 'disc' });

    $input.on('input.ssnmask', function () {
      var atEnd = this.selectionStart === this.value.length;
      this.value = formatSSN(this.value);
      if (atEnd) this.setSelectionRange(this.value.length, this.value.length);
    });

    $input.on('focus.ssnmask', function () {
      $input.css({ 'webkitTextSecurity': 'none', 'text-security': 'none' });
    });

    $input.on('blur.ssnmask', function () {
      $input.css({ 'webkitTextSecurity': 'disc', 'text-security': 'disc' });
      var valid = /^\d{3}-\d{2}-\d{4}$/.test($input.val());
      $input.toggleClass('is-invalid', $input.val().length > 0 && !valid);
    });
  }

  function initWidgets() {
    $('.tdxfr-widget').each(function () {
      var config = parseConfigText($(this).text());
      if (String(config.widget || '').toLowerCase() !== 'ssn-mask') return;

      var id = normalizeAttributeId(config.target);
      if (!id) return;

      var $field = $('#attribute' + id).first();
      if (!$field.length) return;

      applySSNMask($field);
    });
  }

  function init() {
    initWidgets();
    setTimeout(initWidgets, 600);
  }

  if (document.readyState === 'loading') {
    $(init);
  } else {
    init();
  }

}
