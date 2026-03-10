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
        { id: 1, name: "Summit Construction Corp", number: "ACC-001", email: "purchasing@summitconstruction.com", phone: "(555) 123-4567", active: true, currencyCode: "USD", creditLimit: 50000, balance: 15500, availableCredit: 34500 },
        { id: 2, name: "Riverside Development", number: "ACC-002", email: "billing@riverside.com", phone: "(555) 987-6543", active: true, currencyCode: "USD", creditLimit: 100000, balance: 45000, availableCredit: 55000 },
        { id: 3, name: "Metro Builders LLC", number: "ACC-003", email: "office@metrobuilders.com", phone: "(555) 456-7890", active: true, currencyCode: "USD", creditLimit: 25000, balance: 28000, availableCredit: -3000 },
        { id: 4, name: "Lakeview Homes", number: "ACC-004", email: "info@lakeviewhomes.net", phone: "(555) 222-3333", active: false, currencyCode: "USD", creditLimit: 50000, balance: 0, availableCredit: 50000 }
    ],
    accountFinancials: [
        { accountId: 1, accountNumber: "ACC-001", accountName: "Summit Construction Corp", currencyCode: "USD", creditLimit: 50000, totalBalance: 15500, availableCredit: 34500, aging30: 12000, aging60: 3500, aging90: 0, aging90Plus: 0, aging: '60', pastDueBalance: 3500, lastSyncAt: new Date().toISOString() },
        { accountId: 2, accountNumber: "ACC-002", accountName: "Riverside Development", currencyCode: "USD", creditLimit: 100000, totalBalance: 45000, availableCredit: 55000, aging30: 45000, aging60: 0, aging90: 0, aging90Plus: 0, aging: '30', pastDueBalance: 0, lastSyncAt: new Date().toISOString() },
        { accountId: 3, accountNumber: "ACC-003", accountName: "Metro Builders LLC", currencyCode: "USD", creditLimit: 25000, totalBalance: 28000, availableCredit: -3000, aging30: 5000, aging60: 8000, aging90: 15000, aging90Plus: 0, aging: '90', pastDueBalance: 23000, lastSyncAt: new Date().toISOString() }
    ],
    dashboardSummary: {
        accountId: 1,
        accountName: "Summit Construction Corp",
        creditLimit: 50000.00,
        currentBalance: 15500.00,
        pastDueInvoicesCount: 1,
        openInvoicesCount: 2,
        overdueInvoicesCount: 1,
        activeOrdersCount: 3,
        pendingQuotesCount: 2,
        recentInvoices: [],
        recentOrders: [],
        recentQuotes: []
    },
    jobs: [
        { id: 101, accountId: 1, jobNumber: "JOB-101", name: "Downtown Office Plaza", isActive: true },
        { id: 102, accountId: 1, jobNumber: "JOB-102", name: "Riverside Residential", isActive: true },
        { id: 201, accountId: 1, jobNumber: "JOB-201", name: "Skyline Tower", isActive: true }
    ],
    jobSummaries: [
        { jobId: 101, orderCount: 1, totalOrdered: 4250, openInvoicesCount: 1 },
        { jobId: 102, orderCount: 1, totalOrdered: 11250, openInvoicesCount: 1 },
        { jobId: 201, orderCount: 1, totalOrdered: 45000, openInvoicesCount: 0 }
    ],
    orders: [
        { id: 1001, accountId: 1, jobId: 101, orderNumber: "ORD-1001", orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), subtotal: 4000, taxTotal: 250, total: 4250, status: "processing", poNumber: "PO-2023-1101" },
        { id: 1002, accountId: 1, jobId: 102, orderNumber: "ORD-1002", orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), subtotal: 10500, taxTotal: 750, total: 11250, status: "shipped", poNumber: "PO-2023-1102" },
        { id: 2001, accountId: 1, jobId: 201, orderNumber: "ORD-2001", orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), subtotal: 42000, taxTotal: 3000, total: 45000, status: "confirmed", poNumber: "PO-SKY-01" }
    ],
    invoices: [
        { id: 5001, accountId: 1, jobId: 101, invoiceNumber: "INV-5001", invoiceDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), total: 4250, balanceDue: 4250, status: "past_due" },
        { id: 5002, accountId: 1, jobId: 102, invoiceNumber: "INV-5002", invoiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), total: 11250, balanceDue: 11250, status: "open" },
        { id: 6001, accountId: 2, jobId: 201, invoiceNumber: "INV-6001", invoiceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), total: 45000, balanceDue: 0, status: "paid" }
    ],
    quotes: [
        { id: 3001, accountId: 1, jobId: 101, quoteNumber: "EST-3001", quoteDate: new Date().toISOString(), expiresOn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), total: 8500, status: "sent" },
        { id: 3002, accountId: 1, jobId: 102, quoteNumber: "EST-3002", quoteDate: new Date().toISOString(), expiresOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), total: 12000, status: "draft" }
    ],
    payments: [
        { id: 1, accountId: 1, userId: 1, externalId: "PAY-999", provider: "RunPayments", status: "settled", currencyCode: "USD", amount: 5200, convenienceFee: 0, totalCharged: 5200, paymentMethodType: "ach", submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), settledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), failureCode: null, failureMessage: null },
        { id: 2, accountId: 1, userId: 1, externalId: "PAY-888", provider: "RunPayments", status: "settled", currencyCode: "USD", amount: 1500, convenienceFee: 0, totalCharged: 1500, paymentMethodType: "card", submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), settledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), failureCode: null, failureMessage: null }
    ],
    paymentMethods: [
        { id: 1, accountId: 1, type: "ach", providerToken: "tok_ach_123", brand: "Chase", last4: "6789", isDefault: true, createdAt: new Date().toISOString() },
        { id: 2, accountId: 1, type: "card", providerToken: "tok_visa_456", brand: "Visa", last4: "1111", expMonth: 12, expYear: 2028, isDefault: false, createdAt: new Date().toISOString() }
    ],
    statements: [
        { id: 1, accountId: 1, statementNumber: "STMT-2024-01", periodStart: "2024-01-01", periodEnd: "2024-01-31", statementDate: "2024-02-01", currencyCode: "USD", openingBalance: 10000, closingBalance: 15500, documentId: 100, createdAt: new Date().toISOString() }
    ],
    documents: [
        { id: 100, accountId: 1, accountName: "Summit Construction Corp", fileName: "Jan-2024-Statement.pdf", s3Key: "stmts/1/2024-01.pdf", fileSize: 245000, mimeType: "application/pdf", createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), intent: 'dealer_shared' },
        { id: 101, accountId: 1, accountName: "Summit Construction Corp", fileName: "Project-Specifications.docx", s3Key: "docs/1/specs.docx", fileSize: 1200000, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), intent: 'dealer_shared' },
        { id: 200, accountId: 1, accountName: "Summit Construction Corp", fileName: "Site-Delivery-Downtown.jpg", s3Key: "docs/1/delivery.jpg", fileSize: 1540000, mimeType: "image/jpeg", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), intent: 'dealer_shared', requiresAck: true },
        { id: 201, accountId: 1, accountName: "Summit Construction Corp", fileName: "Foundation-Inspection.jpg", s3Key: "docs/1/foundation.jpg", fileSize: 2100000, mimeType: "image/jpeg", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), intent: 'dealer_shared' },
        { id: 202, accountId: 1, accountName: "Summit Construction Corp", fileName: "Skyline-Blueprints.pdf", s3Key: "docs/1/blueprints.pdf", fileSize: 4500000, mimeType: "application/pdf", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), intent: 'dealer_shared', requiresAck: true }
    ],
    salesRep: {
        id: 99,
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "s.jenkins@empirebuildingmaterials.com",
        phone: "(555) 987-6543"
    },
    arAutomations: [
        {
            id: 1,
            name: "7-Day Past Due Reminder",
            condition: "past_due",
            channel: "sms",
            messageTemplate: "Hi {contactName}, just a friendly reminder that invoice {invoiceNumbers} for {totalAmount} is now 7 days past due. Please arrange payment.",
            followUpIntervalDays: 7,
            maxFollowUps: 3,
            isActive: true,
            activeInvoices: 12,
            totalSent: 45,
            totalCollected: 8500,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            name: "3-Day Before Due Alert",
            condition: "due_in_3_days",
            channel: "email",
            messageTemplate: "Dear {contactName}, this is a reminder that invoice {invoiceNumbers} for {totalAmount} is due in 3 days. Thank you!",
            followUpIntervalDays: 0,
            maxFollowUps: 1,
            isActive: true,
            activeInvoices: 8,
            totalSent: 120,
            totalCollected: 24500,
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
    ]
};

