/**
 * DataService - Singleton for fetching and caching mock data
 * Provides typed access to account data, orders, invoices, and estimates
 */

import type {
    AccountData,
    Order,
    OrderStatus,
    Invoice,
    InvoiceStatus,
    Estimate
} from '../types/index.js';

class DataServiceImpl {
    private accountData: AccountData | null = null;
    private ordersData: Order[] | null = null;
    private invoicesData: Invoice[] | null = null;
    private estimatesData: Estimate[] | null = null;

    /**
     * Fetch account data from mock JSON
     */
    async getAccountData(): Promise<AccountData> {
        if (this.accountData) return this.accountData;

        const response = await fetch('./data/account.json');
        if (!response.ok) {
            throw new Error('Failed to load account data');
        }
        this.accountData = await response.json() as AccountData;
        return this.accountData;
    }

    /**
     * Get mock orders data (simulates API call)
     * Data structure mirrors account.js ordersData
     */
    async getOrders(): Promise<Order[]> {
        if (this.ordersData) return this.ordersData;

        // Simulate async API call with mock data from account.js
        this.ordersData = [
            {
                id: 'ORD-478242',
                orderNumber: 'ORD-478242',
                userId: 'u123',
                projectId: 'proj-001',
                status: 'delivered' as OrderStatus,
                total: 2480.80,
                createdAt: '2026-01-10',
                lines: [
                    { id: '1', productId: 'p1', sku: '100-2414', name: '2" x 4" x 14\' SPF', quantity: 100, unitPrice: 9.20, lineTotal: 920.00 },
                    { id: '2', productId: 'p2', sku: 'H-GS-5', name: 'Gold Star Screw 1-5/8" 5#', quantity: 5, unitPrice: 45.00, lineTotal: 225.00 },
                    { id: '3', productId: 'p3', sku: 'T-DW-20V', name: 'DeWalt 20V Max Drill Kit', quantity: 1, unitPrice: 99.00, lineTotal: 99.00 },
                ],
            },
            {
                id: 'ORD-476918',
                orderNumber: 'ORD-476918',
                userId: 'u123',
                projectId: 'proj-002',
                status: 'shipped' as OrderStatus,
                total: 1839.56,
                createdAt: '2026-01-12',
                lines: [
                    { id: '4', productId: 'p4', sku: '100-2408-T', name: '2" x 4" Treated Wood', quantity: 50, unitPrice: 8.50, lineTotal: 425.00 },
                    { id: '5', productId: 'p5', sku: 'L-IJ-1178', name: 'I-Joist, RFPI 80S 11-7/8" x 10\'', quantity: 20, unitPrice: 45.20, lineTotal: 904.00 },
                    { id: '6', productId: 'p6', sku: 'SO-999', name: 'Special Order Item', quantity: 1, unitPrice: 510.56, lineTotal: 510.56 },
                ],
            },
            {
                id: 'ORD-476909',
                orderNumber: 'ORD-476909',
                userId: 'u123',
                projectId: 'proj-003',
                status: 'confirmed' as OrderStatus,
                total: 277.93,
                createdAt: '2026-01-14',
                lines: [
                    { id: '7', productId: 'p7', sku: '100-2410', name: '2" x 4" x 10\' SPF', quantity: 20, unitPrice: 6.50, lineTotal: 130.00 },
                    { id: '8', productId: 'p8', sku: 'DG-Mud-5', name: 'Sheetrock Ultralight Drywall Compound', quantity: 4, unitPrice: 18.25, lineTotal: 73.00 },
                    { id: '9', productId: 'p9', sku: 'DG-Tape', name: 'Joint Tape 250\'', quantity: 2, unitPrice: 3.49, lineTotal: 6.98 },
                    { id: '10', productId: 'p10', sku: 'T-Sand-M', name: 'Sanding Sponge', quantity: 5, unitPrice: 2.99, lineTotal: 14.95 },
                ],
            },
        ];

        return this.ordersData;
    }

    /**
     * Get a single order by ID
     */
    async getOrderById(orderId: string): Promise<Order | undefined> {
        const orders = await this.getOrders();
        return orders.find(o => o.id === orderId);
    }

    /**
     * Get mock invoices data
     */
    async getInvoices(): Promise<Invoice[]> {
        if (this.invoicesData) return this.invoicesData;

        this.invoicesData = [
            {
                id: 'INV-336318',
                invoiceNumber: 'INV-336318',
                projectId: 'proj-001',
                status: 'open' as InvoiceStatus,
                dueDate: '2026-01-25',
                subtotal: 14733.04,
                tax: 1215.47,
                total: 15948.51,
                amountPaid: 0,
                amountDue: 15948.51,
                createdAt: '2026-01-05',
            },
            {
                id: 'INV-W71083',
                invoiceNumber: 'INV-W71083',
                projectId: 'proj-002',
                status: 'open' as InvoiceStatus,
                dueDate: '2026-01-28',
                subtotal: 21.93,
                tax: 1.81,
                total: 23.74,
                amountPaid: 0,
                amountDue: 23.74,
                createdAt: '2026-01-08',
            },
            {
                id: 'INV-335252',
                invoiceNumber: 'INV-335252',
                projectId: 'proj-001',
                status: 'open' as InvoiceStatus,
                dueDate: '2026-01-30',
                subtotal: 312.50,
                tax: 25.78,
                total: 338.28,
                amountPaid: 0,
                amountDue: 338.28,
                createdAt: '2026-01-10',
            },
            {
                id: 'INV-334001',
                invoiceNumber: 'INV-334001',
                projectId: 'proj-001',
                status: 'overdue' as InvoiceStatus,
                dueDate: '2026-01-01',
                subtotal: 2450.00,
                tax: 202.13,
                total: 2652.13,
                amountPaid: 0,
                amountDue: 2652.13,
                createdAt: '2025-12-15',
            },
        ];

        return this.invoicesData;
    }

    /**
     * Get a single invoice by ID
     */
    async getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
        const invoices = await this.getInvoices();
        return invoices.find(i => i.id === invoiceId);
    }

    /**
     * Get mock estimates data
     */
    async getEstimates(): Promise<Estimate[]> {
        if (this.estimatesData) return this.estimatesData;

        this.estimatesData = [
            {
                id: 'EST-14014',
                estimateNumber: 'EST-14014',
                projectId: 'proj-001',
                status: 'sent',
                validUntil: '2026-01-31',
                subtotal: 1312.00,
                tax: 108.00,
                total: 1420.00,
                createdAt: '2026-01-10',
            },
            {
                id: 'EST-14029',
                estimateNumber: 'EST-14029',
                projectId: 'proj-002',
                status: 'accepted',
                validUntil: '2026-01-20',
                subtotal: 1535.19,
                tax: 125.81,
                total: 1661.00,
                createdAt: '2026-01-05',
            },
            {
                id: 'EST-13990',
                estimateNumber: 'EST-13990',
                projectId: 'proj-003',
                status: 'expired',
                validUntil: '2025-12-31',
                subtotal: 416.00,
                tax: 34.00,
                total: 450.00,
                createdAt: '2025-12-15',
            },
        ];

        return this.estimatesData;
    }

    /**
     * Clear all cached data (useful for logout)
     */
    clearCache(): void {
        this.accountData = null;
        this.ordersData = null;
        this.invoicesData = null;
        this.estimatesData = null;
    }
}

// Singleton export
export const DataService = new DataServiceImpl();
