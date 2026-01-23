import { client } from '../client';
import type { Order, Invoice, Quote, OrderLine, QuoteLine } from '../types/domain';

export const SalesService = {
    // Maps to GET /orders
    getOrders: () =>
        client.request<Order[]>('/orders'),

    // Maps to GET /orders/{id}
    getOrderDetails: (orderId: number) =>
        client.request<Order>(`/orders/${orderId}`),

    // Maps to GET /invoices
    getInvoices: () =>
        client.request<Invoice[]>('/invoices'),

    // Maps to GET /v1/quotes
    getQuotes: () =>
        client.request<Quote[]>('/quotes'),

    getQuoteDetails: (quoteId: number) =>
        client.request<Quote>(`/quotes/${quoteId}`),

    // Maps to GET /v1/quotes/{id}/lines
    getQuoteLines: (quoteId: number) =>
        client.request<QuoteLine[]>(`/quotes/${quoteId}/lines`),

    // Maps to GET /v1/orders/{id}/lines
    getOrderLines: (orderId: number) =>
        client.request<OrderLine[]>(`/orders/${orderId}/lines`),
};
