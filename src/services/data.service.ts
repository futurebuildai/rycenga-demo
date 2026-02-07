/**
 * DataService - Singleton for fetching and caching data
 * Provides typed access to account data, orders, invoices, and estimates
 * Uses AccountService for real API data with mapping to legacy types
 */

import type {
    AccountData,
    Order,  // Legacy types
    Invoice,
    Estimate,
    Project,
    DashboardSummary,
    OrderLine,
    InvoiceLine
} from '../types/index.js';

import { SalesService } from '../connect/services/sales.js';
import { JobsService } from '../connect/services/jobs.js';
import { DashboardService } from '../connect/services/dashboard.js';
import { AccountService, type AccountFinancials } from '../connect/services/account.js';
import { BillingService } from '../connect/services/billing.js';
import { BrandingService } from './branding.service.js';
import { AuthService } from './auth.service.js';
import type { Account, JobSummary } from '../connect/types/domain.js';
import { mapQuoteToEstimate, mapJobToProject, mapOrderToLegacy, mapInvoiceToLegacy, mapOrderLineToLegacy, mapInvoiceLineToLegacy } from '../connect/mappers.js';

/**
 * Maps backend Account + AccountFinancials to legacy AccountData format
 * Provides backward compatibility for existing UI components
 * Support info now comes from BrandingService instead of hardcoded defaults
 */
