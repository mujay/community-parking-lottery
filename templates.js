// HTML 模板模組
const Templates = {
    // 建立結果表格模板
    createResultsTable(pageResults, page, totalResults, totalPages, resultsPerPage) {
        const startIndex = (page - 1) * resultsPerPage;
        const endIndex = Math.min(startIndex + resultsPerPage, totalResults);

        return `
            <div class="results-table-container">
                <div class="table-header">
                    <h4>
                        抽籤結果 ${totalPages > 1 ? `(第 ${page} 頁，共 ${totalPages} 頁) ` : ''}
                        (顯示 ${startIndex + 1}-${endIndex} 筆，共 ${totalResults} 筆)
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
                            ${pageResults.map((pair, index) => `
                                <tr>
                                    <td class="serial-number">${startIndex + index + 1}</td>
                                    <td class="lottery-number">${pair.lotteryNumber}</td>
                                    <td class="parking-number">${pair.parkingSpot}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${totalPages > 1 ? this.createPagination(page, totalPages, totalResults) : ''}
            </div>
        `;
    },

    // 建立分頁控制項模板
    createPagination(page, totalPages, totalResults) {
        return `
            <div class="pagination">
                <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} 
                        onclick="lottery.showResultPage(${page - 1})" title="上一頁">
                    ‹ 上一頁
                </button>
                <div class="pagination-info">
                    <span>第 ${page} 頁，共 ${totalPages} 頁</span>
                    <span class="total-info">總共 ${totalResults} 筆結果</span>
                </div>
                <button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} 
                        onclick="lottery.showResultPage(${page + 1})" title="下一頁">
                    下一頁 ›
                </button>
            </div>
        `;
    },

    // 建立結果資訊模板
    createResultInfo(results) {
        return `
            <div class="round-result">
                <h3>最新抽籤結果</h3>
                <div class="round-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">抽籤時間：</span>
                            <span class="info-value">${results.timestamp.toLocaleString('zh-TW')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">抽籤號碼：</span>
                            <span class="info-value">${
                                results.lotteryNumbers.length > 20
                                    ? `${results.lotteryNumbers.slice(0, 20).join(', ')} ... (共${results.lotteryNumbers.length}個)`
                                    : results.lotteryNumbers.join(', ')
                            }</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">車位範圍：</span>
                            <span class="info-value">${
                                results.parkingRange.length > 50
                                    ? `${results.parkingRange.substring(0, 50)}...`
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
                            <span class="info-value">${results.available}個</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">參與抽籤：</span>
                            <span class="info-value">${results.selectedCount}個</span>
                        </div>
                    </div>
                    ${results.note ? `<div class="note-section"><strong class="note">${results.note}</strong></div>` : ''}
                </div>
            </div>
        `;
    },

    // 建立歷史記錄詳細結果模板
    createHistoryDetails(record, historyIndex) {
        const timestamp = record.timestamp.toLocaleString
            ? record.timestamp.toLocaleString('zh-TW')
            : new Date(record.timestamp).toLocaleString('zh-TW');

        return `
            <div class="round-result">
                <h3>歷史記錄詳細結果</h3>
                <div class="round-info">
                    <div><strong>時間：</strong>${timestamp}</div>
                    <div><strong>抽籤號碼：</strong>${record.lotteryNumbers.join(', ')}</div>
                    <div><strong>車位範圍：</strong>${record.parkingRange}</div>
                    <div><strong>排除停車位：</strong>${record.exclude || '無'}</div>
                    <div><strong>可用車位：</strong>${record.available}個</div>
                    <div><strong>抽籤號碼總數：</strong>${record.participants}個</div>
                    <div><strong>實際參與抽籤：</strong>${record.selectedCount}個</div>
                    ${record.note ? `<div><strong class="note">${record.note}</strong></div>` : ''}
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
                                ${record.results.map((result) => `
                                    <tr>
                                        <td>${result.lotteryNumber}</td>
                                        <td class="parking-number">${result.parkingSpot}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
};
