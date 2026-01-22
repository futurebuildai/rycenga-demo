import { client } from '../client';
import type { Order, Invoice, Quote } from '../types/domain';

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

    // Maps to GET /quotes
    getQuotes: () =>
        client.request<Quote[]>('/quotes'),

    getQuoteDetails: (quoteId: number) =>
        client.request<Quote>(`/quotes/${quoteId}`),
};
