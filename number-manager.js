// 數字管理通用模組
class NumberManager {
    constructor() {
        this.numbers = [];
        this.displayElementId = '';
        this.countElementId = '';
        this.numberType = '';
    }

    // 初始化管理器
    init(displayElementId, countElementId, numberType, initialNumbers = []) {
        this.displayElementId = displayElementId;
        this.countElementId = countElementId;
        this.numberType = numberType;
        this.numbers = [...initialNumbers];
        this.updateDisplay();
        return this;
    }

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

    // 加入數字到陣列
    addNumbersToArray(newNumbers) {
        // 檢查重複
        const existingNumbers = new Set(this.numbers);
        const duplicates = newNumbers.filter(num => existingNumbers.has(num));

        if (duplicates.length > 0) {
            alert(`${this.numberType} ${duplicates.join(', ')} 已存在`);
            return false;
        }

        // 加入到陣列
        this.numbers.push(...newNumbers);
        this.numbers.sort((a, b) => a - b);
        this.updateDisplay();
        return true;
    }

    // 新增範圍
    addRange(startNum, endNum) {
        if (!this.validateNumberRange(startNum, endNum)) {
            return false;
        }

        const newNumbers = [];
        for (let i = startNum; i <= endNum; i++) {
            newNumbers.push(i);
        }

        return this.addNumbersToArray(newNumbers);
    }

    // 新增單一數字
    addSingle(num) {
        if (!this.validateSingleNumber(num)) {
            return false;
        }

        return this.addNumbersToArray([num]);
    }

    // 移除特定數字
    removeNumber(number) {
        const index = this.numbers.indexOf(number);
        if (index > -1) {
            this.numbers.splice(index, 1);
            this.updateDisplay();
            return true;
        }
        return false;
    }

    // 清空所有數字
    clear() {
        if (confirm(`確定要清空所有${this.numberType}嗎？`)) {
            this.numbers = [];
            this.updateDisplay();
            return true;
        }
        return false;
    }

    // 重置為預設值
    resetToDefault(defaultNumbers) {
        if (confirm(`確定要重置為預設的${this.numberType}嗎？`)) {
            this.numbers = [...defaultNumbers];
            this.numbers.sort((a, b) => a - b);
            this.updateDisplay();
            return true;
        }
        return false;
    }

    // 更新顯示
    updateDisplay() {
        if (!this.displayElementId || !this.countElementId) return;

        const displayElement = document.getElementById(this.displayElementId);
        const countElement = document.getElementById(this.countElementId);

        if (!displayElement || !countElement) return;

        if (this.numbers.length === 0) {
            displayElement.innerHTML = `<span class="no-numbers">尚未加入任何${this.numberType}</span>`;
        } else {
            const tagsHtml = this.numbers
                .map(number => this.createNumberTag(number))
                .join('');
            displayElement.innerHTML = tagsHtml;
        }

        // 更新統計
        const countText = this.numberType === '排除車位' ? 
            `排除車位總數：${this.numbers.length}` : 
            `${this.numberType}總數：${this.numbers.length}`;
        countElement.textContent = countText;
    }

    // 建立數字標籤
    createNumberTag(number) {
        const isExcluded = this.numberType === '排除車位';
        const tagClass = isExcluded ? 'exclude-tag' : 
                        this.checkIfExcluded && this.checkIfExcluded(number) ? 'number-tag excluded-parking' : 'number-tag';
        
        const removeFunction = isExcluded ? 'removeExcludeNumber' : 
                              this.numberType === '抽籤號碼' ? 'removeLotteryNumber' : 'removeParkingNumber';

        const excludeIndicator = this.checkIfExcluded && this.checkIfExcluded(number) ? 
            '<span class="excluded-indicator">🚫</span>' : '';

        return `<span class="${tagClass}">
            ${number}${excludeIndicator}
            <button class="remove-btn" onclick="lottery.${removeFunction}(${number})" title="移除此${this.numberType}">×</button>
        </span>`;
    }

    // 設定排除檢查函式 (用於車位號碼顯示)
    setExcludeChecker(checkFunction) {
        this.checkIfExcluded = checkFunction;
        return this;
    }

    // 獲取所有數字
    getNumbers() {
        return [...this.numbers];
    }

    // 獲取數字數量
    getCount() {
        return this.numbers.length;
    }

    // 檢查是否包含某個數字
    includes(number) {
        return this.numbers.includes(number);
    }

    // 過濾數字 (用於獲取可用車位等)
    filter(filterFunction) {
        return this.numbers.filter(filterFunction);
    }
}
