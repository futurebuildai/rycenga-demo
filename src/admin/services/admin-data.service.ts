/**
 * Admin Data Service
 * Provides account and dashboard data for the Admin Portal.
 * Uses adminClient for real API calls and maps strict domain types to UI view models.
 *
 * Endpoint mapping (frontend path → backend path):
 *   /accounts                      → GET /v1/accounts
 *   /accounts/{id}                 → GET /v1/accounts/{id}
 *   /accounts/{id}/addresses       → GET /v1/accounts/{id}/addresses
 *   /orders?account_id={id}        → GET /v1/orders?account_id={id}
 *   /invoices?account_id={id}      → GET /v1/invoices?account_id={id}
 *   /quotes?account_id={id}        → GET /v1/quotes?account_id={id}
 *   /dashboard/summary?account_id= → GET /v1/dashboard/summary?account_id={id}
 */

import { adminClient } from './admin-client.js';
import type {
    Account,
    AccountAddress,
    AccountFinancials,
    DashboardSummary,
    Order,
    Invoice,
    Quote,
} from '../../connect/types/domain.js';

// --- UI View Models ---

export type AccountStatus = 'Active' | 'Hold' | 'Overdue';

export interface AdminAccount {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: AccountStatus;
    creditLimit: number;
    balance: number;
    availableCredit: number;
    pastDueBalance: number;
    aging: 'Current' | '30' | '60' | '90' | '90+';
    openInvoicesCount: number;
    primaryContact: string;
}

export interface AdminDashboardSummary {
    totalAccounts: number;
    activeOrders: number;
    pendingEstimates: number;
    totalCreditExtended: number;
    totalReceivables: number;
    accountsAtRisk: number;
}

export interface AdminAccountAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface AdminOrder {
    id: string;
    date: string;
    total: number;
    status: 'Pending' | 'Processing' | 'Shipped';
    itemsCount: number;
}

export interface AdminInvoice {
    id: string;
    date: string;
    dueDate: string;
    total: number;
    balance: number;
    status: 'Open' | 'Past Due' | 'Paid';
}

export interface AdminQuote {
    id: string;
    date: string;
    expiryDate: string;
    total: number;
    status: 'Draft' | 'Sent' | 'Expired';
    name: string;
}

export interface AdminAccountDetails extends AdminAccount {
    address: AdminAccountAddress;
    salesRep: string;
    paymentTerms: string;
    memberSince: string;
    taxId: string;
    openOrders: AdminOrder[];
    openInvoices: AdminInvoice[];
    openQuotes: AdminQuote[];
}

// --- Helpers ---

const isPastDue = (inv: Invoice): boolean => inv.status === 'past_due';

