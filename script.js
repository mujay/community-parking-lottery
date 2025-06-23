// 停車位抽籤系統 JavaScript 程式碼

class ParkingLotterySystem {
    constructor() {
        this.history =
            JSON.parse(localStorage.getItem('parkingLotteryHistory')) || [];
        this.aZoneRanges = [];
        this.bZoneRanges = [];
        this.unifiedRanges = [];
        this.aZoneExcludes = [191, 192, 193, 194, 195]; // 預設身障車格
        this.bZoneExcludes = [];
        this.unifiedExcludes = [191, 192, 193, 194, 195]; // 預設身障車格
        this.initializeEventListeners();
        this.initializeExcludeDisplays();
        this.loadHistory();
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
                                            <td class="order-number">${pair.lotteryNumber}</td>
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
            .map((record) => {
                const totalResults = record.zoneResults.reduce(
                    (sum, zone) => sum + zone.results.length,
                    0
                );
                const timestamp = record.timestamp.toLocaleString
                    ? record.timestamp.toLocaleString('zh-TW')
                    : new Date(record.timestamp).toLocaleString('zh-TW');
                return `
                <div class="history-item">
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
            this.bZoneExcludes = [];
            this.unifiedExcludes = [191, 192, 193, 194, 195];
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

        countElement.textContent = `總數量：${totalCount}`;
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
            } else if (zone === 'unified') {
                this.unifiedExcludes = [191, 192, 193, 194, 195];
            }
            // B區沒有預設排除
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
    }
}

// 當頁面載入完成後初始化系統
document.addEventListener('DOMContentLoaded', () => {
    window.lotterySystem = new ParkingLotterySystem();
});

// 頁面可見性變化時重新載入歷史記錄（支援多分頁同步）
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.lotterySystem) {
        window.lotterySystem.loadHistory();
    }
});
