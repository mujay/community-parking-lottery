// 停車位抽籤系統 JavaScript 程式碼

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
        
        this.parkingManager = new NumberManager().init(
            'parking-numbers-display',
            'parking-count',
            '車位號碼'
        ).setExcludeChecker((num) => this.excludeManager.includes(num));
        
        this.excludeManager = new NumberManager().init(
            'exclude-numbers-display',
            'exclude-count',
            '排除車位',
            ParkingConfig.defaultExcludedSpots
        );

        // 處理歷史記錄的向後相容性
        this.migrateHistoryData();

        // 主題和語言系統
        this.currentTheme = localStorage.getItem('theme') || 'japanese';
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.translations = Translations;

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
                element.textContent = this.translations[this.currentLanguage][key];
            }
        });

        // 更新頁面標題和 HTML lang 屬性
        document.title = this.getText('title');
        document.documentElement.lang =
            this.currentLanguage === 'zh' ? 'zh-TW' : 'en';
    }

    // 初始化事件監聽器
    initializeEventListeners() {
        // 抽籤號碼相關事件
        document.getElementById('add-lottery-range')
            .addEventListener('click', () => this.addLotteryRange());
        document.getElementById('add-lottery-single')
            .addEventListener('click', () => this.addLotterySingle());
        document.getElementById('clear-lottery-numbers')
            .addEventListener('click', () => this.lotteryManager.clear() && this.updateLotterySummary());

        // 車位號碼相關事件
        document.getElementById('add-parking-range')
            .addEventListener('click', () => this.addParkingRange());
        document.getElementById('add-parking-single')
            .addEventListener('click', () => this.addParkingSingle());
        document.getElementById('clear-parking-numbers')
            .addEventListener('click', () => this.parkingManager.clear() && this.updateParkingSummary() && this.updateLotterySummary());

        // 排除車位相關事件
        document.getElementById('add-exclude-range')
            .addEventListener('click', () => this.addExcludeRange());
        document.getElementById('add-exclude-single')
            .addEventListener('click', () => this.addExcludeSingle());
        document.getElementById('reset-exclude-numbers')
            .addEventListener('click', () => this.resetExcludeNumbers());

        // 簡化的 Enter 鍵支援
        this.setupEnterKeySupport();

        // 抽籤和重置按鈕
        document.getElementById('start-lottery')
            .addEventListener('click', () => this.startLottery());
        document.getElementById('reset-lottery')
            .addEventListener('click', () => this.resetLottery());

        // 歷史記錄清除
        document.getElementById('clear-history')
            .addEventListener('click', () => this.clearHistory());

        // 主題和語言切換
        document.getElementById('style-selector')
            .addEventListener('change', (e) => this.switchTheme(e.target.value));
        document.getElementById('language-selector')
            .addEventListener('change', (e) => this.switchLanguage(e.target.value));
    }

    // 設定 Enter 鍵支援
    setupEnterKeySupport() {
        const enterMappings = [
            { ids: ['lottery-range-start', 'lottery-range-end'], action: () => this.addLotteryRange() },
            { ids: ['lottery-single-number'], action: () => this.addLotterySingle() },
            { ids: ['parking-range-start', 'parking-range-end'], action: () => this.addParkingRange() },
            { ids: ['parking-single-number'], action: () => this.addParkingSingle() },
            { ids: ['exclude-range-start', 'exclude-range-end'], action: () => this.addExcludeRange() },
            { ids: ['exclude-single-number'], action: () => this.addExcludeSingle() }
        ];

        enterMappings.forEach(mapping => {
            mapping.ids.forEach(id => {
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
        // 為所有分頁按鈕添加事件監聽器
        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName, e.target);
            });
        });
    }

    // 分頁切換邏輯
    switchTab(tabName, clickedBtn) {
        // 找到同組的所有按鈕和內容
        const tabGroup = clickedBtn.parentElement;
        const contentContainer = tabGroup.nextElementSibling.parentElement;

        // 移除所有 active 狀態
        tabGroup
            .querySelectorAll('.tab-btn')
            .forEach((btn) => btn.classList.remove('active'));
        contentContainer
            .querySelectorAll('.tab-content')
            .forEach((content) => content.classList.remove('active'));

        // 添加 active 狀態到點擊的按鈕和對應的內容
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

    // 獲取可用的停車位（從設定的車位號碼中排除指定的車位）
    getAvailableParkingSpots() {
        return this.parkingManager.filter(num => !this.excludeManager.includes(num));
    }

    // 抽籤號碼相關方法 - 使用管理器
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

    // 車位號碼相關方法 - 使用管理器
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

    // 排除車位相關方法 - 使用管理器
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
            this.parkingManager.updateDisplay(); // 重新繪製車位號碼以顯示排除狀態
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
            this.parkingManager.updateDisplay(); // 重新繪製車位號碼以顯示排除狀態
        }
    }

    removeExcludeNumber(number) {
        if (this.excludeManager.removeNumber(number)) {
            this.updateParkingSummary();
            this.updateLotterySummary();
            this.parkingManager.updateDisplay(); // 重新繪製車位號碼以顯示排除狀態
        }
    }

    resetExcludeNumbers() {
        if (this.excludeManager.resetToDefault(ParkingConfig.defaultExcludedSpots)) {
            this.updateParkingSummary();
            this.updateLotterySummary();
            this.parkingManager.updateDisplay(); // 重新繪製車位號碼以顯示排除狀態
        }
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

    // 開始抽籤
    startLottery() {
        try {
            const lotteryNumbers = this.lotteryManager.getNumbers();
            const availableSpots = this.getAvailableParkingSpots();

            // 檢查是否有抽籤號碼
            if (lotteryNumbers.length === 0) {
                alert('請先加入抽籤號碼');
                return;
            }

            // 檢查是否有車位號碼
            if (this.parkingManager.getCount() === 0) {
                alert('請先加入車位號碼');
                return;
            }

            if (availableSpots.length === 0) {
                alert('沒有可用的停車位（所有車位都被排除了）');
                return;
            }

            // 執行抽籤
            const lotteryResult = this.conductLottery(lotteryNumbers, availableSpots);

            // 儲存到歷史記錄
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

            // 顯示結果
            this.displayResults(results);
        } catch (error) {
            alert('抽籤錯誤：' + error.message);
            console.error('抽籤錯誤：', error);
        }
    }

    // 顯示抽籤結果 - 使用模板
    displayResults(results) {
        const container = document.getElementById('results-container');
        const resultsPerPage = 50;
        const totalResults = results.results.length;
        const totalPages = Math.ceil(totalResults / resultsPerPage);

        // 使用模板建立結果資訊
        const resultInfoHtml = Templates.createResultInfo(results);
        
        // 使用模板建立結果表格
        const pageResults = results.results.slice(0, resultsPerPage);
        const tableHtml = Templates.createResultsTable(
            pageResults, 1, totalResults, totalPages, resultsPerPage
        );

        const resultHtml = `
            ${resultInfoHtml}
            <div class="zone-results">
                <div class="zone-result" id="current-results-display">
                    ${tableHtml}
                </div>
            </div>
        `;

        container.innerHTML = resultHtml;

        // 儲存當前結果用於分頁
        this.currentDisplayResults = results.results;
        this.currentResultsPerPage = resultsPerPage;
    }

    // 顯示指定頁面的結果 - 使用模板
    showResultPage(page) {
        if (!this.currentDisplayResults || page < 1) return;

        const totalPages = Math.ceil(this.currentDisplayResults.length / this.currentResultsPerPage);
        if (page > totalPages) return;

        const startIndex = (page - 1) * this.currentResultsPerPage;
        const endIndex = Math.min(startIndex + this.currentResultsPerPage, this.currentDisplayResults.length);
        const pageResults = this.currentDisplayResults.slice(startIndex, endIndex);

        const container = document.getElementById('current-results-display');
        if (!container) return;

        const tableHtml = Templates.createResultsTable(
            pageResults, page, this.currentDisplayResults.length, totalPages, this.currentResultsPerPage
        );

        container.innerHTML = tableHtml;
    }

    // 顯示歷史記錄詳細結果 - 使用模板
    showHistoryDetails(historyIndex) {
        const record = this.history[historyIndex];
        if (!record) return;

        const detailsHtml = Templates.createHistoryDetails(record, historyIndex);
        
        // 更新結果容器顯示
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = detailsHtml;

        // 滾動到結果區域
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

        let selectedLotteryNumbers;
        let note = '';

        if (lotteryNumbers.length <= availableSpots.length) {
            // 抽籤號碼數量 <= 車位數量，所有號碼都中籤
            selectedLotteryNumbers = lotteryNumbers;
        } else {
            // 抽籤號碼數量 > 車位數量，隨機選擇部分號碼中籤
            selectedLotteryNumbers = this.shuffleArray([
                ...lotteryNumbers,
            ]).slice(0, availableSpots.length);
            note = `注意：抽籤號碼數量(${lotteryNumbers.length})超過可用車位數量(${availableSpots.length})，已隨機選擇${availableSpots.length}個號碼參與抽籤`;
        }

        // 洗牌停車位
        const shuffledSpots = this.shuffleArray(availableSpots);

        // 配對抽籤號碼和停車位
        const results = [];
        for (let i = 0; i < selectedLotteryNumbers.length; i++) {
            results.push({
                lotteryNumber: selectedLotteryNumbers[i],
                parkingSpot: shuffledSpots[i],
            });
        }

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
            // 檢查是否有抽籤號碼
            if (this.lotteryNumbers.length === 0) {
                alert('請先加入抽籤號碼');
                return;
            }

            // 檢查是否有車位號碼
            if (this.parkingNumbers.length === 0) {
                alert('請先加入車位號碼');
                return;
            }

            const availableSpots = this.getAvailableParkingSpots();

            if (availableSpots.length === 0) {
                alert('沒有可用的停車位（所有車位號碼都被排除了）');
                return;
            }

            // 執行抽籤
            const lotteryResult = this.conductLottery(
                this.lotteryNumbers,
                availableSpots
            );

            // 儲存到歷史記錄
            const results = {
                timestamp: new Date(),
                lotteryNumbers: [...this.lotteryNumbers],
                parkingRange: this.parkingNumbers.join(','),
                exclude: this.excludeNumbers.join(',') || '無',
                available: availableSpots.length,
                participants: lotteryResult.totalLotteryNumbers,
                selectedCount: lotteryResult.selectedCount,
                results: lotteryResult.results,
                note: lotteryResult.note,
            };

            this.saveToHistory(results);

            // 顯示結果
            this.displayResults(results);
        } catch (error) {
            alert('抽籤錯誤：' + error.message);
            console.error('抽籤錯誤：', error);
        }
    }

    // 顯示抽籤結果
    displayResults(results) {
        const container = document.getElementById('results-container');

        // 檢查結果數量，如果超過50筆，採用分頁顯示
        const resultsPerPage = 50;
        const totalResults = results.results.length;
        const totalPages = Math.ceil(totalResults / resultsPerPage);
        let currentPage = 1;

        const createResultsTable = (pageResults, page) => {
            const startIndex = (page - 1) * resultsPerPage;
            const endIndex = Math.min(
                startIndex + resultsPerPage,
                totalResults
            );

            return `
                <div class="results-table-container">
                    <div class="table-header">
                        <h4>
                            抽籤結果 ${
                                totalPages > 1
                                    ? `(第 ${page} 頁，共 ${totalPages} 頁) `
                                    : ''
                            }
                            (顯示 ${
                                startIndex + 1
                            }-${endIndex} 筆，共 ${totalResults} 筆)
                            <div class="copy-buttons">
                                <button class="copy-csv-btn" onclick="lottery.copyCSV(0)" title="複製完整 CSV 資料">
                                    複製 CSV
                                </button>
                                <button class="copy-numbers-btn" onclick="lottery.copyParkingNumbers(0)" title="複製所有停車位號碼">
                                    複製停車位號碼
                                </button>
                            </div>
                        </h4>
                    </div>
                    <div class="table-wrapper">
                        <table class="lottery-table">
                            <thead>
                                <tr>
                                    <th>序號</th>
                                    <th>抽籤號碼</th>
                                    <th>分配停車位</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pageResults
                                    .map(
                                        (pair, index) => `
                                    <tr>
                                        <td class="serial-number">${
                                            startIndex + index + 1
                                        }</td>
                                        <td class="lottery-number">${
                                            pair.lotteryNumber
                                        }</td>
                                        <td class="parking-number">${
                                            pair.parkingSpot
                                        }</td>
                                    </tr>
                                `
                                    )
                                    .join('')}
                            </tbody>
                        </table>
                    </div>
                    ${
                        totalPages > 1
                            ? `
                        <div class="pagination">
                            <button class="pagination-btn" ${
                                page === 1 ? 'disabled' : ''
                            } 
                                    onclick="lottery.showResultPage(${
                                        page - 1
                                    })" title="上一頁">
                                ‹ 上一頁
                            </button>
                            <div class="pagination-info">
                                <span>第 ${page} 頁，共 ${totalPages} 頁</span>
                                <span class="total-info">總共 ${totalResults} 筆結果</span>
                            </div>
                            <button class="pagination-btn" ${
                                page === totalPages ? 'disabled' : ''
                            } 
                                    onclick="lottery.showResultPage(${
                                        page + 1
                                    })" title="下一頁">
                                下一頁 ›
                            </button>
                        </div>
                    `
                            : ''
                    }
                </div>
            `;
        };

        const resultHtml = `
            <div class="round-result">
                <h3>最新抽籤結果</h3>
                <div class="round-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">抽籤時間：</span>
                            <span class="info-value">${results.timestamp.toLocaleString(
                                'zh-TW'
                            )}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">抽籤號碼：</span>
                            <span class="info-value">${
                                results.lotteryNumbers.length > 20
                                    ? `${results.lotteryNumbers
                                          .slice(0, 20)
                                          .join(', ')} ... (共${
                                          results.lotteryNumbers.length
                                      }個)`
                                    : results.lotteryNumbers.join(', ')
                            }</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">車位範圍：</span>
                            <span class="info-value">${
                                results.parkingRange.length > 50
                                    ? `${results.parkingRange.substring(
                                          0,
                                          50
                                      )}...`
                                    : results.parkingRange
                            }</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">排除停車位：</span>
                            <span class="info-value">${
                                results.exclude.length > 30
                                    ? `${results.exclude.substring(0, 30)}...`
                                    : results.exclude
                            }</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">可用車位：</span>
                            <span class="info-value">${
                                results.available
                            }個</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">參與抽籤：</span>
                            <span class="info-value">${
                                results.selectedCount
                            }個</span>
                        </div>
                    </div>
                    ${
                        results.note
                            ? `<div class="note-section">
                        <strong class="note">${results.note}</strong>
                    </div>`
                            : ''
                    }
                </div>
                <div class="zone-results">
                    <div class="zone-result" id="current-results-display">
                        ${createResultsTable(
                            results.results.slice(0, resultsPerPage),
                            currentPage
                        )}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = resultHtml;

        // 儲存當前結果用於分頁
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
        if (!container) return;

        const createResultsTable = (pageResults, page) => {
            const startIndex = (page - 1) * this.currentResultsPerPage;
            const endIndex = Math.min(
                startIndex + this.currentResultsPerPage,
                this.currentDisplayResults.length
            );
            const totalResults = this.currentDisplayResults.length;
            const totalPages = Math.ceil(
                totalResults / this.currentResultsPerPage
            );

            return `
                <div class="results-table-container">
                    <div class="table-header">
                        <h4>
                            抽籤結果 ${
                                totalPages > 1
                                    ? `(第 ${page} 頁，共 ${totalPages} 頁) `
                                    : ''
                            }
                            (顯示 ${
                                startIndex + 1
                            }-${endIndex} 筆，共 ${totalResults} 筆)
                            <div class="copy-buttons">
                                <button class="copy-csv-btn" onclick="lottery.copyCSV(0)" title="複製完整 CSV 資料">
                                    複製 CSV
                                </button>
                                <button class="copy-numbers-btn" onclick="lottery.copyParkingNumbers(0)" title="複製所有停車位號碼">
                                    複製停車位號碼
                                </button>
                            </div>
                        </h4>
                    </div>
                    <div class="table-wrapper">
                        <table class="lottery-table">
                            <thead>
                                <tr>
                                    <th>序號</th>
                                    <th>抽籤號碼</th>
                                    <th>分配停車位</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pageResults
                                    .map(
                                        (pair, index) => `
                                    <tr>
                                        <td class="serial-number">${
                                            startIndex + index + 1
                                        }</td>
                                        <td class="lottery-number">${
                                            pair.lotteryNumber
                                        }</td>
                                        <td class="parking-number">${
                                            pair.parkingSpot
                                        }</td>
                                    </tr>
                                `
                                    )
                                    .join('')}
                            </tbody>
                        </table>
                    </div>
                    ${
                        totalPages > 1
                            ? `
                        <div class="pagination">
                            <button class="pagination-btn" ${
                                page === 1 ? 'disabled' : ''
                            } 
                                    onclick="lottery.showResultPage(${
                                        page - 1
                                    })" title="上一頁">
                                ‹ 上一頁
                            </button>
                            <div class="pagination-info">
                                <span>第 ${page} 頁，共 ${totalPages} 頁</span>
                                <span class="total-info">總共 ${totalResults} 筆結果</span>
                            </div>
                            <button class="pagination-btn" ${
                                page === totalPages ? 'disabled' : ''
                            } 
                                    onclick="lottery.showResultPage(${
                                        page + 1
                                    })" title="下一頁">
                                下一頁 ›
                            </button>
                        </div>
                    `
                            : ''
                    }
                </div>
            `;
        };

        container.innerHTML = createResultsTable(pageResults, page);
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
                    <div><strong>抽籤號碼：</strong>${record.lotteryNumbers.join(
                        ', '
                    )}</div>
                    <div><strong>車位範圍：</strong>${record.parkingRange}</div>
                    <div><strong>排除停車位：</strong>${
                        record.exclude || '無'
                    }</div>
                    <div><strong>可用車位：</strong>${record.available}個</div>
                    <div><strong>抽籤號碼總數：</strong>${
                        record.participants
                    }個</div>
                    <div><strong>實際參與抽籤：</strong>${
                        record.selectedCount
                    }個</div>
                    ${
                        record.note
                            ? `<div><strong class="note">${record.note}</strong></div>`
                            : ''
                    }
                </div>
                <div class="zone-results">
                    <div class="zone-result">
                        <h4>
                            抽籤結果 (${record.results.length} 個停車位)
                            <div class="copy-buttons">
                                <button class="copy-csv-btn" onclick="lottery.copyCSV(${historyIndex})">複製 CSV</button>
                                <button class="copy-numbers-btn" onclick="lottery.copyParkingNumbers(${historyIndex})">複製停車位號碼</button>
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
                                ${record.results
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
    async copyCSV(historyIndex) {
        const record = this.history[historyIndex];
        if (!record) {
            alert('找不到對應的抽籤資料');
            return;
        }

        const timestamp = new Date(record.timestamp);

        // 建立 CSV 內容
        let csvContent = `抽籤結果\n`;
        csvContent += `抽籤時間,${timestamp.toLocaleString('zh-TW')}\n`;
        csvContent += `抽籤號碼,${record.lotteryNumbers.join(',')}\n`;
        csvContent += `車位範圍,${record.parkingRange}\n`;
        csvContent += `排除停車位,${record.exclude || '無'}\n`;
        csvContent += `可用位數,${record.available}\n`;
        csvContent += `抽籤號碼總數,${record.participants}\n`;
        csvContent += `實際參與抽籤,${record.selectedCount}\n`;
        if (record.note) {
            csvContent += `備註,${record.note}\n`;
        }
        csvContent += '\n';
        csvContent += '抽籤號碼,分配停車位\n';

        // 新增每筆抽籤結果
        record.results.forEach((pair) => {
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
    async copyParkingNumbers(historyIndex) {
        const record = this.history[historyIndex];
        if (!record) {
            alert('找不到對應的抽籤資料');
            return;
        }

        // 建立停車位號碼字串，用逗號分隔
        const parkingNumbers = record.results
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

    // 重置抽籤
    resetLottery() {
        if (confirm('確定要重置當前抽籤設定嗎？')) {
            document.getElementById('results-container').innerHTML =
                '<div class="no-results">尚未進行抽籤</div>';

            // 清空抽籤號碼和車位範圍
            this.lotteryNumbers = [];
            this.parkingRanges = [];
            this.updateLotteryNumbersDisplay();
            this.updateParkingRangesDisplay();

            // 重置排除停車位為預設值
            this.excludes = [
                191,
                192,
                193,
                194,
                195, // 身障車格
                313,
                314,
                315,
                316,
                317,
                318,
                319,
                320,
                321,
                322, // 充電機車位
            ];
            this.updateExcludeDisplay();
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
    addRange() {
        const startInput = document.getElementById('lottery-start');
        const endInput = document.getElementById('lottery-end');

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
        if (startNum === endNum) {
            rangeStr = `${startNum}`; // 單個號碼
        } else {
            rangeStr = `${startNum}-${endNum}`; // 範圍
        }

        // 檢查是否重複
        if (this.lotteryRanges.includes(rangeStr)) {
            alert('此範圍已存在');
            return;
        }

        // 檢查是否與現有範圍重疊
        const newRangeNumbers = this.parseNumberRange(rangeStr);
        const existingNumbers = new Set();

        // 獲取所有現有號碼
        this.lotteryRanges.forEach((range) => {
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

        // 加入到範圍陣列
        this.lotteryRanges.push(rangeStr);

        // 更新顯示
        this.updateRangeDisplay();
        this.updateRangeCount();

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
    addExclude() {
        const input = document.getElementById('exclude-input');
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

        // 加入新的排除號碼（避免重複）
        newExcludes.forEach((num) => {
            if (!this.excludes.includes(num)) {
                this.excludes.push(num);
            }
        });

        // 排序
        this.excludes.sort((a, b) => a - b);

        // 更新顯示
        this.updateExcludeDisplay();

        // 清空輸入框
        input.value = '';
        input.focus();
    }

    // 移除特定排除停車位
    removeExclude(parkingNumber) {
        const index = this.excludes.indexOf(parkingNumber);
        if (index > -1) {
            this.excludes.splice(index, 1);
            this.updateExcludeDisplay();
        }
    }

    // 清空排除停車位
    clearExclude() {
        if (confirm('確定要清空所有排除的停車位嗎？')) {
            this.excludes = [];
            this.updateExcludeDisplay();
        }
    }

    // 重置為預設排除停車位
    resetExclude() {
        if (confirm('確定要重置為預設設定嗎？')) {
            this.excludes = [
                191,
                192,
                193,
                194,
                195, // 身障車格
                313,
                314,
                315,
                316,
                317,
                318,
                319,
                320,
                321,
                322, // 充電機車位
            ];
            this.updateExcludeDisplay();
        }
    }

    // 更新排除停車位顯示
    updateExcludeDisplay() {
        const displayElement = document.getElementById('exclude-display');

        if (this.excludes.length === 0) {
            displayElement.innerHTML =
                '<span class="no-excludes">目前無排除的停車位</span>';
        } else {
            const tagsHtml = this.excludes
                .map(
                    (num) =>
                        `<span class="exclude-tag">
                    ${num}
                    <button class="remove-exclude" onclick="window.lotterySystem.removeExclude(${num})" title="移除此停車位">×</button>
                </span>`
                )
                .join('');
            displayElement.innerHTML = tagsHtml;
        }

        // 更新車位摘要和抽籤摘要
        this.updateSpotsSummary();
        this.updateLotterySummary();
    }

    // === 抽籤號碼管理 ===

    // 新增抽籤號碼範圍
    addLotteryRange() {
        const startInput = document.getElementById('lottery-range-start');
        const endInput = document.getElementById('lottery-range-end');

        const startNum = parseInt(startInput.value);
        const endNum = parseInt(endInput.value);

        if (!this.validateNumberRange(startNum, endNum)) {
            return;
        }

        // 產生號碼陣列
        const newNumbers = [];
        for (let i = startNum; i <= endNum; i++) {
            newNumbers.push(i);
        }

        if (
            !this.addNumbersToArray(this.lotteryNumbers, newNumbers, '抽籤號碼')
        ) {
            return;
        }

        // 更新顯示
        this.updateLotteryNumbersDisplay();
        this.updateLotterySummary();

        // 清空輸入框
        startInput.value = '';
        endInput.value = '';
        startInput.focus();
    }

    // 新增單一抽籤號碼
    addLotterySingle() {
        const input = document.getElementById('lottery-single-number');
        const num = parseInt(input.value);

        if (!this.validateSingleNumber(num)) {
            return;
        }

        if (!this.addNumbersToArray(this.lotteryNumbers, [num], '抽籤號碼')) {
            return;
        }

        // 更新顯示
        this.updateLotteryNumbersDisplay();
        this.updateLotterySummary();

        // 清空輸入框
        input.value = '';
        input.focus();
    }

    // 清空所有抽籤號碼
    clearLotteryNumbers() {
        if (confirm('確定要清空所有抽籤號碼嗎？')) {
            this.lotteryNumbers = [];
            this.updateLotteryNumbersDisplay();
            this.updateLotterySummary();
        }
    }

    // 移除特定抽籤號碼
    removeLotteryNumber(number) {
        const index = this.lotteryNumbers.indexOf(number);
        if (index > -1) {
            this.lotteryNumbers.splice(index, 1);
            this.updateLotteryNumbersDisplay();
            this.updateLotterySummary();
        }
    }

    // 更新抽籤號碼顯示
    updateLotteryNumbersDisplay() {
        const displayElement = document.getElementById(
            'lottery-numbers-display'
        );
        const countElement = document.getElementById('lottery-count');

        if (this.lotteryNumbers.length === 0) {
            displayElement.innerHTML =
                '<span class="no-numbers">尚未加入任何號碼</span>';
        } else {
            const tagsHtml = this.lotteryNumbers
                .map(
                    (number) => `<span class="number-tag">
                    ${number}
                    <button class="remove-btn" onclick="lottery.removeLotteryNumber(${number})" title="移除此號碼">×</button>
                </span>`
                )
                .join('');
            displayElement.innerHTML = tagsHtml;
        }

        // 更新統計
        countElement.textContent = `抽籤號碼總數：${this.lotteryNumbers.length}`;
    }

    // === 車位號碼管理 ===

    // 新增車位號碼範圍
    addParkingRange() {
        const startInput = document.getElementById('parking-range-start');
        const endInput = document.getElementById('parking-range-end');

        const startNum = parseInt(startInput.value);
        const endNum = parseInt(endInput.value);

        if (!this.validateNumberRange(startNum, endNum)) {
            return;
        }

        // 產生號碼陣列
        const newNumbers = [];
        for (let i = startNum; i <= endNum; i++) {
            newNumbers.push(i);
        }

        if (
            !this.addNumbersToArray(this.parkingNumbers, newNumbers, '車位號碼')
        ) {
            return;
        }

        // 更新顯示
        this.updateParkingNumbersDisplay();
        this.updateParkingSummary();
        this.updateLotterySummary();

        // 清空輸入框
        startInput.value = '';
        endInput.value = '';
        startInput.focus();
    }

    // 新增單一車位號碼
    addParkingSingle() {
        const input = document.getElementById('parking-single-number');
        const num = parseInt(input.value);

        if (!this.validateSingleNumber(num)) {
            return;
        }

        if (!this.addNumbersToArray(this.parkingNumbers, [num], '車位號碼')) {
            return;
        }

        // 更新顯示
        this.updateParkingNumbersDisplay();
        this.updateParkingSummary();
        this.updateLotterySummary();

        // 清空輸入框
        input.value = '';
        input.focus();
    }

    // 清空所有車位號碼
    clearParkingNumbers() {
        if (confirm('確定要清空所有車位號碼嗎？')) {
            this.parkingNumbers = [];
            this.updateParkingNumbersDisplay();
            this.updateParkingSummary();
            this.updateLotterySummary();
        }
    }

    // 移除特定車位號碼
    removeParkingNumber(number) {
        const index = this.parkingNumbers.indexOf(number);
        if (index > -1) {
            this.parkingNumbers.splice(index, 1);
            this.updateParkingNumbersDisplay();
            this.updateParkingSummary();
            this.updateLotterySummary();
        }
    }

    // 更新車位號碼顯示
    updateParkingNumbersDisplay() {
        const displayElement = document.getElementById(
            'parking-numbers-display'
        );
        const countElement = document.getElementById('parking-count');

        if (this.parkingNumbers.length === 0) {
            displayElement.innerHTML =
                '<span class="no-numbers">尚未加入任何號碼</span>';
        } else {
            const tagsHtml = this.parkingNumbers
                .map((number) => {
                    const isExcluded = this.excludeNumbers.includes(number);
                    const tagClass = isExcluded
                        ? 'number-tag excluded-parking'
                        : 'number-tag';
                    const title = isExcluded
                        ? '此車位已被排除，無法參與抽籤'
                        : '點擊移除此號碼';

                    return `<span class="${tagClass}" ${
                        isExcluded ? 'data-excluded="true"' : ''
                    }>
                    ${number}
                    ${
                        isExcluded
                            ? '<span class="excluded-indicator" title="已排除">🚫</span>'
                            : ''
                    }
                    <button class="remove-btn" onclick="lottery.removeParkingNumber(${number})" title="${title}">×</button>
                </span>`;
                })
                .join('');
            displayElement.innerHTML = tagsHtml;
        }

        // 更新統計
        countElement.textContent = `車位號碼總數：${this.parkingNumbers.length}`;
    }

    // === 排除車位號碼管理 ===

    // 新增排除車位號碼範圍
    addExcludeRange() {
        const startInput = document.getElementById('exclude-range-start');
        const endInput = document.getElementById('exclude-range-end');

        const startNum = parseInt(startInput.value);
        const endNum = parseInt(endInput.value);

        if (!this.validateNumberRange(startNum, endNum)) {
            return;
        }

        // 產生號碼陣列
        const newNumbers = [];
        for (let i = startNum; i <= endNum; i++) {
            newNumbers.push(i);
        }

        if (
            !this.addNumbersToArray(this.excludeNumbers, newNumbers, '排除車位')
        ) {
            return;
        }

        // 更新顯示
        this.updateExcludeNumbersDisplay();
        this.updateParkingSummary();
        this.updateLotterySummary();

        // 清空輸入框
        startInput.value = '';
        endInput.value = '';
        startInput.focus();
    }

    // 新增單一排除車位號碼
    addExcludeSingle() {
        const input = document.getElementById('exclude-single-number');
        const num = parseInt(input.value);

        if (!this.validateSingleNumber(num)) {
            return;
        }

        if (!this.addNumbersToArray(this.excludeNumbers, [num], '排除車位')) {
            return;
        }

        // 更新顯示
        this.updateExcludeNumbersDisplay();
        this.updateParkingSummary();
        this.updateLotterySummary();

        // 清空輸入框
        input.value = '';
        input.focus();
    }

    // 重置排除車位為預設值
    resetExcludeNumbers() {
        if (confirm('確定要重置為預設的排除車位嗎？')) {
            this.excludeNumbers = ParkingConfig.defaultExcludedSpots.slice();
            this.updateExcludeNumbersDisplay();
            this.updateParkingSummary();
            this.updateLotterySummary();
        }
    }

    // 移除特定排除車位號碼
    removeExcludeNumber(number) {
        const index = this.excludeNumbers.indexOf(number);
        if (index > -1) {
            this.excludeNumbers.splice(index, 1);
            this.updateExcludeNumbersDisplay();
            this.updateParkingSummary();
            this.updateLotterySummary();
        }
    }

    // 更新排除車位號碼顯示
    updateExcludeNumbersDisplay() {
        const displayElement = document.getElementById(
            'exclude-numbers-display'
        );
        const countElement = document.getElementById('exclude-count');

        if (this.excludeNumbers.length === 0) {
            displayElement.innerHTML =
                '<span class="no-numbers">目前無排除車位</span>';
        } else {
            const tagsHtml = this.excludeNumbers
                .map(
                    (number) => `<span class="exclude-tag">
                    ${number}
                    <button class="remove-btn" onclick="lottery.removeExcludeNumber(${number})" title="移除此排除">×</button>
                </span>`
                )
                .join('');
            displayElement.innerHTML = tagsHtml;
        }

        // 更新統計
        countElement.textContent = `排除車位總數：${this.excludeNumbers.length}`;
    }

    // === 輔助方法 ===

    // 驗證數字範圍
    validateNumberRange(startNum, endNum) {
        if (isNaN(startNum) || isNaN(endNum)) {
            alert('請輸入有效的數字');
            return false;
        }

        if (startNum < 1 || endNum < 1 || startNum > 999 || endNum > 999) {
            alert('請輸入1-999之間的數字');
            return false;
        }

        if (startNum > endNum) {
            alert('起始數字不能大於結束數字');
            return false;
        }

        return true;
    }

    // 驗證單一數字
    validateSingleNumber(num) {
        if (isNaN(num)) {
            alert('請輸入有效的數字');
            return false;
        }

        if (num < 1 || num > 999) {
            alert('請輸入1-999之間的數字');
            return false;
        }

        return true;
    }

    // 加入號碼到陣列（通用方法）
    addNumbersToArray(targetArray, newNumbers, type) {
        // 檢查重複
        const existingNumbers = new Set(targetArray);
        const duplicates = newNumbers.filter((num) => existingNumbers.has(num));

        if (duplicates.length > 0) {
            alert(`${type} ${duplicates.join(', ')} 已存在`);
            return false;
        }

        // 加入到陣列
        targetArray.push(...newNumbers);

        // 排序
        targetArray.sort((a, b) => a - b);

        return true;
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

        const totalSpots = this.parkingNumbers.length;
        const excludedSpots = this.excludeNumbers.length;
        const availableSpots = Math.max(
            0,
            totalSpots -
                this.excludeNumbers.filter((num) =>
                    this.parkingNumbers.includes(num)
                ).length
        );

        totalElement.textContent = totalSpots;
        excludedElement.textContent = excludedSpots;
        availableElement.textContent = availableSpots;
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
            totalLotteryElement.textContent = this.lotteryNumbers.length;
        }

        if (totalAvailableSpotsElement) {
            // 計算實際可用車位（車位號碼中未被排除的）
            const availableSpots = this.parkingNumbers.filter(
                (num) => !this.excludeNumbers.includes(num)
            );
            totalAvailableSpotsElement.textContent = availableSpots.length;
        }

        // 顯示/隱藏注意事項
        if (summaryNoteElement) {
            const availableSpots = this.parkingNumbers.filter(
                (num) => !this.excludeNumbers.includes(num)
            );
            if (
                this.lotteryNumbers.length > availableSpots.length &&
                availableSpots.length > 0
            ) {
                summaryNoteElement.style.display = 'block';
            } else {
                summaryNoteElement.style.display = 'none';
            }
        }
    }

    // 重置所有設定
    resetLottery() {
        if (confirm('確定要重置所有抽籤設定嗎？這將清空所有號碼設定。')) {
            // 清空結果顯示
            document.getElementById('results-container').innerHTML =
                '<div class="no-results">尚未進行抽籤</div>';

            // 重置所有陣列
            this.lotteryNumbers = [];
            this.parkingNumbers = [];

            // 重置排除號碼為預設值
            this.excludeNumbers = ParkingConfig.defaultExcludedSpots.slice();

            // 更新所有顯示
            this.updateAllDisplays();
        }
    }

    // 處理歷史記錄的向後相容性
    migrateHistoryData() {
        let needsMigration = false;
        this.history.forEach((record, index) => {
            // 如果記錄有舊的格式（有zoneResults而不是新的格式）
            if (record.zoneResults && !record.lotteryNumbers) {
                needsMigration = true;
                // 將舊格式轉換為新格式
                let allLotteryNumbers = [];
                let allParkingRanges = [];
                let allResults = [];

                record.zoneResults.forEach((zoneResult) => {
                    // 解析抽籤號碼
                    const lotteryNums = this.parseNumberRange(
                        zoneResult.range || ''
                    );
                    allLotteryNumbers.push(...lotteryNums);

                    // 處理車位範圍（舊系統中車位是固定的）
                    if (zoneResult.zone === 'A') {
                        allParkingRanges.push('1-210');
                    } else if (zoneResult.zone === 'B') {
                        allParkingRanges.push('211-322');
                    } else if (zoneResult.zone === '整體') {
                        allParkingRanges.push('1-322');
                    }

                    // 合併結果
                    allResults.push(...zoneResult.results);
                });

                // 更新記錄為新格式
                this.history[index] = {
                    timestamp: record.timestamp,
                    lotteryNumbers: [...new Set(allLotteryNumbers)].sort(
                        (a, b) => a - b
                    ), // 去重並排序
                    parkingRange: [...new Set(allParkingRanges)].join(','), // 去重
                    exclude: record.zoneResults[0]?.exclude || '無',
                    available: record.zoneResults.reduce(
                        (sum, zone) => sum + zone.available,
                        0
                    ),
                    participants: allLotteryNumbers.length,
                    selectedCount: allResults.length,
                    results: allResults,
                    note:
                        record.zoneResults.length > 1
                            ? '此記錄為舊系統分區抽籤的合併結果'
                            : '',
                };
            }
        });

        if (needsMigration) {
            localStorage.setItem(
                'parkingLotteryHistory',
                JSON.stringify(this.history)
            );
        }
    }
    // 更新車位統計摘要
    updateParkingSummary() {
        const totalElement = document.getElementById('total-parking-spots');
        const excludedElement = document.getElementById('excluded-parking-spots');
        const availableElement = document.getElementById('available-parking-spots');

        if (totalElement) totalElement.textContent = this.parkingManager.getCount();
        if (excludedElement) excludedElement.textContent = this.excludeManager.getCount();
        if (availableElement) availableElement.textContent = this.getAvailableParkingSpots().length;
    }

    // 更新抽籤摘要
    updateLotterySummary() {
        const totalLotteryElement = document.getElementById('total-lottery-numbers');
        const totalAvailableSpotsElement = document.getElementById('total-available-spots');
        const summaryNoteElement = document.getElementById('summary-note');

        if (totalLotteryElement) {
            totalLotteryElement.textContent = this.lotteryManager.getCount();
        }

        if (totalAvailableSpotsElement) {
            const availableSpots = this.getAvailableParkingSpots();
            totalAvailableSpotsElement.textContent = availableSpots.length;
        }

        // 顯示/隱藏注意事項
        if (summaryNoteElement) {
            const availableSpots = this.getAvailableParkingSpots();
            const lotteryCount = this.lotteryManager.getCount();
            
            if (lotteryCount > availableSpots.length && availableSpots.length > 0) {
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
