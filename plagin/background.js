chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleRender") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["content.js"] // Запускаем content.js заново
            }).then(() => {
                sendResponse({ status: "ok" });
            }).catch((error) => {
                console.error("Ошибка при выполнении скрипта:", error);
                sendResponse({ status: "error", message: error.message });
            });
        });

        return true;
    }
});