// --- INTERCEPTOR LOGIC ---
export class MockApi {
    static async handle(endpoint: string, options: RequestInit = {}): Promise<any> {
        console.log(`[Mock API] Intercepted Request: ${options.method || 'GET'} ${endpoint}`);

        // Add artificial delay to simulate network (300ms)
        await new Promise(resolve => setTimeout(resolve, 300));

        // Robust path normalization and param extraction
        let path = '';
        let params: Record<string, string> = {};

        try {
            // Handle absolute URLs or relative paths
            const urlStr = endpoint.startsWith('http') ? endpoint : `http://localhost${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
            const url = new URL(urlStr);
            path = url.pathname;
            url.searchParams.forEach((v, k) => params[k] = v);
        } catch (e) {
            path = endpoint.split('?')[0];
        }

        // Remove common API prefixes
        path = path.replace(/^\/(?:api\/)?v1/, '');
        // Ensure path starts with /
        if (!path.startsWith('/')) path = '/' + path;

        console.log(`[Mock API] Final Normalized Path: ${path}`, params);

        // Helper for filtering by jobId if present in params
        const filterByJob = (list: any[]) => {
            const jobId = params.JobId || params.jobId || params.ProjectId || params.projectId;
            if (jobId) {
                const id = parseInt(jobId);
                return list.filter((i: any) => (i.jobId || i.projectId) === id);
            }
            return list;
        };

        // Helper for filtering by accountId if present in params
        const filterByAccount = (list: any[]) => {
            const accId = params.accountId || params.account_id || params.AccountId;
            if (accId) {
                const id = parseInt(accId);
                return list.filter((i: any) => i.accountId === id);
            }
            return list;
        };

        const paginate = (list: any[]) => {
            const limit = parseInt(params.limit || params.pageSize || '100');
            const offset = parseInt(params.offset || '0');
            return {
                items: list.slice(offset, offset + limit),
                total: list.length
            };
        };

        // 1. Branding / Config
        if (path === '/branding/storefront') return mockDataStore.branding;

        // 8. Admin Endpoints 
        if (path === '/admin/tenants') {
            return paginate([
                { id: 1, name: "Empire Building Materials", subdomain: "empire", status: "active", createdAt: new Date().toISOString() }
            ]);
        }
        if (path === '/admin/users' || path === '/admin/users/') {
            return paginate([
                { id: 1, name: "Admin User", email: "admin@builderwire.com", role: "admin", isActive: true },
                { id: 2, name: "John Doe", email: "john@summitconstruction.com", role: "user", isActive: true }
            ]);
        }
        if (path === '/admin/account-dashboard' || path.includes('/admin/account-dashboard')) {
            const items = mockDataStore.accounts.map(a => {
                const fin = mockDataStore.accountFinancials.find(f => f.accountId === a.id);
                return {
                    ...a,
                    pastDueBalance: fin?.pastDueBalance ?? 0,
                    aging: fin?.aging ?? 'Current',
                    openInvoicesCount: mockDataStore.invoices.filter(i => i.accountId === a.id && i.status !== 'paid').length,
                    primaryContact: a.name
                };
            });
            return paginate(items);
        }
        if (path === '/admin/dashboard-summary') {
            return {
                totalAccounts: mockDataStore.accounts.length,
                activeOrders: mockDataStore.orders.length,
                pendingQuotes: mockDataStore.quotes.length,
                totalCreditLimit: mockDataStore.accounts.reduce((sum, a) => sum + (a.creditLimit || 0), 0),
                totalBalance: mockDataStore.accounts.reduce((sum, a) => sum + (a.balance || 0), 0),
                accountsAtRisk: 1
            };
        }
        if (path === '/admin/files') {
            return paginate(mockDataStore.documents);
        }
        if (path === '/admin/accounts' || path.endsWith('/admin/accounts')) {
            return paginate(mockDataStore.accounts);
        }

        // 8.1 AR Center Endpoints
        if (path === '/admin/ar/summary') {
            return {
                totalOutstanding: mockDataStore.accounts.reduce((sum, a) => sum + a.balance, 0),
                openRequests: mockDataStore.accounts.filter(a => a.balance > 0).length,
                paidThisMonth: 12500.50,
                overdueCount: mockDataStore.accountFinancials.filter(f => f.pastDueBalance > 0).length,
            };
        }
        if (path === '/admin/ar/accounts') {
            const items = mockDataStore.accounts.map(a => {
                const fin = mockDataStore.accountFinancials.find(f => f.accountId === a.id);
                const invs = mockDataStore.invoices.filter(i => i.accountId === a.id);
                return {
                    accountId: a.id,
                    accountNumber: a.number,
                    accountName: a.name,
                    email: a.email,
                    phone: a.phone,
                    currencyCode: a.currencyCode,
                    totalBalance: a.balance,
                    pastDueBalance: fin?.pastDueBalance ?? 0,
                    currentBalance: a.balance - (fin?.pastDueBalance ?? 0),
                    openInvoiceCount: invs.filter(i => i.status !== 'paid').length,
                    overdueInvoiceCount: invs.filter(i => i.status === 'past_due').length,
                    dueNext7Days: 0,
                    latestInvoiceDate: invs[0]?.invoiceDate || null,
                    latestInvoiceNumber: invs[0]?.invoiceNumber || null,
                    lastPaymentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    lastPaymentAmount: 500.00,
                    agingBucket: fin?.aging || 'Current',
                    lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    nextActionAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                    contactChannel: 'both',
                    contactCount: 3
                };
            });
            return paginate(items);
        }
        if (path === '/admin/ar/automations') {
            return (mockDataStore as any).arAutomations;
        }
        if (path === '/admin/ar/bulk-preview') {
            const condition = params.condition;
            const items = mockDataStore.accounts
                .filter(a => {
                    if (condition === 'past_due') return (mockDataStore.accountFinancials.find(f => f.accountId === a.id)?.pastDueBalance ?? 0) > 0;
                    return true;
                })
                .map(a => ({
                    accountId: a.id,
                    accountName: a.name,
                    invoiceIds: mockDataStore.invoices.filter(i => i.accountId === a.id && i.status !== 'paid').map(i => i.id),
                    invoiceCount: mockDataStore.invoices.filter(i => i.accountId === a.id && i.status !== 'paid').length,
                    totalAmount: a.balance
                }));
            return items;
        }

        // 2. Account & User Context
        if (path === '/auth/me' || path === '/user') {
            return { user: { id: 1, firstName: "Demo", lastName: "User", accountId: 1 } };
        }
        if (path.startsWith('/accounts/')) {
            const match = path.match(/\/accounts\/(\d+)(?:\/(.*))?/);
            if (match) {
                const id = parseInt(match[1]);
                const sub = match[2];
                if (sub === 'financials') return mockDataStore.accountFinancials.find(f => f.accountId === id) || mockDataStore.accountFinancials[0];
                if (sub === 'members') return [
                    { id: 1, name: "John Doe", email: "john@summitconstruction.com", role: "owner", status: "active" },
                    { id: 2, name: "Jane Smith", email: "jane@summitconstruction.com", role: "purchaser", status: "active" }
                ];
                return mockDataStore.accounts.find(a => a.id === id) || mockDataStore.accounts[0];
            }
        }
        if (path === '/accounts') return mockDataStore.accounts;

        // 3. Dashboard
        if (path === '/dashboard/summary') return mockDataStore.dashboardSummary;

        // 4. Jobs / Projects
        if (path === '/jobs/summaries' || path === '/jobs/summary') {
            return mockDataStore.jobSummaries; // Returns array directly
        }
        if (path === '/jobs') {
            return mockDataStore.jobs.filter(j => j.accountId === 1); // Mock single account jobs
        }
        if (path.startsWith('/jobs')) {
            const match = path.match(/\/jobs\/(\d+)/);
            if (match) return mockDataStore.jobs.find(j => j.id === parseInt(match[1]));
        }

        // 5. Orders
        if (path === '/sales/orders' || path === '/orders' || path === '/order-summaries' || path === '/sales/order-summaries') {
            const filtered = filterByJob(filterByAccount(mockDataStore.orders));
            const items = filtered.map(o => {
                const job = mockDataStore.jobs.find(j => j.id === o.jobId);
                return {
                    ...o,
                    jobName: job?.name || 'Unknown Project',
                    jobNumber: job?.jobNumber || '',
                    productCount: 1
                };
            });
            return paginate(items);
        }
        if (path.startsWith('/sales/orders/') || path.startsWith('/orders/')) {
            const match = path.match(/\/(?:sales\/)?orders\/(\d+)/);
            if (match) {
                const id = parseInt(match[1]);
                if (path.endsWith('/lines')) return [
                    { id: 1, orderId: id, lineNumber: 1, itemCode: "LUM-2X4-08", description: "2x4x8 Standard Stud", quantityOrdered: 100, quantityShipped: 100, quantityBackordered: 0, unitPrice: 5.45, extendedPrice: 545.00, status: "shipped" }
                ];
                return mockDataStore.orders.find(o => o.id === id);
            }
        }

        // 6. Invoices
        if (path === '/billing/invoices' || path === '/sales/invoices' || path === '/invoices') {
            const filtered = filterByJob(filterByAccount(mockDataStore.invoices));
            const items = filtered.map(i => {
                const job = mockDataStore.jobs.find(j => j.id === i.jobId);
                return {
                    ...i,
                    jobName: job?.name || 'Unknown Project',
                    jobNumber: job?.jobNumber || ''
                };
            });
            return paginate(items);
        }
        if (path.startsWith('/billing/invoices/') || path.startsWith('/invoices/')) {
            const match = path.match(/\/(?:billing\/)?invoices\/(\d+)/);
            if (match) {
                const id = parseInt(match[1]);
                if (path.endsWith('/lines')) return [
                    { id: 1, invoiceId: id, lineNumber: 1, itemCode: "LUM-2X4-08", description: "2x4x8 Standard Stud", quantityBilled: 100, unitPrice: 5.45, extendedPrice: 545.00 }
                ];
                return mockDataStore.invoices.find(i => i.id === id);
            }
        }

        // 7. Quotes / Estimates
        if (path === '/sales/quotes' || path === '/quotes') {
            const filtered = filterByJob(filterByAccount(mockDataStore.quotes));
            const items = filtered.map(q => {
                const job = mockDataStore.jobs.find(j => j.id === q.jobId);
                return {
                    ...q,
                    jobName: job?.name || 'Unknown Project',
                    jobNumber: job?.jobNumber || ''
                };
            });
            return paginate(items);
        }
        if (path.startsWith('/sales/quotes/') || path.startsWith('/quotes/')) {
            const match = path.match(/\/(?:sales\/)?quotes\/(\d+)/);
            if (match) {
                const id = parseInt(match[1]);
                if (path.endsWith('/lines')) return [
                    { id: 1, quoteId: id, lineNumber: 1, itemCode: "LUM-2X4-08", description: "2x4x8 Standard Stud", quantity: 100, unitPrice: 5.25, extendedPrice: 525.00 }
                ];
                return mockDataStore.quotes.find(q => q.id === id);
            }
        }

        if (path.match(/\/quotes\/(\d+)\/convert$/)) {
            const match = path.match(/\/quotes\/(\d+)\/convert$/);
            const id = parseInt(match![1]);
            const quote = mockDataStore.quotes.find(q => q.id === id);
            if (quote) {
                quote.status = 'converted';
            }
            return { status: 'success' };
        }

        // --- Quick Quote AI Structuring ---
        if (path === '/estimates/structure' && options.method === 'POST') {
            // Simulate AI structuring of text or voice input
            // For demo purposes, we return a fixed structured list
            return [
                { id: '1', sku: '2X4-8-STUD', name: '2x4x8 Spruce-Pine-Fir Stud', quantity: 10, unitPrice: 5.95 },
                { id: '2', sku: '16D-NAIL-5LB', name: '16d Common Nails - 5lb Box', quantity: 1, unitPrice: 12.50 },
                { id: '3', sku: 'PLY-34-CDX', name: '3/4" CDX Plywood - 4x8 Sheet', quantity: 3, unitPrice: 45.00 }
            ];
        }

        // --- Quick Quote Submission ---
        if (path === '/estimates/quick-submit' && options.method === 'POST') {
            const newId = Math.floor(Math.random() * 9000) + 1000;
            const newEstimate = {
                id: newId,
                accountId: 1,
                quoteNumber: `EST-${newId}`,
                quoteDate: new Date().toISOString(),
                expiresOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                total: params.total || 0,
                status: 'sent' as const,
                jobId: 101, // Default to Downtown Office Plaza for demo
                lines: params.lines || []
            };
            mockDataStore.quotes.unshift(newEstimate);
            return { status: 'success', estimateId: newId };
        }

        // 9. Wallet / Payments
        if (path === '/payment-methods') return mockDataStore.paymentMethods;
        if (path === '/payments' || path === '/v1/payments') {
            return filterByAccount(mockDataStore.payments);
        }

        // 10. Documents / Statements
        if (path === '/statements') return filterByAccount(mockDataStore.statements);
        if (path === '/files' || path === '/documents' || path.includes('/docs')) {
            const view = params.view || 'list';

            if (view === 'summary') {
                return {
                    totalFiles: mockDataStore.documents.length,
                    sharedByDealer: mockDataStore.documents.filter(d => d.intent === 'dealer_shared').length,
                    myUploads: mockDataStore.documents.filter(d => d.intent === 'contractor_uploaded').length,
                    pendingAck: mockDataStore.documents.filter(d => d.requiresAck && !d.acknowledgedAt).length
                };
            }

            if (view === 'folders') {
                return ['Project Photos'];
            }

            // Default list view
            const filtered = filterByAccount(mockDataStore.documents);
            // Map to ContractorDocumentDTO expected by UI
            const items = filtered.map(d => ({
                ...d,
                assignmentId: d.id,
                intent: d.intent || 'dealer_shared'
            }));
            return paginate(items);
        }

        if (path.match(/\/files\/(\d+)\/content$/)) {
            // For demo previews, we redirect to high-quality unsplash construction images
            const match = path.match(/\/files\/(\d+)\/content$/);
            const id = parseInt(match![1]);
            const urls: Record<number, string> = {
                200: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200', // Job site delivery
                201: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=1200', // Foundation/Construction
                202: 'https://images.unsplash.com/photo-1503387762-592dee58ca3b?auto=format&fit=crop&q=80&w=1200', // Architectural
            };

            // In a real mock-api interceptor returning blobs, we'd need to fetch or return a Blob
            // However, the frontend preview Drawer expects an object URL created from a blob.
            // Since requestBlob is used, we have a challenge because requestBlob uses fetch() directly.
            // For this demo, we'll suggest the user looks at the documents page where the metadata is seeded.
            return {};
        }

        if (path.match(/\/files\/(\d+)$/) && options.method === 'PATCH') {
            const match = path.match(/\/files\/(\d+)$/);
            const id = parseInt(match![1]);
            const body = JSON.parse(options.body as string);
            const doc = mockDataStore.documents.find(d => d.id === id);
            if (doc) {
                if (body.acknowledge) doc.acknowledgedAt = new Date().toISOString();
                if (body.filePath !== undefined) doc.filePath = body.filePath;
                return { ok: true, id };
            }
        }

        // Fallback catch-all
        console.warn(`[Mock API] Unhandled endpoint: ${endpoint}, returning empty object.`);
        return {};
    }
}
