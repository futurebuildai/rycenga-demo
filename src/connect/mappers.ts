import type { Job, Quote } from './types/domain';
import type { Project, Estimate } from '../types/index';

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

export const mapQuoteToEstimate = (quote: Quote): Estimate => ({
    id: quote.id.toString(),
    estimateNumber: quote.quoteNumber,
    status: ((): Estimate['status'] => {
        switch (quote.status) {
            case 'draft': return 'draft';
            case 'pending': return 'sent';
            case 'accepted': return 'accepted';
            case 'rejected': return 'expired'; // 'rejected' not in legacy type
            case 'expired': return 'expired';
            default: return 'draft';
        }
    })(),
    total: quote.total,
    validUntil: quote.expiresOn || new Date(Date.now() + 86400000 * 30).toISOString(), // Default 30 days if missing
});
