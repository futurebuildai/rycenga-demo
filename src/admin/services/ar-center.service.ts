/**
 * AR Center Service
 * Manages payment requests and automation rules for accounts receivable.
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

interface BackendARSummary {
    totalOutstanding: number;
    totalPastDue: number;
    openInvoiceCount: number;
    overdueInvoiceCount: number;
    accountsWithBalanceCount: number;
    dueNext7Days: number;
    collectedMTD: number;
}

interface BackendARAccountSummary {
    accountId: number;
    accountNumber: string;
    accountName: string;
    email: string;
    phone: string;
    currencyCode: string;
    totalBalance: number;
    pastDueBalance: number;
    currentBalance: number;
    openInvoiceCount: number;
    overdueInvoiceCount: number;
    dueNext7Days: number;
    latestInvoiceDate?: string;
    lastPaymentAt?: string;
    lastPaymentAmount: number;
    agingBucket: string;
}

function formatDate(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

class ARCenterServiceImpl {
    private mapBackendSummary(summary: BackendARSummary): ARSummary {
        return {
            totalOutstanding: summary.totalOutstanding,
            openRequests: summary.accountsWithBalanceCount,
            paidThisMonth: summary.collectedMTD,
            overdueCount: summary.overdueInvoiceCount,
        };
    }

    private mapBackendAccountToRequest(account: BackendARAccountSummary): PaymentRequest {
        const anchorTime =
            account.latestInvoiceDate ||
            account.lastPaymentAt ||
            new Date().toISOString();
        const status: PaymentRequestStatus =
            account.totalBalance <= 0
                ? 'paid'
                : account.pastDueBalance > 0
                    ? 'overdue'
                    : 'sent';

        return {
            id: account.accountId,
            accountId: account.accountId,
            accountName: account.accountName,
            createdByUserId: 0,
            status,
            totalAmount: account.totalBalance,
            remainingAmount: account.totalBalance,
            messageSubject: `AR Balance - ${account.accountName}`,
            messageBody: `Account ${account.accountName} currently has ${account.openInvoiceCount} open invoice(s).`,
            deliverySms: false,
            deliveryEmail: false,
            recipientPhone: account.phone || null,
            recipientEmail: account.email || null,
            reminderCount: 0,
            lastReminderAt: null,
            viewedAt: null,
            paidAt: status === 'paid' ? anchorTime : null,
            invoices: [],
            createdAt: anchorTime,
            updatedAt: anchorTime,
        };
    }

    async getSummary(): Promise<ARSummary> {
        const summary = await adminClient.request<BackendARSummary>('/admin/ar/summary');
        return this.mapBackendSummary(summary);
    }

    async getPaymentRequests(
        limit = 10,
        offset = 0,
        status?: PaymentRequestStatus,
        search?: string,
        sort: 'newest' | 'oldest' | 'amount-desc' | 'amount-asc' = 'newest'
    ): Promise<{ items: PaymentRequest[]; total: number }> {
        const sortMap: Record<string, string> = {
            'amount-desc': 'balance_desc',
            'amount-asc': 'balance_asc',
            newest: 'last_payment_desc',
            oldest: 'name_asc',
        };
        const query = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
            sort: sortMap[sort] || 'balance_desc',
        });
        if (status === 'overdue') query.set('pastDueOnly', 'true');
        if (search) query.set('search', search);

        const response = await adminClient.request<{ items: BackendARAccountSummary[]; total: number }>(`/admin/ar/accounts?${query}`);
        let items = response.items.map((item) => this.mapBackendAccountToRequest(item));
        if (status) {
            items = items.filter((item) => item.status === status);
        }
        return { items, total: response.total };
    }

    async getPaymentRequest(id: number): Promise<PaymentRequest | null> {
        try {
            const account = await adminClient.request<BackendARAccountSummary>(`/admin/ar/accounts/${id}`);
            return this.mapBackendAccountToRequest(account);
        } catch (error) {
            if (error instanceof Error && /\b404\b/.test(error.message)) {
                return null;
            }
            throw error;
        }
    }

    async createPaymentRequest(payload: CreatePaymentRequestPayload): Promise<PaymentRequest> {
        return adminClient.request<PaymentRequest>('/admin/payment-requests', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async sendReminder(id: number, delivery: 'sms' | 'email' | 'both'): Promise<{ success: boolean; message: string; reminderCount: number }> {
        return adminClient.request<{ success: boolean; message: string; reminderCount: number }>(
            `/admin/payment-requests/${id}/remind`,
            { method: 'POST', body: JSON.stringify({ delivery }) }
        );
    }

    async cancelRequest(id: number): Promise<PaymentRequest | null> {
        try {
            return await adminClient.request<PaymentRequest>(`/admin/payment-requests/${id}/cancel`, { method: 'PUT' });
        } catch (error) {
            if (error instanceof Error && /\b404\b/.test(error.message)) {
                return null;
            }
            throw error;
        }
    }

    async bulkCreateRequests(requests: CreatePaymentRequestPayload[]): Promise<{ created: number; failed: number }> {
        return adminClient.request<{ created: number; failed: number }>('/admin/payment-requests/bulk', {
            method: 'POST',
            body: JSON.stringify({ requests }),
        });
    }

    async getBulkPreview(condition: AutomationCondition): Promise<BulkPreviewAccount[]> {
        return adminClient.request<BulkPreviewAccount[]>(`/admin/payment-requests/bulk-preview?condition=${condition}`);
    }

    async getAutomations(): Promise<AutomationRule[]> {
        return adminClient.request<AutomationRule[]>('/admin/automations');
    }

    async createAutomation(payload: Omit<AutomationRule, 'id' | 'activeInvoices' | 'totalSent' | 'totalCollected' | 'createdAt' | 'updatedAt'>): Promise<AutomationRule> {
        return adminClient.request<AutomationRule>('/admin/automations', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async updateAutomation(id: number, payload: Partial<Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AutomationRule | null> {
        try {
            return await adminClient.request<AutomationRule>(`/admin/automations/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
        } catch (error) {
            if (error instanceof Error && /\b404\b/.test(error.message)) {
                return null;
            }
            throw error;
        }
    }

    async deleteAutomation(id: number): Promise<void> {
        await adminClient.request<void>(`/admin/automations/${id}`, { method: 'DELETE' });
    }

    async toggleAutomation(id: number): Promise<AutomationRule | null> {
        try {
            return await adminClient.request<AutomationRule>(`/admin/automations/${id}/toggle`, { method: 'PUT' });
        } catch (error) {
            if (error instanceof Error && /\b404\b/.test(error.message)) {
                return null;
            }
            throw error;
        }
    }
}

export const ARCenterService = new ARCenterServiceImpl();
export { formatDate, formatCurrency };
