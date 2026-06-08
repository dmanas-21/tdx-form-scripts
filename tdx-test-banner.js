document.addEventListener("DOMContentLoaded", function () {
    const testDiv = document.getElementById("tdx-test");

    if (testDiv) {
        testDiv.innerHTML = "✅ JavaScript loaded successfully from CDN!";
        testDiv.style.backgroundColor = "#d4edda";
        testDiv.style.padding = "10px";
        testDiv.style.border = "1px solid green";
    } else {
        console.log("Test div not found");
    }
});
