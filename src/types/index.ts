/**
 * Shared domain types used across the framework.
 *
 * This is the single source of truth for all entity types.
 * API response types, page object types, and test data types
 * should all derive from these canonical definitions.
 */

// ============================================
// USER TYPES
// ============================================

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
    createdAt?: string;
}

export interface ValidUser extends User {
    username: string;
    password: string;
}

export interface InvalidUser {
    username: string;
    password: string;
    expectedError: string;
}

export interface NewUserTemplate {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LockedUser {
    username: string;
    password: string;
    expectedError: string;
}

export interface UsersData {
    validUsers: ValidUser[];
    invalidUsers: InvalidUser[];
    newUserTemplate: NewUserTemplate;
    lockedUser: LockedUser;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    rating: number;
    reviewCount?: number;
    images?: string[];
    sizes?: string[];
    colors?: string[];
}

export interface OutOfStockProduct extends Omit<Product, 'sizes' | 'colors'> {
    stock: 0;
}

export interface PromoCode {
    code: string;
    discount: number;
    type: string;
    minOrder: number;
    expired?: boolean;
}

export interface ProductsData {
    products: Product[];
    outOfStockProduct: OutOfStockProduct;
    categories: string[];
    promoCodes: PromoCode[];
}

// ============================================
// ORDER TYPES
// ============================================

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}
