(() => {
    function init() {
        const existingBlock = document.querySelector(".group_friends");
        if (!existingBlock) {
            waitForData();
        }
    }

    const urlObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                init();
            }
        }
    });

    urlObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    init();

    function applySavedStyles() {
        chrome.storage.sync.get('styles', (data) => {
            if (data.styles) {
                const elements = document.querySelectorAll('[data-testid="post_date_block_preview"]');
                elements.forEach(element => {
                    element.style.color = data.styles.color;
                    element.style.fontSize = data.styles.fontSize;
                });
            }
        });
    }

    applySavedStyles();

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {
            case "toggleRender":
                toggleRender();
                break;
            case "updateStyles":
                const elements = document.querySelectorAll('[data-testid="post_date_block_preview"]');
                elements.forEach(element => {
                    element.style.color = message.styles.color;
                    element.style.fontSize = message.styles.fontSize;
                });
                chrome.storage.sync.set({ styles: message.styles });
                break;
        }
    });

    function toggleRender() {
        const existingBlock = document.querySelector(".group_friends");
        if (existingBlock) {
            existingBlock.remove();
        } else {
            waitForData();
        }
    }

    function waitForData() {
        const observer = new MutationObserver(() => {
            const dataPostEl = document.querySelectorAll('[data-testid="post_date_block_preview"]');
            const arrDate = [...dataPostEl].map((item) => item.textContent);

            if (arrDate.length > 5) {
                const arrDateAbsolute = arrDate.map((item) => convertPostDate(item));
                const objData = Object.fromEntries(arrDate.map((key, index) => [key, arrDateAbsolute[index]]));
                const arrData = Object.entries(objData).map(([key, value]) => ({ key, value }));
                renderBlock(arrData.slice(0, 5));
            }

            applySavedStyles();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function convertPostDate(input) {
        const now = new Date();

        if (input.includes('только что')) {
            return now;
        }

        const relativeRegex = /(\d+)\s*(мин|ч|д|н)\s*назад/;
        const absoluteRegex = /(\d{1,2})\s+(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)\s*(\d{4})?/;

        const relativeMatch = input.match(relativeRegex);
        if (relativeMatch) {
            const value = parseInt(relativeMatch[1], 10);
            const unit = relativeMatch[2];

            let diff;
            if (unit === 'мин') {
                diff = value * 60 * 1000;
            } else if (unit === 'ч') {
                diff = value * 60 * 60 * 1000;
            } else if (unit === 'д') {
                diff = value * 24 * 60 * 60 * 1000;
            } else if (unit === 'н') {
                diff = value * 7 * 24 * 60 * 60 * 1000;
            }

            return new Date(now.getTime() - diff);
        }

        const absoluteMatch = input.match(absoluteRegex);
        if (absoluteMatch) {
            const day = parseInt(absoluteMatch[1], 10);
            const monthStr = absoluteMatch[2];
            const year = absoluteMatch[3] ? parseInt(absoluteMatch[3], 10) : now.getFullYear();

            const months = {
                янв: 0,
                фев: 1,
                мар: 2,
                апр: 3,
                май: 4,
                июн: 5,
                июл: 6,
                авг: 7,
                сен: 8,
                окт: 9,
                ноя: 10,
                дек: 11
            };

            const month = months[monthStr];

            return new Date(year, month, day);
        }

        return null;
    }
    function getContent() {
        const phoneElement = document.querySelector('a[href^="tel:"]');
        const phone = phoneElement ? phoneElement.getAttribute('href').replace('tel:', '').replace('+', '') : null;
    
        let groupId = window.location.href.replace(/^https:\/\/vk\.com\//, '');
    
        return { phone, groupId };
    }
    
    

    function renderBlock(data) {
        const backDate = Date.now() - 1000 * 60 * 60 * 24 * 30 * 6;

        const sectionBlock = document.querySelector("#narrow_column");
        if (!sectionBlock) return;

        const existingBlock = document.querySelector(".new_block");
        if (existingBlock) return;

        const labelHead = document.createElement("div");
        const newBlock = document.createElement("div");
        const newDiv = document.createElement("div");
        const buttonEl=document.createElement('button');
        const dataUlEl = document.createElement("ul");
        newDiv.append(dataUlEl);
        dataUlEl.classList.add("block-list");
        
        buttonEl.textContent = 'Собрать данные'
        buttonEl.style.cssText = buttonEl.style.cssText = `
        display: block;
        width: 60px;
        height: 20px; 
        background: red;
    `;
    
       
    buttonEl.addEventListener('click', () => {
        const { phone, groupId } = getContent();
        if (groupId) {
            const url = new URL('http://chelenjsproject.ru/redirect');
            if (phone) url.searchParams.append('phone', phone);
            url.searchParams.append('groupId', groupId);
            window.location.href = url.toString();
        } else {
            alert('Не удалось найти информацию');
        }
    });

        sectionBlock.prepend(newBlock);
        newDiv.prepend(labelHead);
        labelHead.textContent = "Лидогенерация";
        labelHead.style.cssText = `
            font-style: normal;
            font-weight: 500;
            -webkit-font-smoothing: subpixel-antialiased;
            -moz-osx-font-smoothing: auto;
            font-size: 15px;
            line-height: 20px;
            letter-spacing: -.007em;`;

        data.forEach((item) => {
            const dataLiEl = document.createElement("li");
            if (item.value < backDate) {
                dataLiEl.style.color = "red";
            }
            dataLiEl.textContent = item.key;
            dataUlEl.append(dataLiEl);
        });

        newBlock.classList.add("page_block", "new_block");
        newBlock.style.cssText = `
            display: block;
            padding: 19px 20px 20px;
        `;

        newBlock.append(newDiv);
        newDiv.appendChild(buttonEl)
        console.log("скрипт отработал");

        setTimeout(applySavedStyles, 0);
    }

})();