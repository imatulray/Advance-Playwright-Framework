import { test, expect } from '../fixtures';
import { ProductModule } from '../modules/ProductModule';
import productsData from '../testdata/products.json';
import { ProductsData, Product } from '../testdata/types';

const typedProductsData = productsData as ProductsData;
const products: Product[] = typedProductsData.products;
const outOfStockProduct = typedProductsData.outOfStockProduct;

test.describe('Product Feature', () => {
    let productModule: ProductModule;

    test.beforeEach(async ({ page }) => {
        productModule = new ProductModule(page);
    });

    test.describe('Product Details', () => {
        test('should display product details correctly', async () => {
            const testProduct = products[0];
            const details = await productModule.getProductDetails(testProduct.id);

            expect(details.title).toBe(testProduct.name);
            expect(details.price).toContain(testProduct.price.toString());
        });

        test('should show in-stock status for available products', async () => {
            const testProduct = products[0];
            const inStock = await productModule.verifyProductInStock(testProduct.id);

            expect(inStock).toBe(true);
        });

        test('should show out-of-stock status for unavailable products', async () => {
            const inStock = await productModule.verifyProductInStock(outOfStockProduct.id);

            expect(inStock).toBe(false);
        });
    });

    test.describe('Add to Cart', () => {
        test('should add product to cart with default quantity', async () => {
            const testProduct = products[0];
            await productModule.addProductToCart(testProduct.id);
        });

        test('should add product to cart with custom quantity', async () => {
            const testProduct = products[0];
            await productModule.addProductToCart(testProduct.id, { quantity: 3 });
        });

        test('should add product to cart with size selection', async () => {
            const clothingProduct = products.find((p: Product) => p.sizes && p.sizes.length > 0);
            if (clothingProduct && clothingProduct.sizes) {
                await productModule.addProductToCart(clothingProduct.id, {
                    size: clothingProduct.sizes[0],
                    quantity: 1,
                });
            }
        });

        test('should add product to cart with color selection', async () => {
            const colorProduct = products.find((p: Product) => p.colors && p.colors.length > 0);
            if (colorProduct && colorProduct.colors) {
                await productModule.addProductToCart(colorProduct.id, {
                    color: colorProduct.colors[0],
                    quantity: 1,
                });
            }
        });

        test('should verify add to cart is available', async () => {
            const testProduct = products[0];
            await productModule.verifyCanAddToCart(testProduct.id);
        });
    });

    test.describe('Buy Now', () => {
        test('should redirect to checkout when clicking buy now', async () => {
            const testProduct = products[0];
            await productModule.buyProductNow(testProduct.id);
        });

        test('should redirect to checkout with selected options', async () => {
            const clothingProduct = products.find(
                (p: Product) => p.sizes && p.sizes.length > 0 && p.colors && p.colors.length > 0
            );
            if (clothingProduct && clothingProduct.sizes && clothingProduct.colors) {
                await productModule.buyProductNow(clothingProduct.id, {
                    size: clothingProduct.sizes[0],
                    color: clothingProduct.colors[0],
                    quantity: 2,
                });
            }
        });
    });

    test.describe('Wishlist', () => {
        test('should add product to wishlist', async () => {
            const testProduct = products[0];
            await productModule.addProductToWishlist(testProduct.id);
        });
    });

    test.describe('Product Search', () => {
        test('should search for products by name', async () => {
            await productModule.searchProducts('Headphones');
        });

        test('should search for products by category', async () => {
            await productModule.searchProducts('Electronics');
        });
    });
});

test.describe('Product - Using Page Object Fixtures', () => {
    test('should display product page elements', async ({ productPage }) => {
        const testProduct = products[0];
        await productPage.navigate(testProduct.id);

        await productPage.expectProductTitleVisible();
        await productPage.expectProductImageVisible();
        await productPage.expectAddToCartEnabled();
    });

    test('should get product rating', async ({ productPage }) => {
        const testProduct = products[0];
        await productPage.navigate(testProduct.id);

        const rating = await productPage.getRating();
        expect(rating).toBeTruthy();
    });
});

