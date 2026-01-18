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
import { mapQuoteToEstimate, mapJobToProject } from '../connect/mappers.js';
import { AuthService } from './auth.service.js';

class DataServiceImpl {
    private accountData: AccountData | null = null;
    private ordersData: Order[] | null = null;
    private invoicesData: Invoice[] | null = null;
    private estimatesData: Estimate[] | null = null;
    private projectsData: Project[] | null = null;

    private getAccountId(): number {
        const user = AuthService.getUser();
        // Fallback or error if no account ID. For now assuming 1 if missing for dev/demo.
        return user?.accountId || 1;
    }

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
        // If we want caching, we can uncomment:
        // if (this.ordersData) return this.ordersData;

        const backendOrders = await SalesService.getOrders(this.getAccountId());

        // Map Backend Order to Frontend Order
        // Current FE Order type: { id, orderNumber, userId, projectId, status, total, createdAt, lines }
        // BE Order type: { id, orderNumber, orderDate, subtotal, taxTotal, total, status, jobId, poNumber }

        this.ordersData = backendOrders.map(o => ({
            id: o.orderNumber, // FE often uses string ID, BE uses int ID. Using OrderNumber as ID for FE compatibility or String(o.id)
            orderNumber: o.orderNumber,
            userId: 'current', // Placeholder
            projectId: o.jobId ? o.jobId.toString() : '',
            status: o.status as any, // Cast to FE status or map strict
            total: o.total,
            createdAt: o.orderDate,
            lines: [] // BE might not return lines in list view, might need detail fetch
        }));

        return this.ordersData;
    }

    /**
     * Get a single order by ID
     */
    async getOrderById(orderId: string): Promise<Order | undefined> {
        // Warning: This expects orderId to be parseable as int for the API
        // If the FE passes "ORD-123", we might fail. 
        // We will try to fetch list first for safety or parse if number
        const id = parseInt(orderId);
        if (!isNaN(id)) {
            const o = await SalesService.getOrderDetails(id);
            return {
                id: o.orderNumber,
                orderNumber: o.orderNumber,
                userId: 'current',
                projectId: o.jobId ? o.jobId.toString() : '',
                status: o.status as any,
                total: o.total,
                createdAt: o.orderDate,
                lines: [], // Populate if available
            };
        }

        // Fallback to searching the list if ID is string based
        const orders = await this.getOrders();
        return orders.find(o => o.id === orderId || o.orderNumber === orderId);
    }

    /**
     * Get invoices via API
     */
    async getInvoices(): Promise<Invoice[]> {
        const backendInvoices = await SalesService.getInvoices(this.getAccountId());

        // Map BE Invoice to FE Invoice
        this.invoicesData = backendInvoices.map(i => ({
            id: i.invoiceNumber,
            invoiceNumber: i.invoiceNumber,
            projectId: '', // Not always on invoice summary
            status: i.status as any,
            dueDate: i.dueDate || '',
            subtotal: i.total - i.balanceDue, // Approximation or fetch detail
            tax: 0,
            total: i.total,
            amountPaid: i.total - i.balanceDue,
            amountDue: i.balanceDue,
            createdAt: i.invoiceDate
        }));

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
        const jobs = await JobsService.getJobs(this.getAccountId());
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
