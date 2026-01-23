import { client } from '../client';
import type { PaymentMethod, PayInvoicePayload, InvoiceLine } from '../types/domain';

/**
 * BillingService - Payment methods and invoice payments
 * MAPS TO: /payment-methods and /invoices/{id}/pay endpoints
 */
export const BillingService = {
    /**
     * Get all payment methods for the account
     * MAPS TO: GET /payment-methods
     */
    getPaymentMethods: (): Promise<PaymentMethod[]> =>
        client.request<PaymentMethod[]>('/payment-methods'),

    /**
     * Add a new payment method
     * MAPS TO: POST /payment-methods
     * Note: In production, this would involve a tokenized payment form (Stripe, etc.)
     */
    addPaymentMethod: (data: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> =>
        client.request<PaymentMethod>('/payment-methods', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * Remove a payment method
     * MAPS TO: DELETE /payment-methods/{id}
     */
    removePaymentMethod: (paymentMethodId: string): Promise<void> =>
        client.request<void>(`/payment-methods/${paymentMethodId}`, {
            method: 'DELETE',
        }),

    /**
     * Set a payment method as the default
     * MAPS TO: PUT /payment-methods/{id}/default
     */
    setDefaultPaymentMethod: (paymentMethodId: string): Promise<PaymentMethod> =>
        client.request<PaymentMethod>(`/payment-methods/${paymentMethodId}/default`, {
            method: 'PUT',
        }),

    /**
     * Pay an invoice
     * MAPS TO: POST /invoices/{invoiceId}/pay
     */
    payInvoice: (invoiceId: number, payload: PayInvoicePayload): Promise<void> =>
        client.request<void>(`/invoices/${invoiceId}/pay`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    /**
     * Get line items for an invoice
     * MAPS TO: GET /v1/invoices/{id}/lines
     */
    getInvoiceLines: (invoiceId: number): Promise<InvoiceLine[]> =>
        client.request<InvoiceLine[]>(`/invoices/${invoiceId}/lines`),
};
