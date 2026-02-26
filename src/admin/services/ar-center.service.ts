/**
 * AR Center Service
 * Manages payment requests and automation rules for accounts receivable.
 * Uses adminClient for real API calls with mock data fallback for frontend dev.
 *
 * Endpoint mapping (frontend path → backend path):
 *   /admin/payment-requests/summary       → GET /v1/admin/payment-requests/summary
 *   /admin/payment-requests               → GET /v1/admin/payment-requests
 *   /admin/payment-requests/{id}          → GET /v1/admin/payment-requests/{id}
 *   /admin/payment-requests               → POST /v1/admin/payment-requests
 *   /admin/payment-requests/{id}/remind   → POST /v1/admin/payment-requests/{id}/remind
 *   /admin/payment-requests/{id}/cancel   → PUT /v1/admin/payment-requests/{id}/cancel
 *   /admin/payment-requests/bulk          → POST /v1/admin/payment-requests/bulk
 *   /admin/payment-requests/bulk-preview  → GET /v1/admin/payment-requests/bulk-preview
 *   /admin/automations                    → GET/POST /v1/admin/automations
 *   /admin/automations/{id}               → PUT/DELETE /v1/admin/automations/{id}
 *   /admin/automations/{id}/toggle        → PUT /v1/admin/automations/{id}/toggle
 */

import { adminClient } from './admin-client.js';
import type {
    PaymentRequest,
    PaymentRequestStatus,
    CreatePaymentRequestPayload,
    ARSummary,
    AutomationRule,
    AutomationCondition,
    BulkPreviewAccount,
} from '../../connect/types/domain.js';

// --- Mock Data ---

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

