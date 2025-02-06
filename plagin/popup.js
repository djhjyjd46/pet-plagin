document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("toggleButton").addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggleRender" });
            }
        });
    });
});
