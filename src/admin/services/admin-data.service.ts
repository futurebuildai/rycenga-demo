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
    OrderLine,
    Invoice,
    InvoiceLine,
    Quote,
    QuoteLine,
    User,
    UserRole,
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
    internalId: number;
    date: string;
    total: number;
    status: 'Pending' | 'Processing' | 'Shipped';
    itemsCount: number;
}

export interface AdminInvoice {
    id: string; // Display ID (invoice number)
    internalId: number; // Database ID for API calls
    date: string;
    dueDate: string;
    total: number;
    balance: number;
    status: 'Open' | 'Past Due' | 'Paid';
}

export interface AdminInvoiceDetails extends AdminInvoice {
    lines: AdminInvoiceLine[];
    pdfUrl?: string;
}

export interface AdminInvoiceLine {
    id: number;
    description: string;
    itemCode: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface AdminQuote {
    id: string;
    internalId: number;
    date: string;
    expiryDate: string;
    total: number;
    status: 'Draft' | 'Sent' | 'Expired';
    name: string;
}

export interface AdminOrderDetails extends AdminOrder {
    subtotal: number;
    taxTotal: number;
    lines: AdminOrderLine[];
}

export interface AdminQuoteDetails extends AdminQuote {
    lines: AdminQuoteLine[];
}

export interface AdminOrderLine {
    id: number;
    itemCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface AdminQuoteLine {
    id: number;
    itemCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface AdminAccountDetails extends AdminAccount {
    address: AdminAccountAddress;
    salesRep: string;
    paymentTerms: string;
    memberSince: string;
    taxId: string;
    openOrders: AdminOrder[];
    openInvoices?: AdminInvoice[]; // Now loaded async
    openQuotes: AdminQuote[];
}

export interface AdminUser {
    id: number;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    accountId?: number;
    phone?: string;
    accountAssignments?: AdminAccountAssignment[];
}

export interface CreateAdminUserInput {
    name: string;
    email: string;
    role: UserRole;
    password: string;
    isActive: boolean;
    phone?: string;
    accountAssignments?: AdminAccountAssignmentInput[];
}

export interface UpdateAdminUserInput {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    phone?: string;
    accountAssignments?: AdminAccountAssignmentInput[];
}

export interface AdminAccountAssignment {
    id: number;
    accountId: number;
    assignmentType: string;
    isPrimary: boolean;
    createdAt: string;
}

export interface AdminAccountAssignmentInput {
    accountId: number;
    assignmentType: string;
    isPrimary: boolean;
}

export type AdminAccountSort = 'name' | 'balance-desc' | 'past-due-desc' | 'age-desc';

interface PaginatedResponse<T> {
    items: T[];
    total: number;
}

// --- Helpers ---

const isPastDue = (inv: Invoice): boolean => inv.status === 'past_due';

/** Format an ISO date string to "Jan 15, 2026" style. */
function formatDate(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    status: raw.active ? ((financials?.pastDueBalance ?? 0) > 0 ? 'Overdue' : 'Active') : 'Hold',
    creditLimit: financials?.creditLimit ?? raw.creditLimit ?? 0,
    balance: financials?.totalBalance ?? raw.balance ?? 0,
    availableCredit: financials?.availableCredit ?? raw.availableCredit ?? 0,
    pastDueBalance: financials?.pastDueBalance ?? 0,
    aging: financials?.aging ?? 'Current',
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
        internalId: raw.id,
        date: formatDate(raw.orderDate),
        total: raw.total,
        status,
        itemsCount: 0,
    };
};

const mapInvoice = (raw: Invoice): AdminInvoice => ({
    id: raw.invoiceNumber || String(raw.id),
    internalId: raw.id,
    date: formatDate(raw.invoiceDate),
    dueDate: formatDate(raw.dueDate),
    total: raw.total,
    balance: raw.balanceDue,
    status: raw.status === 'open' ? 'Open' : isPastDue(raw) ? 'Past Due' : 'Paid',
});

const mapInvoiceLine = (raw: InvoiceLine): AdminInvoiceLine => ({
    id: raw.id,
    description: raw.description || raw.itemCode,
    itemCode: raw.itemCode,
    quantity: raw.quantityBilled,
    unitPrice: raw.unitPrice,
    total: raw.extendedPrice,
});

const mapQuote = (raw: Quote): AdminQuote => ({
    id: raw.quoteNumber || String(raw.id),
    internalId: raw.id,
    date: formatDate(raw.quoteDate),
    expiryDate: formatDate(raw.expiresOn),
    total: raw.total,
    status: (raw.status === 'sent' || raw.status === 'viewed') ? 'Sent'
        : raw.status === 'expired' ? 'Expired'
            : 'Draft',
    name: raw.quoteNumber,
});

const mapOrderLine = (raw: OrderLine): AdminOrderLine => ({
    id: raw.id,
    itemCode: raw.itemCode,
    description: raw.description || raw.itemCode,
    quantity: raw.quantityOrdered,
    unitPrice: raw.unitPrice,
    total: raw.extendedPrice,
});

const mapQuoteLine = (raw: QuoteLine): AdminQuoteLine => ({
    id: raw.id,
    itemCode: raw.itemCode,
    description: raw.description || raw.itemCode,
    quantity: raw.quantity,
    unitPrice: raw.unitPrice,
    total: raw.extendedPrice,
});

const mapAdminUser = (u: User): AdminUser => ({
    id: u.id,
    email: u.email,
    name: u.name || '(No Name)',
    role: u.role,
    isActive: u.isActive,
    accountId: u.accountId,
    phone: u.phone || undefined,
    accountAssignments: u.accountAssignments?.map((a) => ({
        id: a.id,
        accountId: a.accountId,
        assignmentType: a.assignmentType,
        isPrimary: a.isPrimary,
        createdAt: a.createdAt,
    })),
});

// --- Service ---

class AdminDataServiceImpl {
    async getAccounts(limit = 10, offset = 0, pastDueOnly = false, sort: AdminAccountSort = 'name'): Promise<{ items: AdminAccount[], total: number }> {
        const query = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
            past_due_only: String(pastDueOnly),
            sort,
        });
        const response = await adminClient.request<{ items: any[], total: number }>(`/admin/account-dashboard?${query.toString()}`);
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