const MOCK_PAYMENT_REQUESTS: PaymentRequest[] = [
    {
        id: 1, accountId: 101, accountName: 'Summit Concrete Co.', createdByUserId: 1,
        status: 'sent', totalAmount: 4250.00, remainingAmount: 4250.00,
        messageSubject: 'Payment Request - Invoice #INV-1042', messageBody: 'Hi {contactName}, please review and pay the attached invoices totaling {totalAmount}.',
        deliverySms: true, deliveryEmail: true, recipientPhone: '+15551234567', recipientEmail: 'ap@summitconcrete.com',
        reminderCount: 0, lastReminderAt: null, viewedAt: null, paidAt: null,
        invoices: [{ invoiceId: 1042, invoiceNumber: 'INV-1042', amountAtRequest: 4250.00, amountPaid: 0 }],
        createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },
    {
        id: 2, accountId: 102, accountName: 'Ironworks Structural LLC', createdByUserId: 1,
        status: 'viewed', totalAmount: 12800.50, remainingAmount: 12800.50,
        messageSubject: 'Payment Request - 2 Invoices', messageBody: 'Hi {contactName}, you have 2 outstanding invoices totaling {totalAmount}. Please pay at your earliest convenience.',
        deliverySms: false, deliveryEmail: true, recipientPhone: null, recipientEmail: 'billing@ironworksllc.com',
        reminderCount: 1, lastReminderAt: daysAgo(1), viewedAt: daysAgo(1), paidAt: null,
        invoices: [
            { invoiceId: 1038, invoiceNumber: 'INV-1038', amountAtRequest: 7500.00, amountPaid: 0 },
            { invoiceId: 1039, invoiceNumber: 'INV-1039', amountAtRequest: 5300.50, amountPaid: 0 },
        ],
        createdAt: daysAgo(5), updatedAt: daysAgo(1),
    },
    {
        id: 3, accountId: 103, accountName: 'GreenBuild Materials', createdByUserId: 1,
        status: 'paid', totalAmount: 1890.00, remainingAmount: 0,
        messageSubject: 'Payment Request - Invoice #INV-1035', messageBody: 'Hi {contactName}, please find attached invoice {invoiceNumbers} for {totalAmount}.',
        deliverySms: true, deliveryEmail: true, recipientPhone: '+15559876543', recipientEmail: 'accounts@greenbuild.com',
        reminderCount: 0, lastReminderAt: null, viewedAt: daysAgo(6), paidAt: daysAgo(4),
        invoices: [{ invoiceId: 1035, invoiceNumber: 'INV-1035', amountAtRequest: 1890.00, amountPaid: 1890.00 }],
        createdAt: daysAgo(8), updatedAt: daysAgo(4),
    },
    {
        id: 4, accountId: 104, accountName: 'Pacific Lumber Supply', createdByUserId: 1,
        status: 'overdue', totalAmount: 8750.00, remainingAmount: 8750.00,
        messageSubject: 'Payment Request - Invoice #INV-1028', messageBody: 'Hi {contactName}, your invoice {invoiceNumbers} totaling {totalAmount} is now overdue. Please remit payment.',
        deliverySms: true, deliveryEmail: true, recipientPhone: '+15552345678', recipientEmail: 'pay@pacificlumber.com',
        reminderCount: 3, lastReminderAt: daysAgo(2), viewedAt: daysAgo(12), paidAt: null,
        invoices: [{ invoiceId: 1028, invoiceNumber: 'INV-1028', amountAtRequest: 8750.00, amountPaid: 0 }],
        createdAt: daysAgo(18), updatedAt: daysAgo(2),
    },
    {
        id: 5, accountId: 105, accountName: 'Apex Roofing Partners', createdByUserId: 1,
        status: 'partially_paid', totalAmount: 15200.00, remainingAmount: 5200.00,
        messageSubject: 'Payment Request - 3 Invoices', messageBody: 'Hi {contactName}, please pay the remaining balance of {totalAmount} across your open invoices.',
        deliverySms: false, deliveryEmail: true, recipientPhone: null, recipientEmail: 'finance@apexroofing.com',
        reminderCount: 1, lastReminderAt: daysAgo(3), viewedAt: daysAgo(7), paidAt: null,
        invoices: [
            { invoiceId: 1030, invoiceNumber: 'INV-1030', amountAtRequest: 6000.00, amountPaid: 6000.00 },
            { invoiceId: 1031, invoiceNumber: 'INV-1031', amountAtRequest: 5000.00, amountPaid: 4000.00 },
            { invoiceId: 1032, invoiceNumber: 'INV-1032', amountAtRequest: 4200.00, amountPaid: 0 },
        ],
        createdAt: daysAgo(10), updatedAt: daysAgo(3),
    },
    {
        id: 6, accountId: 106, accountName: 'Valley Excavation Inc.', createdByUserId: 1,
        status: 'cancelled', totalAmount: 3400.00, remainingAmount: 3400.00,
        messageSubject: 'Payment Request - Invoice #INV-1025', messageBody: 'Hi {contactName}, invoice {invoiceNumbers} for {totalAmount} is ready for payment.',
        deliverySms: true, deliveryEmail: false, recipientPhone: '+15553456789', recipientEmail: null,
        reminderCount: 0, lastReminderAt: null, viewedAt: null, paidAt: null,
        invoices: [{ invoiceId: 1025, invoiceNumber: 'INV-1025', amountAtRequest: 3400.00, amountPaid: 0 }],
        createdAt: daysAgo(15), updatedAt: daysAgo(10),
    },
    {
        id: 7, accountId: 107, accountName: 'Ridgeline Drywall Co.', createdByUserId: 1,
        status: 'sent', totalAmount: 6320.00, remainingAmount: 6320.00,
        messageSubject: 'Payment Request - Invoice #INV-1045', messageBody: 'Hi {contactName}, please review invoice {invoiceNumbers} for {totalAmount} from {dealerName}.',
        deliverySms: true, deliveryEmail: true, recipientPhone: '+15554567890', recipientEmail: 'ar@ridgelinedrywall.com',
        reminderCount: 0, lastReminderAt: null, viewedAt: null, paidAt: null,
        invoices: [{ invoiceId: 1045, invoiceNumber: 'INV-1045', amountAtRequest: 6320.00, amountPaid: 0 }],
        createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
        id: 8, accountId: 108, accountName: 'BlueLine Plumbing', createdByUserId: 1,
        status: 'viewed', totalAmount: 2150.75, remainingAmount: 2150.75,
        messageSubject: 'Payment Request - Invoice #INV-1040', messageBody: 'Hi {contactName}, invoice {invoiceNumbers} for {totalAmount} is awaiting payment.',
        deliverySms: false, deliveryEmail: true, recipientPhone: null, recipientEmail: 'office@bluelineplumbing.com',
        reminderCount: 2, lastReminderAt: daysAgo(1), viewedAt: daysAgo(3), paidAt: null,
        invoices: [{ invoiceId: 1040, invoiceNumber: 'INV-1040', amountAtRequest: 2150.75, amountPaid: 0 }],
        createdAt: daysAgo(7), updatedAt: daysAgo(1),
    },
    {
        id: 9, accountId: 109, accountName: 'Cornerstone Masonry', createdByUserId: 1,
        status: 'paid', totalAmount: 9450.00, remainingAmount: 0,
        messageSubject: 'Payment Request - 2 Invoices', messageBody: 'Hi {contactName}, invoices {invoiceNumbers} totaling {totalAmount} are due. Thank you!',
        deliverySms: true, deliveryEmail: true, recipientPhone: '+15555678901', recipientEmail: 'pay@cornerstonemasonry.com',
        reminderCount: 1, lastReminderAt: daysAgo(8), viewedAt: daysAgo(10), paidAt: daysAgo(6),
        invoices: [
            { invoiceId: 1020, invoiceNumber: 'INV-1020', amountAtRequest: 5000.00, amountPaid: 5000.00 },
            { invoiceId: 1021, invoiceNumber: 'INV-1021', amountAtRequest: 4450.00, amountPaid: 4450.00 },
        ],
        createdAt: daysAgo(14), updatedAt: daysAgo(6),
    },
    {
        id: 10, accountId: 110, accountName: 'Titan Steel Fabrication', createdByUserId: 1,
        status: 'overdue', totalAmount: 22300.00, remainingAmount: 22300.00,
        messageSubject: 'OVERDUE - Payment Request', messageBody: 'Hi {contactName}, your payment of {totalAmount} is past due. Please arrange payment immediately.',
        deliverySms: true, deliveryEmail: true, recipientPhone: '+15556789012', recipientEmail: 'ap@titansteel.com',
        reminderCount: 4, lastReminderAt: daysAgo(1), viewedAt: daysAgo(20), paidAt: null,
        invoices: [
            { invoiceId: 1015, invoiceNumber: 'INV-1015', amountAtRequest: 12000.00, amountPaid: 0 },
            { invoiceId: 1016, invoiceNumber: 'INV-1016', amountAtRequest: 10300.00, amountPaid: 0 },
        ],
        createdAt: daysAgo(25), updatedAt: daysAgo(1),
    },
    {
        id: 11, accountId: 111, accountName: 'Cascade Electric Works', createdByUserId: 1,
        status: 'sent', totalAmount: 3870.25, remainingAmount: 3870.25,
        messageSubject: 'Payment Request - Invoice #INV-1048', messageBody: 'Hi {contactName}, please pay invoice {invoiceNumbers} for {totalAmount}.',
        deliverySms: true, deliveryEmail: true, recipientPhone: '+15557890123', recipientEmail: 'billing@cascadeelectric.com',
        reminderCount: 0, lastReminderAt: null, viewedAt: null, paidAt: null,
        invoices: [{ invoiceId: 1048, invoiceNumber: 'INV-1048', amountAtRequest: 3870.25, amountPaid: 0 }],
        createdAt: daysAgo(0), updatedAt: daysAgo(0),
    },
    {
        id: 12, accountId: 112, accountName: 'Horizon Paving Group', createdByUserId: 1,
        status: 'partially_paid', totalAmount: 18500.00, remainingAmount: 8500.00,
        messageSubject: 'Payment Request - 2 Invoices', messageBody: 'Hi {contactName}, you have a remaining balance of {totalAmount} across your invoices.',
        deliverySms: false, deliveryEmail: true, recipientPhone: null, recipientEmail: 'ar@horizonpaving.com',
        reminderCount: 2, lastReminderAt: daysAgo(2), viewedAt: daysAgo(9), paidAt: null,
        invoices: [
            { invoiceId: 1022, invoiceNumber: 'INV-1022', amountAtRequest: 10000.00, amountPaid: 10000.00 },
            { invoiceId: 1023, invoiceNumber: 'INV-1023', amountAtRequest: 8500.00, amountPaid: 0 },
        ],
        createdAt: daysAgo(12), updatedAt: daysAgo(2),
    },
    {
        id: 13, accountId: 113, accountName: 'Northern Framing Solutions', createdByUserId: 1,
        status: 'viewed', totalAmount: 5640.00, remainingAmount: 5640.00,
        messageSubject: 'Payment Request - Invoice #INV-1044', messageBody: 'Hi {contactName}, invoice {invoiceNumbers} for {totalAmount} is ready for payment.',
        deliverySms: true, deliveryEmail: false, recipientPhone: '+15558901234', recipientEmail: null,
        reminderCount: 0, lastReminderAt: null, viewedAt: daysAgo(0), paidAt: null,
        invoices: [{ invoiceId: 1044, invoiceNumber: 'INV-1044', amountAtRequest: 5640.00, amountPaid: 0 }],
        createdAt: daysAgo(3), updatedAt: daysAgo(0),
    },
];