function mapAccountToLegacy(account: Account, financials: AccountFinancials): AccountData {
    // Parse name into first/last (backend may provide just 'name')
    const nameParts = (account.name ?? 'User').split(' ');
    const firstName = nameParts[0] ?? 'User';
    const lastName = nameParts.slice(1).join(' ') || '';
    const fullName = account.name ?? 'User';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1) || ''}`.toUpperCase();

    // Get support info from branding service (will be the cached sync value or defaults)
    const branding = BrandingService.getBrandingSync();

    return {
        user: {
            id: String(account.id),
            firstName,
            lastName,
            fullName,
            initials,
            email: account.email ?? '',
            phone: account.phone ?? '',
        },
        company: {
            id: String(account.id),
            name: account.name ?? 'Company',
            limit: financials.creditLimit,
            available: financials.availableCredit,
            balance: financials.balance,
        },
        support: {
            phone: branding.contactPhone,
            email: branding.contactEmail,
        },
        team: [],  // Team data fetched separately if needed
        location: '',  // Location can be derived from addresses if needed
    };
}

class DataServiceImpl {
    private accountData: AccountData | null = null;
    private pendingAccountData?: Promise<AccountData>;
    private currentAccountId: number | null = null;
    private dashboardSummary: DashboardSummary | null = null;
    private pendingDashboardSummary?: Promise<DashboardSummary>;
    private ordersData: Order[] | null = null;
    private invoicesData: Invoice[] | null = null;
    private estimatesData: Estimate[] | null = null;
    private projectsData: Project[] | null = null;
    private jobSummariesData: JobSummary[] | null = null;

    /**
     * Fetch account data from API
     * Fetches account list, then account details + financials
     * Maps to legacy AccountData format for backward compatibility
     */
    async getAccountData(): Promise<AccountData> {
        if (this.accountData) return this.accountData;
        if (this.pendingAccountData) return this.pendingAccountData;

        this.pendingAccountData = (async () => {
            const user = AuthService.getUser();
            const userAccountId = user?.accountId ?? null;

            if (userAccountId) {
                this.currentAccountId = userAccountId;
            } else {
                // Fetch accounts list to get the user's account
                const accounts = await AccountService.getAccounts();
                if (!accounts || accounts.length === 0) {
                    throw new Error('No accounts found for user');
                }
                // Use the first account (primary account)
                const primaryAccount = accounts[0];
                this.currentAccountId = primaryAccount.id;
            }

            // Fetch full account details and financials in parallel
            const [accountDetails, financials] = await Promise.all([
                AccountService.getAccount(this.currentAccountId!),
                AccountService.getAccountFinancials(this.currentAccountId!),
            ]);

            // Map to legacy format
            this.accountData = mapAccountToLegacy(accountDetails, financials);
            return this.accountData;
        })();

        try {
            return await this.pendingAccountData;
        } finally {
            this.pendingAccountData = undefined;
        }
    }

    /**
     * Get the current account ID (after getAccountData is called)
     */
    getCurrentAccountId(): number | null {
        return this.currentAccountId;
    }

    /**
     * Get orders via API
     */
    async getOrders(limit = 25, offset = 0): Promise<{ items: Order[]; total: number }> {
        const { items: backendOrders, total } = await SalesService.getOrders({ limit, offset });
        const items = backendOrders.map(mapOrderToLegacy);
        this.ordersData = items;
        return { items, total };
    }

    /**
     * Get a single order by ID
     */
    async getOrderById(orderId: number): Promise<Order | undefined> {
        const o = await SalesService.getOrderDetails(orderId);
        return mapOrderToLegacy(o);
    }

    /**
     * Get invoices via API
     */
    async getInvoices(): Promise<Invoice[]> {
        const { items: backendInvoices } = await SalesService.getInvoices();
        this.invoicesData = backendInvoices.map(mapInvoiceToLegacy);
        return this.invoicesData;
    }

    /**
     * Get a single invoice by ID
     */
    async getInvoiceById(invoiceId: string | number): Promise<Invoice | undefined> {
        const invoices = await this.getInvoices();
        const id = typeof invoiceId === 'number' ? invoiceId : parseInt(invoiceId, 10);
        return invoices.find(i => i.id === id || i.invoiceNumber === String(invoiceId));
    }

    /**
     * Get estimates (Quotes) via API
     */
    async getEstimates(limit = 25, offset = 0): Promise<{ items: Estimate[]; total: number }> {
        const { items: quotes, total } = await SalesService.getQuotes({ limit, offset });
        const items = quotes.map(mapQuoteToEstimate);
        this.estimatesData = items;
        return { items, total };
    }

    /**
     * Get line items for a quote
     */
    async getQuoteLines(quoteId: number): Promise<OrderLine[]> {
        const lines = await SalesService.getQuoteLines(quoteId);
        return lines.map(mapOrderLineToLegacy);
    }

    /**
     * Get line items for an order
     */
    async getOrderLines(orderId: number): Promise<OrderLine[]> {
        const lines = await SalesService.getOrderLines(orderId);
        return lines.map(mapOrderLineToLegacy);
    }

    /**
     * Get line items for an invoice
     */
    async getInvoiceLines(invoiceId: number): Promise<InvoiceLine[]> {
        const backendLines = await BillingService.getInvoiceLines(invoiceId);
        return backendLines.map(mapInvoiceLineToLegacy);
    }

    /**
     * Get Projects (Jobs) via API
     */
    async getProjects(): Promise<Project[]> {
        const jobs = await JobsService.getJobs();
        this.projectsData = jobs.map(mapJobToProject);
        return this.projectsData;
    }

    /**
     * Get Job Summaries via API
     */
    async getJobSummaries(): Promise<JobSummary[]> {
        if (this.jobSummariesData) return this.jobSummariesData;
        this.jobSummariesData = await JobsService.getJobSummaries();
        return this.jobSummariesData;
    }

    /**
     * Get Dashboard Summary
     * Uses auth/account context on backend.
     */
    async getDashboardSummary(): Promise<DashboardSummary> {
        if (this.dashboardSummary) return this.dashboardSummary;
        if (this.pendingDashboardSummary) return this.pendingDashboardSummary;
        if (!this.currentAccountId) {
            // Keep account context available for compatibility fallback only.
            await this.getAccountData();
        }
        this.pendingDashboardSummary = (async () => {
            const summary = await DashboardService.getSummary();
            this.dashboardSummary = summary;
            return summary;
        })();

        try {
            return await this.pendingDashboardSummary;
        } finally {
            this.pendingDashboardSummary = undefined;
        }
    }

    /**
     * Clear all cached data
     */
    clearCache(): void {
        this.accountData = null;
        this.currentAccountId = null;
        this.dashboardSummary = null;
        this.pendingDashboardSummary = undefined;
        this.ordersData = null;
        this.invoicesData = null;
        this.estimatesData = null;
        this.projectsData = null;
        this.jobSummariesData = null;
    }
}

// Singleton export
export const DataService = new DataServiceImpl();
