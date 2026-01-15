import { client } from '../client';

// Assuming basic product type until strictly defined
export interface Product {
    id: number;
    sku: string;
    name: string;
    description?: string;
    price: number;
    stockLevel: number;
    imageUrl?: string;
    category?: string;
}

export const CatalogService = {
    getProducts: (query?: string) =>
        client.request<Product[]>(`/products${query ? `?q=${query}` : ''}`),

    getProductDetails: (productId: number) =>
        client.request<Product>(`/products/${productId}`),

    getCategories: () =>
        client.request<string[]>('/products/categories'),
};
