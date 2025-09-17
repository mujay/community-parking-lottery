// HTML 模板模組
const Templates = {
    // 建立結果表格模板
    createResultsTable(
        pageResults,
        page,
        totalResults,
        totalPages,
        resultsPerPage,
        getText = (key) => key // 預設的翻譯函式
    ) {
        const startIndex = (page - 1) * resultsPerPage;
        const endIndex = Math.min(startIndex + resultsPerPage, totalResults);

        return `
            <div class="results-table-container">
                <div class="table-header">
                    <h4>
                        ${getText('results-title')} ${
            totalPages > 1
                ? `(${getText('page')} ${page}${getText(
                      'page-of'
                  )} ${totalPages} ${getText('pages')}) `
                : ''
        }
                        (${getText('showing')} ${
            startIndex + 1
        }-${endIndex} ${getText('items-of')} ${totalResults} ${getText(
            'items'
        )})
                        <div class="copy-buttons">
                            <button class="copy-csv-btn" onclick="lottery.copyCSV(0)" title="${getText(
                                'copy-csv-tooltip'
                            )}">
                                ${getText('copy-csv')}
                            </button>
                            <button class="copy-numbers-btn" onclick="lottery.copyParkingNumbers(0)" title="${getText(
                                'copy-numbers-tooltip'
                            )}">
                                ${getText('copy-parking-numbers')}
                            </button>
                        </div>
                    </h4>
                </div>
                <div class="table-wrapper">
                    <table class="lottery-table">
                        <thead>
                            <tr>
                                <th>${getText('serial-number')}</th>
                                <th>${getText('lottery-number')}</th>
                                <th>${getText('assigned-parking')}</th>
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
                        ? this.createPagination(page, totalPages, totalResults)
                        : ''
                }
            </div>
        `;
    },

    // 建立分頁控制項模板
    createPagination(page, totalPages, totalResults, getText = (key) => key) {
        return `
            <div class="pagination">
                <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} 
                        onclick="lottery.showResultPage(${
                            page - 1
                        })" title="${getText('previous-page')}">
                    ‹ ${getText('previous-page')}
                </button>
                <div class="pagination-info">
                    <span>${getText('page')} ${page}${getText(
            'page-of'
        )} ${totalPages} ${getText('pages')}</span>
                    <span class="total-info">${getText(
                        'total'
                    )} ${totalResults} ${getText('results')}</span>
                </div>
                <button class="pagination-btn" ${
                    page === totalPages ? 'disabled' : ''
                } 
                        onclick="lottery.showResultPage(${
                            page + 1
                        })" title="${getText('next-page')}">
                    ${getText('next-page')} ›
                </button>
            </div>
        `;
    },

    // 建立結果資訊模板
    createResultInfo(results, getText = (key) => key) {
        return `
            <div class="round-result">
                <h3>${getText('latest-results')}</h3>
                <div class="round-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">${getText(
                                'lottery-time'
                            )}：</span>
                            <span class="info-value">${results.timestamp.toLocaleString(
                                getText('locale-code')
                            )}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">${getText(
                                'lottery-numbers'
                            )}：</span>
                            <span class="info-value">${
                                results.lotteryNumbers.length > 20
                                    ? `${results.lotteryNumbers
                                          .slice(0, 20)
                                          .join(', ')} ... (${getText(
                                          'total'
                                      )}${
                                          results.lotteryNumbers.length
                                      }${getText('numbers')})`
                                    : results.lotteryNumbers.join(', ')
                            }</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">${getText(
                                'parking-range'
                            )}：</span>
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
                            <span class="info-label">${getText(
                                'excluded-parking'
                            )}：</span>
                            <span class="info-value">${
                                results.exclude.length > 30
                                    ? `${results.exclude.substring(0, 30)}...`
                                    : results.exclude
                            }</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">${getText(
                                'available-spots'
                            )}：</span>
                            <span class="info-value">${
                                results.available
                            }${getText('spots')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">${getText(
                                'participants'
                            )}：</span>
                            <span class="info-value">${
                                results.selectedCount
                            }${getText('spots')}</span>
                        </div>
                    </div>
                    ${
                        results.note
                            ? `<div class="note-section"><strong class="note">${results.note}</strong></div>`
                            : ''
                    }
                </div>
            </div>
        `;
    },

    // 建立歷史記錄詳細結果模板
    createHistoryDetails(record, historyIndex, getText = (key) => key) {
        const timestamp = record.timestamp.toLocaleString
            ? record.timestamp.toLocaleString(getText('locale-code'))
            : new Date(record.timestamp).toLocaleString(getText('locale-code'));

        return `
            <div class="round-result">
                <h3>${getText('history-details')}</h3>
                <div class="round-info">
                    <div><strong>${getText('time')}：</strong>${timestamp}</div>
                    <div><strong>${getText(
                        'lottery-numbers'
                    )}：</strong>${record.lotteryNumbers.join(', ')}</div>
                    <div><strong>${getText('parking-range')}：</strong>${
            record.parkingRange
        }</div>
                    <div><strong>${getText('excluded-parking')}：</strong>${
            record.exclude || getText('none')
        }</div>
                    <div><strong>${getText('available-spots')}：</strong>${
            record.available
        }${getText('spots')}</div>
                    <div><strong>${getText(
                        'total-lottery-numbers'
                    )}：</strong>${record.participants}${getText('spots')}</div>
                    <div><strong>${getText('actual-participants')}：</strong>${
            record.selectedCount
        }${getText('spots')}</div>
                    ${
                        record.note
                            ? `<div><strong class="note">${record.note}</strong></div>`
                            : ''
                    }
                </div>
                <div class="zone-results">
                    <div class="zone-result">
                        <h4>
                            ${getText('lottery-results')} (${
            record.results.length
        } ${getText('parking-spots')})
                            <div class="copy-buttons">
                                <button class="copy-csv-btn" onclick="lottery.copyCSV(${historyIndex})">${getText(
            'copy-csv'
        )}</button>
                                <button class="copy-numbers-btn" onclick="lottery.copyParkingNumbers(${historyIndex})">${getText(
            'copy-parking-numbers'
        )}</button>
                            </div>
                        </h4>
                        <table class="lottery-table">
                            <thead>
                                <tr>
                                    <th>${getText('lottery-number')}</th>
                                    <th>${getText('parking-spot')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${record.results
                                    .map(
                                        (result) => `
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
    },
};
