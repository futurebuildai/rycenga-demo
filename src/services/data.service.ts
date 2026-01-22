/**
 * DataService - Singleton for fetching and caching mock data
 * Provides typed access to account data, orders, invoices, and estimates
 */

import type {
    AccountData,
    Order,  // Legacy types
    Invoice,
    Estimate,
    Project
} from '../types/index.js';

import { SalesService } from '../connect/services/sales.js';
import { JobsService } from '../connect/services/jobs.js';
import { mapQuoteToEstimate, mapJobToProject, mapOrderToLegacy, mapInvoiceToLegacy } from '../connect/mappers.js';

class DataServiceImpl {
    private accountData: AccountData | null = null;
    private ordersData: Order[] | null = null;
    private invoicesData: Invoice[] | null = null;
    private estimatesData: Estimate[] | null = null;
    private projectsData: Project[] | null = null;

    /**
     * Fetch account data
     * @TODO: Replace with actual AccountService call
     */
    async getAccountData(): Promise<AccountData> {
        if (this.accountData) return this.accountData;
        const response = await fetch('./data/account.json');
        if (!response.ok) throw new Error('Failed to load account data');
        this.accountData = await response.json() as AccountData;
        return this.accountData;
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
     * Get Projects (Jobs) via API
     */
    async getProjects(): Promise<Project[]> {
        const jobs = await JobsService.getJobs();
        this.projectsData = jobs.map(mapJobToProject);
        return this.projectsData;
    }

    /**
     * Clear all cached data
     */
    clearCache(): void {
        this.accountData = null;
        this.ordersData = null;
        this.invoicesData = null;
        this.estimatesData = null;
        this.projectsData = null;
    }
}

// Singleton export
export const DataService = new DataServiceImpl();