const MOCK_AUTOMATION_RULES: AutomationRule[] = [
    {
        id: 1, name: 'Past Due Auto-Reminder',
        condition: 'past_due', messageTemplate: 'Hi {contactName}, invoice {invoiceNumbers} totaling {totalAmount} is past due. Please arrange payment at your earliest convenience.',
        followUpIntervalDays: 7, maxFollowUps: 3, isActive: true,
        activeInvoices: 12, totalSent: 47, totalCollected: 34200.00,
        createdAt: daysAgo(60), updatedAt: daysAgo(1),
    },
    {
        id: 2, name: 'Due in 3 Days Notice',
        condition: 'due_in_3_days', messageTemplate: 'Hi {contactName}, a friendly reminder that invoice {invoiceNumbers} for {totalAmount} is due in 3 days.',
        followUpIntervalDays: 0, maxFollowUps: 1, isActive: true,
        activeInvoices: 5, totalSent: 23, totalCollected: 18750.00,
        createdAt: daysAgo(45), updatedAt: daysAgo(3),
    },
    {
        id: 3, name: 'Due Today Alert',
        condition: 'due_today', messageTemplate: 'Hi {contactName}, invoice {invoiceNumbers} for {totalAmount} is due today. Please remit payment to avoid late fees.',
        followUpIntervalDays: 0, maxFollowUps: 1, isActive: false,
        activeInvoices: 0, totalSent: 8, totalCollected: 6100.00,
        createdAt: daysAgo(30), updatedAt: daysAgo(10),
    },
];

