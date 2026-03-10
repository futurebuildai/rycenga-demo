/**
 * AR Center Service
 * Account roll-up is the canonical data source for AR Center.
 */

import { adminClient } from './admin-client.js';
import type {
    ARSummary,
    AutomationRule,
    AutomationCondition,
    BulkPreviewAccount,
    ARAccountRow,
    ARAccountInvoice,
    ARAccountContactPayload,
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
    latestInvoiceNumber?: string;
    lastPaymentAt?: string;
    lastPaymentAmount: number;
    agingBucket: string;
    lastContactedAt?: string;
    nextActionAt?: string;
    contactChannel?: 'sms' | 'email' | 'both' | 'none';
    contactCount?: number;
}

interface BackendARAccountInvoicesResponse {
    items: ARAccountInvoice[];
    total: number;
}

function formatDate(iso: string | undefined | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount: number | undefined | null): string {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
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

    private mapBackendAccount(account: BackendARAccountSummary): ARAccountRow {
        return {
            accountId: account.accountId,
            accountNumber: account.accountNumber,
            accountName: account.accountName,
            email: account.email || null,
            phone: account.phone || null,
            currencyCode: account.currencyCode,
            totalBalance: account.totalBalance,
            pastDueBalance: account.pastDueBalance,
            currentBalance: account.currentBalance,
            openInvoiceCount: account.openInvoiceCount,
            overdueInvoiceCount: account.overdueInvoiceCount,
            dueNext7Days: account.dueNext7Days,
            latestInvoiceDate: account.latestInvoiceDate || null,
            latestInvoiceNumber: account.latestInvoiceNumber || null,
            lastPaymentAt: account.lastPaymentAt || null,
            lastPaymentAmount: account.lastPaymentAmount,
            agingBucket: account.agingBucket,
            lastContactedAt: account.lastContactedAt || null,
            nextActionAt: account.nextActionAt || null,
            contactChannel: account.contactChannel || 'none',
            contactCount: account.contactCount ?? 0,
        };
    }

    async getSummary(): Promise<ARSummary> {
        const summary = await adminClient.request<BackendARSummary>('/admin/ar/summary');
        return this.mapBackendSummary(summary);
    }

    async getAccounts(
        limit = 10,
        offset = 0,
        search?: string,
        sort: 'newest' | 'oldest' | 'amount-desc' | 'amount-asc' = 'newest',
        pastDueOnly = false
    ): Promise<{ items: ARAccountRow[]; total: number }> {
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
        if (pastDueOnly) query.set('pastDueOnly', 'true');
        if (search) query.set('search', search);

        const response = await adminClient.request<{ items: BackendARAccountSummary[]; total: number }>(`/admin/ar/accounts?${query}`);
        return {
            items: response.items.map((item) => this.mapBackendAccount(item)),
            total: response.total,
        };
    }

    async getAccount(id: number): Promise<ARAccountRow | null> {
        try {
            const account = await adminClient.request<BackendARAccountSummary>(`/admin/ar/accounts/${id}`);
            return this.mapBackendAccount(account);
        } catch (error) {
            if (error instanceof Error && /\b404\b/.test(error.message)) {
                return null;
            }
            throw error;
        }
    }

    async getAccountInvoices(accountId: number, limit = 25, offset = 0, status = 'open'): Promise<{ items: ARAccountInvoice[]; total: number }> {
        const query = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
            status,
        });
        const response = await adminClient.request<BackendARAccountInvoicesResponse>(`/admin/ar/accounts/${accountId}/invoices?${query}`);
        return {
            items: response.items,
            total: response.total,
        };
    }

    async sendAccountContact(accountId: number, payload: ARAccountContactPayload): Promise<{ success: boolean; message: string; reminderCount: number }> {
        return adminClient.request<{ success: boolean; message: string; reminderCount: number }>(
            `/admin/ar/accounts/${accountId}/contact`,
            {
                method: 'POST',
                body: JSON.stringify(payload),
            }
        );
    }

    async bulkContact(payload: { requests: ARAccountContactPayload[] }): Promise<{ created: number; failed: number }> {
        return adminClient.request<{ created: number; failed: number }>('/admin/ar/accounts/bulk-contact', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async getBulkPreview(condition: AutomationCondition): Promise<BulkPreviewAccount[]> {
        return adminClient.request<BulkPreviewAccount[]>(`/admin/ar/bulk-preview?condition=${condition}`);
    }

    async getAutomations(): Promise<AutomationRule[]> {
        return adminClient.request<AutomationRule[]>('/admin/ar/automations');
    }

    async createAutomation(payload: Omit<AutomationRule, 'id' | 'activeInvoices' | 'totalSent' | 'totalCollected' | 'createdAt' | 'updatedAt'>): Promise<AutomationRule> {
        return adminClient.request<AutomationRule>('/admin/ar/automations', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async updateAutomation(id: number, payload: Partial<Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AutomationRule | null> {
        try {
            return await adminClient.request<AutomationRule>(`/admin/ar/automations/${id}`, {
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
        await adminClient.request<void>(`/admin/ar/automations/${id}`, { method: 'DELETE' });
    }

    async toggleAutomation(id: number): Promise<AutomationRule | null> {
        try {
            return await adminClient.request<AutomationRule>(`/admin/ar/automations/${id}/toggle`, { method: 'PUT' });
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
