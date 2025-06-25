// 停車位抽籤系統 JavaScript 程式碼

class ParkingLotterySystem {
    constructor() {
        // 身障車格
        const defaultAZoneExcludes = [191, 192, 193, 194, 195];
        const defaultBZoneExcludes = [
            313, 314, 315, 316, 317, 318, 319, 320, 321, 322,
        ];

        this.history =
            JSON.parse(localStorage.getItem('parkingLotteryHistory')) || [];
        this.aZoneRanges = [];
        this.bZoneRanges = [];
        this.unifiedRanges = [];
        this.aZoneExcludes = defaultAZoneExcludes; // 預設身障車格
        this.bZoneExcludes = defaultBZoneExcludes; // 預設充電機車位
        this.unifiedExcludes = [
            ...defaultAZoneExcludes,
            ...defaultBZoneExcludes,
        ]; // 預設身障車格 + 充電機車位

        // 主題和語言系統
        this.currentTheme = localStorage.getItem('theme') || 'japanese';
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.translations = this.initializeTranslations();

        this.initializeThemeAndLanguage();
        this.initializeEventListeners();
        this.initializeExcludeDisplays();
        this.loadHistory();
    }

    // 初始化翻譯內容
    initializeTranslations() {
        return {
            zh: {
                title: '🚗 社區停車位抽籤系統',
                subtitle: '總停車位數：322格 (A區：1-210，B區：211-322)',
                'lottery-settings': '抽籤設定',
                'separate-zones': '分區抽籤',
                'separate-zones-desc': '勾選後將A區和B區分別進行抽籤',
                'start-lottery': '開始抽籤',
                'reset-lottery': '重置',
                'clear-history': '清除記錄',
                'a-zone-setting': 'A區設定 (1-210)',
                'b-zone-setting': 'B區設定 (211-322)',
                'unified-setting': '整體設定 (1-322)',
                'lottery-numbers': '🎫 抽籤號碼設定',
                'parking-spots': '🚗 車位設定',
                'added-ranges': '已加入的抽籤號碼範圍：',
                'add-range': '新增抽籤號碼範圍：',
                to: '至',
                add: '加入',
                clear: '清空',
                reset: '重置',
                'no-ranges': '尚未加入任何範圍',
                'lottery-count': '抽籤號碼總數：',
                'total-spots': '總車位數：',
                'excluded-spots': '排除車位：',
                'available-spots': '可用車位：',
                'exclude-label': 'A區排除的停車位號碼：',
                'exclude-input-placeholder':
                    '輸入停車位號碼或範圍 (例：10 或 25-30)',
                'add-exclude': '加入',
                'reset-exclude': '重置為預設',
                'lottery-summary': '📊 本次抽籤摘要',
                'total-lottery-numbers': '抽籤號碼總數：',
                'total-available-spots': '可用車位總數：',
                'a-zone-label': 'A區：',
                'b-zone-label': 'B區：',
                'lottery-numbers-short': '抽籤號碼',
                'available-spots-short': '可用車位',
                units: '個',
                'lottery-results': '抽籤結果',
                'lottery-history': '歷史記錄',
                'no-results': '尚未進行抽籤',
                'no-history': '暫無歷史記錄',
            },
            en: {
                title: '🚗 Community Parking Lottery System',
                subtitle: 'Total Spaces: 322 (Zone A: 1-210, Zone B: 211-322)',
                'lottery-settings': 'Lottery Settings',
                'separate-zones': 'Separate Zones',
                'separate-zones-desc':
                    'Check to conduct separate lotteries for Zone A and Zone B',
                'start-lottery': 'Start Lottery',
                'reset-lottery': 'Reset',
                'clear-history': 'Clear History',
                'a-zone-setting': 'Zone A Settings (1-210)',
                'b-zone-setting': 'Zone B Settings (211-322)',
                'unified-setting': 'Unified Settings (1-322)',
                'lottery-numbers': '🎫 Lottery Numbers',
                'parking-spots': '🚗 Parking Spots',
                'added-ranges': 'Added Lottery Number Ranges:',
                'add-range': 'Add Lottery Number Range:',
                to: 'to',
                add: 'Add',
                clear: 'Clear',
                reset: 'Reset',
                'no-ranges': 'No ranges added yet',
                'lottery-count': 'Total Numbers: ',
                'total-spots': 'Total Spots: ',
                'excluded-spots': 'Excluded: ',
                'available-spots': 'Available: ',
                'exclude-label': 'Zone A Excluded Parking Numbers:',
                'exclude-input-placeholder':
                    'Enter parking numbers or range (e.g.: 10 or 25-30)',
                'add-exclude': 'Add',
                'reset-exclude': 'Reset to Default',
                'lottery-summary': '📊 Lottery Summary',
                'total-lottery-numbers': 'Total Lottery Numbers:',
                'total-available-spots': 'Total Available Spots:',
                'a-zone-label': 'Zone A:',
                'b-zone-label': 'Zone B:',
                'lottery-numbers-short': 'Numbers',
                'available-spots-short': 'Spots',
                units: '',
                'lottery-results': 'Lottery Results',
                'lottery-history': 'Lottery History',
                'no-results': 'No lottery conducted yet',
                'no-history': 'No history records',
            },
        };
    }

