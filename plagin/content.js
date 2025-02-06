window.addEventListener("load", () => {
    waitForData(); // Ждем, пока появится достаточно данных
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "toggleRender") {
        toggleRender();
    }
});

function toggleRender() {
    const existingBlock = document.querySelector(".group_friends");
    if (existingBlock) {
        existingBlock.remove(); // Если блок есть, удаляем его
    } else {
        waitForData(); // Если нет, ждем появления данных
    }
}

function waitForData() {
    const observer = new MutationObserver(() => {
        const dataPostEl = document.querySelectorAll('[data-testid="post_date_block_preview"]');
        const arrDate = [...dataPostEl].map((item) => item.textContent);

        if (arrDate.length >= 5) {
            observer.disconnect(); // Останавливаем наблюдение, когда получили 5 элементов
            renderBlock(arrDate.slice(0, 5));
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function renderBlock(arrDate) {
    const sectionBlock = document.querySelector("#narrow_column");
    if (!sectionBlock) return;

    const existingBlock = document.querySelector(".group_friends");
    if (existingBlock) return; // Чтобы не добавлять дубликаты

    const labelHead = document.createElement("div");
    const newBlock = document.createElement("div");
    const newDiv = document.createElement("div");

    const dataUlEl = document.createElement("ul");
    newDiv.append(dataUlEl);
    dataUlEl.classList.add("block-list");

    sectionBlock.prepend(newBlock);
    newDiv.prepend(labelHead);
    labelHead.classList.add("group_friends_text");
    labelHead.textContent = "Лидогенерация";

    arrDate.forEach((item) => {
        const dataLiEl = document.createElement("li");
        dataLiEl.textContent = item;
        dataUlEl.append(dataLiEl);
    });

    newBlock.classList.add("page_block", "group_friends");
    newBlock.append(newDiv);
}
