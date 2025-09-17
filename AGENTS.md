# 儲存庫指南

## 專案結構與模組組織
- 根目錄包含靜態資源：`index.html`、`style.css` 與 JavaScript 模組。
- 核心模組：`script.js`（入口/UI 邏輯）、`number-manager.js`（清單/狀態）、`templates.js`（HTML 產生器）、`translations.js`（i18n）、`config.js`（`ParkingConfig`）。
- 無建置流程或打包器；由 `index.html` 以 `<script>` 直接載入。

## 建置、測試與開發命令
- 本機啟動（靜態伺服器）：
  - `python3 -m http.server 8080` → 開啟 http://localhost:8080
  - 或 `npx http-server -c-1`（停用快取）→ http://127.0.0.1:8080
- 煙霧測試：開啟應用、切換主題/語言、加入區間/單號、執行抽籤、檢查歷史與剪貼簿功能。

## 程式風格與命名規範
- JavaScript：4 空白縮排、必加分號、單引號；每行 < 120 字元。
- 檔名：模組使用 kebab-case（如 `number-manager.js`）；HTML/CSS 小寫。
- 識別字：類別/建構子 `PascalCase`（如 `ParkingLotterySystem`、`NumberManager`）；變數/函式 `camelCase`；設定單例 `PascalCase`（如 `ParkingConfig`）。
- DOM：優先使用 `data-*` 屬性與 `index.html` 既有 `id` 選擇器。

## 語系與在地化
- 預設語系：正體中文（台灣，`zh-TW`）。翻譯鍵使用 `zh`（對應 zh-TW）與 `en`。
- 新增/變更任何 UI 文案，必須於 `translations.js` 提供 `zh` 對應；若同時提供 `en`，請同步維護。
- 日期與數字請使用在地化顯示，例如使用 `locale-code` 翻譯鍵或 `toLocaleString('zh-TW')`。

## 測試指引
- 尚未配置測試框架。提交變更時，請在 PR 說明列出手動測試步驟：
  - 瀏覽器：最新版 Chrome、Safari。
  - 語言：zh/en；主題：japanese/github。
  - 邊界情況：空清單、重複號碼、排除與區間重疊。
- 需要時可在 `tests/` 新增輕量 HTML 測試頁（不需打包）。

## Commit 與 Pull Request 規範
- Commit 採用 Conventional Commits：`feat:`、`fix:`、`ref:`、`docs:`（訊息可使用中文）。範例：`feat: 增強多語言支援並改進介面`。
- PR 必須包含：
  - 精簡摘要與緣由（以正體中文撰寫）；如有請連結 Issue。
  - UI 變更請提供前/後截圖（兩種主題、兩種語言）。
  - 影響的 i18n 鍵（`translations.js`，需包含 `zh` 文案）與任何 `ParkingConfig` 變更說明。

## 安全與設定建議
- 不儲存機密；本專案僅使用 `localStorage`，請儘量保持鍵名穩定。
- 調整 `config.js` 中的 `defaultExcludedSpots` 需附理由並在 PR 紀錄。
- 避免引入大型相依；維持靜態、無框架架構。
