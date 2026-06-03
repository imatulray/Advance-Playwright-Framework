/**
 * Test data type definitions.
 *
 * These types are now sourced from the shared `src/types` module
 * so that test data types, API types, and module types stay in sync.
 *
 * Re-exported here to keep existing imports working without changes.
 */
export type {
    ValidUser,
    InvalidUser,
    NewUserTemplate,
    LockedUser,
    UsersData,
    Product,
    OutOfStockProduct,
    PromoCode,
    ProductsData,
} from '../types';