    // 初始化主題和語言
    initializeThemeAndLanguage() {
        // 設定主題
        document.body.className =
            this.currentTheme === 'github' ? 'github-style' : '';
        document.getElementById('style-selector').value = this.currentTheme;

        // 設定語言
        document.getElementById('language-selector').value =
            this.currentLanguage;
        this.updateLanguage();

        // 添加主題和語言切換事件監聽器
        document
            .getElementById('style-selector')
            .addEventListener('change', (e) => {
                this.switchTheme(e.target.value);
            });

        document
            .getElementById('language-selector')
            .addEventListener('change', (e) => {
                this.switchLanguage(e.target.value);
            });
    }

    // 切換主題
    switchTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);

        if (theme === 'github') {
            document.body.className = 'github-style';
        } else {
            document.body.className = '';
        }
    }

    // 切換語言
    switchLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        this.updateLanguage();
    }

    // 更新頁面語言
    updateLanguage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach((element) => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[this.currentLanguage][key]) {
                element.textContent =
                    this.translations[this.currentLanguage][key];
            }
        });

        // 更新頁面標題和 HTML lang 屬性
        document.title = this.translations[this.currentLanguage].title;
        document.documentElement.lang =
            this.currentLanguage === 'zh' ? 'zh-TW' : 'en';
    }

    // 初始化事件監聽器
    initializeEventListeners() {
        document
            .getElementById('start-lottery')
            .addEventListener('click', () => this.startLottery());
        document
            .getElementById('reset-lottery')
            .addEventListener('click', () => this.resetLottery());
        document
            .getElementById('clear-history')
            .addEventListener('click', () => this.clearHistory());
        document
            .getElementById('separate-zones')
            .addEventListener('change', (e) =>
                this.toggleZoneSettings(e.target.checked)
            );

        // 範圍管理按鈕事件
        document
            .getElementById('add-a-range')
            .addEventListener('click', () => this.addRange('a'));
        document
            .getElementById('clear-a-ranges')
            .addEventListener('click', () => this.clearRanges('a'));
        document
            .getElementById('add-b-range')
            .addEventListener('click', () => this.addRange('b'));
        document
            .getElementById('clear-b-ranges')
            .addEventListener('click', () => this.clearRanges('b'));
        document
            .getElementById('add-unified-range')
            .addEventListener('click', () => this.addRange('unified'));
        document
            .getElementById('clear-unified-ranges')
            .addEventListener('click', () => this.clearRanges('unified'));

        // 排除停車位管理按鈕事件
        document
            .getElementById('add-a-exclude')
            .addEventListener('click', () => this.addExclude('a'));
        document
            .getElementById('clear-a-exclude')
            .addEventListener('click', () => this.resetExclude('a'));
        document
            .getElementById('add-b-exclude')
            .addEventListener('click', () => this.addExclude('b'));
        document
            .getElementById('clear-b-exclude')
            .addEventListener('click', () => this.clearExclude('b'));
        document
            .getElementById('add-unified-exclude')
            .addEventListener('click', () => this.addExclude('unified'));
        document
            .getElementById('clear-unified-exclude')
            .addEventListener('click', () => this.resetExclude('unified'));

        // Enter 鍵支援
        [
            'a-zone-start',
            'a-zone-end',
            'b-zone-start',
            'b-zone-end',
            'unified-start',
            'unified-end',
        ].forEach((id) => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const zone = id.includes('a-zone')
                        ? 'a'
                        : id.includes('b-zone')
                        ? 'b'
                        : 'unified';
                    this.addRange(zone);
                }
            });
        });

        // 排除輸入框 Enter 鍵支援
        [
            'a-zone-exclude-input',
            'b-zone-exclude-input',
            'unified-exclude-input',
        ].forEach((id) => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const zone = id.includes('a-zone')
                        ? 'a'
                        : id.includes('b-zone')
                        ? 'b'
                        : 'unified';
                    this.addExclude(zone);
                }
            });
        });

        // 數字輸入框限制
        [
            'a-zone-start',
            'a-zone-end',
            'b-zone-start',
            'b-zone-end',
            'unified-start',
            'unified-end',
        ].forEach((id) => {
            document.getElementById(id).addEventListener('input', (e) => {
                // 只允許數字，限制1-3位
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length > 3) {
                    value = value.slice(0, 3);
                }
                e.target.value = value;
            });
        });

        // 初始化顯示設定
        this.toggleZoneSettings(
            document.getElementById('separate-zones').checked
        );
    }

    // 初始化排除停車位顯示
    initializeExcludeDisplays() {
        this.updateExcludeDisplay('a');
        this.updateExcludeDisplay('b');
        this.updateExcludeDisplay('unified');

        // 初始化車位摘要
        this.updateSpotsSummary('a');
        this.updateSpotsSummary('b');
        this.updateSpotsSummary('unified');

        // 初始化抽籤摘要
        this.updateLotterySummary();
    }

    // 切換區域設定顯示
    toggleZoneSettings(isSeparate) {
        const zoneSettings = document.querySelector('.zone-settings');
        const unifiedSettings = document.querySelector('.unified-settings');

        if (isSeparate) {
            zoneSettings.style.display = 'grid';
            unifiedSettings.style.display = 'none';
        } else {
            zoneSettings.style.display = 'none';
            unifiedSettings.style.display = 'block';
        }

        // 更新抽籤摘要
        this.updateLotterySummary();
    }

    // 解析號碼範圍字串（例：1-50,60-80 或 A001-A050）
    parseNumberRange(rangeStr) {
        if (!rangeStr || rangeStr.trim() === '') return [];

        const numbers = new Set();
        const ranges = rangeStr.split(',');

        ranges.forEach((range) => {
            range = range.trim();
            if (range.includes('-')) {
                const [start, end] = range.split('-');
                const startTrim = start.trim();
                const endTrim = end.trim();

                // 檢查是否為字母數字格式（如 A001-A050）
                const startMatch = startTrim.match(/^([A-Za-z]+)(\d+)$/);
                const endMatch = endTrim.match(/^([A-Za-z]+)(\d+)$/);

                if (startMatch && endMatch && startMatch[1] === endMatch[1]) {
                    // 字母數字格式
                    const prefix = startMatch[1];
                    const startNum = parseInt(startMatch[2]);
                    const endNum = parseInt(endMatch[2]);
                    const padLength = startMatch[2].length;

                    if (!isNaN(startNum) && !isNaN(endNum)) {
                        for (let i = startNum; i <= endNum; i++) {
                            numbers.add(
                                prefix + i.toString().padStart(padLength, '0')
                            );
                        }
                    }
                } else {
                    // 純數字格式
                    const startNum = parseInt(startTrim);
                    const endNum = parseInt(endTrim);
                    if (!isNaN(startNum) && !isNaN(endNum)) {
                        for (let i = startNum; i <= endNum; i++) {
                            numbers.add(i);
                        }
                    }
                }
            } else {
                // 單一號碼
                const trimmed = range.trim();
                const numMatch = trimmed.match(/^\d+$/);
                if (numMatch) {
                    numbers.add(parseInt(trimmed));
                } else {
                    numbers.add(trimmed);
                }
            }
        });

        return Array.from(numbers);
    }

    // 解析排除的號碼
    parseExcludeNumbers(excludeStr) {
        return this.parseNumberRange(excludeStr);
    }

    // 獲取可用的停車位（只返回停車位號碼，不包括排除的）
    getAvailableParkingSpots(zone, excludeNumbers) {
        let allSpots = [];

        if (zone === 'A') {
            // A區：1-210
            for (let i = 1; i <= 210; i++) {
                allSpots.push(i);
            }
        } else if (zone === 'B') {
            // B區：211-322
            for (let i = 211; i <= 322; i++) {
                allSpots.push(i);
            }
        } else {
            // 整體：1-322
            for (let i = 1; i <= 322; i++) {
                allSpots.push(i);
            }
        }

        // 排除指定的停車位
        const availableSpots = allSpots.filter(
            (spot) => !excludeNumbers.includes(spot)
        );
        return availableSpots;
    }

    // Fisher-Yates 洗牌演算法
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 執行抽籤
    conductLottery(lotteryNumbers, availableSpots) {
        if (lotteryNumbers.length === 0) {
            throw new Error('沒有抽籤號碼');
        }

        if (availableSpots.length === 0) {
            throw new Error('沒有可用的停車位');
        }

        if (lotteryNumbers.length > availableSpots.length) {
            throw new Error(
                `抽籤號碼數量（${lotteryNumbers.length}）超過可用停車位數量（${availableSpots.length}）`
            );
        }

        // 洗牌停車位
        const shuffledSpots = this.shuffleArray(availableSpots);

        // 配對抽籤號碼和停車位
        const results = [];
        for (let i = 0; i < lotteryNumbers.length; i++) {
            results.push({
                lotteryNumber: lotteryNumbers[i],
                parkingSpot: shuffledSpots[i],
            });
        }

        return results;
    }

    // 開始抽籤
    startLottery() {
        try {
            // 獲取設定值
            const separateZones =
                document.getElementById('separate-zones').checked;

            const results = {
                timestamp: new Date(),
                separateZones: separateZones,
                zoneResults: [],
            };

            if (separateZones) {
                // 分區抽籤

                // A區抽籤
                const aZoneRange = this.getCombinedRanges('a');
                if (aZoneRange) {
                    const aLotteryNumbers = this.parseNumberRange(aZoneRange);
                    const aAvailable = this.getAvailableParkingSpots(
                        'A',
                        this.aZoneExcludes
                    );

                    if (aLotteryNumbers.length > 0 && aAvailable.length > 0) {
                        const aResults = this.conductLottery(
                            aLotteryNumbers,
                            aAvailable
                        );
                        results.zoneResults.push({
                            zone: 'A',
                            range: aZoneRange,
                            exclude: this.aZoneExcludes.join(',') || '無',
                            available: aAvailable.length,
                            participants: aLotteryNumbers.length,
                            results: aResults,
                        });
                    }
                }

                // B區抽籤
                const bZoneRange = this.getCombinedRanges('b');
                if (bZoneRange) {
                    const bLotteryNumbers = this.parseNumberRange(bZoneRange);
                    const bAvailable = this.getAvailableParkingSpots(
                        'B',
                        this.bZoneExcludes
                    );

                    if (bLotteryNumbers.length > 0 && bAvailable.length > 0) {
                        const bResults = this.conductLottery(
                            bLotteryNumbers,
                            bAvailable
                        );
                        results.zoneResults.push({
                            zone: 'B',
                            range: bZoneRange,
                            exclude: this.bZoneExcludes.join(',') || '無',
                            available: bAvailable.length,
                            participants: bLotteryNumbers.length,
                            results: bResults,
                        });
                    }
                }
            } else {
                // 不分區抽籤
                const unifiedRange = this.getCombinedRanges('unified');

                if (!unifiedRange) {
                    alert('請先加入發放抽籤號碼範圍');
                    return;
                }

                const allLotteryNumbers = this.parseNumberRange(unifiedRange);
                const allAvailable = this.getAvailableParkingSpots(
                    'all',
                    this.unifiedExcludes
                );

                if (allLotteryNumbers.length > 0 && allAvailable.length > 0) {
                    const allResults = this.conductLottery(
                        allLotteryNumbers,
                        allAvailable
                    );
                    results.zoneResults.push({
                        zone: '整體',
                        range: unifiedRange,
                        exclude: this.unifiedExcludes.join(',') || '無',
                        available: allAvailable.length,
                        participants: allLotteryNumbers.length,
                        results: allResults,
                    });
                } else {
                    alert('沒有有效的抽籤號碼或可用停車位');
                    return;
                }
            }

            if (results.zoneResults.length === 0) {
                alert('沒有有效的抽籤結果，請檢查設定');
                return;
            }

            // 儲存到歷史記錄
            this.saveToHistory(results);

            // 顯示結果
            this.displayResults(results);
        } catch (error) {
            alert('抽籤錯誤：' + error.message);
        }
    }

    // 顯示抽籤結果
    displayResults(results) {
        const container = document.getElementById('results-container');
        const resultIndex = 0; // 當前結果的索引，用於複製功能

        const resultHtml = `
            <div class="round-result">
                <h3>最新抽籤結果</h3>
                <div class="round-info">
                    <strong>抽籤時間：</strong>${results.timestamp.toLocaleString(
                        'zh-TW'
                    )}<br>
                    <strong>抽籤方式：</strong>${
                        results.separateZones ? '分區抽籤' : '合併抽籤'
                    }
                </div>
                <div class="zone-results">
                    ${results.zoneResults
                        .map(
                            (zoneResult, zoneIndex) => `
                        <div class="zone-result">
                            <h4>
                                ${zoneResult.zone}區結果 (參與：${
                                zoneResult.participants ||
                                zoneResult.results.length
                            }，可用位數：${zoneResult.available})
                                <div class="copy-buttons">
                                    <button class="copy-csv-btn" onclick="window.lotterySystem.copyCSV(${resultIndex}, ${zoneIndex})">
                                        複製 CSV
                                    </button>
                                    <button class="copy-numbers-btn" onclick="window.lotterySystem.copyParkingNumbers(${resultIndex}, ${zoneIndex})">
                                        複製停車位號碼
                                    </button>
                                </div>
                            </h4>
                            <div class="round-info">
                                <strong>發放抽籤號碼範圍：</strong>${
                                    zoneResult.range
                                }<br>
                                <strong>排除停車位：</strong>${
                                    zoneResult.exclude || '無'
                                }
                            </div>
                            <table class="lottery-table">
                                <thead>
                                    <tr>
                                        <th>抽籤號碼</th>
                                        <th>分配停車位</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${zoneResult.results
                                        .map(
                                            (pair, index) => `
                                        <tr>
                                            <td>${pair.lotteryNumber}</td>
                                            <td class="parking-number">${pair.parkingSpot}</td>
                                        </tr>
                                    `
                                        )
                                        .join('')}
                                </tbody>
                            </table>
                        </div>
                    `
                        )
                        .join('')}
                </div>
            </div>
        `;

        container.innerHTML = resultHtml;
    }

    // 顯示歷史記錄詳細結果
    showHistoryDetails(historyIndex) {
        const record = this.history[historyIndex];
        if (!record) return;

        // 建立詳細結果的 HTML
        const timestamp = record.timestamp.toLocaleString
            ? record.timestamp.toLocaleString('zh-TW')
            : new Date(record.timestamp).toLocaleString('zh-TW');

        let detailsHtml = `
            <div class="round-result">
                <h3>歷史記錄詳細結果</h3>
                <div class="round-info">
                    <div><strong>時間：</strong>${timestamp}</div>
                    <div><strong>模式：</strong>${
                        record.separateZones ? '分區抽籤' : '整體抽籤'
                    }</div>
                    <div><strong>總計：</strong>${record.zoneResults.reduce(
                        (sum, zone) => sum + zone.results.length,
                        0
                    )} 個停車位</div>
                </div>
                <div class="zone-results">
        `;

        // 為每個區域建立結果表格
        record.zoneResults.forEach((zoneResult, zoneIndex) => {
            detailsHtml += `
                <div class="zone-result">
                    <h4>
                        ${zoneResult.zone}區抽籤結果 (${
                zoneResult.results.length
            } 個停車位)
                        <div class="copy-buttons">
                            <button class="copy-csv-btn" onclick="lottery.copyCSV(${historyIndex}, ${zoneIndex})">複製 CSV</button>
                            <button class="copy-numbers-btn" onclick="lottery.copyParkingNumbers(${historyIndex}, ${zoneIndex})">複製停車位號碼</button>
                        </div>
                    </h4>
                    <table class="lottery-table">
                        <thead>
                            <tr>
                                <th>抽籤號碼</th>
                                <th>停車位</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${zoneResult.results
                                .map(
                                    (result, index) => `
                                <tr>
                                    <td>${result.lotteryNumber}</td>
                                    <td class="parking-number">${result.parkingSpot}</td>
                                </tr>
                            `
                                )
                                .join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        detailsHtml += `
                </div>
            </div>
        `;

        // 更新結果容器顯示
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = detailsHtml;

        // 滾動到結果區域
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 複製 CSV 內容到剪貼簿
    async copyCSV(historyIndex, zoneIndex) {
        // 從歷史記錄中找到對應的結果（因為最新結果已經儲存在索引0）
        const roundData = this.history[historyIndex];
        if (!roundData || !roundData.zoneResults[zoneIndex]) {
            alert('找不到對應的抽籤資料');
            return;
        }

        const zoneResult = roundData.zoneResults[zoneIndex];
        const timestamp = new Date(roundData.timestamp);

        // 建立 CSV 內容
        let csvContent = `抽籤結果 - ${zoneResult.zone}區\n`;
        csvContent += `抽籤時間,${timestamp.toLocaleString('zh-TW')}\n`;
        csvContent += `抽籤方式,${
            roundData.separateZones ? '分區抽籤' : '合併抽籤'
        }\n`;
        csvContent += `發放範圍,${zoneResult.range}\n`;
        csvContent += `排除停車位,${zoneResult.exclude || '無'}\n`;
        csvContent += `可用位數,${zoneResult.available}\n`;
        csvContent += '\n';
        csvContent += '抽籤號碼,分配停車位\n';

        // 新增每筆抽籤結果
        zoneResult.results.forEach((pair) => {
            csvContent += `${pair.lotteryNumber},${pair.parkingSpot}\n`;
        });

        // 複製到剪貼簿
        try {
            await navigator.clipboard.writeText(csvContent);
            alert('CSV 內容已複製到剪貼簿！');
        } catch (err) {
            console.error('複製失敗：', err);
            alert('複製失敗，請手動複製');
        }
    }

    // 複製停車位號碼到剪貼簿
    async copyParkingNumbers(historyIndex, zoneIndex) {
        // 從歷史記錄中找到對應的結果
        const roundData = this.history[historyIndex];
        if (!roundData || !roundData.zoneResults[zoneIndex]) {
            alert('找不到對應的抽籤資料');
            return;
        }

        const zoneResult = roundData.zoneResults[zoneIndex];

        // 建立停車位號碼字串，用逗號分隔
        const parkingNumbers = zoneResult.results
            .map((pair) => pair.parkingSpot)
            .join(',');

        // 複製到剪貼簿
        try {
            await navigator.clipboard.writeText(parkingNumbers);
            alert('停車位號碼已複製到剪貼簿！\n可直接貼到「排除停車位」欄位');
        } catch (err) {
            console.error('複製失敗：', err);
            alert('複製失敗，請手動複製');
        }
    }

    // 儲存到歷史記錄
    saveToHistory(results) {
        this.history.unshift(results);
        // 只保留最近20筆記錄
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        localStorage.setItem(
            'parkingLotteryHistory',
            JSON.stringify(this.history)
        );
        this.loadHistory();
    }

    // 載入歷史記錄
    loadHistory() {
        const container = document.getElementById('history-container');

        if (this.history.length === 0) {
            container.innerHTML = '<div class="no-history">暫無歷史記錄</div>';
            return;
        }

        const historyHtml = this.history
            .map((record, index) => {
                const totalResults = record.zoneResults.reduce(
                    (sum, zone) => sum + zone.results.length,
                    0
                );
                const timestamp = record.timestamp.toLocaleString
                    ? record.timestamp.toLocaleString('zh-TW')
                    : new Date(record.timestamp).toLocaleString('zh-TW');
                return `
                <div class="history-item" onclick="lottery.showHistoryDetails(${index})" style="cursor: pointer;">
                    <h4>${timestamp}</h4>
                    <div class="history-summary">
                        ${record.separateZones ? '分區抽籤' : '整體抽籤'} | 
                        共 ${totalResults} 個停車位 | 
                        ${record.zoneResults
                            .map(
                                (zone) =>
                                    `${zone.zone}區: ${zone.results.length}個`
                            )
                            .join(', ')}
                    </div>
                    <div class="history-hint">點擊查看詳細結果</div>
                </div>
            `;
            })
            .join('');

        container.innerHTML = historyHtml;
    }

    // 重置抽籤
    resetLottery() {
        if (confirm('確定要重置當前抽籤設定嗎？')) {
            document.getElementById('results-container').innerHTML =
                '<div class="no-results">尚未進行抽籤</div>';

            // 清空範圍陣列和顯示
            this.aZoneRanges = [];
            this.bZoneRanges = [];
            this.unifiedRanges = [];
            this.updateRangeDisplay('a');
            this.updateRangeDisplay('b');
            this.updateRangeDisplay('unified');
            this.updateRangeCount('a');
            this.updateRangeCount('b');
            this.updateRangeCount('unified');

            // 重置排除停車位為預設值
            this.aZoneExcludes = [191, 192, 193, 194, 195];
            this.bZoneExcludes = [
                313, 314, 315, 316, 317, 318, 319, 320, 321, 322,
            ];
            this.unifiedExcludes = [
                191, 192, 193, 194, 195, 313, 314, 315, 316, 317, 318, 319, 320,
                321, 322,
            ];
            this.updateExcludeDisplay('a');
            this.updateExcludeDisplay('b');
            this.updateExcludeDisplay('unified');

            document.getElementById('separate-zones').checked = true;

            // 重新設定顯示狀態
            this.toggleZoneSettings(true);
        }
    }

    // 清除歷史記錄
    clearHistory() {
        if (confirm('確定要清除所有歷史記錄嗎？此操作無法復原。')) {
            this.history = [];
            localStorage.removeItem('parkingLotteryHistory');
            this.loadHistory();
        }
    }

    // 新增範圍
    addRange(zone) {
        let prefix, prefixEnd;
        const startId =
            zone === 'a'
                ? 'a-zone-start'
                : zone === 'b'
                ? 'b-zone-start'
                : 'unified-start';
        const endId =
            zone === 'a'
                ? 'a-zone-end'
                : zone === 'b'
                ? 'b-zone-end'
                : 'unified-end';

        if (zone === 'a') {
            prefix = 'A';
            prefixEnd = 'A';
        } else if (zone === 'b') {
            prefix = 'B';
            prefixEnd = 'B';
        } else {
            // unified 使用純數字，不需要前綴
            prefix = '';
            prefixEnd = '';
        }

        const startInput = document.getElementById(startId);
        const endInput = document.getElementById(endId);

        const startValue = startInput.value.trim();
        const endValue = endInput.value.trim();

        if (!startValue || !endValue) {
            alert('請輸入起始和結束數字');
            return;
        }

        // 驗證數字範圍（1-999）
        const startNum = parseInt(startValue);
        const endNum = parseInt(endValue);

        if (
            isNaN(startNum) ||
            isNaN(endNum) ||
            startNum < 1 ||
            endNum < 1 ||
            startNum > 999 ||
            endNum > 999
        ) {
            alert('請輸入1-999之間的數字');
            return;
        }

        if (startNum > endNum) {
            alert('起始數字不能大於結束數字');
            return;
        }

        // 建立範圍字串
        let rangeStr;
        if (zone === 'unified') {
            // 不分區使用純數字
            if (startNum === endNum) {
                rangeStr = `${startNum}`; // 單個號碼
            } else {
                rangeStr = `${startNum}-${endNum}`; // 範圍
            }
        } else {
            // 分區使用前綴+補零
            const startPadded = startValue.padStart(3, '0');
            const endPadded = endValue.padStart(3, '0');
            if (startNum === endNum) {
                rangeStr = `${prefix}${startPadded}`; // 單個號碼
            } else {
                rangeStr = `${prefix}${startPadded}-${prefix}${endPadded}`; // 範圍
            }
        }

        // 檢查是否重複
        const targetArray =
            zone === 'a'
                ? this.aZoneRanges
                : zone === 'b'
                ? this.bZoneRanges
                : this.unifiedRanges;
        if (targetArray.includes(rangeStr)) {
            alert('此範圍已存在');
            return;
        }

        // 檢查是否與現有範圍重疊
        const newRangeNumbers = this.parseNumberRange(rangeStr);
        const existingNumbers = new Set();

        // 獲取所有現有號碼
        targetArray.forEach((range) => {
            const numbers = this.parseNumberRange(range);
            numbers.forEach((num) => existingNumbers.add(num));
        });

        // 檢查重疊
        const overlapping = newRangeNumbers.filter((num) =>
            existingNumbers.has(num)
        );
        if (overlapping.length > 0) {
            if (startNum === endNum) {
                alert(`號碼 ${rangeStr} 已存在`);
            } else {
                alert(
                    `範圍 ${rangeStr} 與現有範圍重疊，重疊號碼：${overlapping.join(
                        ', '
                    )}`
                );
            }
            return;
        }

        // 加入到對應的範圍陣列
        targetArray.push(rangeStr);

        // 更新顯示
        this.updateRangeDisplay(zone);
        this.updateRangeCount(zone);

        // 清空輸入框
        startInput.value = '';
        endInput.value = '';
        startInput.focus();
    }

    // 移除特定範圍
    removeRange(zone, index) {
        const targetArray =
            zone === 'a'
                ? this.aZoneRanges
                : zone === 'b'
                ? this.bZoneRanges
                : this.unifiedRanges;
        targetArray.splice(index, 1);
        this.updateRangeDisplay(zone);
        this.updateRangeCount(zone);
    }

    // 清空所有範圍
    clearRanges(zone) {
        if (confirm('確定要清空所有範圍嗎？')) {
            if (zone === 'a') {
                this.aZoneRanges = [];
            } else if (zone === 'b') {
                this.bZoneRanges = [];
            } else {
                this.unifiedRanges = [];
            }
            this.updateRangeDisplay(zone);
            this.updateRangeCount(zone);
        }
    }

    // 更新範圍顯示
    updateRangeDisplay(zone) {
        const displayId =
            zone === 'a'
                ? 'a-zone-ranges-display'
                : zone === 'b'
                ? 'b-zone-ranges-display'
                : 'unified-ranges-display';
        const displayElement = document.getElementById(displayId);
        const targetArray =
            zone === 'a'
                ? this.aZoneRanges
                : zone === 'b'
                ? this.bZoneRanges
                : this.unifiedRanges;

        if (targetArray.length === 0) {
            displayElement.innerHTML =
                '<span class="no-ranges">尚未加入任何範圍</span>';
        } else {
            const tagsHtml = targetArray
                .map(
                    (range, index) =>
                        `<span class="range-tag">
                    ${range}
                    <button class="remove-range" onclick="window.lotterySystem.removeRange('${zone}', ${index})" title="移除此範圍">×</button>
                </span>`
                )
                .join('');
            displayElement.innerHTML = tagsHtml;
        }
    }

    // 更新範圍數量統計
    updateRangeCount(zone) {
        const countId =
            zone === 'a'
                ? 'a-zone-count'
                : zone === 'b'
                ? 'b-zone-count'
                : 'unified-count';
        const countElement = document.getElementById(countId);
        const targetArray =
            zone === 'a'
                ? this.aZoneRanges
                : zone === 'b'
                ? this.bZoneRanges
                : this.unifiedRanges;

        // 計算總數量
        let totalCount = 0;
        targetArray.forEach((range) => {
            const numbers = this.parseNumberRange(range);
            totalCount += numbers.length;
        });

        countElement.textContent = `抽籤號碼總數：${totalCount}`;

        // 更新車位摘要
        this.updateSpotsSummary(zone);

        // 更新整體摘要
        this.updateLotterySummary();
    }

    // 更新車位摘要
    updateSpotsSummary(zone) {
        let totalSpots, excludedCount, availableSpots;
        const excludeArray =
            zone === 'a'
                ? this.aZoneExcludes
                : zone === 'b'
                ? this.bZoneExcludes
                : this.unifiedExcludes;

        if (zone === 'a') {
            totalSpots = 210; // A區: 1-210
            excludedCount = this.aZoneExcludes.length;
            availableSpots = totalSpots - excludedCount;
        } else if (zone === 'b') {
            totalSpots = 112; // B區: 211-322 (112個)
            excludedCount = this.bZoneExcludes.length;
            availableSpots = totalSpots - excludedCount;
        } else {
            totalSpots = 322; // 整體: 1-322
            excludedCount = this.unifiedExcludes.length;
            availableSpots = totalSpots - excludedCount;
        }

        const summaryId =
            zone === 'a'
                ? 'a-zone-spots-summary'
                : zone === 'b'
                ? 'b-zone-spots-summary'
                : 'unified-spots-summary';
        const summaryElement = document.getElementById(summaryId);

        if (summaryElement) {
            if (zone === 'unified') {
                // 計算A區和B區的可用車位
                const aAvailable = 210 - this.aZoneExcludes.length;
                const bAvailable = 112 - this.bZoneExcludes.length;

                summaryElement.innerHTML = `
                    <div class="total-spots">總車位數：${totalSpots}個</div>
                    <div class="excluded-spots">排除車位：${excludedCount}個</div>
                    <div class="available-spots-count">可用車位：${availableSpots}個</div>
                    <div class="zone-breakdown">
                        <span class="zone-detail">A區可用：${aAvailable}個</span>
                        <span class="zone-detail">B區可用：${bAvailable}個</span>
                    </div>
                `;
            } else {
                summaryElement.innerHTML = `
                    <div class="total-spots">總車位數：${totalSpots}個</div>
                    <div class="excluded-spots">排除車位：${excludedCount}個</div>
                    <div class="available-spots-count">可用車位：${availableSpots}個</div>
                `;
            }
        }
    }

    // 更新抽籤摘要
    updateLotterySummary() {
        const separateZones = document.getElementById('separate-zones').checked;
        const totalLotteryElement = document.getElementById(
            'total-lottery-numbers'
        );
        const totalAvailableElement = document.getElementById(
            'total-available-spots'
        );
        const summaryBreakdown = document.getElementById('summary-breakdown');

        let totalLotteryNumbers = 0;
        let totalAvailableSpots = 0;

        if (separateZones) {
            // 分區模式
            const aLotteryCount = this.aZoneRanges.reduce((sum, range) => {
                return sum + this.parseNumberRange(range).length;
            }, 0);
            const bLotteryCount = this.bZoneRanges.reduce((sum, range) => {
                return sum + this.parseNumberRange(range).length;
            }, 0);

            const aAvailableSpots = 210 - this.aZoneExcludes.length;
            const bAvailableSpots = 112 - this.bZoneExcludes.length;

            totalLotteryNumbers = aLotteryCount + bLotteryCount;
            totalAvailableSpots = aAvailableSpots + bAvailableSpots;

            // 更新分區細節
            document.getElementById('a-zone-lottery-count').textContent =
                aLotteryCount;
            document.getElementById('a-zone-available-count').textContent =
                aAvailableSpots;
            document.getElementById('b-zone-lottery-count').textContent =
                bLotteryCount;
            document.getElementById('b-zone-available-count').textContent =
                bAvailableSpots;

            summaryBreakdown.style.display = 'block';
        } else {
            // 整體模式
            totalLotteryNumbers = this.unifiedRanges.reduce((sum, range) => {
                return sum + this.parseNumberRange(range).length;
            }, 0);
            totalAvailableSpots = 322 - this.unifiedExcludes.length;

            summaryBreakdown.style.display = 'none';
        }

        totalLotteryElement.textContent = totalLotteryNumbers;
        totalAvailableElement.textContent = totalAvailableSpots;
    }

    // 獲取合併後的範圍字串
    getCombinedRanges(zone) {
        const targetArray =
            zone === 'a'
                ? this.aZoneRanges
                : zone === 'b'
                ? this.bZoneRanges
                : this.unifiedRanges;
        return targetArray.join(',');
    }

    // 新增排除停車位
    addExclude(zone) {
        const inputId =
            zone === 'a'
                ? 'a-zone-exclude-input'
                : zone === 'b'
                ? 'b-zone-exclude-input'
                : 'unified-exclude-input';
        const input = document.getElementById(inputId);
        const value = input.value.trim();

        if (!value) {
            alert('請輸入停車位號碼');
            return;
        }

        // 解析輸入的停車位號碼
        const newExcludes = this.parseNumberRange(value);
        if (newExcludes.length === 0) {
            alert('停車位號碼格式錯誤');
            return;
        }

        // 獲取目標陣列
        const targetArray =
            zone === 'a'
                ? this.aZoneExcludes
                : zone === 'b'
                ? this.bZoneExcludes
                : this.unifiedExcludes;

        // 加入新的排除號碼（避免重複）
        newExcludes.forEach((num) => {
            if (!targetArray.includes(num)) {
                targetArray.push(num);
            }
        });

        // 排序
        targetArray.sort((a, b) => a - b);

        // 更新顯示
        this.updateExcludeDisplay(zone);

        // 清空輸入框
        input.value = '';
        input.focus();
    }

    // 移除特定排除停車位
    removeExclude(zone, parkingNumber) {
        const targetArray =
            zone === 'a'
                ? this.aZoneExcludes
                : zone === 'b'
                ? this.bZoneExcludes
                : this.unifiedExcludes;
        const index = targetArray.indexOf(parkingNumber);
        if (index > -1) {
            targetArray.splice(index, 1);
            this.updateExcludeDisplay(zone);
        }
    }

    // 清空排除停車位
    clearExclude(zone) {
        if (confirm('確定要清空所有排除的停車位嗎？')) {
            if (zone === 'a') {
                this.aZoneExcludes = [];
            } else if (zone === 'b') {
                this.bZoneExcludes = [];
            } else {
                this.unifiedExcludes = [];
            }
            this.updateExcludeDisplay(zone);
        }
    }

    // 重置為預設排除停車位
    resetExclude(zone) {
        if (confirm('確定要重置為預設設定嗎？')) {
            if (zone === 'a') {
                this.aZoneExcludes = [191, 192, 193, 194, 195];
            } else if (zone === 'b') {
                this.bZoneExcludes = [
                    313, 314, 315, 316, 317, 318, 319, 320, 321, 322,
                ];
            } else if (zone === 'unified') {
                this.unifiedExcludes = [
                    191, 192, 193, 194, 195, 313, 314, 315, 316, 317, 318, 319,
                    320, 321, 322,
                ];
            }
            this.updateExcludeDisplay(zone);
        }
    }

    // 更新排除停車位顯示
    updateExcludeDisplay(zone) {
        const displayId =
            zone === 'a'
                ? 'a-zone-exclude-display'
                : zone === 'b'
                ? 'b-zone-exclude-display'
                : 'unified-exclude-display';
        const displayElement = document.getElementById(displayId);
        const targetArray =
            zone === 'a'
                ? this.aZoneExcludes
                : zone === 'b'
                ? this.bZoneExcludes
                : this.unifiedExcludes;

        if (targetArray.length === 0) {
            displayElement.innerHTML =
                '<span class="no-excludes">目前無排除的停車位</span>';
        } else {
            const tagsHtml = targetArray
                .map(
                    (num) =>
                        `<span class="exclude-tag">
                    ${num}
                    <button class="remove-exclude" onclick="window.lotterySystem.removeExclude('${zone}', ${num})" title="移除此停車位">×</button>
                </span>`
                )
                .join('');
            displayElement.innerHTML = tagsHtml;
        }

        // 更新車位摘要和抽籤摘要
        this.updateSpotsSummary(zone);
        this.updateLotterySummary();
    }
}

// 當頁面載入完成後初始化系統
document.addEventListener('DOMContentLoaded', () => {
    window.lotterySystem = new ParkingLotterySystem();
    window.lottery = window.lotterySystem; // 建立簡短別名供 HTML onclick 使用
});

// 頁面可見性變化時重新載入歷史記錄（支援多分頁同步）
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.lotterySystem) {
        window.lotterySystem.loadHistory();
    }
});