/** Compute the aging bucket from the oldest overdue invoice. */
function computeAgingFromInvoices(invoices: Invoice[]): AdminAccount['aging'] {
    const now = Date.now();
    let oldestDaysOverdue = 0;

    for (const inv of invoices) {
        if (!isPastDue(inv) || !inv.dueDate) continue;
        const days = Math.floor((now - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        if (days > oldestDaysOverdue) oldestDaysOverdue = days;
    }

    if (oldestDaysOverdue > 90) return '90+';
    if (oldestDaysOverdue > 60) return '90';
    if (oldestDaysOverdue > 30) return '60';
    if (oldestDaysOverdue > 0) return '30';
    return 'Current';
}

/** Format an ISO date string to "Jan 15, 2026" style. */
function formatDate(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Sum balanceDue for all overdue invoices. */
function computePastDueBalance(invoices: Invoice[]): number {
    return invoices
        .filter(isPastDue)
        .reduce((sum, inv) => sum + inv.balanceDue, 0);
}

// --- Mappers ---

const mapStatus = (active: boolean, invoices?: Invoice[]): AccountStatus => {
    if (!active) return 'Hold';
    if (invoices?.some(isPastDue)) return 'Overdue';
    return 'Active';
};

const mapAccount = (raw: Account, invoices?: Invoice[], financials?: AccountFinancials): AdminAccount => ({
    id: raw.id,
    name: raw.name || 'Unknown',
    email: raw.email || '',
    phone: raw.phone || '',
    status: mapStatus(raw.active, invoices),
    creditLimit: financials?.creditLimit ?? raw.creditLimit ?? 0,
    balance: financials?.totalBalance ?? raw.balance ?? 0,
    availableCredit: financials?.availableCredit ?? raw.availableCredit ?? 0,
    pastDueBalance: invoices ? computePastDueBalance(invoices) : 0,
    aging: invoices ? computeAgingFromInvoices(invoices) : 'Current',
    openInvoicesCount: invoices
        ? invoices.filter(inv => inv.status === 'open' || isPastDue(inv)).length
        : 0,
    primaryContact: raw.name || 'Unknown',
});

const mapOrder = (raw: Order): AdminOrder => {
    let status: AdminOrder['status'];
    switch (raw.status) {
        case 'pending':
            status = 'Pending';
            break;
        case 'shipped':
        case 'delivered':
            status = 'Shipped';
            break;
        default:
            status = 'Processing';
    }
    return {
        id: raw.orderNumber || String(raw.id),
        date: formatDate(raw.orderDate),
        total: raw.total,
        status,
        itemsCount: 0,
    };
};

const mapInvoice = (raw: Invoice): AdminInvoice => ({
    id: raw.invoiceNumber || String(raw.id),
    date: formatDate(raw.invoiceDate),
    dueDate: formatDate(raw.dueDate),
    total: raw.total,
    balance: raw.balanceDue,
    status: raw.status === 'open' ? 'Open' : isPastDue(raw) ? 'Past Due' : 'Paid',
});

const mapQuote = (raw: Quote): AdminQuote => ({
    id: raw.quoteNumber || String(raw.id),
    date: formatDate(raw.quoteDate),
    expiryDate: formatDate(raw.expiresOn),
    total: raw.total,
    status: (raw.status === 'sent' || raw.status === 'viewed') ? 'Sent'
        : raw.status === 'expired' ? 'Expired'
            : 'Draft',
    name: raw.quoteNumber,
});

// --- Service ---

class AdminDataServiceImpl {
    async getAccounts(limit = 10, offset = 0, pastDueOnly = false): Promise<{ items: AdminAccount[], total: number }> {
        const response = await adminClient.request<{ items: any[], total: number }>(`/admin/account-dashboard?limit=${limit}&offset=${offset}&past_due_only=${pastDueOnly}`);
        const { items: accounts, total } = response;

        const items: AdminAccount[] = accounts.map(a => ({
            id: a.id,
            name: a.name,
            email: a.email,
            phone: a.phone,
            status: a.active ? (a.pastDueBalance > 0 ? 'Overdue' : 'Active') : 'Hold',
            creditLimit: a.creditLimit,
            balance: a.balance,
            availableCredit: a.availableCredit,
            pastDueBalance: a.pastDueBalance,
            aging: a.aging as any,
            openInvoicesCount: a.openInvoicesCount,
            primaryContact: a.primaryContact,
        }));

        return { items, total };
    }

    async getDashboardSummary(): Promise<AdminDashboardSummary> {
        const response = await adminClient.request<any>('/admin/dashboard-summary');

        return {
            totalAccounts: response.totalAccounts,
            activeOrders: response.activeOrders,
            pendingEstimates: response.pendingQuotes,
            totalCreditExtended: response.totalCreditLimit,
            totalReceivables: response.totalBalance,
            accountsAtRisk: response.accountsAtRisk,
        };
    }

    async getAccountDetails(id: number): Promise<AdminAccountDetails | null> {
        try {
            const [account, addresses, financials, orders, invoices, quotes] = await Promise.all([
                adminClient.request<Account>(`/accounts/${id}`),
                adminClient.request<AccountAddress[]>(`/accounts/${id}/addresses`).catch((): AccountAddress[] => []),
                adminClient.request<AccountFinancials>(`/accounts/${id}/financials`).catch((): AccountFinancials | null => null),
                adminClient.request<Order[]>(`/orders?account_id=${id}`).catch((): Order[] => []),
                adminClient.request<Invoice[]>(`/invoices?account_id=${id}`).catch((): Invoice[] => []),
                adminClient.request<Quote[]>(`/quotes?account_id=${id}`).catch((): Quote[] => []),
            ]);

            const base = mapAccount(account, invoices, financials ?? undefined);

            const addr = addresses[0];
            const address: AdminAccountAddress = {
                street: addr?.line1 || '',
                city: addr?.city || '',
                state: addr?.state || '',
                zip: addr?.zip || '',
                country: addr?.country || '',
            };

            return {
                ...base,
                address,
                salesRep: 'Unassigned',
                paymentTerms: account.paymentTermsCode || 'Net 30',
                memberSince: '',
                taxId: '',
                openOrders: orders.map(mapOrder),
                openInvoices: invoices.map(mapInvoice),
                openQuotes: quotes.map(mapQuote),
            };
        } catch (e) {
            console.error('Failed to fetch account details', e);
            return null;
        }
    }

    async inviteTeamMember(_email: string, _name: string, _role: string): Promise<void> {
        // Backend team invitation endpoint not yet available.
        // Wire to POST /team/invite when implemented.
        throw new Error('Team invitations are not yet available. This feature is coming soon.');
    }
}

export const AdminDataService = new AdminDataServiceImpl();
