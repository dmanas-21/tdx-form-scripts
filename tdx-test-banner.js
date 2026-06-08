(function () {
    function initializeTDXTest() {
        const target = document.getElementById("tdx-test-banner");

        if (!target) {
            return;
        }

        const message = target.dataset.message || "Success";
        const color = target.dataset.color || "#0078d4";

        const banner = document.createElement("div");
        banner.innerText = message;

        banner.style.backgroundColor = color;
        banner.style.color = "#fff";
        banner.style.padding = "12px";
        banner.style.margin = "10px 0";
        banner.style.borderRadius = "4px";
        banner.style.fontWeight = "bold";
        banner.style.textAlign = "center";

        target.appendChild(banner);

        console.log("TDX custom script executed.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeTDXTest);
    } else {
        initializeTDXTest();
    }
})();
