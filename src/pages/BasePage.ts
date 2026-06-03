import { expect, Page } from '@playwright/test';

/**
 * Abstract base class for all Page Objects.
 *
 * Centralises:
 *  - The `page` dependency injection
 *  - Cross-cutting helpers (waitForPageReady, takeScreenshot, etc.)
 *  - Common assertion utilities
 *
 * Every new page object should extend BasePage instead of
 * re-declaring `private page: Page` and its constructor manually.
 */
export abstract class BasePage {
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // NAVIGATION
    // ============================================

    /**
     * Navigate to the page's URL.
     * Override in subclasses to provide the specific path.
     */
    abstract navigate(...args: unknown[]): Promise<void>;

    // ============================================
    // SHARED HELPERS
    // ============================================

    /**
     * Wait for DOM content to be loaded (fast, reliable alternative to networkidle)
     */
    async waitForPageReady(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Take a screenshot and save it under tta-report/screenshots/<name>.png
     */
    async takeScreenshot(name: string): Promise<void> {
        await this.page.screenshot({ path: `tta-report/screenshots/${name}.png` });
    }

    /**
     * Get the current page URL
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Get the current page title
     */
    async getPageTitle(): Promise<string> {
        return this.page.title();
    }

    // ============================================
    // SHARED ASSERTIONS
    // ============================================

    /**
     * Assert that the page URL contains the given substring
     */
    async expectUrlContains(urlPart: string): Promise<void> {
        await expect(this.page).toHaveURL(new RegExp(urlPart));
    }

    /**
     * Assert that the page has the given title
     */
    async expectTitle(titlePattern: string | RegExp): Promise<void> {
        await expect(this.page).toHaveTitle(titlePattern);
    }
}
