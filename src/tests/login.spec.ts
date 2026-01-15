import { test, expect } from '../fixtures';
import { LoginModule } from '../modules/LoginModule';
import usersData from '../testdata/users.json';
import { UsersData, InvalidUser } from '../testdata/types';

const typedUsersData = usersData as UsersData;
const validUser = typedUsersData.validUsers[0];
const invalidUsers: InvalidUser[] = typedUsersData.invalidUsers;

test.describe('Login Feature', () => {
    let loginModule: LoginModule;

    test.beforeEach(async ({ page }) => {
        loginModule = new LoginModule(page);
    });

    test.describe('Valid Login Scenarios', () => {
        test('should login successfully with valid credentials', async ({ page }) => {
            await loginModule.doLogin(validUser.username, validUser.password);

            await loginModule.verifyLoggedIn();
            expect(page.url()).toContain('/home');
        });

        test('should login with remember me option', async ({ page }) => {
            await loginModule.doLoginWithRememberMe(validUser.username, validUser.password);

            await loginModule.verifyLoggedIn();
            expect(page.url()).toContain('/home');
        });

        test('should logout successfully', async ({ page }) => {
            // First login
            await loginModule.doLogin(validUser.username, validUser.password);
            await loginModule.verifyLoggedIn();

            // Then logout
            await loginModule.doLogout();
            await loginModule.verifyLoggedOut();
        });
    });

    test.describe('Invalid Login Scenarios', () => {
        test('should show error with invalid credentials', async () => {
            const invalidUser = invalidUsers[0];
            const errorMessage = await loginModule.attemptInvalidLogin(
                invalidUser.username,
                invalidUser.password,
            );

            expect(errorMessage).toContain(invalidUser.expectedError);
        });

        test('should show error when username is empty', async () => {
            const emptyUsername = invalidUsers.find((u: InvalidUser) => u.username === '');
            if (emptyUsername) {
                const errorMessage = await loginModule.attemptInvalidLogin(
                    emptyUsername.username,
                    emptyUsername.password,
                );

                expect(errorMessage).toContain(emptyUsername.expectedError);
            }
        });

        test('should show error when password is empty', async () => {
            const emptyPassword = invalidUsers.find((u: InvalidUser) => u.password === '');
            if (emptyPassword) {
                const errorMessage = await loginModule.attemptInvalidLogin(
                    emptyPassword.username,
                    emptyPassword.password,
                );

                expect(errorMessage).toContain(emptyPassword.expectedError);
            }
        });
    });

    test.describe('Login Page Elements', () => {
        test('should display login form elements', async ({ loginPage }) => {
            await loginPage.navigate();

            await loginPage.expectUsernameFieldVisible();
            await loginPage.expectPasswordFieldVisible();
            await loginPage.expectLoginButtonEnabled();
        });

        test('should navigate to forgot password page', async () => {
            await loginModule.goToForgotPassword();
        });

        test('should navigate to sign up page', async () => {
            await loginModule.goToSignUp();
        });
    });
});

test.describe('Login - Using Fixtures', () => {
    test('should show user avatar when logged in', async ({ authenticatedPage }) => {
        // Page is already logged in via fixture
        const userAvatar = authenticatedPage.locator('[data-testid="user-avatar"]');
        await expect(userAvatar).toBeVisible();
    });

    test('should display correct username after login', async ({ authenticatedPage }) => {
        const usernameDisplay = authenticatedPage.locator('[data-testid="username-display"]');
        await expect(usernameDisplay).toBeVisible();
    });
});