    async getInvoices(accountId: number, limit = 10, offset = 0): Promise<{ items: AdminInvoice[]; total: number }> {
        const response = await adminClient.request<{ items: any[]; total: number }>(`/invoices?account_id=${accountId}&limit=${limit}&offset=${offset}&status=open`);
        const { items: invoices, total } = response;
        return {
            items: invoices.map(mapInvoice),
            total
        };
    }

    async getOrders(accountId: number, limit = 10, offset = 0): Promise<{ items: AdminOrder[]; total: number }> {
        const response = await adminClient.request<{ items: any[]; total: number }>(`/orders?account_id=${accountId}&limit=${limit}&offset=${offset}&status=open`);
        const { items: orders, total } = response;
        return {
            items: orders.map(mapOrder),
            total,
        };
    }

    async getQuotes(accountId: number, limit = 10, offset = 0): Promise<{ items: AdminQuote[]; total: number }> {
        const response = await adminClient.request<{ items: any[]; total: number }>(`/quotes?account_id=${accountId}&limit=${limit}&offset=${offset}&status=open`);
        const { items: quotes, total } = response;
        return {
            items: quotes.map(mapQuote),
            total,
        };
    }

    async getInvoice(id: number): Promise<AdminInvoiceDetails | null> {
        try {
            const [invoice, lines] = await Promise.all([
                adminClient.request<Invoice>(`/invoices/${id}`),
                adminClient.request<InvoiceLine[]>(`/invoices/${id}/lines`).catch(() => [])
            ]);

            return {
                ...mapInvoice(invoice),
                lines: lines.map(mapInvoiceLine),
                pdfUrl: invoice.pdfUrl,
            };
        } catch (e) {
            console.error('Failed to fetch invoice', e);
            return null;
        }
    }

    async getOrder(id: number): Promise<AdminOrderDetails | null> {
        try {
            const [order, lines] = await Promise.all([
                adminClient.request<Order>(`/orders/${id}`),
                adminClient.request<OrderLine[]>(`/orders/${id}/lines`).catch(() => []),
            ]);
            const mapped = mapOrder(order);
            return {
                ...mapped,
                subtotal: order.subtotal,
                taxTotal: order.taxTotal,
                lines: lines.map(mapOrderLine),
            };
        } catch (e) {
            console.error('Failed to fetch order', e);
            return null;
        }
    }

    async getQuote(id: number): Promise<AdminQuoteDetails | null> {
        try {
            const [quote, lines] = await Promise.all([
                adminClient.request<Quote>(`/quotes/${id}`),
                adminClient.request<QuoteLine[]>(`/quotes/${id}/lines`).catch(() => []),
            ]);
            const mapped = mapQuote(quote);
            return {
                ...mapped,
                lines: lines.map(mapQuoteLine),
            };
        } catch (e) {
            console.error('Failed to fetch quote', e);
            return null;
        }
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

    async getUsers(limit = 25, offset = 0, search = ''): Promise<{ items: AdminUser[]; total: number }> {
        const query = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
        });
        if (search.trim()) {
            query.set('search', search.trim());
        }

        const response = await adminClient.request<{ items: User[]; total: number }>(`/admin/users?${query.toString()}`);
        return {
            items: response.items.map(mapAdminUser),
            total: response.total,
        };
    }

    async createUser(input: CreateAdminUserInput): Promise<AdminUser> {
        const payload: Record<string, unknown> = {
            name: input.name,
            email: input.email,
            role: input.role,
            password: input.password,
            isActive: input.isActive,
            accountAssignments: input.accountAssignments ?? [],
        };
        if (input.phone) {
            payload.phone = input.phone;
        }

        const response = await adminClient.request<User>('/admin/users', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return mapAdminUser(response);
    }

    async getUser(id: number): Promise<AdminUser> {
        const response = await adminClient.request<User>(`/admin/users/${id}`);
        return mapAdminUser(response);
    }

    async updateUser(input: UpdateAdminUserInput): Promise<AdminUser> {
        const payload: Record<string, unknown> = {
            name: input.name,
            email: input.email,
            role: input.role,
            isActive: input.isActive,
            phone: input.phone ?? null,
            accountAssignments: input.accountAssignments ?? [],
        };

        const response = await adminClient.request<User>(`/admin/users/${input.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        return mapAdminUser(response);
    }

    async getAccountDetails(id: number): Promise<AdminAccountDetails | null> {
        try {
            const [account, addresses, financials] = await Promise.all([
                adminClient.request<Account>(`/accounts/${id}`),
                adminClient.request<AccountAddress[]>(`/accounts/${id}/addresses`).catch((): AccountAddress[] => []),
                adminClient.request<AccountFinancials>(`/accounts/${id}/financials`).catch((): AccountFinancials | null => null),
            ]);

            const base = mapAccount(account, undefined, financials ?? undefined);

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
                openOrders: [],
                openQuotes: [],
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
