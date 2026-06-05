
function formatSSN(value) {
    const digits = value.replace(/\D/g, "").substring(0, 9);

    if (digits.length <= 3) {
        return digits;
    }

    if (digits.length <= 5) {
        return digits.substring(0, 3) + "-" +
               digits.substring(3);
    }

    return digits.substring(0, 3) + "-" +
           digits.substring(3, 5) + "-" +
           digits.substring(5);
}

function applySSNMask(field) {

    if (!field || field.dataset.nvccMaskInitialized) {
        return;
    }

    field.dataset.nvccMaskInitialized = "true";
    field.maxLength = 11;

    field.addEventListener("input", function () {
        this.value = formatSSN(this.value);
    });
}

/* wherever you loop through inputMasks */

config.inputMasks.forEach(function(mask) {

    if (mask.type !== "ssn") {
        return;
    }

    const field =
        document.querySelector("#CustomAttributes_" + mask.target);

    if (field) {
        applySSNMask(field);
    }
});

