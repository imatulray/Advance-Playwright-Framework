/**
 * API Layer — HTTP clients for interacting with back-end services directly.
 *
 * Intended uses:
 *  - Setting up test preconditions via API (e.g. create a user before a UI login test)
 *  - Asserting back-end state after a UI action
 *  - Writing pure API/contract tests
 *
 * These classes are NOT yet used by any spec file. To integrate:
 *   1. Inject `request` from Playwright fixtures into the API class constructor
 *   2. Use in a test's beforeEach to seed data, then verify via the UI
 *
 * @example
 *   const authApi = new AuthApi(request, config.apiBaseUrl);
 *   const { token } = await authApi.login(username, password);
 */
export { AuthApi, LoginResponse, UserProfile, RegisterRequest, RegisterResponse } from './AuthApi';
export { ProductApi, Product, ProductListResponse, ProductSearchParams, Review } from './ProductApi';
export { OrderApi, Order, OrderItem, ShippingAddress, CreateOrderRequest, OrderListResponse } from './OrderApi';

