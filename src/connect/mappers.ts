import type { Job, Quote, Order as BackendOrder, Invoice as BackendInvoice, OrderLine as BackendOrderLine, QuoteLine as BackendQuoteLine } from './types/domain';
import type { Project, Estimate, Order, Invoice, OrderLine, InvoiceLine } from '../types/index';

/**
 * Maps Backend Job to Legacy Frontend Project
 * Extracts address from nested Job.address or first addresses[] entry
 */
export const mapJobToProject = (job: Job): Project => {
    // Get primary address from address field or first entry in addresses array
    const addr = job.address ?? job.addresses?.[0];

    return {
        id: job.id.toString(),
        userId: 'current', // Placeholder as legacy FE expects it
        name: job.name,
        status: job.isActive ? 'active' : 'archived',
        address: addr ? {
            street: addr.addressLine1 || '',
            city: addr.city || '',
            state: addr.state || '',
            zip: addr.postalCode || ''
        } : undefined
    };
};

/**
 * Maps Backend Quote to Legacy Frontend Estimate
 */
export const mapQuoteToEstimate = (quote: Quote): Estimate => ({
    id: quote.id,
    estimateNumber: quote.quoteNumber,
    status: ((): Estimate['status'] => {
        switch (quote.status) {
            case 'draft':
            case 'sent':
            case 'viewed':
            case 'converted': return 'sent';
            case 'accepted': return 'accepted';
            case 'rejected': return 'rejected';
            case 'expired': return 'expired';
            default: return 'sent'; // Fallback to sent if status is unknown/draft
        }
    })(),
    total: quote.total,
    validUntil: quote.expiresOn || new Date(Date.now() + 86400000 * 30).toISOString(),
});

/**
 * Maps Backend Order to Legacy Frontend Order
 */
export const mapOrderToLegacy = (order: BackendOrder): Order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    userId: 'current',
    projectId: order.jobId?.toString() ?? null,
    status: order.status,
    total: order.total,
    createdAt: order.orderDate,
    poNumber: order.poNumber ?? null,
    lines: [], // Lines fetched separately via /orders/{id}/lines
});

/**
 * Maps Backend Invoice to Legacy Frontend Invoice
 */
export const mapInvoiceToLegacy = (invoice: BackendInvoice): Invoice => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    projectId: null,
    status: invoice.status as Invoice['status'],
    dueDate: invoice.dueDate,
    total: invoice.total,
    amountDue: invoice.balanceDue,
    amountPaid: invoice.total - invoice.balanceDue,
    createdAt: invoice.invoiceDate,
});

/**
 * Maps Backend OrderLine/QuoteLine to Legacy Frontend OrderLine
 */
export const mapOrderLineToLegacy = (line: BackendOrderLine | BackendQuoteLine): OrderLine => ({
    id: line.id.toString(),
    productId: '0', // Not present in backend, using placeholder
    sku: line.itemCode,
    name: line.description || '',
    quantity: (line as any).quantityOrdered ?? (line as any).quantity,
    unitPrice: line.unitPrice,
    lineTotal: line.extendedPrice,
});

/**
 * Maps Backend InvoiceLine to Legacy Frontend InvoiceLine
 */
export const mapInvoiceLineToLegacy = (line: any): InvoiceLine => ({
    id: line.id.toString(),
    invoiceId: line.invoiceId,
    productId: '0',
    sku: line.itemCode,
    name: line.description || '',
    quantity: line.quantityBilled,
    unitPrice: line.unitPrice,
    lineTotal: line.extendedPrice,
});
