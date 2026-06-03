/**
 * Sample Test Suite for The Testing Academy
 * @description Demo tests to showcase CustomTTAReporter functionality
 * @author Pramod Dutta
 * @website https://thetestingacademy.com
 */

import { test, expect } from '../fixtures';

test.describe('@P0 @Smoke @TTA The Testing Academy - Sample Tests', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to The Testing Academy website
        await page.goto('https://thetestingacademy.com');
    });

    test('@P0 should load homepage successfully', async ({ page }) => {
        await test.step('Verify page title', async () => {
            await expect(page).toHaveTitle(/.+/);
        });

        await test.step('Verify page URL', async () => {
            expect(page.url()).toContain('thetestingacademy');
        });

        await test.step('Take screenshot of homepage', async () => {
            await page.screenshot({ path: 'tta-report/screenshots/homepage.png' });
        });
    });

    test('@P1 should display main navigation', async ({ page }) => {
        await test.step('Verify header is visible', async () => {
            const header = page.locator('header').first();
            await expect(header).toBeVisible({ timeout: 10000 });
        });

        await test.step('Verify navigation exists', async () => {
            const nav = page.locator('nav').first();
            await expect(nav).toBeVisible({ timeout: 10000 });
        });
    });

    test('@P1 should have proper SEO elements', async ({ page }) => {
        await test.step('Check meta description exists', async () => {
            const metaDesc = page.locator('meta[name="description"]');
            await expect(metaDesc).toHaveAttribute('content', /.+/);
        });

        await test.step('Check Open Graph title exists', async () => {
            const ogTitle = page.locator('meta[property="og:title"]');
            await expect(ogTitle).toHaveAttribute('content', /.+/);
        });

        await test.step('Verify favicon exists', async () => {
            const favicon = page.locator('link[rel*="icon"]').first();
            await expect(favicon).toHaveAttribute('href', /.+/);
        });
    });

    test('@P2 should be responsive', async ({ page }) => {
        await test.step('Test desktop viewport', async () => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            const body = page.locator('body');
            await expect(body).toBeVisible();
        });

        await test.step('Test tablet viewport', async () => {
            await page.setViewportSize({ width: 768, height: 1024 });
            const body = page.locator('body');
            await expect(body).toBeVisible();
        });

        await test.step('Test mobile viewport', async () => {
            await page.setViewportSize({ width: 375, height: 667 });
            const body = page.locator('body');
            await expect(body).toBeVisible();
        });
    });

    test('@P1 should measure page performance', async ({ page }) => {
        await test.step('Measure page load time', async () => {
            const startTime = Date.now();
            await page.goto('https://thetestingacademy.com');
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;
            expect(loadTime).toBeLessThan(10000); // 10 seconds max
        });

        await test.step('Check for JavaScript errors', async () => {
            const errors: string[] = [];
            page.on('pageerror', (error) => errors.push(error.message));
            // Wait for any late-firing JS errors using a locator-based wait
            await expect(page.locator('body')).toBeVisible();
            expect(errors.length).toBe(0);
        });
    });
});

test.describe('@P2 @Regression TTA - Additional Checks', () => {
    
    test('@P2 should verify footer content', async ({ page }) => {
        await page.goto('https://thetestingacademy.com');
        
        await test.step('Scroll to footer', async () => {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        });

        await test.step('Verify footer exists', async () => {
            const footer = page.locator('footer').first();
            await expect(footer).toBeVisible({ timeout: 10000 });
        });

        await test.step('Take footer screenshot', async () => {
            await page.screenshot({ path: 'tta-report/screenshots/footer.png', fullPage: false });
        });
    });
});
