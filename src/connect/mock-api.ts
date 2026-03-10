// ==========================================
// MOCK API INTERCEPTOR FOR SALES DEMO
// ==========================================

import type { Order, Invoice, Estimate, Project, DashboardSummary, Account, JobSummary, Product, OrderLine, InvoiceLine } from './types/domain.js';

// --- DEMO DATA STORE ---
const mockDataStore = {
    branding: {
        templateId: 1,
        paletteId: 2,
        primaryColor: "#0f172a",
        secondaryColor: "#e2e8f0",
        fontFamily: "Inter, sans-serif",
        logoUrl: "/vite.svg", // Replace with actual logo path if needed
        accountTitle: "Empire Building Materials | Customer Portal",
        adminTitle: "Empire Building Materials | Admin Portal",
        contactEmail: "sales@empirebuildingmaterials.com",
        contactPhone: "(888) 555-0199",
        updatedAt: new Date().toISOString()
    },
    accounts: [
        {
            id: 1,
            name: "Summit Construction Corp",
            email: "purchasing@summitconstruction.com",
            phone: "(555) 123-4567",
            status: "active",
            createdAt: new Date().toISOString()
        }
    ],
    accountFinancials: {
        accountId: 1,
        creditLimit: 50000.00,
        availableCredit: 34500.00,
        balance: 15500.00,
        pastDue: 0.00,
        lastPaymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lastPaymentAmount: 5200.00
    },
    dashboardSummary: {
        openOrdersCount: 12,
        pendingQuotesCount: 5,
        unpaidInvoicesCount: 3,
        totalBalance: 15500.00,
        availableCredit: 34500.00
    },
    jobSummaries: [
        { id: 101, name: "Downtown Office Plaza", status: "active", createdAt: new Date().toISOString() },
        { id: 102, name: "Riverside Residential Complex", status: "active", createdAt: new Date().toISOString() }
    ],
    orders: [
        {
            id: 1001,
            accountId: 1,
            jobId: 101,
            referenceNumber: "PO-2023-1101",
            status: "processing",
            totalAmount: 4250.00,
            subtotal: 4000.00,
            taxAmount: 250.00,
            shippingAmount: 0,
            currency: "USD",
            placedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            shippingAddress: { street1: "100 Main St", city: "Metropolis", state: "NY", postalCode: "10001", country: "US" }
        },
        {
            id: 1002,
            accountId: 1,
            jobId: 102,
            referenceNumber: "PO-2023-1102",
            status: "shipped",
            totalAmount: 11250.00,
            subtotal: 10500.00,
            taxAmount: 750.00,
            shippingAmount: 0,
            currency: "USD",
            placedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            shippingAddress: { street1: "550 River Rd", city: "Metropolis", state: "NY", postalCode: "10002", country: "US" }
        }
    ],
    invoices: [
        {
            id: 5001,
            accountId: 1,
            jobId: 101,
            orderId: 1001,
            invoiceNumber: "INV-23-001",
            status: "unpaid",
            totalAmount: 4250.00,
            subtotal: 4000.00,
            taxAmount: 250.00,
            amountDue: 4250.00,
            amountPaid: 0,
            currency: "USD",
            issuedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 5002,
            accountId: 1,
            jobId: 102,
            orderId: 1002,
            invoiceNumber: "INV-23-002",
            status: "unpaid",
            totalAmount: 11250.00,
            subtotal: 10500.00,
            taxAmount: 750.00,
            amountDue: 11250.00,
            amountPaid: 0,
            currency: "USD",
            issuedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            dueDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    quotes: [
        {
            id: 3001,
            accountId: 1,
            jobId: 101,
            referenceNumber: "RFQ-23-401",
            status: "pending",
            totalAmount: 8500.00,
            subtotal: 8000.00,
            taxAmount: 500.00,
            currency: "USD",
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
        }
    ],
    salesRep: {
        id: 99,
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "s.jenkins@empirebuildingmaterials.com",
        phone: "(555) 987-6543"
    }
};

// --- INTERCEPTOR LOGIC ---
export class MockApi {
    static async handle(endpoint: string, options: RequestInit = {}): Promise<any> {
        console.log(`[Mock API] Intercepted Request: ${options.method || 'GET'} ${endpoint}`);

        // Add artificial delay to simulate network (300ms)
        await new Promise(resolve => setTimeout(resolve, 300));

        const path = endpoint.split('?')[0];

        // 1. Branding / Config / UI
        if (path.includes('/branding/storefront')) {
            return mockDataStore.branding;
        }

        // 2. Account & User Context
        if (path.includes('/auth/me') || path.includes('/user')) {
            return { user: { id: 1, firstName: "Demo", lastName: "User" } };
        }
        if (path.includes('/accounts')) {
            // Check for specific account vs list
            const match = path.match(/\/accounts\/(\d+)(?:\/(.*))?/);
            if (match) {
                const id = parseInt(match[1]);
                const sub = match[2];
                if (sub === 'financials') return mockDataStore.accountFinancials;
                if (sub === 'users') return []; // no team members mock for now
                return mockDataStore.accounts.find(a => a.id === id) || mockDataStore.accounts[0];
            }
            return mockDataStore.accounts;
        }

        // 3. Dashboard
        if (path.includes('/dashboard/summary')) {
            return mockDataStore.dashboardSummary;
        }

        // 4. Jobs / Projects
        if (path.includes('/jobs/summaries')) {
            return mockDataStore.jobSummaries;
        }
        if (path.includes('/jobs')) {
            return mockDataStore.jobSummaries;
        }

        // 5. Orders
        if (path.includes('/sales/orders')) {
            const match = path.match(/\/sales\/orders\/(\d+)/);
            if (match) {
                const id = parseInt(match[1]);
                if (path.includes('/lines')) {
                    return []; // Empty lines for simplicity
                }
                return mockDataStore.orders.find(o => o.id === id);
            }
            return { items: mockDataStore.orders, total: mockDataStore.orders.length };
        }

        // 6. Invoices
        if (path.includes('/billing/invoices') || path.includes('/sales/invoices')) {
            const match = path.match(/\/billing\/invoices\/(\d+)/);
            if (match) {
                const id = parseInt(match[1]);
                if (path.includes('/lines')) {
                    return [];
                }
                return mockDataStore.invoices.find(i => i.id === id);
            }
            return { items: mockDataStore.invoices, total: mockDataStore.invoices.length };
        }

        // 7. Quotes / Estimates
        if (path.includes('/sales/quotes')) {
            const match = path.match(/\/sales\/quotes\/(\d+)/);
            if (match) {
                if (path.includes('/lines')) return [];
                return mockDataStore.quotes.find(q => q.id === parseInt(match[1]));
            }
            return { items: mockDataStore.quotes, total: mockDataStore.quotes.length };
        }

        // 8. Admin Endpoints 
        if (path.includes('/admin/tenants')) {
            return {
                items: [
                    { id: 1, name: "Empire Building Materials", subdomain: "empire", customDomain: "portal.empirebuildingmaterials.com", status: "active", createdAt: new Date().toISOString() }
                ],
                total: 1
            };
        }

        if (path.includes('/admin/users')) {
            return { items: [], total: 0 };
        }

        // Fallback catch-all
        console.warn(`[Mock API] Unhandled endpoint: ${endpoint}, returning empty object.`);
        return {};
    }
}
