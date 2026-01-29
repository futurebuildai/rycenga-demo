import { client } from '../client';
import type {
    PaymentMethod,
    PaymentMethodCreatePayload,
    PaymentConfig,
    PaymentTransaction,
    Statement,
    PayInvoicePayload,
    PaymentPayload,
    InvoiceLine
} from '../types/domain';

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
     * Remove a payment method
     * MAPS TO: DELETE /payment-methods/{id}
     */
    removePaymentMethod: (paymentMethodId: number): Promise<void> =>
        client.request<void>(`/payment-methods/${paymentMethodId}`, {
            method: 'DELETE',
        }),

    // /**
    //  * Set a payment method as the default
    //  * MAPS TO: PUT /payment-methods/{id}/default
    //  *
    //  * TODO: [L7 AUDIT] Backend endpoint NOT IMPLEMENTED
    //  * Backend team must add PUT /v1/payment-methods/{id}/default to router.go
    //  * Currently only GET, POST, DELETE exist for /payment-methods (router.go:260-284)
    //  */
    // setDefaultPaymentMethod: (paymentMethodId: number): Promise<PaymentMethod> =>
    //     client.request<PaymentMethod>(`/payment-methods/${paymentMethodId}/default`, {
    //         method: 'PUT',
    //     }),

    /**
     * Create a payment
     * MAPS TO: POST /v1/payments
     */
    createPayment: (payload: PaymentPayload): Promise<PaymentTransaction> =>
        client.request<PaymentTransaction>('/payments', {
            method: 'POST',
            headers: {
                'Idempotency-Key': crypto.randomUUID(),
            },
            body: JSON.stringify(payload),
        }),

    // /**
    //  * @deprecated Use `createPayment` with `type: 'invoice'` instead.
    //  * Pay an invoice
    //  * MAPS TO: POST /invoices/{invoiceId}/pay
    //  *
    //  * TODO: [L7 AUDIT] Backend endpoint NOT IMPLEMENTED
    //  * Backend team must add POST /v1/invoices/{id}/pay to router.go
    //  * No /invoices/{id}/pay route currently exists in backend
    //  */
    // payInvoice: (invoiceId: number, payload: PayInvoicePayload): Promise<void> =>
    //     client.request<void>(`/invoices/${invoiceId}/pay`, {
    //         method: 'POST',
    //         body: JSON.stringify(payload),
    //     }),

    /**
     * Get line items for an invoice
     * MAPS TO: GET /v1/invoices/{id}/lines
     */
    getInvoiceLines: (invoiceId: number): Promise<InvoiceLine[]> =>
        client.request<InvoiceLine[]>(`/invoices/${invoiceId}/lines`),

    /**
     * Get payment config for SDK initialization
     * MAPS TO: GET /payment-config
     */
    getPaymentConfig: (): Promise<PaymentConfig> =>
        client.request<PaymentConfig>('/payment-config'),

    /**
     * Create a payment method with tokenized data
     * MAPS TO: POST /payment-methods
     */
    createPaymentMethod: (data: PaymentMethodCreatePayload): Promise<PaymentMethod> =>
        client.request<PaymentMethod>('/payment-methods', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * Get payment transaction history
     * MAPS TO: GET /payments
     */
    getPaymentHistory: (): Promise<PaymentTransaction[]> =>
        client.request<PaymentTransaction[]>('/payments'),

    /**
     * Get account statements
     * MAPS TO: GET /statements
     */
    getStatements: (): Promise<Statement[]> =>
        client.request<Statement[]>('/statements'),
};
