// 多語言翻譯模組
const Translations = {
    zh: {
        title: '🚗 停車位抽籤系統',
        'lottery-settings': '抽籤設定',
        'start-lottery': '開始抽籤',
        'reset-lottery': '重置',
        'clear-history': '清除記錄',
        'lottery-numbers': '🎫 抽籤號碼設定',
        'parking-numbers': '🚗 車位號碼設定',
        'added-lottery-numbers': '已加入的抽籤號碼：',
        'added-parking-numbers': '已加入的車位號碼：',
        'add-range': '新增抽籤號碼範圍：',
        'add-parking-range': '新增車位範圍：',
        to: '至',
        add: '加入',
        clear: '清空所有抽籤號碼',
        reset: '重置',
        'no-numbers': '尚未加入任何號碼',
        'lottery-count': '抽籤號碼總數：',
        'parking-count': '車位號碼總數：',
        '抽籤號碼-count': '抽籤號碼總數：',
        '車位號碼-count': '車位號碼總數：',
        'total-spots': '總車位數：',
        'excluded-spots': '排除車位：',
        'available-spots': '可用車位：',
        'exclude-label': '已排除的車位號碼：',
        'exclude-count': '排除車位總數：',
        'exclude-input-placeholder': '191-195,313-322',
        'add-exclude': '加入',
        'reset-exclude': '重置為預設排除',
        'lottery-summary': '📊 本次抽籤摘要',
        'total-lottery-numbers': '抽籤號碼總數：',
        'total-available-spots': '可用車位總數：',
        'lottery-results': '抽籤結果',
        'lottery-history': '歷史記錄',
        'no-results': '尚未進行抽籤',
        'no-history': '暫無歷史記錄',

        // 按鈕文字
        'batch-add': '批次新增',
        'single-add': '單一新增',
        'single-exclude': '單一排除',
        'add-range-btn': '加入範圍',
        'add-number': '加入號碼',
        'batch-exclude': '批次排除',
        'exclude-number': '排除號碼',

        // 表單標籤
        'add-lottery-range-label': '新增抽籤號碼範圍：',
        'add-single-lottery-label': '新增單一抽籤號碼：',
        'add-parking-range-label': '新增車位號碼範圍：',
        'add-single-parking-label': '新增單一車位號碼：',
        'exclude-parking-range-label': '排除車位號碼範圍：',

        // 頁面固定文字
        'style-label': '🎨 風格：',
        'style-japanese': '日系風格',
        'style-github': 'GitHub 風格',
        'language-label': '🌍 語言：',
        chinese: '中文',
        help: '❓ 使用說明',

        // 統計標籤
        'total-parking': '總車位：',
        'excluded-parking': '排除：',
        'available-parking': '可用：',

        // 提示文字
        'batch-hint': '支援格式：單號碼 (9,8,5) 或範圍 (1-5,8-10)',
        'batch-exclude-label': '批次排除車位號碼（逗號分隔）：',
        'exclude-single-label': '排除單一車位號碼：',

        // 結果表格
        'results-title': '抽籤結果',
        page: '第',
        'page-of': '頁，共',
        pages: '頁',
        showing: '顯示',
        'items-of': '筆，共',
        items: '筆',
        'copy-csv': '複製 CSV',
        'copy-csv-tooltip': '複製完整 CSV 資料',
        'copy-parking-numbers': '複製停車位號碼',
        'copy-numbers-tooltip': '複製所有停車位號碼',
        'serial-number': '序號',
        'lottery-number': '抽籤號碼',
        'assigned-parking': '分配停車位',
        'previous-page': '上一頁',
        'next-page': '下一頁',
        total: '總共',
        results: '筆結果',

        // 使用說明
        'help-title': '使用說明',
        'help-close': '關閉',
        'help-intro': '本工具用於將抽籤號碼隨機配對可用停車位。',
        'help-step-1': '加入抽籤號碼（單號或範圍）。',
        'help-step-2': '加入車位號碼（可多段範圍）。',
        'help-step-3': '視需要設定排除車位（單號、範圍或批次）。',
        'help-step-4': '點擊「開始抽籤」，查看結果與摘要。',
        'help-step-5': '可分頁瀏覽、複製 CSV 或停車位清單；歷史自動保存。',
        'help-note': '提示：當抽籤號碼多於可用車位時，系統會隨機選擇等量號碼參與抽籤。',

        // 結果資訊
        'latest-results': '最新抽籤結果',
        'lottery-time': '抽籤時間',
        'locale-code': 'zh-TW',
        numbers: '個',
        'parking-range': '車位範圍',
        spots: '個',
        participants: '參與抽籤',

        // 歷史記錄
        'history-details': '歷史記錄詳細結果',
        time: '時間',
        none: '無',
        'actual-participants': '實際參與抽籤',
        'parking-spots': '個停車位',
        'parking-spot': '停車位',

        // CSV 相關
        note: '備註',
        'csv-copied-message': 'CSV 內容已複製到剪貼簿！',
        'record-not-found': '找不到對應的抽籤資料',
        'parking-numbers-copied-message':
            '停車位號碼已複製到剪貼簿！\n可直接貼到「排除停車位」欄位',
        'copy-failed-message': '複製失敗，請手動複製',

        // Alert 訊息
        'add-lottery-numbers-first': '請先加入抽籤號碼',
        'add-parking-numbers-first': '請先加入車位號碼',
        'no-available-spots': '沒有可用的停車位（所有車位都被排除了）',
        'lottery-error': '抽籤錯誤',
        'enter-valid-number': '請輸入有效的數字',
        'enter-number-between-1-999': '請輸入1-999之間的數字',
        'start-number-cannot-be-greater-than-end': '起始數字不能大於結束數字',
        'enter-numbers': '請輸入數字',
    },
    en: {
        title: '🚗 Parking Lottery System',
        'lottery-settings': 'Lottery Settings',
        'start-lottery': 'Start Lottery',
        'reset-lottery': 'Reset',
        'clear-history': 'Clear History',
        'lottery-numbers': '🎫 Lottery Numbers Setup',
        'parking-numbers': '🚗 Parking Numbers Setup',
        'added-lottery-numbers': 'Added Lottery Numbers:',
        'added-parking-numbers': 'Added Parking Numbers:',
        'add-range': 'Add Lottery Number Range:',
        'add-parking-range': 'Add Parking Range:',
        to: 'to',
        add: 'Add',
        clear: 'Clear All Lottery Numbers',
        reset: 'Reset',
        'no-numbers': 'No numbers added yet',
        'lottery-count': 'Total Lottery Numbers: ',
        'parking-count': 'Total Parking Numbers: ',
        '抽籤號碼-count': 'Total Lottery Numbers: ',
        '車位號碼-count': 'Total Parking Numbers: ',
        'total-spots': 'Total Spots: ',
        'excluded-spots': 'Excluded: ',
        'available-spots': 'Available: ',
        'exclude-label': 'Excluded Parking Numbers:',
        'exclude-count': 'Total Excluded Numbers:',
        'exclude-input-placeholder': '191-195,313-322',
        'add-exclude': 'Add',
        'reset-exclude': 'Reset to Default Exclusions',
        'lottery-summary': '📊 Lottery Summary',
        'total-lottery-numbers': 'Total Lottery Numbers:',
        'total-available-spots': 'Total Available Spots:',
        'lottery-results': 'Lottery Results',
        'lottery-history': 'Lottery History',
        'no-results': 'No lottery conducted yet',
        'no-history': 'No history records',

        // 按鈕文字
        'batch-add': 'Batch Add',
        'single-add': 'Single Add',
        'single-exclude': 'Single Exclude',
        'add-range-btn': 'Add Range',
        'add-number': 'Add Number',
        'batch-exclude': 'Batch Exclude',
        'exclude-number': 'Exclude Number',

        // 表單標籤
        'add-lottery-range-label': 'Add Lottery Number Range:',
        'add-single-lottery-label': 'Add Single Lottery Number:',
        'add-parking-range-label': 'Add Parking Number Range:',
        'add-single-parking-label': 'Add Single Parking Number:',
        'exclude-parking-range-label': 'Exclude Parking Number Range:',

        // 頁面固定文字
        'style-label': '🎨 Style:',
        'style-japanese': 'Japanese Style',
        'style-github': 'GitHub Style',
        'language-label': '🌍 Language:',
        chinese: '中文',
        help: '❓ Help',

        // 統計標籤
        'total-parking': 'Total:',
        'excluded-parking': 'Excluded:',
        'available-parking': 'Available:',

        // 提示文字
        'batch-hint':
            'Supported formats: Single numbers (9,8,5) or ranges (1-5,8-10)',
        'batch-exclude-label':
            'Batch Exclude Parking Numbers (comma-separated):',
        'exclude-single-label': 'Exclude Single Parking Number:',

        // 結果表格
        'results-title': 'Lottery Results',
        page: 'Page',
        'page-of': ' of',
        pages: '',
        showing: 'Showing',
        'items-of': ' of',
        items: ' items',
        'copy-csv': 'Copy CSV',
        'copy-csv-tooltip': 'Copy complete CSV data',
        'copy-parking-numbers': 'Copy Parking Numbers',
        'copy-numbers-tooltip': 'Copy all parking numbers',
        'serial-number': 'Serial',
        'lottery-number': 'Lottery Number',
        'assigned-parking': 'Assigned Parking',
        'previous-page': 'Previous',
        'next-page': 'Next',
        total: 'Total ',
        results: ' results',

        // 使用說明
        'help-title': 'How to Use',
        'help-close': 'Close',
        'help-intro':
            'Pair lottery numbers with available parking spots at random.',
        'help-step-1': 'Add lottery numbers (single or range).',
        'help-step-2': 'Add parking numbers (multiple ranges allowed).',
        'help-step-3': 'Optionally set exclusions (single, range, or batch).',
        'help-step-4': 'Click “Start Lottery” to see results and summary.',
        'help-step-5':
            'Browse by pages, copy CSV or parking numbers; history is saved.',
        'help-note':
            'Note: If entries exceed available spots, only a random subset participates.',

        // 結果資訊
        'latest-results': 'Latest Lottery Results',
        'lottery-time': 'Lottery Time',
        'locale-code': 'en',
        numbers: ' numbers',
        'parking-range': 'Parking Range',
        spots: ' spots',
        participants: 'Participants',

        // 歷史記錄
        'history-details': 'History Details',
        time: 'Time',
        none: 'None',
        'actual-participants': 'Actual Participants',
        'parking-spots': ' parking spots',
        'parking-spot': 'Parking Spot',

        // CSV 相關
        note: 'Note',
        'csv-copied-message': 'CSV content copied to clipboard!',
        'record-not-found': 'Record not found',
        'parking-numbers-copied-message':
            'Parking numbers copied to clipboard!\nYou can paste directly to the "Exclude Parking" field',
        'copy-failed-message': 'Copy failed, please copy manually',

        // Alert 訊息
        'add-lottery-numbers-first': 'Please add lottery numbers first',
        'add-parking-numbers-first': 'Please add parking numbers first',
        'no-available-spots':
            'No available parking spots (all spots are excluded)',
        'lottery-error': 'Lottery error',
        'enter-valid-number': 'Please enter a valid number',
        'enter-number-between-1-999': 'Please enter a number between 1-999',
        'start-number-cannot-be-greater-than-end':
            'Start number cannot be greater than end number',
        'enter-numbers': 'Please enter numbers',
    },
};
