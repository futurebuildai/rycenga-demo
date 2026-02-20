import { client } from '../client';
import type { Order, OrderSummary, Invoice, Quote, OrderLine, QuoteLine } from '../types/domain';

interface PagingOptions {
    limit?: number;
    offset?: number;
    accountId?: number;
    JobId?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
}

export const SalesService = {
    // Maps to GET /orders
    getOrders: ({ limit = 25, offset = 0, accountId, JobId }: PagingOptions = {}) => {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
        });
        if (typeof accountId === 'number') {
            params.set('account_id', String(accountId));
        }
        if (typeof JobId === 'number') {
            params.set('JobId', String(JobId));
        }
        return client.request<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
    },

    // Maps to GET /orders/{id}
    getOrderDetails: (orderId: number) =>
        client.request<Order>(`/orders/${orderId}`),

    // Maps to GET /order-summaries
    getOrderSummaries: ({ limit = 25, offset = 0, accountId, JobId }: PagingOptions = {}) => {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
        });
        if (typeof accountId === 'number') {
            params.set('account_id', String(accountId));
        }
        if (typeof JobId === 'number') {
            params.set('JobId', String(JobId));
        }
        return client.request<PaginatedResponse<OrderSummary>>(`/order-summaries?${params.toString()}`);
    },

    // Maps to GET /invoices
    getInvoices: (limit = 200, offset = 0, JobId?: number, status?: string) => {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
        });
        if (typeof JobId === 'number') {
            params.set('JobId', String(JobId));
        }
        if (status) {
            params.set('status', status);
        }
        return client.request<{ items: Invoice[]; total: number }>(`/invoices?${params.toString()}`);
    },

    // Maps to GET /invoices/{id}
    getInvoiceDetails: (invoiceId: number) =>
        client.request<Invoice>(`/invoices/${invoiceId}`),

    // Maps to GET /v1/quotes
    getQuotes: ({ limit = 25, offset = 0, accountId, JobId }: PagingOptions = {}) => {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
        });
        if (typeof accountId === 'number') {
            params.set('account_id', String(accountId));
        }
        if (typeof JobId === 'number') {
            params.set('JobId', String(JobId));
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
