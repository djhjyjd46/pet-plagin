(() => {
    // Функция инициализации
    function init() {
        const existingBlock = document.querySelector(".group_friends");
        if (!existingBlock) {
            waitForData();
        }
    }

    // Отслеживание изменений URL через наблюдатель за body
    const urlObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                init();
            }
        }
    });

    // Запуск наблюдателя за изменениями в DOM
    urlObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Первичная инициализация
    init();

    // Обработчик сообщений от popup
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

            if (arrDate.length > 4) {
                const arrDateAbsolute = arrDate.map((item) => convertPostDate(item));

                const objData = Object.fromEntries(arrDate.map((key, index) => [key, arrDateAbsolute[index]]));
                const arrData = Object.entries(objData).map(([key, value]) => ({ key, value }));
                renderBlock(arrData.slice(0, 5));
            }

        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function convertPostDate(input) {
        const now = new Date();

        // Добавляем проверку для "только что"
        if (input.includes('только что')) {
            return now;
        }

        // Обновляем регулярное выражение для распознавания минут
        const relativeRegex = /(\d+)\s*(мин|ч|д|н)\s*назад/;

        // Регулярное выражение для распознавания абсолютных дат (например, "12 янв 2024")
        const absoluteRegex = /(\d{1,2})\s+(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)\s*(\d{4})?/;

        // Обработка относительных дат
        const relativeMatch = input.match(relativeRegex);
        if (relativeMatch) {
            const value = parseInt(relativeMatch[1], 10);
            const unit = relativeMatch[2];

            let diff;
            if (unit === 'мин') {
                diff = value * 60 * 1000; // Минуты в миллисекундах
            } else if (unit === 'ч') {
                diff = value * 60 * 60 * 1000; // Часы в миллисекундах
            } else if (unit === 'д') {
                diff = value * 24 * 60 * 60 * 1000; // Дни в миллисекундах
            } else if (unit === 'н') {
                diff = value * 7 * 24 * 60 * 60 * 1000; // Недели в миллисекундах
            }

            return new Date(now.getTime() - diff); // Возвращаем дату с учетом разницы
        }

        // Обработка абсолютных дат (например, "12 янв 2024" или "11 фев")
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

            return new Date(year, month, day); // Возвращаем объект Date с абсолютной датой
        }

        // Если не найдено совпадение, возвращаем null
        return null;
    }

    function renderBlock(data) {
        // conts groupPhone = querySelector('')

        const backDate = Date.now() - 1000 * 60 * 60 * 24 * 30 * 6; // 6 месяцев назад

        const sectionBlock = document.querySelector("#narrow_column");
        if (!sectionBlock) return;

        const existingBlock = document.querySelector(".new_block");
        if (existingBlock) return; // Чтобы не добавлять дубликаты

        const labelHead = document.createElement("div");
        const newBlock = document.createElement("div");
        const newDiv = document.createElement("div");

        const dataUlEl = document.createElement("ul");
        newDiv.append(dataUlEl);
        dataUlEl.classList.add("block-list");

        sectionBlock.prepend(newBlock);
        newDiv.prepend(labelHead);
        labelHead.textContent = "Лидогенерация";
        labelHead.style.cssText = `
            font-style: normal;
            font-style: normal;
            font-weight: 500;
            -webkit-font-smoothing: subpixel-antialiased;
            -moz-osx-font-smoothing: auto;
            font-size: 15px;
            line-height: 20px;
            letter-spacing: -.007em;`

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

        console.log(data);

    }
})();