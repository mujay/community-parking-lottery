// 停車位抽籤系統設定檔案

const ParkingConfig = {
    // 預設排除車位（身障車格 + 充電機車位）
    defaultExcludedSpots: [
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
    ],

    // 其他設定可以在這裡添加
    settings: {
        // 分頁顯示數量
        resultsPerPage: 50,

        // 預設主題
        defaultTheme: 'japanese',

        // 預設語言
        defaultLanguage: 'zh',
    },
};
