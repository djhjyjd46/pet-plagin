document.addEventListener("DOMContentLoaded", () => {
  const color = document.querySelector(".color");
  const num = document.querySelector(".num");
  const apply = document.querySelector("#apply");
  const toggleButton = document.querySelector("#toggleButton");
  let numValue = num.value;
  let colorValue = color.value;

  num.addEventListener("input", (e) => {
    numValue = e.target.value;
  });

  color.addEventListener("input", (e) => {
    colorValue = e.target.value;
  });

  apply.addEventListener("click", () => {
    chrome.storage.sync.set({
      styles: {
        color: colorValue,
        fontSize: `${numValue}px`
      }
    }, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }, () => {
            chrome.tabs.sendMessage(tab.id, {
              action: "updateStyles",
              styles: {
                color: colorValue,
                fontSize: `${numValue}px`
              }
            });
          });
        });
      });
    });
  });

  // Добавляем обработчик события для кнопки "Обновить"
  toggleButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }, () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "toggleRender" });
        });
      }
    });
  });
});
