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
import type { Account } from '../connect/types/domain.js';
import { mapQuoteToEstimate, mapJobToProject, mapOrderToLegacy, mapInvoiceToLegacy, mapOrderLineToLegacy, mapInvoiceLineToLegacy } from '../connect/mappers.js';

/**
 * Maps backend Account + AccountFinancials to legacy AccountData format
 * Provides backward compatibility for existing UI components
 */
function mapAccountToLegacy(account: Account, financials: AccountFinancials): AccountData {
    // Parse name into first/last (backend may provide just 'name')
    const nameParts = (account.name ?? 'User').split(' ');
    const firstName = nameParts[0] ?? 'User';
    const lastName = nameParts.slice(1).join(' ') || '';
    const fullName = account.name ?? 'User';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1) || ''}`.toUpperCase();

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
            phone: '(555) 123-4567',  // Default support info
            email: 'support@velocity.com',
        },
        team: [],  // Team data fetched separately if needed
        location: '',  // Location can be derived from addresses if needed
    };
}

class DataServiceImpl {
    private accountData: AccountData | null = null;
    private currentAccountId: number | null = null;
    private ordersData: Order[] | null = null;
    private invoicesData: Invoice[] | null = null;
    private estimatesData: Estimate[] | null = null;
    private projectsData: Project[] | null = null;

    /**
     * Fetch account data from API
     * Fetches account list, then account details + financials
     * Maps to legacy AccountData format for backward compatibility
     */
    async getAccountData(): Promise<AccountData> {
        if (this.accountData) return this.accountData;

        // Fetch accounts list to get the user's account
        const accounts = await AccountService.getAccounts();
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found for user');
        }

        // Use the first account (primary account)
        const primaryAccount = accounts[0];
        this.currentAccountId = primaryAccount.id;

        // Fetch full account details and financials in parallel
        const [accountDetails, financials] = await Promise.all([
            AccountService.getAccount(primaryAccount.id),
            AccountService.getAccountFinancials(primaryAccount.id),
        ]);

        // Map to legacy format
        this.accountData = mapAccountToLegacy(accountDetails, financials);
        return this.accountData;
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
    async getOrders(): Promise<Order[]> {
        const backendOrders = await SalesService.getOrders();
        this.ordersData = backendOrders.map(mapOrderToLegacy);
        return this.ordersData;
    }

    /**
     * Get a single order by ID
     */
    async getOrderById(orderId: string): Promise<Order | undefined> {
        const id = parseInt(orderId);
        if (!isNaN(id)) {
            const o = await SalesService.getOrderDetails(id);
            return mapOrderToLegacy(o);
        }
        const orders = await this.getOrders();
        return orders.find(o => o.id === orderId || o.orderNumber === orderId);
    }

    /**
     * Get invoices via API
     */
    async getInvoices(): Promise<Invoice[]> {
        const backendInvoices = await SalesService.getInvoices();
        this.invoicesData = backendInvoices.map(mapInvoiceToLegacy);
        return this.invoicesData;
    }

    /**
     * Get a single invoice by ID
     */
    async getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
        const invoices = await this.getInvoices();
        return invoices.find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);
    }

    /**
     * Get estimates (Quotes) via API
     */
    async getEstimates(): Promise<Estimate[]> {
        const quotes = await SalesService.getQuotes();
        this.estimatesData = quotes.map(mapQuoteToEstimate);
        return this.estimatesData;
    }

    /**
     * Get line items for a quote
     */
    async getQuoteLines(quoteId: string): Promise<OrderLine[]> {
        const id = parseInt(quoteId);
        if (isNaN(id)) return [];
        const lines = await SalesService.getQuoteLines(id);
        return lines.map(mapOrderLineToLegacy);
    }

    /**
     * Get line items for an order
     */
    async getOrderLines(orderId: string): Promise<OrderLine[]> {
        const id = parseInt(orderId);
        if (isNaN(id)) return [];
        const lines = await SalesService.getOrderLines(id);
        return lines.map(mapOrderLineToLegacy);
    }

    /**
     * Get line items for an invoice
     */
    async getInvoiceLines(invoiceId: string): Promise<InvoiceLine[]> {
        const id = String(invoiceId);
        const backendLines = await BillingService.getInvoiceLines(id);
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
     * Get Dashboard Summary
     * Requires getAccountData() to be called first to set currentAccountId
     */
    async getDashboardSummary(): Promise<DashboardSummary> {
        if (!this.currentAccountId) {
            // Ensure account data is loaded first
            await this.getAccountData();
        }
        if (!this.currentAccountId) {
            throw new Error('No account ID available for dashboard summary');
        }
        return DashboardService.getSummary(this.currentAccountId);
    }

    /**
     * Clear all cached data
     */
    clearCache(): void {
        this.accountData = null;
        this.currentAccountId = null;
        this.ordersData = null;
        this.invoicesData = null;
        this.estimatesData = null;
        this.projectsData = null;
    }
}

// Singleton export
export const DataService = new DataServiceImpl();
