// eslint.config.mjs — ESLint v9 flat config (ESM required)
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import playwrightPlugin from 'eslint-plugin-playwright';

export default [
    // TypeScript source files
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                project: './tsconfig.json',
            },
            globals: {
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            playwright: playwrightPlugin,
        },
        rules: {
            // TypeScript rules
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',

            // General JS rules
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',
            'no-var': 'error',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],

            // Playwright-specific rules
            'playwright/no-focused-test': 'error',
            // test.skip() is intentionally used when test data is missing — see analysis item #4
            'playwright/no-skipped-test': 'off',
            'playwright/valid-expect': 'error',
            // Note: Tests asserting through module methods (module.verifyXxx) can't be
            // statically resolved by this plugin. Downgraded to 'warn' to avoid false positives.
            'playwright/expect-expect': [
                'warn',
                {
                    assertFunctionNames: [
                        'expect',
                        // LoginModule assertions
                        'verifyLoggedIn',
                        'verifyLoginError',
                        'verifyNotLoggedIn',
                        // ProductModule assertions
                        'verifyProductInCart',
                        'verifyCartCount',
                        'verifyProductDetails',
                        // CheckoutModule assertions
                        'verifyReadyToPlaceOrder',
                        'verifyOrderConfirmation',
                        'verifyCheckoutError',
                        // Katalon page object assertions
                        'expectPageLoaded',
                        'expectBrandHeadingVisible',
                        'expectMakeAppointmentButtonVisible',
                        'expectToggleNavigationVisible',
                        'expectSidebarMenuVisible',
                        'expectSidebarMenuItems',
                        'expectOnLoginPage',
                        'expectUsernameFieldVisible',
                        'expectPasswordFieldVisible',
                        'expectLoginButtonVisible',
                        'expectPasswordFieldMasked',
                        'expectOnConfirmationPage',
                    ],
                },
            ],
            'playwright/no-wait-for-timeout': 'warn',
            'playwright/no-force-option': 'warn',
        },
    },

    // Ignore generated / third-party directories
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'playwright-report/**',
            'test-results/**',
            'tta-report/**',
            'scripts/**',
        ],
    },
];
