/**
 * TTA Report Generator
 * @description Builds the HTML report from collected test data.
 *              CSS and JavaScript are read from their own source files and inlined
 *              into the report so it is fully self-contained (single .html file).
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// DATA TYPES  (shared with TTAReporter.ts)
// ============================================================

export interface StepData {
    title: string;
    category: string;
    duration: number;
    status: 'passed' | 'failed' | 'skipped';
    screenshot?: string;
    error?: string;
    stackTrace?: string;
    startTime?: string;
    consoleLogs?: string[];
    stepIndex?: number;
    videoStartTime?: number;
    videoEndTime?: number;
}

export interface TestData {
    id: string;
    title: string;
    fullTitle: string;
    file: string;
    describePath: string[];
    location: string;
    duration: number;
    status: 'passed' | 'failed' | 'skipped' | 'timedOut';
    retry: number;
    screenshots: { name: string; path: string }[];
    steps: StepData[];
    video?: string;
    trace?: string;
    error?: string;
    errorStack?: string;
    tags: string[];
}

export interface SuiteStats {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
}

export interface ReportContext {
    testResults: TestData[];
    suiteStats: SuiteStats;
    startTime: Date;
    endTime: Date;
    runId: string;
    browserName: string;
    platform: string;
    workers: number;
}

// ============================================================
// GENERATOR
// ============================================================

export class TTAReportGenerator {
    /** Directory where this generator lives — used to locate asset files */
    private readonly assetDir: string;

    constructor() {
        this.assetDir = __dirname;
    }

    // ----------------------------------------------------------
    // PUBLIC API
    // ----------------------------------------------------------

    /**
     * Build a complete, self-contained HTML report string.
     * Inlines CSS from tta-report-styles.css and JS from tta-report-scripts.js.
     */
    buildReport(ctx: ReportContext): string {
        return this.renderTemplate(ctx);
    }

    /**
     * Build a "live" version that auto-refreshes every 5 seconds.
     */
    buildLiveReport(ctx: ReportContext, runningTests: TestData[]): string {
        const liveCtx: ReportContext = {
            ...ctx,
            testResults: [...ctx.testResults, ...runningTests],
        };
        let html = this.renderTemplate(liveCtx);
        html = html.replace(
            '<meta charset="UTF-8">',
            '<meta charset="UTF-8">\n    <meta http-equiv="refresh" content="5">',
        );
        return html;
    }

    /**
     * Generate the history page listing all past report files.
     */
    buildHistoryPage(reportDir: string): string {
        const files = fs
            .readdirSync(reportDir)
            .filter((f) => f.startsWith('report_') && f.endsWith('.html'))
            .sort()
            .reverse();

        const rows = files
            .map((f, i) => {
                const match = f.match(/report_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.html/);
                const dateStr = match
                    ? `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`
                    : f;
                const badge = i === 0 ? '<span class="latest-badge">LATEST</span>' : '';
                return `<div class="report-item">
                <a href="${f}" class="report-link">${f}${badge}</a>
                <span class="report-date">${dateStr}</span>
            </div>`;
            })
            .join('\n');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TTA Report History</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; margin-bottom: 20px; border-radius: 8px; }
        .report-list { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .report-item { padding: 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .report-item:hover { background: #f0fdf4; }
        .report-link { color: #059669; text-decoration: none; font-weight: 500; }
        .report-link:hover { text-decoration: underline; }
        .report-date { color: #666; font-size: 12px; }
        .latest-badge { background: #10b981; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="header"><h1>📊 TTA Report History</h1><p>The Testing Academy - Playwright Framework</p></div>
    <div class="report-list">${rows}</div>
</body>
</html>`;
    }

    // ----------------------------------------------------------
    // PRIVATE — template rendering
    // ----------------------------------------------------------

    private renderTemplate(ctx: ReportContext): string {
        const css = this.loadAsset('tta-report-styles.css');
        const js  = this.loadAsset('tta-report-scripts.js');
        const passRate = ctx.suiteStats.total > 0
            ? ((ctx.suiteStats.passed / ctx.suiteStats.total) * 100).toFixed(1)
            : '0';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TTA Automation Report</title>
    <style>
${css}
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 TTA Automation Report</h1>
        <p class="header-subtitle">The Testing Academy - Playwright Framework</p>
    </div>

    <div class="container">
        ${this.renderStatsDashboard(ctx, passRate)}
        ${this.renderMetaBar(ctx)}
        ${this.renderFilters()}
        ${this.renderTestTable(ctx)}
    </div>

    <div id="screenshotModal" class="modal">
        <span class="modal-close">&times;</span>
        <img id="modalImage" class="modal-content" src="" alt="Screenshot">
    </div>

    <footer class="report-footer">
        <p>Built with ❤️ by <a href="https://thetestingacademy.com" target="_blank">Pramod Dutta</a> | <a href="https://thetestingacademy.com" target="_blank">The Testing Academy</a></p>
    </footer>

    <script>
${js}
    </script>
</body>
</html>`;
    }

    private renderStatsDashboard(ctx: ReportContext, passRate: string): string {
        const duration = this.formatDuration(ctx.endTime.getTime() - ctx.startTime.getTime());
        return `
        <div class="stats-dashboard">
            <div class="stat-card">
                <div class="stat-value">${ctx.suiteStats.total}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-value">${ctx.suiteStats.passed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-value">${ctx.suiteStats.failed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card skipped">
                <div class="stat-value">${ctx.suiteStats.skipped}</div>
                <div class="stat-label">Skipped</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${passRate}%</div>
                <div class="stat-label">Pass Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${duration}</div>
                <div class="stat-label">Duration</div>
            </div>
        </div>`;
    }

    private renderMetaBar(ctx: ReportContext): string {
        const env = process.env.TEST_ENV || 'UAT';
        return `
        <div class="meta-section">
            <div class="meta-item">
                <span class="meta-label">Environment</span>
                <span class="env-badge">🌐 ${env.toUpperCase()}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Browser</span>
                <span class="browser-badge">🌍 ${ctx.browserName}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Platform</span>
                <span class="meta-value">${ctx.platform}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Workers</span>
                <span class="meta-value">${ctx.workers}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Run ID</span>
                <span class="meta-value" style="font-family: 'JetBrains Mono', monospace; font-size: 12px;">${ctx.runId}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Started</span>
                <span class="meta-value">${this.formatTime(ctx.startTime)}</span>
            </div>
        </div>`;
    }

    private renderFilters(): string {
        return `
        <div class="filters">
            <div class="filter-group">
                <strong>🏷️ Priority:</strong>
                <label><input type="checkbox" class="group-filter" value="all" checked onchange="filterByGroup(this)"><span>All</span></label>
                <label><input type="checkbox" class="group-filter" value="p0" onchange="filterByGroup(this)"><span>P0</span></label>
                <label><input type="checkbox" class="group-filter" value="p1" onchange="filterByGroup(this)"><span>P1</span></label>
                <label><input type="checkbox" class="group-filter" value="smoke" onchange="filterByGroup(this)"><span>Smoke</span></label>
            </div>
            <div class="filter-group">
                <strong>📊 Status:</strong>
                <label><input type="checkbox" class="status-filter" value="all" checked onchange="filterByStatus(this)"><span>All</span></label>
                <label><input type="checkbox" class="status-filter" value="passed" onchange="filterByStatus(this)"><span>✅ Passed</span></label>
                <label><input type="checkbox" class="status-filter" value="failed" onchange="filterByStatus(this)"><span>❌ Failed</span></label>
                <label><input type="checkbox" class="status-filter" value="skipped" onchange="filterByStatus(this)"><span>⏭️ Skipped</span></label>
            </div>
        </div>`;
    }

    private renderTestTable(ctx: ReportContext): string {
        let html = `
        <div class="test-table-container">
        <table class="test-table">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Suite</th>
                    <th>Test Name</th>
                    <th>Author</th>
                    <th>Priority</th>
                    <th>Tags</th>
                    <th>File</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Screenshot</th>
                    <th>Video</th>
                    <th>Trace</th>
                </tr>
            </thead>
            <tbody>`;

        let serialNo = 1;
        for (const test of ctx.testResults) {
            const statusClass = test.status === 'passed'
                ? 'passed'
                : test.status === 'failed' || test.status === 'timedOut'
                    ? 'failed'
                    : 'skipped';
            const statusText = statusClass === 'passed' ? 'Passed'
                : statusClass === 'failed' ? 'Failed'
                : 'Skipped';

            const tagsData = test.tags.join(',').toLowerCase();
            const testGroup = test.tags.find((t) => t.includes('P0') || t.includes('P1') || t.includes('P2'))
                           || test.describePath[0]
                           || 'E2E';
            const author = process.env.TEST_AUTHOR || 'TTA-QA';
            const testStart = new Date(ctx.startTime.getTime());
            const testEnd   = new Date(testStart.getTime() + test.duration);
            const firstScreenshot =
                test.screenshots[0]?.path ||
                test.steps.find((s) => s.screenshot)?.screenshot ||
                '';

            html += `
                <tr class="test-row ${statusClass}" data-test-id="${test.id}" data-tags="${tagsData}">
                    <td class="col-sno">${serialNo}</td>
                    <td class="col-suite">${this.escapeHtml(test.describePath[0] || 'Default')}</td>
                    <td class="col-testname">
                        <span class="test-name-link" onclick="toggleTestDetail('${test.id}')">${this.escapeHtml(test.title)}</span>
                    </td>
                    <td class="col-author">${author}</td>
                    <td class="col-group">${this.escapeHtml(testGroup)}</td>
                    <td class="col-tags">${test.tags.map((t) => `<span class="tag">${t}</span>`).join(' ')}</td>
                    <td class="col-file">${this.escapeHtml(test.location)}</td>
                    <td class="col-starttime">${this.formatTime(testStart)}</td>
                    <td class="col-endtime">${this.formatTime(testEnd)}</td>
                    <td class="col-duration">${this.formatDuration(test.duration)}</td>
                    <td class="col-status"><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td class="col-screenshot">
                        ${firstScreenshot ? `<a href="${firstScreenshot}" target="_blank" class="screenshot-link">📷 View</a>` : 'N/A'}
                    </td>
                    <td class="col-video">
                        ${test.video ? `<a href="${test.video}" target="_blank" class="video-link-cell">▶️ Play</a>` : 'N/A'}
                    </td>
                    <td class="col-trace">
                        ${test.trace ? `<a href="${test.trace}" target="_blank" class="trace-link-cell">📁 View</a>` : 'N/A'}
                    </td>
                </tr>
                <tr class="test-detail-row" id="detail-row-${test.id}" style="display: none;">
                    <td colspan="14">
                        <div class="test-detail" id="detail-${test.id}">
                            ${this.renderTestDetailPanel(test)}
                        </div>
                    </td>
                </tr>`;
            serialNo++;
        }

        html += `
            </tbody>
        </table>
        </div>`;
        return html;
    }

    private renderTestDetailPanel(test: TestData): string {
        let html = '<div class="detail-panel">';

        if (test.error) {
            html += `
            <div class="detail-section error-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Errors
                </div>
                <div class="section-content">
                    <div class="error-box">
                        <pre class="error-message">${this.escapeHtml(test.error)}</pre>
                        ${test.errorStack
                            ? `<details class="stack-details"><summary>Call Stack</summary><pre class="stack-trace-content">${this.escapeHtml(test.errorStack)}</pre></details>`
                            : ''}
                    </div>
                </div>
            </div>`;
        }

        if (test.steps.length > 0) {
            html += `
            <div class="detail-section steps-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Test Steps
                </div>
                <div class="section-content">
                    <div class="steps-list">`;

            test.steps.forEach((step, stepIndex) => {
                const stepIcon  = step.status === 'passed' ? '✓' : '✗';
                const stepClass = step.status;
                const stepId    = `step-${test.id}-${stepIndex}`;

                html += `
                    <div class="step-item-container">
                        <div class="step-item ${stepClass} expandable" onclick="toggleStepDetails(this, '${stepId}-details')">
                            <span class="step-expand-icon">▶</span>
                            <span class="step-icon ${stepClass}">${stepIcon}</span>
                            <span class="step-name">${this.escapeHtml(step.title)}</span>
                            <span class="step-time">${this.formatDuration(step.duration)}</span>
                        </div>
                        <div id="${stepId}-details" class="step-details" style="display: none;">
                            <div class="step-meta">
                                <span class="step-meta-item">⏱️ Started: ${step.startTime || 'N/A'}</span>
                                <span class="step-meta-item">⏳ Duration: ${this.formatDuration(step.duration)}</span>
                                <span class="step-meta-item">🎬 Video: ${this.formatVideoTime(step.videoStartTime || 0)} - ${this.formatVideoTime(step.videoEndTime || 0)}</span>
                            </div>`;

                if (step.consoleLogs && step.consoleLogs.length > 0) {
                    html += `
                            <div class="step-console">
                                <div class="step-console-header">📋 Console Output (${step.consoleLogs.length} lines)</div>
                                <div class="step-console-content">
                                    ${step.consoleLogs.map((log) => `<div class="console-line">${this.escapeHtml(log)}</div>`).join('')}
                                </div>
                            </div>`;
                }

                if (step.screenshot) {
                    html += `
                            <div class="step-screenshot">
                                <div class="step-screenshot-header">📷 Screenshot</div>
                                <a href="${step.screenshot}" target="_blank">
                                    <img src="${step.screenshot}" alt="Step Screenshot" class="step-screenshot-img"/>
                                </a>
                            </div>`;
                }

                if (step.error) {
                    html += `
                            <div class="step-error">
                                <div class="step-error-header">❌ Error</div>
                                <div class="step-error-message">${this.escapeHtml(step.error)}</div>
                            </div>`;
                    if (step.stackTrace) {
                        html += `
                            <div class="step-stack-trace">
                                <div class="step-stack-header">📜 Stack Trace</div>
                                <pre class="step-stack-content">${this.escapeHtml(step.stackTrace)}</pre>
                            </div>`;
                    }
                }

                html += `
                        </div>
                    </div>`;
            });

            html += `
                    </div>
                </div>
            </div>`;
        }

        if (test.screenshots.length > 0) {
            html += `
            <div class="detail-section screenshots-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Screenshots
                </div>
                <div class="section-content">
                    <div class="screenshots-grid">
                        ${test.screenshots.map((s) => `
                        <div class="screenshot-item">
                            <a href="${s.path}" target="_blank" class="screenshot-link">
                                <img src="${s.path}" alt="${s.name}" class="screenshot-preview"/>
                            </a>
                            <div class="screenshot-name">📎 ${this.escapeHtml(s.name)}</div>
                        </div>`).join('')}
                    </div>
                </div>
            </div>`;
        }

        if (test.trace) {
            html += `
            <div class="detail-section traces-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Traces
                </div>
                <div class="section-content">
                    <a href="${test.trace}" download class="trace-download">📁 trace</a>
                </div>
            </div>`;
        }

        if (test.video) {
            html += `
            <div class="detail-section videos-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Videos
                </div>
                <div class="section-content">
                    <video controls class="test-video" src="${test.video}"></video>
                    <div class="video-link"><a href="${test.video}" target="_blank">📎 video</a></div>
                </div>
            </div>`;
        }

        html += '</div>';
        return html;
    }

    // ----------------------------------------------------------
    // PRIVATE — formatting utilities
    // ----------------------------------------------------------

    formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;
        return minutes > 0 ? `${minutes}m ${remaining}s` : `${remaining}s`;
    }

    private formatVideoTime(ms: number): string {
        const total = Math.floor(ms / 1000);
        const min   = Math.floor(total / 60);
        const sec   = total % 60;
        const msec  = Math.floor((ms % 1000) / 10);
        return `${min}:${sec.toString().padStart(2, '0')}.${msec.toString().padStart(2, '0')}`;
    }

    formatTime(date: Date): string {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ----------------------------------------------------------
    // PRIVATE — asset loading
    // ----------------------------------------------------------

    /**
     * Load a file from the same directory as this generator.
     * Falls back to an empty string with a warning if the file is missing.
     */
    private loadAsset(filename: string): string {
        const filePath = path.join(this.assetDir, filename);
        try {
            return fs.readFileSync(filePath, 'utf-8');
        } catch {
            console.warn(`[TTAReportGenerator] Asset not found: ${filePath}`);
            return '';
        }
    }
}
