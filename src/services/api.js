// ========================================
// LUMBER BOSS - API SERVICE
// Fetch wrapper for product data
// ========================================

const BASE_URL = '../data';

/**
 * Fetch all products from the mock data
 * @returns {Promise<{products: Array, categories: Array}>}
 */
export async function fetchProducts() {
    const response = await fetch(`${BASE_URL}/products.json`);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
}

/**
 * Fetch a single product by SKU
 * @param {string} sku - Product SKU
 * @returns {Promise<Object|undefined>}
 */
export async function fetchProduct(sku) {
    const data = await fetchProducts();
    return data.products.find(p => p.sku === sku);
}

/**
 * Fetch all categories
 * @returns {Promise<Array>}
 */
export async function fetchCategories() {
    const data = await fetchProducts();
    return data.categories;
}
