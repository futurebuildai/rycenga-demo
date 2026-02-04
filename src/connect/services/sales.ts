import { client } from '../client';
import type { Order, Invoice, Quote, OrderLine, QuoteLine } from '../types/domain';

interface PagingOptions {
    limit?: number;
    offset?: number;
    accountId?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
}

export const SalesService = {
    // Maps to GET /orders
    getOrders: ({ limit = 25, offset = 0, accountId }: PagingOptions = {}) => {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
        });
        if (typeof accountId === 'number') {
            params.set('account_id', String(accountId));
        }
        return client.request<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
    },

    // Maps to GET /orders/{id}
    getOrderDetails: (orderId: number) =>
        client.request<Order>(`/orders/${orderId}`),

    // Maps to GET /invoices
    getInvoices: (limit = 1000, offset = 0) =>
        client.request<{ items: Invoice[]; total: number }>(`/invoices?limit=${limit}&offset=${offset}`),

    // Maps to GET /v1/quotes
    getQuotes: ({ limit = 25, offset = 0, accountId }: PagingOptions = {}) => {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
        });
        if (typeof accountId === 'number') {
            params.set('account_id', String(accountId));
        }
        return client.request<PaginatedResponse<Quote>>(`/quotes?${params.toString()}`);
    },

    getQuoteDetails: (quoteId: number) =>
        client.request<Quote>(`/quotes/${quoteId}`),

    // Maps to GET /v1/quotes/{id}/lines
    getQuoteLines: (quoteId: number) =>
        client.request<QuoteLine[]>(`/quotes/${quoteId}/lines`),

    // Maps to GET /v1/orders/{id}/lines
    getOrderLines: (orderId: number) =>
        client.request<OrderLine[]>(`/orders/${orderId}/lines`),
};
