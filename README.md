# 🚗 社區停車位抽籤系統

一個現代化的網頁應用程式，專為社區停車位分配而設計的抽籤系統。支援多種佈景主題切換（日系風格、GitHub 風格），具備分區抽籤、靈活的號碼範圍管理、完整的結果匯出功能，以及全站 CSS 變數化的主題一致性設計。

## 🌐 線上展示

🔗 **[立即體驗 DEMO](https://mujay.github.io/community-parking-lottery/)**

無需安裝，直接在瀏覽器中體驗完整功能！

## ✨ 主要功能

### 🎯 抽籤模式

-   **分區抽籤**：A 區（1-210）和 B 區（211-322）分別進行抽籤
-   **整體抽籤**：所有停車位統一抽籤分配
-   **智慧前綴**：分區模式使用 A/B 前綴，整體模式使用純數字
-   **並列顯示**：分區抽籤結果支援左右並列顯示（響應式設計）

### 🎨 主題與設計

-   **多主題支援**：日系風格（溫暖米色調）、GitHub 風格（深色專業風格）
-   **即時切換**：右上角主題選擇器，一鍵切換全站主題
-   **CSS 變數化**：全站使用 CSS 變數系統，確保主題切換的一致性
-   **響應式設計**：所有主題皆支援桌面、平板、手機等各種裝置
-   **現代化界面**：圓角設計、陰影效果、漸層背景、毛玻璃效果

### 📝 號碼範圍管理

-   **靈活輸入**：支援 1-3 位數字輸入，自動補零格式化
-   **重疊檢查**：自動檢測範圍重疊並提供詳細提示
-   **單號支援**：起始和結束相同時自動識別為單個號碼
-   **即時統計**：顯示已加入範圍的總數量

### 🚫 排除停車位管理

-   **A 區預設排除**：身障車格（191-195）預設排除
-   **B 區預設排除**：充電機車位（313-322）預設排除
-   **靈活添加**：支援單一號碼或範圍格式
-   **視覺化管理**：標籤式顯示，可個別移除
-   **智慧排序**：自動排序和去重

### 📊 結果處理與顯示

-   **簡潔顯示**：抽籤號碼與停車位的直接對應（移除順序欄位）
-   **分區設定**：清楚區分抽籤號碼設定與車位設定
-   **即時統計**：顯示抽籤號碼數量、可用車位數等摘要資訊
-   **CSV 匯出**：完整的抽籤資訊和結果
-   **號碼複製**：快速複製停車位號碼用於下輪排除
-   **歷史記錄**：自動保存最近 20 筆抽籤記錄，支援點擊查看詳細結果

## 🛠️ 技術規格

### 🛠️ 技術規格

### 前端技術

-   **HTML5**：響應式網頁結構
-   **CSS3**：多主題設計系統、CSS 變數化、漸層背景、毛玻璃效果與動畫
-   **JavaScript ES6+**：物件導向程式設計、主題切換管理
-   **本地儲存**：使用 LocalStorage 保存歷史記錄與主題偏好
-   **響應式設計**：支援桌面、平板、手機等各種裝置
-   **主題系統**：全站 CSS 變數統一管理，確保主題切換一致性

### 瀏覽器支援

-   Chrome 60+
-   Firefox 55+
-   Safari 12+
-   Edge 79+

### 檔案結構

```
lottery/
├── index.html          # 主要網頁結構
├── style.css           # 樣式表
├── script.js           # 核心JavaScript邏輯
└── README.md           # 專案說明文件
```

## 🚀 安裝與使用

### 方法一：直接開啟

1. 下載所有檔案到本地資料夾
2. 用瀏覽器開啟 `index.html`

### 方法二：本地伺服器

```bash
# 使用 Python 啟動本地伺服器
cd /path/to/lottery
python3 -m http.server 8000

# 瀏覽器開啟 http://localhost:8000
```

### 方法三：Live Server (VS Code)

1. 安裝 Live Server 擴展
2. 右鍵點擊 `index.html`
3. 選擇 "Open with Live Server"

## 📋 使用指南

### 主題切換

1. **選擇主題**：點擊右上角「🎨 風格」選單
2. **即時預覽**：選擇「日系風格」或「GitHub 風格」
3. **自動記憶**：系統會記住您的主題偏好
4. **響應式適配**：所有裝置都支援主題切換功能

### 分區抽籤流程

1. **勾選「分區抽籤」**
2. **設定 A 區範圍**：
    - 輸入起始數字：`1`
    - 輸入結束數字：`50`
    - 點擊「加入」→ 顯示 A001-A050（50 個號碼）
3. **設定 B 區範圍**：
    - 輸入起始數字：`1`
    - 輸入結束數字：`30`
    - 點擊「加入」→ 顯示 B001-B030（30 個號碼）
4. **調整排除停車位**（可選）
5. **點擊「開始抽籤」**

### 整體抽籤流程

1. **取消勾選「分區抽籤」**
2. **設定號碼範圍**：
    - 輸入起始數字：`1`
    - 輸入結束數字：`80`
    - 點擊「加入」→ 顯示 1-80（80 個號碼）
3. **調整排除停車位**（可選）
4. **點擊「開始抽籤」**

### 進階功能

#### 多範圍設定

```
範例：A001-A050, A060-A080
1. 加入 A 1-50
2. 加入 A 60-80
總數量：71個號碼
```

#### 單號碼加入

```
範例：加入特定號碼 A025
輸入起始：25
輸入結束：25
結果：A025
```

#### 排除停車位

```
範例：排除停車位 25-30
在排除輸入框輸入：25-30
點擊「加入」
```

## 🎨 界面特色與主題系統

### 多主題設計

系統支援兩種專業設計主題，可透過右上角主題選擇器即時切換：

#### 🌸 日系風格主題

-   **溫暖色調**：米色系主色調，營造溫馨感
-   **細緻材質**：圓角設計、陰影效果、漸層背景
-   **毛玻璃效果**：backdrop-filter 營造現代感
-   **文字優化**：高對比度、清晰字體、適當字重

#### 🖤 GitHub 風格主題

-   **專業深色**：GitHub 風格的深色系設計
-   **程式設計師友善**：熟悉的深色界面，降低眼部疲勞
-   **對比清晰**：高對比度的色彩設計，確保可讀性
-   **現代簡潔**：簡潔的線條與間距，專注於功能

### 技術特色

-   **CSS 變數系統**：全站使用 CSS 變數統一管理色彩、尺寸、圓角等
-   **主題一致性**：切換主題時，所有 UI 元件都能正確套用新樣式
-   **即時切換**：無需重新整理，主題變更立即生效
-   **本地記憶**：自動記住使用者的主題偏好設定

### 響應式設計

-   **桌面版**：完整功能展示，分區結果並列顯示，主題選擇器位於右上角
-   **平板版**：適配中等螢幕，優化按鈕排列，主題切換響應觸控
-   **手機版**：垂直布局優化，確保觸控友善，主題選單自適應

### 視覺元素

-   **標籤系統**：清晰的範圍和排除管理，支援多主題色彩
-   **顏色區分**：不同功能使用不同顏色層次，主題間保持一致性
-   **動畫效果**：平滑的按鈕懸停和點擊回饋，適配各主題風格
-   **SVG 裝飾**：細緻的背景紋理圖案，隨主題變化
-   **主題切換**：右上角風格選擇器，支援即時預覽與切換

## 🔧 核心演算法

### Fisher-Yates 洗牌

系統使用標準的 Fisher-Yates 演算法確保抽籤的隨機性和公平性：

```javascript
shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
```

### 重疊檢查

智慧檢測範圍重疊，避免號碼重複分配：

```javascript
// 檢查新範圍與現有範圍的重疊
const overlapping = newRangeNumbers.filter((num) => existingNumbers.has(num));
```

## 📁 資料格式

### CSV 匯出格式

```csv
抽籤結果 - A區
抽籤時間,2024/6/24 下午2:30:15
抽籤方式,分區抽籤
發放範圍,A001-A050
排除停車位,191,192,193,194,195
可用位數,205

抽籤號碼,分配停車位
A001,25
A002,156
A003,78
...
```

### 本地儲存結構

```javascript
{
    "timestamp": "2024-06-24T06:30:15.123Z",
    "separateZones": true,
    "zoneResults": [
        {
            "zone": "A",
            "range": "A001-A050",
            "exclude": "191,192,193,194,195",
            "available": 205,
            "participants": 50,
            "results": [
                {"lotteryNumber": "A001", "parkingSpot": 25},
                {"lotteryNumber": "A002", "parkingSpot": 156}
            ]
        }
    ]
}
```

## 🎯 使用案例

### 社區管理委員會

-   **月度抽籤**：每月重新分配停車位
-   **公平分配**：確保所有住戶機會均等
-   **記錄保存**：完整的抽籤歷史記錄

### 辦公大樓

-   **員工停車**：依部門或樓層分區管理
-   **訪客車位**：臨時停車位分配
-   **彈性調整**：可排除維修或預留車位

### 活動場地

-   **大型活動**：參展商停車位分配
-   **分時段管理**：不同時段的車位安排
-   **VIP 保留**：重要賓客車位預留

## 🛡️ 安全性與隱私

### 資料安全

-   **本地運算**：所有計算在瀏覽器本地進行
-   **無伺服器依賴**：不需要網路連線
-   **隱私保護**：不收集或傳送個人資料

### 公平性保證

-   **標準演算法**：使用業界標準隨機演算法
-   **透明過程**：所有步驟可追溯驗證
-   **結果匯出**：完整的抽籤記錄可供查驗

## 🤝 貢獻與支援

### 問題回報

如果您發現任何問題或有改進建議，歡迎：

1. 檢查現有的問題清單
2. 建立詳細的問題描述
3. 提供重現步驟和環境資訊

### 功能建議

我們歡迎新功能的建議：

-   多語言支援
-   列印功能
-   更多佈景主題（如深色模式、高對比度模式）
-   自訂主題顏色設定
-   批次匯入功能

## � 相關連結

-   **[🌐 線上展示](https://mujay.github.io/community-parking-lottery/)** - 立即體驗完整功能
-   **[📁 GitHub 儲存庫](https://github.com/mujay/community-parking-lottery)** - 原始程式碼與文件
-   **[🐛 問題回報](https://github.com/mujay/community-parking-lottery/issues)** - 回報錯誤或問題
-   **[💡 功能建議](https://github.com/mujay/community-parking-lottery/discussions)** - 分享想法和建議

## �📄 授權資訊

本專案採用 MIT 授權條款，您可以自由：

-   使用、複製、修改、合併、發布、分發
-   用於商業或非商業用途
-   在遵守授權條款的前提下自由使用

## 🔄 版本記錄

### v2.1.0 (2024-06-24)

-   🎨 **多主題系統**：新增 GitHub 風格主題，支援即時主題切換
-   🔧 **CSS 變數化**：全站使用 CSS 變數系統，確保主題切換一致性
-   ⚡ **主題記憶**：使用 LocalStorage 記住使用者主題偏好
-   🎯 **UI 統一**：所有 UI 元件（按鈕、表格、卡片、標籤等）皆支援主題切換
-   📱 **響應式主題**：主題切換功能在所有裝置上都能正常運作
-   🔍 **移除蘋果風格**：清理舊有蘋果風格主題相關程式碼

### v2.0.0 (2024-06-24)

-   🎨 **全新日系風格設計**：溫暖米色調、圓角設計、毛玻璃效果
-   ✨ **新增充電機車位管理**：B 區預設排除 313-322 充電機車位
-   📊 **增強統計顯示**：即時車位統計、抽籤摘要資訊
-   🖥️ **優化顯示布局**：分區結果支援並列顯示（響應式）
-   📋 **簡化結果表格**：移除順序欄位，突出重要資訊
-   🔍 **歷史記錄改進**：支援點擊查看詳細抽籤結果
-   📱 **閱讀性提升**：加強文字對比度、字體大小優化
-   🎯 **介面重組**：清楚區分抽籤號碼設定與車位設定

### v1.0.0 (2024-06-24)

-   ✨ 初始版本發布
-   🎯 分區和整體抽籤功能
-   📝 範圍管理和重疊檢查
-   🚫 排除停車位管理
-   📊 CSV 匯出和歷史記錄
-   🎨 響應式網頁設計

---

**開發者**：停車位抽籤系統團隊  
**最後更新**：2024 年 6 月 24 日  
**版本**：v2.1.0

---

🎉 感謝使用停車位抽籤系統！全新的多主題系統（日系風格與 GitHub 風格）、CSS 變數化設計與增強功能，希望能為您的社區管理帶來更好的體驗。
