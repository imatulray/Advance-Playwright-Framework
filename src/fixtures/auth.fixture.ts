import { test as base, Page, BrowserContext } from '@playwright/test';
import { LoginModule } from '../modules/LoginModule';
import { config } from '../config';

export interface AuthFixture {
    authenticatedPage: Page;
    authenticatedContext: BrowserContext;
}

/**
 * Create a fixture with pre-authenticated page
 */
export const authTest = base.extend<AuthFixture>({
    /**
     * Pre-authenticated browser context
     */
    authenticatedContext: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Delegate to LoginModule (single source of truth)
        const loginModule = new LoginModule(page);
        await loginModule.doLogin(config.testUser.username, config.testUser.password);

        // Store authentication state for reuse
        await context.storageState({ path: '.auth/user.json' });

        await use(context);
        await context.close();
    },

    /**
     * Pre-authenticated page fixture
     */
    authenticatedPage: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Delegate to LoginModule (single source of truth)
        const loginModule = new LoginModule(page);
        await loginModule.doLogin(config.testUser.username, config.testUser.password);

        await use(page);
        await context.close();
    },
});

/**
 * Create a fixture using stored authentication state
 */
export const authenticatedTest = base.extend<{ page: Page }>({
    page: async ({ browser }, use) => {
        try {
            // Try to use stored auth state
            const context = await browser.newContext({
                storageState: '.auth/user.json',
            });
            const page = await context.newPage();
            await use(page);
            await context.close();
        } catch {
            // Fall back to fresh login if no stored state
            const context = await browser.newContext();
            const page = await context.newPage();

            const loginModule = new LoginModule(page);
            await loginModule.doLogin(config.testUser.username, config.testUser.password);

            await use(page);
            await context.close();
        }
    },
});


