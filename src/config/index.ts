import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface TestUser {
    username: string;
    password: string;
}

export interface ApiConfig {
    baseUrl: string;
    timeout: number;
}

export interface AppConfig {
    baseUrl: string;
    apiBaseUrl: string;
    apiTimeout: number;
    testUser: TestUser;
    logLevel: string;
    retryCount: number;
    defaultTimeout: number;
}

/**
 * Returns environment-specific URL/retry overrides based on NODE_ENV.
 * Values are always driven by environment variables first.
 */
function getEnvironmentConfig(): Partial<AppConfig> {
    const environment = process.env.NODE_ENV || 'development';

    switch (environment) {
        case 'production':
            return {
                baseUrl: process.env.PROD_BASE_URL || 'https://app.example.com',
                apiBaseUrl: process.env.PROD_API_URL || 'https://api.example.com',
                retryCount: 5,
            };
        case 'staging':
            return {
                baseUrl: process.env.STAGING_BASE_URL || 'https://staging.example.com',
                apiBaseUrl: process.env.STAGING_API_URL || 'https://staging-api.example.com',
                retryCount: 3,
            };
        case 'development':
        default:
            return {
                baseUrl: 'http://localhost:3000',
                apiBaseUrl: 'http://localhost:3000/api',
                retryCount: 2,
            };
    }
}

/**
 * Application configuration.
 *
 * Base values come from environment variables (or .env file).
 * Environment-specific URL/retry overrides (NODE_ENV=staging|production)
 * are merged on top, but testUser credentials always come from env vars.
 */
const _testUser: TestUser = {
    username: process.env.TEST_USERNAME || '',
    password: process.env.TEST_PASSWORD || '',
};

export const config: AppConfig = Object.assign(
    {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
        apiTimeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
        defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000', 10),
        testUser: _testUser,
        logLevel: process.env.LOG_LEVEL || 'INFO',
        retryCount: parseInt(process.env.RETRY_COUNT || '3', 10),
    },
    // Apply environment-specific URL + retryCount overrides
    getEnvironmentConfig(),
    // testUser always wins — env vars take priority over any env override
    { testUser: _testUser },
);

/**
 * Static test data (non-sensitive fixtures used in tests)
 */
export const testData = {
    validCreditCard: {
        number: '4111111111111111',
        expiry: '12/25',
        cvc: '123',
        holder: 'Test User',
    },
    invalidCreditCard: {
        number: '4111111111111112',
        expiry: '12/20',
        cvc: '999',
        holder: 'Invalid User',
    },
    addresses: {
        us: {
            street: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US',
        },
        uk: {
            street: '10 Downing Street',
            city: 'London',
            state: '',
            zip: 'SW1A 2AA',
            country: 'GB',
        },
    },
};

export default config;