// --- Helpers ---

function formatDate(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Track mock mutations for session
let mockRequests = [...MOCK_PAYMENT_REQUESTS];
let mockRules = [...MOCK_AUTOMATION_RULES];
let nextRequestId = 14;
let nextRuleId = 4;

// --- Service ---

class ARCenterServiceImpl {

    async getSummary(): Promise<ARSummary> {
        try {
            return await adminClient.request<ARSummary>('/admin/payment-requests/summary');
        } catch {
            const active = mockRequests.filter(r => r.status !== 'cancelled' && r.status !== 'paid');
            return {
                totalOutstanding: active.reduce((sum, r) => sum + r.remainingAmount, 0),
                openRequests: active.length,
                paidThisMonth: mockRequests.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.totalAmount, 0),
                overdueCount: mockRequests.filter(r => r.status === 'overdue').length,
            };
        }
    }

    async getPaymentRequests(
        limit = 10,
        offset = 0,
        status?: PaymentRequestStatus,
        search?: string,
        sort: 'newest' | 'oldest' | 'amount-desc' | 'amount-asc' = 'newest'
    ): Promise<{ items: PaymentRequest[]; total: number }> {
        try {
            const query = new URLSearchParams({ limit: String(limit), offset: String(offset), sort });
            if (status) query.set('status', status);
            if (search) query.set('search', search);
            return await adminClient.request<{ items: PaymentRequest[]; total: number }>(`/admin/payment-requests?${query}`);
        } catch {
            let filtered = [...mockRequests];
            if (status) filtered = filtered.filter(r => r.status === status);
            if (search) {
                const q = search.toLowerCase();
                filtered = filtered.filter(r =>
                    r.accountName.toLowerCase().includes(q) ||
                    r.invoices.some(inv => inv.invoiceNumber.toLowerCase().includes(q))
                );
            }
            switch (sort) {
                case 'oldest': filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
                case 'amount-desc': filtered.sort((a, b) => b.totalAmount - a.totalAmount); break;
                case 'amount-asc': filtered.sort((a, b) => a.totalAmount - b.totalAmount); break;
                default: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
            return { items: filtered.slice(offset, offset + limit), total: filtered.length };
        }
    }

    async getPaymentRequest(id: number): Promise<PaymentRequest | null> {
        try {
            return await adminClient.request<PaymentRequest>(`/admin/payment-requests/${id}`);
        } catch {
            return mockRequests.find(r => r.id === id) ?? null;
        }
    }

    async createPaymentRequest(payload: CreatePaymentRequestPayload): Promise<PaymentRequest> {
        try {
            return await adminClient.request<PaymentRequest>('/admin/payment-requests', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        } catch {
            // Generate realistic mock amounts per invoice
            const invoices = payload.invoiceIds.map(id => {
                const amount = Math.round((1000 + (id % 10) * 750) * 100) / 100;
                return { invoiceId: id, invoiceNumber: `INV-${id}`, amountAtRequest: amount, amountPaid: 0 };
            });
            const totalAmount = invoices.reduce((sum, inv) => sum + inv.amountAtRequest, 0);
            // Look up account name from existing mock data if possible
            const existingAccount = mockRequests.find(r => r.accountId === payload.accountId);
            const newRequest: PaymentRequest = {
                id: nextRequestId++,
                accountId: payload.accountId,
                accountName: existingAccount?.accountName ?? `Account #${payload.accountId}`,
                createdByUserId: 1,
                status: 'sent',
                totalAmount,
                remainingAmount: totalAmount,
                messageSubject: payload.messageSubject ?? 'Payment Request',
                messageBody: payload.messageBody ?? '',
                deliverySms: payload.deliverySms,
                deliveryEmail: payload.deliveryEmail,
                recipientPhone: payload.recipientPhone ?? null,
                recipientEmail: payload.recipientEmail ?? null,
                reminderCount: 0,
                lastReminderAt: null,
                viewedAt: null,
                paidAt: null,
                invoices,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockRequests.unshift(newRequest);
            return newRequest;
        }
    }

    async sendReminder(id: number, delivery: 'sms' | 'email' | 'both'): Promise<{ success: boolean; message: string; reminderCount: number }> {
        try {
            return await adminClient.request<{ success: boolean; message: string; reminderCount: number }>(
                `/admin/payment-requests/${id}/remind`,
                { method: 'POST', body: JSON.stringify({ delivery }) }
            );
        } catch {
            const req = mockRequests.find(r => r.id === id);
            if (!req) return { success: false, message: 'Request not found', reminderCount: 0 };
            if (req.status === 'paid' || req.status === 'cancelled') {
                return { success: false, message: `Cannot send reminder for ${req.status} request`, reminderCount: req.reminderCount };
            }
            req.reminderCount += 1;
            req.lastReminderAt = new Date().toISOString();
            req.updatedAt = new Date().toISOString();
            return { success: true, message: 'Reminder sent via ' + delivery, reminderCount: req.reminderCount };
        }
    }

    async cancelRequest(id: number): Promise<PaymentRequest | null> {
        try {
            return await adminClient.request<PaymentRequest>(`/admin/payment-requests/${id}/cancel`, { method: 'PUT' });
        } catch {
            const req = mockRequests.find(r => r.id === id);
            if (!req) return null;
            req.status = 'cancelled';
            req.updatedAt = new Date().toISOString();
            return { ...req };
        }
    }

    async bulkCreateRequests(requests: CreatePaymentRequestPayload[]): Promise<{ created: number; failed: number }> {
        try {
            return await adminClient.request<{ created: number; failed: number }>('/admin/payment-requests/bulk', {
                method: 'POST',
                body: JSON.stringify({ requests }),
            });
        } catch {
            for (const payload of requests) {
                const invoices = payload.invoiceIds.map(id => {
                    const amount = Math.round((1000 + (id % 10) * 750) * 100) / 100;
                    return { invoiceId: id, invoiceNumber: `INV-${id}`, amountAtRequest: amount, amountPaid: 0 };
                });
                const totalAmount = invoices.reduce((sum, inv) => sum + inv.amountAtRequest, 0);
                const existingAccount = mockRequests.find(r => r.accountId === payload.accountId);
                const newReq: PaymentRequest = {
                    id: nextRequestId++,
                    accountId: payload.accountId,
                    accountName: existingAccount?.accountName ?? `Account #${payload.accountId}`,
                    createdByUserId: 1,
                    status: 'sent',
                    totalAmount,
                    remainingAmount: totalAmount,
                    messageSubject: payload.messageSubject ?? 'Payment Request',
                    messageBody: payload.messageBody ?? '',
                    deliverySms: payload.deliverySms,
                    deliveryEmail: payload.deliveryEmail,
                    recipientPhone: payload.recipientPhone ?? null,
                    recipientEmail: payload.recipientEmail ?? null,
                    reminderCount: 0,
                    lastReminderAt: null,
                    viewedAt: null,
                    paidAt: null,
                    invoices,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                mockRequests.unshift(newReq);
            }
            return { created: requests.length, failed: 0 };
        }
    }

    async getBulkPreview(condition: AutomationCondition): Promise<BulkPreviewAccount[]> {
        try {
            return await adminClient.request<BulkPreviewAccount[]>(`/admin/payment-requests/bulk-preview?condition=${condition}`);
        } catch {
            const conditionAccounts: Record<string, BulkPreviewAccount[]> = {
                past_due: [
                    { accountId: 104, accountName: 'Pacific Lumber Supply', invoiceIds: [1028], invoiceCount: 1, totalAmount: 8750.00 },
                    { accountId: 110, accountName: 'Titan Steel Fabrication', invoiceIds: [1015, 1016], invoiceCount: 2, totalAmount: 22300.00 },
                ],
                due_today: [
                    { accountId: 108, accountName: 'BlueLine Plumbing', invoiceIds: [1040], invoiceCount: 1, totalAmount: 2150.75 },
                ],
                due_in_3_days: [
                    { accountId: 102, accountName: 'Ironworks Structural LLC', invoiceIds: [1038, 1039], invoiceCount: 2, totalAmount: 12800.50 },
                    { accountId: 108, accountName: 'BlueLine Plumbing', invoiceIds: [1040], invoiceCount: 1, totalAmount: 2150.75 },
                ],
                due_in_7_days: [
                    { accountId: 102, accountName: 'Ironworks Structural LLC', invoiceIds: [1038, 1039], invoiceCount: 2, totalAmount: 12800.50 },
                    { accountId: 108, accountName: 'BlueLine Plumbing', invoiceIds: [1040], invoiceCount: 1, totalAmount: 2150.75 },
                    { accountId: 113, accountName: 'Northern Framing Solutions', invoiceIds: [1044], invoiceCount: 1, totalAmount: 5640.00 },
                ],
            };
            return conditionAccounts[condition] ?? [];
        }
    }

    async getAutomations(): Promise<AutomationRule[]> {
        try {
            return await adminClient.request<AutomationRule[]>('/admin/automations');
        } catch {
            return [...mockRules];
        }
    }

    async createAutomation(payload: Omit<AutomationRule, 'id' | 'activeInvoices' | 'totalSent' | 'totalCollected' | 'createdAt' | 'updatedAt'>): Promise<AutomationRule> {
        try {
            return await adminClient.request<AutomationRule>('/admin/automations', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        } catch {
            const rule: AutomationRule = {
                ...payload,
                id: nextRuleId++,
                activeInvoices: 0,
                totalSent: 0,
                totalCollected: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockRules.push(rule);
            return rule;
        }
    }

    async updateAutomation(id: number, payload: Partial<Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AutomationRule | null> {
        try {
            return await adminClient.request<AutomationRule>(`/admin/automations/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
        } catch {
            const rule = mockRules.find(r => r.id === id);
            if (!rule) return null;
            Object.assign(rule, payload, { updatedAt: new Date().toISOString() });
            return { ...rule };
        }
    }

    async deleteAutomation(id: number): Promise<void> {
        try {
            await adminClient.request<void>(`/admin/automations/${id}`, { method: 'DELETE' });
        } catch {
            mockRules = mockRules.filter(r => r.id !== id);
        }
    }

    async toggleAutomation(id: number): Promise<AutomationRule | null> {
        try {
            return await adminClient.request<AutomationRule>(`/admin/automations/${id}/toggle`, { method: 'PUT' });
        } catch {
            const rule = mockRules.find(r => r.id === id);
            if (!rule) return null;
            rule.isActive = !rule.isActive;
            rule.updatedAt = new Date().toISOString();
            return { ...rule };
        }
    }
}

export const ARCenterService = new ARCenterServiceImpl();
export { formatDate, formatCurrency };
