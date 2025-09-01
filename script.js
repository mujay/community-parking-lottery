// 停車位抽籤系統 JavaScript 程式碼 - 優化版本

class ParkingLotterySystem {
    constructor() {
        this.history =
            JSON.parse(localStorage.getItem('parkingLotteryHistory')) || [];

        // 初始化數字管理器
        this.lotteryManager = new NumberManager().init(
            'lottery-numbers-display',
            'lottery-count',
            '抽籤號碼'
        );

        this.parkingManager = new NumberManager()
            .init('parking-numbers-display', 'parking-count', '車位號碼')
            .setExcludeChecker((num) => this.excludeManager.includes(num));

        this.excludeManager = new NumberManager().init(
            'exclude-numbers-display',
            'exclude-count',
            '排除車位',
            ParkingConfig.defaultExcludedSpots
        );

        // 主題和語言系統
        this.currentTheme = localStorage.getItem('theme') || 'japanese';
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.translations = Translations;

        this.migrateHistoryData();
        this.initializeThemeAndLanguage();
        this.initializeEventListeners();
        this.initializeTabSwitching();
        this.updateAllDisplays();
        this.loadHistory();
    }

    // 取得翻譯文字
    getText(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    // 初始化主題和語言
    initializeThemeAndLanguage() {
        document.body.className =
            this.currentTheme === 'github' ? 'github-style' : '';
        document.getElementById('style-selector').value = this.currentTheme;
        document.getElementById('language-selector').value =
            this.currentLanguage;

        // 設定翻譯函式給所有 NumberManager
        this.lotteryManager.setTranslationFunction((key) => this.getText(key));
        this.parkingManager.setTranslationFunction((key) => this.getText(key));
        this.excludeManager.setTranslationFunction((key) => this.getText(key));

        // 設定自定義 alert 函式給所有 NumberManager
        const customAlert = (message) => alert(message);
        this.lotteryManager.setAlertFunction(customAlert);
        this.parkingManager.setAlertFunction(customAlert);
        this.excludeManager.setAlertFunction(customAlert);

        this.updateLanguage();

        document
            .getElementById('style-selector')
            .addEventListener('change', (e) =>
                this.switchTheme(e.target.value)
            );
        document
            .getElementById('language-selector')
            .addEventListener('change', (e) =>
                this.switchLanguage(e.target.value)
            );
    }

    // 切換主題
    switchTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        document.body.className = theme === 'github' ? 'github-style' : '';
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

        // 重新設定翻譯函式給所有 NumberManager
        this.lotteryManager.setTranslationFunction((key) => this.getText(key));
        this.parkingManager.setTranslationFunction((key) => this.getText(key));
        this.excludeManager.setTranslationFunction((key) => this.getText(key));

        document.title = this.getText('title');
        document.documentElement.lang =
            this.currentLanguage === 'zh' ? 'zh-TW' : 'en';
    }

    // 初始化事件監聽器
    initializeEventListeners() {
        // 抽籤號碼相關事件
        document
            .getElementById('add-lottery-range')
            .addEventListener('click', () => this.addLotteryRange());
        document
            .getElementById('add-lottery-single')
            .addEventListener('click', () => this.addLotterySingle());
        document
            .getElementById('clear-lottery-numbers')
            .addEventListener('click', () => {
                if (this.lotteryManager.clear()) this.updateLotterySummary();
            });

        // 車位號碼相關事件
        document
            .getElementById('add-parking-range')
            .addEventListener('click', () => this.addParkingRange());
        document
            .getElementById('add-parking-single')
            .addEventListener('click', () => this.addParkingSingle());
        document
            .getElementById('clear-parking-numbers')
            .addEventListener('click', () => {
                if (this.parkingManager.clear()) {
                    this.updateParkingSummary();
                    this.updateLotterySummary();
                }
            });

        // 排除車位相關事件
        document
            .getElementById('add-exclude-range')
            .addEventListener('click', () => this.addExcludeRange());
        document
            .getElementById('add-exclude-single')
            .addEventListener('click', () => this.addExcludeSingle());
        document
            .getElementById('add-exclude-batch')
            .addEventListener('click', () => this.addExcludeBatch());
        document
            .getElementById('reset-exclude-numbers')
            .addEventListener('click', () => this.resetExcludeNumbers());

        // 設定 Enter 鍵支援
        this.setupEnterKeySupport();

        // 抽籤和重置按鈕
        document
            .getElementById('start-lottery')
            .addEventListener('click', () => this.startLottery());
        document
            .getElementById('reset-lottery')
            .addEventListener('click', () => this.resetLottery());
        document
            .getElementById('clear-history')
            .addEventListener('click', () => this.clearHistory());
    }

