/**
 * Custom TTA Reporter for Playwright
 * @author Pramod Dutta
 * @website https://thetestingacademy.com
 * @version 1.0.0
 * @description Custom HTML Reporter for Playwright Test Automation Framework
 */
/* eslint-disable no-console -- Reporter intentionally writes to terminal stdout */

import {
    FullConfig,
    FullResult,
    Reporter,
    Suite,
    TestCase,
    TestResult,
    TestStep,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

import {
    TTAReportGenerator,
    TestData,
    StepData,
    SuiteStats,
    ReportContext,
} from './TTAReportGenerator';

export default class TTAReporter implements Reporter {
    private testResults: TestData[] = [];
    private suiteStats: SuiteStats = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 };
    private config!: FullConfig;
    private startTime: Date = new Date();
    private endTime: Date = new Date();
    private outputFile: string = 'tta-report/index.html';
    private runId: string = '';
    
    private testStepsMap: Map<string, StepData[]> = new Map();
    private testStartTimeMap: Map<string, number> = new Map();
    private testStepCounterMap: Map<string, number> = new Map();
    private testCounter: number = 0;
    
    private runningTests: Map<string, TestData> = new Map();
    
    // Extracted HTML Generation logic
    private generator: TTAReportGenerator = new TTAReportGenerator();

    onBegin(config: FullConfig, suite: Suite): void {
        const now = new Date();
        this.runId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        this.outputFile = `tta-report/report_${this.runId}.html`;
        this.config = config;
        this.startTime = new Date();
        const totalTests = suite.allTests().length;
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║        🎭 TTA PLAYWRIGHT AUTOMATION - REAL-TIME REPORT         ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  📅 Started: ${this.startTime.toLocaleString().padEnd(47)}║`);
        console.log(`║  📊 Total Tests: ${String(totalTests).padEnd(44)}║`);
        console.log(`║  🌐 Environment: ${(process.env.TEST_ENV || 'UAT').padEnd(44)}║`);
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        this.initializeLiveReport();
    }

    private initializeLiveReport(): void {
        const reportDir = path.dirname(this.outputFile);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        this.updateReportRealTime();
        console.log(`📡 Real-time report: ${this.outputFile}`);
    }

    onTestBegin(test: TestCase): void {
        this.testStepsMap.set(test.id, []);
        this.testStartTimeMap.set(test.id, Date.now());
        this.testStepCounterMap.set(test.id, 0);
        this.testCounter++;

        const testFile = test.location.file.split('/').pop() || '';
        console.log(`\n▶️  STARTING: ${test.title}`);
        console.log(`   📁 File: ${testFile}`);
        console.log(`   📍 Suite: ${test.parent.title}`);
        console.log('   ─────────────────────────────────────────────────────');

        const describePath: string[] = [];
        let parent: { title: string; parent?: unknown } | undefined = test.parent;
        while (parent && parent.title) {
            describePath.unshift(parent.title);
            parent = parent.parent as { title: string; parent?: unknown } | undefined;
        }

        this.runningTests.set(test.id, {
            id: `running-${test.id}`,
            title: test.title,
            fullTitle: [...describePath, test.title].join(' › '),
            file: test.location.file,
            describePath: describePath,
            location: `${test.location.file}:${test.location.line}`,
            duration: 0,
            status: 'passed',
            retry: 0,
            screenshots: [],
            steps: [],
            tags: test.tags || [],
        });

        this.updateReportRealTime();
    }

    onStepBegin(_test: TestCase, _result: TestResult, step: TestStep): void {
        if (step.category === 'test.step') {
            console.log(`   ⏳ ${step.title}...`);
        }
    }

    onStepEnd(test: TestCase, _result: TestResult, step: TestStep): void {
        if (step.category === 'test.step') {
            const duration = step.duration ? `(${step.duration}ms)` : '';
            const status = step.error ? '❌' : '✅';
            console.log(`   ${status} ${step.title} ${duration}`);

            const testStartTime = this.testStartTimeMap.get(test.id) || Date.now();
            const stepCounter = this.testStepCounterMap.get(test.id) || 0;
            const testSteps = this.testStepsMap.get(test.id) || [];

            const stepStartTime = new Date(step.startTime).getTime();
            const videoStartTime = stepStartTime - testStartTime;
            const videoEndTime = videoStartTime + (step.duration || 0);

            const stepData: StepData = {
                title: step.title,
                category: step.category,
                duration: step.duration || 0,
                status: step.error ? 'failed' : 'passed',
                error: step.error?.message,
                stackTrace: step.error?.stack,
                consoleLogs: [],
                stepIndex: stepCounter,
                videoStartTime: Math.max(0, videoStartTime),
                videoEndTime: Math.max(0, videoEndTime),
            };
            testSteps.push(stepData);
            this.testStepsMap.set(test.id, testSteps);
            this.testStepCounterMap.set(test.id, stepCounter + 1);

            const runningTest = this.runningTests.get(test.id);
            if (runningTest) {
                runningTest.steps = [...testSteps];
                this.runningTests.set(test.id, runningTest);
            }

            this.updateReportRealTime();
        }
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        this.suiteStats.total++;

        let status: 'passed' | 'failed' | 'skipped' | 'timedOut' = 'passed';
        let statusIcon = '✅';
        if (result.status === 'passed') {
            this.suiteStats.passed++;
            status = 'passed';
            statusIcon = '✅';
        } else if (result.status === 'failed' || result.status === 'timedOut') {
            this.suiteStats.failed++;
            status = result.status === 'timedOut' ? 'timedOut' : 'failed';
            statusIcon = '❌';
        } else {
            this.suiteStats.skipped++;
            status = 'skipped';
            statusIcon = '⏭️';
        }

        const testTime = this.generator.formatDuration(result.duration);

        console.log('   ─────────────────────────────────────────────────────');
        console.log(`   ${statusIcon} RESULT: ${status.toUpperCase()} | Duration: ${testTime}`);
        if (result.error) {
            console.log(`   ⚠️  Error: ${result.error.message?.substring(0, 80)}...`);
        }
        console.log(`\n   📊 Running Total: ✅ ${this.suiteStats.passed} | ❌ ${this.suiteStats.failed} | ⏭️ ${this.suiteStats.skipped}`);

        const currentTestSteps = this.testStepsMap.get(test.id) || [];
        this.associateLogsWithSteps(test, result, currentTestSteps);

        const screenshots: { name: string; path: string }[] = [];
        const stepScreenshots: Map<string, string> = new Map();
        let videoPath: string | undefined;
        let tracePath: string | undefined;

        for (const attachment of result.attachments) {
            if (attachment.contentType === 'image/png') {
                const screenshotName = `screenshot_${this.testCounter}_${screenshots.length + 1}.png`;
                const destPath = path.join('tta-report', 'screenshots', screenshotName);
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                try {
                    if (attachment.path) {
                        fs.copyFileSync(attachment.path, destPath);
                    } else if (attachment.body) {
                        fs.writeFileSync(destPath, attachment.body);
                    }
                    screenshots.push({ name: attachment.name || `Screenshot ${screenshots.length + 1}`, path: `screenshots/${screenshotName}` });
                    if (attachment.name) {
                        stepScreenshots.set(attachment.name, `screenshots/${screenshotName}`);
                    }
                } catch {
                    console.warn(`Failed to save screenshot: ${attachment.name}`);
                }
            }

            if (attachment.contentType === 'video/webm' && attachment.path) {
                const videoName = `video_${this.testCounter}.webm`;
                const destPath = path.join('tta-report', 'videos', videoName);
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                try {
                    fs.copyFileSync(attachment.path, destPath);
                    videoPath = `videos/${videoName}`;
                } catch {
                    console.warn(`Failed to copy video: ${attachment.path}`);
                }
            }

            if (attachment.name === 'trace' && attachment.path) {
                const traceName = `trace_${this.testCounter}.zip`;
                const destPath = path.join('tta-report', 'traces', traceName);
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                try {
                    fs.copyFileSync(attachment.path, destPath);
                    tracePath = `traces/${traceName}`;
                } catch {
                    console.warn(`Failed to copy trace: ${attachment.path}`);
                }
            }
        }

        // Associate screenshots with steps
        for (const step of currentTestSteps) {
            for (const [name, screenshotPath] of stepScreenshots) {
                const nameLower = name.toLowerCase();
                const titleLower = step.title.toLowerCase();

                const stepIndexPattern = `step-${step.stepIndex}-`;
                if (nameLower.startsWith(stepIndexPattern)) {
                    step.screenshot = screenshotPath;
                    break;
                }

                const stepNumPattern1 = `step_${(step.stepIndex || 0) + 1}_`;
                const stepNumPattern2 = `step ${(step.stepIndex || 0) + 1}`;
                if (nameLower.includes(stepNumPattern1) || nameLower.includes(stepNumPattern2)) {
                    step.screenshot = screenshotPath;
                    break;
                }

                const cleanedName = nameLower.replace(/step[-_]?\d+[-_:]?/i, '').trim();
                if (cleanedName && (titleLower.includes(cleanedName) || cleanedName.includes(titleLower.substring(0, 20)))) {
                    step.screenshot = screenshotPath;
                    break;
                }
            }
        }

        const describePath: string[] = [];
        let parent: Suite | undefined = test.parent;
        while (parent) {
            if (parent.title) {
                describePath.unshift(parent.title);
            }
            parent = parent.parent;
        }

        const tagMatches = test.title.match(/@\w+/g) || [];

        const testData: TestData = {
            id: `test-${test.id}`,
            title: test.title,
            fullTitle: [...describePath, test.title].join(' › '),
            file: test.location.file,
            describePath: describePath,
            location: `${test.location.file.split('/').pop()}:${test.location.line}`,
            duration: result.duration,
            status: status,
            retry: result.retry,
            screenshots: screenshots,
            steps: [...currentTestSteps],
            video: videoPath,
            trace: tracePath,
            error: result.error?.message,
            errorStack: result.error?.stack,
            tags: tagMatches,
        };

        this.testResults.push(testData);
        this.runningTests.delete(test.id);

        this.updateReportRealTime();
    }

    private updateReportRealTime(): void {
        try {
            const reportDir = path.dirname(this.outputFile);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }

            const browserName = this.config.projects[0]?.name || 'chrome';
            const platform = process.platform === 'darwin' ? 'Mac' : process.platform === 'win32' ? 'Windows' : 'Linux';

            const ctx: ReportContext = {
                testResults: this.testResults,
                suiteStats: this.suiteStats,
                startTime: this.startTime,
                endTime: new Date(),
                runId: this.runId,
                browserName: browserName,
                platform: platform,
                workers: this.config.workers,
            };

            const inProgressTests = Array.from(this.runningTests.values());
            const html = this.generator.buildLiveReport(ctx, inProgressTests);
            fs.writeFileSync(this.outputFile, html);
        } catch (error) {
            console.error('❌ Real-time report update failed:', error);
        }
    }

    async onEnd(_result: FullResult): Promise<void> {
        this.endTime = new Date();
        const duration = this.generator.formatDuration(this.endTime.getTime() - this.startTime.getTime());
        const passRate = this.suiteStats.total > 0
            ? ((this.suiteStats.passed / this.suiteStats.total) * 100).toFixed(1)
            : '0';

        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║                    📊 FINAL TEST SUMMARY                        ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  ✅ Passed:  ${String(this.suiteStats.passed).padEnd(49)}║`);
        console.log(`║  ❌ Failed:  ${String(this.suiteStats.failed).padEnd(49)}║`);
        console.log(`║  ⏭️  Skipped: ${String(this.suiteStats.skipped).padEnd(49)}║`);
        console.log(`║  📊 Total:   ${String(this.suiteStats.total).padEnd(49)}║`);
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  ⏱️  Duration: ${duration.padEnd(47)}║`);
        console.log(`║  📈 Pass Rate: ${(passRate + '%').padEnd(47)}║`);
        console.log('╚════════════════════════════════════════════════════════════════╝');

        console.log('\n📊 Generating TTA HTML Report...');
        await this.generateReport();
        console.log(`✅ Report generated: ${this.outputFile}`);
    }

    private associateLogsWithSteps(_test: TestCase, result: TestResult, testSteps: StepData[]): void {
        if (testSteps.length === 0) {return;}

        for (const step of testSteps) {
            if (!step.consoleLogs) {step.consoleLogs = [];}
        }

        for (const attachment of result.attachments) {
            const logMatch = attachment.name.match(/^step-(\d+)-logs$/);
            if (logMatch && attachment.contentType === 'text/plain') {
                const stepIndex = parseInt(logMatch[1], 10);
                if (stepIndex >= 0 && stepIndex < testSteps.length) {
                    let logContent = '';
                    if (attachment.body) {
                        logContent = Buffer.isBuffer(attachment.body)
                            ? attachment.body.toString()
                            : String(attachment.body);
                    } else if (attachment.path) {
                        try {
                            logContent = fs.readFileSync(attachment.path, 'utf-8');
                        } catch {
                            // Ignore read errors
                        }
                    }

                    if (logContent) {
                        const logs = logContent.split('\n').filter((line) => line.trim());
                        if (logs.length > 0) {
                            testSteps[stepIndex].consoleLogs = logs;
                        }
                    }
                }
            }
        }

        const stdout = result.stdout || [];
        const allLogs: string[] = [];

        for (const chunk of stdout) {
            if (typeof chunk === 'string') {
                allLogs.push(...chunk.split('\n').filter((line) => line.trim()));
            } else if (Buffer.isBuffer(chunk)) {
                allLogs.push(...chunk.toString().split('\n').filter((line) => line.trim()));
            }
        }

        const stderr = result.stderr || [];
        for (const chunk of stderr) {
            if (typeof chunk === 'string') {
                allLogs.push(...chunk.split('\n').filter((line) => line.trim()).map((line) => `[stderr] ${line}`));
            } else if (Buffer.isBuffer(chunk)) {
                allLogs.push(...chunk.toString().split('\n').filter((line) => line.trim()).map((line) => `[stderr] ${line}`));
            }
        }

        if (allLogs.length === 0) {return;}

        const stepTitlePatterns: RegExp[] = testSteps.map((step) => {
            const escaped = step.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(escaped, 'i');
        });

        const assignedLogs: boolean[] = new Array(allLogs.length).fill(false);

        for (let logIndex = 0; logIndex < allLogs.length; logIndex++) {
            const log = allLogs[logIndex];
            for (let stepIndex = 0; stepIndex < testSteps.length; stepIndex++) {
                if (stepTitlePatterns[stepIndex].test(log)) {
                    testSteps[stepIndex].consoleLogs!.push(log);
                    assignedLogs[logIndex] = true;
                    break;
                }
            }
        }

        const unassignedLogs = allLogs.filter((_, idx) => !assignedLogs[idx]);

        if (unassignedLogs.length > 0 && testSteps.length > 0) {
            const stepsNeedingLogs = testSteps.filter((s) => s.consoleLogs!.length === 0);

            if (stepsNeedingLogs.length > 0) {
                const logsPerStep = Math.ceil(unassignedLogs.length / testSteps.length);
                let logIdx = 0;

                for (let stepIdx = 0; stepIdx < testSteps.length && logIdx < unassignedLogs.length; stepIdx++) {
                    const step = testSteps[stepIdx];
                    const logsForThisStep = Math.min(logsPerStep, unassignedLogs.length - logIdx);

                    if (step.consoleLogs!.length === 0) {
                        for (let i = 0; i < logsForThisStep; i++) {
                            step.consoleLogs!.push(unassignedLogs[logIdx++]);
                        }
                    }
                }
            } else {
                testSteps[0].consoleLogs!.push(...unassignedLogs);
            }
        }
    }

    private async generateReport(): Promise<void> {
        const reportDir = path.dirname(this.outputFile);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const browserName = this.config.projects[0]?.name || 'chrome';
        const platform = process.platform === 'darwin' ? 'Mac' : process.platform === 'win32' ? 'Windows' : 'Linux';

        const ctx: ReportContext = {
            testResults: this.testResults,
            suiteStats: this.suiteStats,
            startTime: this.startTime,
            endTime: this.endTime,
            runId: this.runId,
            browserName: browserName,
            platform: platform,
            workers: this.config.workers,
        };

        const html = this.generator.buildReport(ctx);
        fs.writeFileSync(this.outputFile, html);

        const indexPath = path.join(reportDir, 'index.html');
        const latestRedirect = `<!DOCTYPE html>
<html><head><meta http-equiv="refresh" content="0;url=${path.basename(this.outputFile)}">
<title>TTA Report - Latest</title></head>
<body><p>Redirecting to <a href="${path.basename(this.outputFile)}">latest report</a>...</p></body></html>`;
        fs.writeFileSync(indexPath, latestRedirect);

        const historyHtml = this.generator.buildHistoryPage(reportDir);
        fs.writeFileSync(path.join(reportDir, 'history.html'), historyHtml);
    }
}
