function formatSSN(value) {
    const digits = value.replace(/\D/g, "").substring(0, 9);

    if (digits.length <= 3) return digits;

    if (digits.length <= 5) {
        return digits.substring(0, 3) + "-" + digits.substring(3);
    }

    return (
        digits.substring(0, 3) + "-" +
        digits.substring(3, 5) + "-" +
        digits.substring(5)
    );
}

function applySSNMask(field) {

    if (!field || field.dataset.nvccMaskInitialized) return;

    field.dataset.nvccMaskInitialized = "true";
    field.maxLength = 11;

    field.addEventListener("input", function () {
        const pos = field.selectionStart;
        const raw = field.value;

        field.value = formatSSN(raw);

        // keep cursor usable (basic fix)
        field.setSelectionRange(pos, pos);
    });
}

/* SAFE INIT (IMPORTANT FIX) */
function initSSNMasking() {

    if (!window.config || !window.config.inputMasks) {
        return false;
    }

    let found = false;

    window.config.inputMasks.forEach(function (mask) {

        if (mask.type !== "ssn") return;

        found = true;

        const fieldId = mask.target;

        // TDx renders in multiple ways — cover all
        const field =
            document.querySelector("#CustomAttributes_" + fieldId) ||
            document.querySelector("input[name*='" + fieldId + "']") ||
            document.querySelector("[id*='" + fieldId + "']");

        if (field) {
            applySSNMask(field);
        }
    });

    return found;
}

/* RETRY LOOP (CRITICAL FOR TEAMDYNAMIX) */
(function waitForConfig() {

    let tries = 0;

    const timer = setInterval(function () {

        tries++;

        // config may not exist immediately in TDx
        if (window.config && window.config.inputMasks) {

            initSSNMasking();

            clearInterval(timer);
        }

        if (tries > 40) {
            clearInterval(timer);
        }

    }, 500);

})();
