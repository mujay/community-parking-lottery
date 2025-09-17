# 🚗 停車位抽籤系統（新版）

一套純前端的停車位抽籤工具，支援主題與語言切換、範圍/批次管理、結果分頁與歷史保存。無需後端，開啟即可使用。

## 🌐 線上展示
🔗 立即體驗 DEMO： https://mujay.github.io/community-parking-lottery/

## ✨ 功能特色
- 抽籤配對：以 Fisher–Yates 演算法隨機將抽籤號碼配對至可用停車位。
- 三組清單管理：抽籤號碼、車位號碼、排除車位；支援單號、範圍與批次（逗號、區間）。
- 超額處理：抽籤號碼多於可用車位時，隨機擇等量號碼參與抽籤並顯示提醒。
- 主題/語言：日系風格、GitHub 風格；繁中（zh‑TW）與英文（en）即時切換並記憶偏好。
- 結果與歷史：結果表分頁顯示（每頁 50 筆）、CSV/停車位清單一鍵複製、歷史記錄自動保存於瀏覽器。

## 📦 檔案結構
```
index.html        # 頁面與載入順序
style.css         # 主題與樣式（CSS 變數）
script.js         # 入口與 UI 流程（ParkingLotterySystem）
number-manager.js # 數字清單通用模組
templates.js      # 結果/歷史/分頁模板
translations.js   # zh/en 文案
config.js         # ParkingConfig（defaultExcludedSpots 等）
```

## 🚀 快速開始
- 直接開啟：用瀏覽器打開 `index.html`。
- 本機伺服器：
  - `python3 -m http.server 8080` → http://localhost:8080
  - 或 `npx http-server -c-1` → http://127.0.0.1:8080

## 🧭 基本操作
1) 加入抽籤號碼：輸入單號或範圍（如 1-80）。
2) 加入車位號碼：可多段範圍（如 1-150, 160-200）。
3) 設定排除車位：支援單號/範圍/批次；預設排除見 `config.js` 的 `defaultExcludedSpots`。
4) 開始抽籤：產出配對結果；可分頁瀏覽、複製 CSV 或複製停車位清單。
5) 歷史記錄：自動保存於 `localStorage`（鍵：`parkingLotteryHistory`）。

## 🌍 語系與主題
- 預設語系：繁體中文（zh‑TW）；可切換英文（en）。
- 預設主題：日系風格；可切換 GitHub 風格。
- 偏好（語系/主題）皆存於瀏覽器 `localStorage`。

## ⚙️ 設定與相容性
- 調整預設排除：修改 `config.js` 的 `defaultExcludedSpots`。
- 舊版相容：啟動時會將舊格式歷史 `zoneResults` 自動轉換為新格式。
- 支援瀏覽器：Chrome/Edge/Safari 等現代瀏覽器。

## 🔒 隱私與資料
- 本專案為純前端；所有資料僅存於本機 `localStorage`，不會傳出裝置。

## 📝 授權
- 若未標示其他授權，預設採用 MIT License。
