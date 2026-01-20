import type { Job, Quote, Order as BackendOrder, Invoice as BackendInvoice } from './types/domain';
import type { Project, Estimate, Order, Invoice } from '../types/index';

/**
 * Maps Backend Job to Legacy Frontend Project
 */
export const mapJobToProject = (job: Job): Project => ({
    id: job.id.toString(),
    userId: 'current', // Placeholder as legacy FE expects it
    name: job.name,
    status: job.isActive ? 'active' : 'archived',
    address: {
        street: job.addressLine1 || '',
        city: job.city || '',
        state: job.state || '',
        zip: ''
    }
});

/**
 * Maps Backend Quote to Legacy Frontend Estimate
 */
export const mapQuoteToEstimate = (quote: Quote): Estimate => ({
    id: quote.id.toString(),
    estimateNumber: quote.quoteNumber,
    status: ((): Estimate['status'] => {
        switch (quote.status) {
            case 'pending': return 'sent';
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
    id: order.orderNumber,
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
    id: invoice.invoiceNumber,
    invoiceNumber: invoice.invoiceNumber,
    projectId: null,
    status: invoice.status as Invoice['status'],
    dueDate: invoice.dueDate,
    total: invoice.total,
    amountDue: invoice.balanceDue,
    amountPaid: invoice.total - invoice.balanceDue,
    createdAt: invoice.invoiceDate,
});