    // 設定 Enter 鍵支援
    setupEnterKeySupport() {
        const mappings = [
            {
                ids: ['lottery-range-start', 'lottery-range-end'],
                action: () => this.addLotteryRange(),
            },
            {
                ids: ['lottery-single-number'],
                action: () => this.addLotterySingle(),
            },
            {
                ids: ['parking-range-start', 'parking-range-end'],
                action: () => this.addParkingRange(),
            },
            {
                ids: ['parking-single-number'],
                action: () => this.addParkingSingle(),
            },
            {
                ids: ['exclude-range-start', 'exclude-range-end'],
                action: () => this.addExcludeRange(),
            },
            {
                ids: ['exclude-single-number'],
                action: () => this.addExcludeSingle(),
            },
            {
                ids: ['exclude-batch-input'],
                action: () => this.addExcludeBatch(),
            },
        ];

        mappings.forEach((mapping) => {
            mapping.ids.forEach((id) => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') mapping.action();
                    });
                }
            });
        });
    }

    // 初始化分頁切換功能
    initializeTabSwitching() {
        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName, e.target);
            });
        });
    }

    // 分頁切換邏輯
    switchTab(tabName, clickedBtn) {
        const tabGroup = clickedBtn.parentElement;
        const contentContainer = tabGroup.nextElementSibling.parentElement;

        tabGroup
            .querySelectorAll('.tab-btn')
            .forEach((btn) => btn.classList.remove('active'));
        contentContainer
            .querySelectorAll('.tab-content')
            .forEach((content) => content.classList.remove('active'));

        clickedBtn.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
    }

    // 更新所有顯示
    updateAllDisplays() {
        this.lotteryManager.updateDisplay();
        this.parkingManager.updateDisplay();
        this.excludeManager.updateDisplay();
        this.updateParkingSummary();
        this.updateLotterySummary();
    }

    // 獲取可用的停車位
    getAvailableParkingSpots() {
        return this.parkingManager.filter(
            (num) => !this.excludeManager.includes(num)
        );
    }

    // 抽籤號碼管理方法
    addLotteryRange() {
        const startInput = document.getElementById('lottery-range-start');
        const endInput = document.getElementById('lottery-range-end');
        const startNum = parseInt(startInput.value);
        const endNum = parseInt(endInput.value);

        if (this.lotteryManager.addRange(startNum, endNum)) {
            startInput.value = '';
            endInput.value = '';
            startInput.focus();
            this.updateLotterySummary();
        }
    }

    addLotterySingle() {
        const input = document.getElementById('lottery-single-number');
        const num = parseInt(input.value);

        if (this.lotteryManager.addSingle(num)) {
            input.value = '';
            input.focus();
            this.updateLotterySummary();
        }
    }

    removeLotteryNumber(number) {
        if (this.lotteryManager.removeNumber(number)) {
            this.updateLotterySummary();
        }
    }

    // 車位號碼管理方法
    addParkingRange() {
        const startInput = document.getElementById('parking-range-start');
        const endInput = document.getElementById('parking-range-end');
        const startNum = parseInt(startInput.value);
        const endNum = parseInt(endInput.value);

        if (this.parkingManager.addRange(startNum, endNum)) {
            startInput.value = '';
            endInput.value = '';
            startInput.focus();
            this.updateParkingSummary();
            this.updateLotterySummary();
        }
    }

    addParkingSingle() {
        const input = document.getElementById('parking-single-number');
        const num = parseInt(input.value);

        if (this.parkingManager.addSingle(num)) {
            input.value = '';
            input.focus();
            this.updateParkingSummary();
            this.updateLotterySummary();
        }
    }

    removeParkingNumber(number) {
        if (this.parkingManager.removeNumber(number)) {
            this.updateParkingSummary();
            this.updateLotterySummary();
        }
    }

    // 排除車位管理方法
    addExcludeRange() {
        const startInput = document.getElementById('exclude-range-start');
        const endInput = document.getElementById('exclude-range-end');
        const startNum = parseInt(startInput.value);
        const endNum = parseInt(endInput.value);

        if (this.excludeManager.addRange(startNum, endNum)) {
            startInput.value = '';
            endInput.value = '';
            startInput.focus();
            this.updateParkingSummary();
            this.updateLotterySummary();
            this.parkingManager.updateDisplay();
        }
    }

    addExcludeSingle() {
        const input = document.getElementById('exclude-single-number');
        const num = parseInt(input.value);

        if (this.excludeManager.addSingle(num)) {
            input.value = '';
            input.focus();
            this.updateParkingSummary();
            this.updateLotterySummary();
            this.parkingManager.updateDisplay();
        }
    }

    addExcludeBatch() {
        const input = document.getElementById('exclude-batch-input');
        const batchStr = input.value.trim();

        if (this.excludeManager.addBatch(batchStr)) {
            input.value = '';
            input.focus();
            this.updateParkingSummary();
            this.updateLotterySummary();
            this.parkingManager.updateDisplay();
        }
    }

    removeExcludeNumber(number) {
        if (this.excludeManager.removeNumber(number)) {
            this.updateParkingSummary();
            this.updateLotterySummary();
            this.parkingManager.updateDisplay();
        }
    }

    resetExcludeNumbers() {
        if (
            this.excludeManager.resetToDefault(
                ParkingConfig.defaultExcludedSpots
            )
        ) {
            this.updateParkingSummary();
            this.updateLotterySummary();
            this.parkingManager.updateDisplay();
        }
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
        if (lotteryNumbers.length === 0) throw new Error('沒有抽籤號碼');
        if (availableSpots.length === 0) throw new Error('沒有可用的停車位');

        let selectedLotteryNumbers;
        let note = '';

        if (lotteryNumbers.length <= availableSpots.length) {
            selectedLotteryNumbers = lotteryNumbers;
        } else {
            selectedLotteryNumbers = this.shuffleArray([
                ...lotteryNumbers,
            ]).slice(0, availableSpots.length);
            note = `注意：抽籤號碼數量(${lotteryNumbers.length})超過可用車位數量(${availableSpots.length})，已隨機選擇${availableSpots.length}個號碼參與抽籤`;
        }

        const shuffledSpots = this.shuffleArray(availableSpots);
        const results = selectedLotteryNumbers.map((lotteryNumber, i) => ({
            lotteryNumber,
            parkingSpot: shuffledSpots[i],
        }));

        return {
            results,
            note,
            totalLotteryNumbers: lotteryNumbers.length,
            selectedCount: selectedLotteryNumbers.length,
        };
    }

    // 開始抽籤
    startLottery() {
        try {
            const lotteryNumbers = this.lotteryManager.getNumbers();
            const availableSpots = this.getAvailableParkingSpots();

            if (lotteryNumbers.length === 0) {
                alert(this.getText('add-lottery-numbers-first'));
                return;
            }

            if (this.parkingManager.getCount() === 0) {
                alert(this.getText('add-parking-numbers-first'));
                return;
            }

            if (availableSpots.length === 0) {
                alert(this.getText('no-available-spots'));
                return;
            }

            const lotteryResult = this.conductLottery(
                lotteryNumbers,
                availableSpots
            );

            const results = {
                timestamp: new Date(),
                lotteryNumbers: [...lotteryNumbers],
                parkingRange: this.parkingManager.getNumbers().join(','),
                exclude: this.excludeManager.getNumbers().join(',') || '無',
                available: availableSpots.length,
                participants: lotteryResult.totalLotteryNumbers,
                selectedCount: lotteryResult.selectedCount,
                results: lotteryResult.results,
                note: lotteryResult.note,
            };

            this.saveToHistory(results);
            this.displayResults(results);
        } catch (error) {
            alert(this.getText('lottery-error') + ': ' + error.message);
            console.error('抽籤錯誤：', error);
        }
    }

    // 顯示抽籤結果 - 使用模板
    displayResults(results) {
        const container = document.getElementById('results-container');
        const resultsPerPage = 50;
        const totalResults = results.results.length;
        const totalPages = Math.ceil(totalResults / resultsPerPage);

        const resultInfoHtml = Templates.createResultInfo(results, (key) =>
            this.getText(key)
        );
        const pageResults = results.results.slice(0, resultsPerPage);
        const tableHtml = Templates.createResultsTable(
            pageResults,
            1,
            totalResults,
            totalPages,
            resultsPerPage,
            (key) => this.getText(key)
        );

        container.innerHTML = `
            ${resultInfoHtml}
            <div class="zone-results">
                <div class="zone-result" id="current-results-display">${tableHtml}</div>
            </div>
        `;

        this.currentDisplayResults = results.results;
        this.currentResultsPerPage = resultsPerPage;
    }

    // 顯示指定頁面的結果
    showResultPage(page) {
        if (!this.currentDisplayResults || page < 1) return;

        const totalPages = Math.ceil(
            this.currentDisplayResults.length / this.currentResultsPerPage
        );
        if (page > totalPages) return;

        const startIndex = (page - 1) * this.currentResultsPerPage;
        const endIndex = Math.min(
            startIndex + this.currentResultsPerPage,
            this.currentDisplayResults.length
        );
        const pageResults = this.currentDisplayResults.slice(
            startIndex,
            endIndex
        );

        const container = document.getElementById('current-results-display');
        if (container) {
            container.innerHTML = Templates.createResultsTable(
                pageResults,
                page,
                this.currentDisplayResults.length,
                totalPages,
                this.currentResultsPerPage,
                (key) => this.getText(key)
            );
        }
    }

    // 顯示歷史記錄詳細結果
    showHistoryDetails(historyIndex) {
        const record = this.history[historyIndex];
        if (!record) return;

        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = Templates.createHistoryDetails(
            record,
            historyIndex,
            (key) => this.getText(key)
        );
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 複製 CSV 內容到剪貼簿
    async copyCSV(historyIndex) {
        const record = this.history[historyIndex];
        if (!record) {
            alert('找不到對應的抽籤資料');
            return;
        }

        const timestamp = new Date(record.timestamp);
        const localeCode = this.getText('locale-code');
        let csvContent = `${this.getText('lottery-results')}\n${this.getText(
            'lottery-time'
        )},${timestamp.toLocaleString(localeCode)}\n`;
        csvContent += `${this.getText(
            'lottery-numbers'
        )},${record.lotteryNumbers.join(',')}\n`;
        csvContent += `${this.getText('parking-range')},${
            record.parkingRange
        }\n`;
        csvContent += `${this.getText('excluded-parking')},${
            record.exclude || this.getText('none')
        }\n`;
        csvContent += `${this.getText('available-spots')},${
            record.available
        }\n`;
        csvContent += `${this.getText('total-lottery-numbers')},${
            record.participants
        }\n`;
        csvContent += `${this.getText('actual-participants')},${
            record.selectedCount
        }\n`;
        if (record.note)
            csvContent += `${this.getText('note')},${record.note}\n`;
        csvContent += `\n${this.getText('lottery-number')},${this.getText(
            'assigned-parking'
        )}\n`;
        record.results.forEach((pair) => {
            csvContent += `${pair.lotteryNumber},${pair.parkingSpot}\n`;
        });

        try {
            await navigator.clipboard.writeText(csvContent);
            alert(this.getText('csv-copied-message'));
        } catch (err) {
            console.error('複製失敗：', err);
            alert('複製失敗，請手動複製');
        }
    }

    // 複製停車位號碼到剪貼簿
    async copyParkingNumbers(historyIndex) {
        const record = this.history[historyIndex];
        if (!record) {
            alert(this.getText('record-not-found'));
            return;
        }

        const parkingNumbers = record.results
            .map((pair) => pair.parkingSpot)
            .join(',');

        try {
            await navigator.clipboard.writeText(parkingNumbers);
            alert(this.getText('parking-numbers-copied-message'));
        } catch (err) {
            console.error('複製失敗：', err);
            alert(this.getText('copy-failed-message'));
        }
    }

    // 儲存到歷史記錄
    saveToHistory(results) {
        this.history.unshift(results);
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
                const timestamp = record.timestamp.toLocaleString
                    ? record.timestamp.toLocaleString('zh-TW')
                    : new Date(record.timestamp).toLocaleString('zh-TW');

                return `
                <div class="history-item" onclick="lottery.showHistoryDetails(${index})" style="cursor: pointer;">
                    <h4>${timestamp}</h4>
                    <div class="history-summary">
                        共 ${record.results.length} 個停車位 | 
                        抽籤號碼：${record.participants}個 | 
                        可用車位：${record.available}個
                        ${
                            record.selectedCount !== record.participants
                                ? ` | 實際參與：${record.selectedCount}個`
                                : ''
                        }
                    </div>
                    <div class="history-hint">點擊查看詳細結果</div>
                </div>
            `;
            })
            .join('');

        container.innerHTML = historyHtml;
    }

    // 更新車位統計摘要
    updateParkingSummary() {
        const totalElement = document.getElementById('total-parking-spots');
        const excludedElement = document.getElementById(
            'excluded-parking-spots'
        );
        const availableElement = document.getElementById(
            'available-parking-spots'
        );

        if (totalElement)
            totalElement.textContent = this.parkingManager.getCount();
        if (excludedElement)
            excludedElement.textContent = this.excludeManager.getCount();
        if (availableElement)
            availableElement.textContent =
                this.getAvailableParkingSpots().length;
    }

    // 更新抽籤摘要
    updateLotterySummary() {
        const totalLotteryElement = document.getElementById(
            'total-lottery-numbers'
        );
        const totalAvailableSpotsElement = document.getElementById(
            'total-available-spots'
        );
        const summaryNoteElement = document.getElementById('summary-note');

        if (totalLotteryElement) {
            totalLotteryElement.textContent = this.lotteryManager.getCount();
        }

        if (totalAvailableSpotsElement) {
            const availableSpots = this.getAvailableParkingSpots();
            totalAvailableSpotsElement.textContent = availableSpots.length;
        }

        if (summaryNoteElement) {
            const availableSpots = this.getAvailableParkingSpots();
            const lotteryCount = this.lotteryManager.getCount();

            if (
                lotteryCount > availableSpots.length &&
                availableSpots.length > 0
            ) {
                summaryNoteElement.innerHTML = `
                    <div class="summary-note warning">
                        ⚠️ 注意：抽籤號碼數量(${lotteryCount})超過可用車位數量(${availableSpots.length})，
                        將隨機選擇${availableSpots.length}個號碼參與抽籤。
                    </div>
                `;
                summaryNoteElement.style.display = 'block';
            } else {
                summaryNoteElement.style.display = 'none';
            }
        }
    }

    // 重置所有設定
    resetLottery() {
        if (confirm('確定要重置所有抽籤設定嗎？這將清空所有號碼設定。')) {
            document.getElementById('results-container').innerHTML =
                '<div class="no-results">尚未進行抽籤</div>';

            this.lotteryManager.numbers = [];
            this.parkingManager.numbers = [];
            this.excludeManager.numbers = [
                ...ParkingConfig.defaultExcludedSpots,
            ];

            this.updateAllDisplays();
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

    // 處理歷史記錄的向後相容性
    migrateHistoryData() {
        let needsMigration = false;
        this.history.forEach((record) => {
            if (record.zoneResults && !record.lotteryNumbers) {
                // 轉換舊格式到新格式
                const allResults = [];
                if (record.zoneResults.aZone)
                    allResults.push(...record.zoneResults.aZone);
                if (record.zoneResults.bZone)
                    allResults.push(...record.zoneResults.bZone);

                record.results = allResults;
                record.lotteryNumbers = allResults.map((r) => r.lotteryNumber);
                record.parkingRange = allResults
                    .map((r) => r.parkingSpot)
                    .join(',');
                record.participants = record.lotteryNumbers.length;
                record.selectedCount = record.lotteryNumbers.length;
                record.available = allResults.length;
                record.exclude = record.exclude || '無';

                delete record.zoneResults;
                needsMigration = true;
            }
        });

        if (needsMigration) {
            localStorage.setItem(
                'parkingLotteryHistory',
                JSON.stringify(this.history)
            );
        }
    }
}

// 當頁面載入完成後初始化系統
document.addEventListener('DOMContentLoaded', () => {
    window.lotterySystem = new ParkingLotterySystem();
    window.lottery = window.lotterySystem;
});

// 頁面可見性變化時重新載入歷史記錄
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.lotterySystem) {
        window.lotterySystem.loadHistory();
    }
});
