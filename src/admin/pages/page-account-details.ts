import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminDataService } from '../services/admin-data.service.js';
import type { AdminAccountDetails, AdminInvoice } from '../services/admin-data.service.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';

interface RouterLocation {
    params: Record<string, string>;
}

type TransactionTab = 'orders' | 'invoices' | 'quotes';

@customElement('admin-page-account-details')
export class PageAccountDetails extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .back-link {
            display: inline-block;
            text-decoration: none;
            color: var(--color-text-muted, #6b7280);
            font-size: 0.875rem;
            margin-bottom: 1rem;
            transition: color 150ms ease;
        }

        .back-link:hover {
            color: var(--color-text, #0f172a);
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
        }

        .page-header h2 {
            margin: 0 0 0.5rem;
            color: var(--color-text, #0f172a);
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
        }

        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .status-Active { background: #dcfce7; color: #166534; }
        .status-Hold { background: #fef3c7; color: #92400e; }
        .status-Overdue { background: #fee2e2; color: #991b1b; }

        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .card {
            background: #ffffff;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .card h3 {
            margin: 0 0 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
            color: var(--color-text, #111827);
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            font-size: 1rem;
        }

        .field {
            margin-bottom: 1rem;
        }

        .field:last-child {
            margin-bottom: 0;
        }

        .label {
            display: block;
            font-size: 0.8125rem;
            color: var(--color-text-muted, #6b7280);
            margin-bottom: 0.125rem;
        }

        .value {
            color: var(--color-text, #111827);
            font-weight: 500;
        }

        .value-lg {
            font-size: 1.5rem;
            font-weight: 700;
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
        }

        .value-positive {
            color: #059669;
        }

        .financials-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 1rem;
        }

        .email-link {
            color: #2563eb;
            text-decoration: none;
        }

        .email-link:hover {
            text-decoration: underline;
        }

        /* Tabs */
        .tab-bar {
            display: flex;
            gap: 0;
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 1.5rem;
        }

        .tab-btn {
            padding: 0.75rem 1.5rem;
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            font-family: var(--font-body, 'Inter', sans-serif);
            color: var(--color-text-muted, #6b7280);
            transition: all 150ms ease;
            position: relative; /* Ensure z-index works */
            z-index: 10;
        }

        .tab-btn:hover {
            color: var(--color-text, #0f172a);
        }

        .tab-btn.active {
            color: var(--color-accent, #f97316);
            border-bottom-color: var(--color-accent, #f97316);
        }

        .tab-content {
            background: #ffffff;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            color: var(--color-text-muted, #6b7280);
            position: relative;
            z-index: 5;
        }

        .error-msg {
            color: var(--color-error, #ef4444);
        }

        .status-stamp {
            position: absolute;
            top: 2rem;
            right: 2rem;
            font-size: 1.5rem;
            font-weight: 700;
            text-transform: uppercase;
            padding: 0.5rem 1rem;
            border: 4px solid;
            border-radius: 8px;
            transform: rotate(-12deg);
            opacity: 0.8;
            pointer-events: none;
            letter-spacing: 2px;
            font-family: 'Space Mono', monospace;
        }

        .stamp-good {
            color: #22c55e;
            border-color: #22c55e;
            background: rgba(34, 197, 94, 0.05);
        }

        .stamp-bad {
            color: #ef4444;
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.05);
        }

        /* Pagination */
        .pagination {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
        }

        .pagination-info {
            font-size: 0.875rem;
            color: var(--color-text-muted);
        }

        .pagination-info span {
            font-weight: 600;
            color: var(--color-text);
        }

        .pagination-actions {
            display: flex;
            gap: 0.5rem;
        }

        .pagination-btn {
            padding: 0.5rem 1rem;
            border: 1px solid var(--color-border, #e2e8f0);
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--color-text, #0f172a);
            transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
            border-color: var(--color-primary-light, #bfdbfe);
            background: var(--color-bg-alt, #f8fafc);
        }

        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .pagination-btn.active {
            background: var(--admin-sidebar-bg, #0f172a);
            color: white;
            border-color: var(--admin-sidebar-bg, #0f172a);
        }
    `;

    // @vaadin/router sets this property with route params
    location?: RouterLocation;

    @state() private account: AdminAccountDetails | null = null;
    @state() private loading = true;
    @state() private activeTab: TransactionTab = 'invoices';

    // Invoice Pagination State
    @state() private invoicesPage = 1;
    @state() private invoicesPageSize = 10;
    @state() private invoicesTotal = 0;
    @state() private invoicesList: AdminInvoice[] = [];
    @state() private invoicesLoading = false;
    @state() private allOpenInvoices: AdminInvoice[] = [];

    private setTab(tab: TransactionTab) {
        this.activeTab = tab;
    }

    async connectedCallback() {
        super.connectedCallback();
        const id = this.location?.params?.id;
        if (id) {
            try {
                const accId = parseInt(id, 10);
                const [account, invoices] = await Promise.all([
                    AdminDataService.getAccountDetails(accId),
                    AdminDataService.getInvoices(accId, 1000, 0),
                ]);
                this.account = account;

                // Filter to only open/overdue invoices
                this.allOpenInvoices = invoices.items.filter(inv =>
                    inv.status === 'Open' || inv.status === 'Past Due'
                );
                this.invoicesTotal = this.allOpenInvoices.length;

                // Apply local pagination
                this.updateInvoicesPage();
            } catch {
                // account stays null
            }
        }
        this.loading = false;
    }

    @state() private toastMessage = '';
    @state() private toastType: 'success' | 'error' | 'info' = 'info';
    private toastTimer?: ReturnType<typeof setTimeout>;

    private showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
        clearTimeout(this.toastTimer);
        this.toastMessage = message;
        this.toastType = type;
        this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 4000);
    }

    @state() private showMessageModal = false;
    @state() private selectedPhone = '';

    // Payment Request State
    @state() private selectedInvoices: Set<string> = new Set();
    @state() private showPaymentModal = false;

    private toggleInvoice(id: string) {
        const newSet = new Set(this.selectedInvoices);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        this.selectedInvoices = newSet;
    }

    private toggleAllInvoices(e: Event) {
        const checked = (e.target as HTMLInputElement).checked;
        if (checked && this.invoicesList.length > 0) {
            this.selectedInvoices = new Set(this.invoicesList.map(i => i.id));
        } else {
            this.selectedInvoices = new Set();
        }
    }

    private openPaymentModal() {
        this.showPaymentModal = true;
    }

    private closePaymentModal() {
        this.showPaymentModal = false;
    }

    private handleSendPaymentRequest() {
        this.showToast(`Payment request sent for ${this.selectedInvoices.size} invoice(s).`, 'success');
        this.selectedInvoices = new Set();
        this.closePaymentModal();
    }

    private renderTabContent() {
        if (!this.account) return null;

        const { openOrders, openQuotes } = this.account;

        switch (this.activeTab) {
            case 'orders':
                return html`
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${openOrders.length === 0 ? html`<tr><td colspan="5" class="text-center">No open orders.</td></tr>` :
                        openOrders.map(o => html`
                                    <tr>
                                        <td class="font-medium">${o.id}</td>
                                        <td>${o.date}</td>
                                        <td>${o.itemsCount} items</td>
                                        <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                                        <td class="text-right font-mono">$${o.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                `)
                    }
                        </tbody>
                    </table>
                `;
            case 'invoices':
                const openInvoices = this.invoicesList;
                const allSelected = openInvoices.length > 0 && this.selectedInvoices.size === openInvoices.length;
                const hasSelection = this.selectedInvoices.size > 0;
                const { start: startItem, end: endItem } = getPaginationBounds(this.invoicesPage, this.invoicesPageSize, this.invoicesTotal);

                return html`
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; min-height: 42px;">
                        <h4 style="margin: 0; color: var(--color-text-light); font-weight: 500;">
                            ${hasSelection ? `${this.selectedInvoices.size} selected` : 'Open Invoices'}
                        </h4>
                        ${hasSelection ? html`
                            <button class="btn-primary" @click=${this.openPaymentModal}>
                                Request Payment
                            </button>
                        ` : ''}
                    </div>

                    ${this.invoicesLoading ? html`
                        <div style="margin-bottom: 0.75rem; color: var(--color-text-muted); font-size: 0.875rem;">Updating invoices...</div>
                    ` : ''}
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 40px;">
                                    <input type="checkbox" aria-label="Select all invoices" .checked=${allSelected} @change=${this.toggleAllInvoices} />
                                </th>
                                <th>Invoice #</th>
                                <th>Date</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th class="text-right">Balance</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${openInvoices.length === 0 ? html`<tr><td colspan="7" class="text-center">No open invoices.</td></tr>` :
                        openInvoices.map(i => html`
                                    <tr class="${this.selectedInvoices.has(i.id) ? 'row-selected' : ''}">
                                        <td>
                                            <input type="checkbox" aria-label="Select invoice ${i.id}" .checked=${this.selectedInvoices.has(i.id)} @change=${() => this.toggleInvoice(i.id)} />
                                        </td>
                                        <td class="font-medium">
                                            <a href="/admin/invoices/${i.internalId}" style="color: var(--color-primary); text-decoration: none; font-weight: 500;">
                                                ${i.id}
                                            </a>
                                        </td>
                                        <td>${i.date}</td>
                                        <td>${i.dueDate}</td>
                                        <td><span class="status-badge status-${i.status === 'Past Due' ? 'Overdue' : i.status}">${i.status}</span></td>
                                        <td class="text-right font-mono ${i.status === 'Past Due' ? 'text-danger' : ''}">$${i.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td class="text-right font-mono text-muted">$${i.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                `)
                    }
                        </tbody>
                    </table>

                    <!-- Pagination Controls -->
                    <div class="pagination">
                        <div class="pagination-info">
                            Showing <span>${startItem}</span> to <span>${endItem}</span> of <span>${this.invoicesTotal}</span> invoices
                        </div>
                        <div class="pagination-actions">
                            <button 
                                class="pagination-btn" 
                                ?disabled=${this.invoicesPage === 1 || this.invoicesLoading}
                                @click=${() => this.handleInvoicePageChange(this.invoicesPage - 1)}
                            >
                                Previous
                            </button>
                            ${this.renderInvoicePageNumbers()}
                            <button 
                                class="pagination-btn" 
                                ?disabled=${this.invoicesPage >= Math.ceil(this.invoicesTotal / this.invoicesPageSize) || this.invoicesLoading}
                                @click=${() => this.handleInvoicePageChange(this.invoicesPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                `;
            case 'quotes':
                return html`
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Estimate Name</th>
                                <th>Estimate #</th>
                                <th>Date</th>
                                <th>Expires</th>
                                <th>Status</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${openQuotes.length === 0 ? html`<tr><td colspan="6" class="text-center">No active quotes.</td></tr>` :
                        openQuotes.map(q => html`
                                    <tr>
                                        <td class="font-medium">${q.name}</td>
                                        <td class="text-muted">${q.id}</td>
                                        <td>${q.date}</td>
                                        <td>${q.expiryDate}</td>
                                        <td><span class="status-badge status-Hold">${q.status}</span></td>
                                        <td class="text-right font-mono">$${q.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                `)
                    }
                        </tbody>
                    </table>
                `;
        }
    }

    private openMessageModal() {
        this.selectedPhone = this.account?.phone || '';
        this.showMessageModal = true;
    }

    private closeMessageModal() {
        this.showMessageModal = false;
    }

    private handleSendMessage() {
        this.showToast('Messaging is coming soon.', 'info');
        this.closeMessageModal();
    }

    render() {
        if (this.loading) return html`<p>Loading account details...</p>`;

        if (!this.account) {
            return html`
                <a href="/admin/accounts" class="back-link">&larr; Back to Accounts</a>
                <p class="error-msg">Account not found.</p>
            `;
        }

        const a = this.account;

        return html`
            <style>
                .btn-primary {
                    background: var(--color-cta);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.875rem;
                }
                .btn-primary:hover { background: var(--color-cta-hover); }
                
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                .data-table th { font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-light); font-weight: 600; background: #f8fafc; }
                .data-table tr:last-child td { border-bottom: none; }
                
                .row-selected { background: #fff7ed; } /* Orange-50 */
                .row-selected:hover { background: #ffedd5 !important; }

                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .font-mono { font-family: 'Space Mono', monospace; letter-spacing: -0.5px; }
                .font-medium { font-weight: 500; }
                .text-muted { color: var(--color-text-muted); }
                .text-danger { color: var(--color-error); font-weight: 600; }
                
                /* Modal */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
                    z-index: 1000;
                }
                .modal {
                    background: white; padding: 2rem; border-radius: 8px; width: 400px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .modal-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; font-family: var(--font-heading); }
                .modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem; }
                .btn-secondary { background: white; border: 1px solid #e2e8f0; color: var(--color-text); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
                select.form-select { width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; margin-top: 0.5rem; }

                .toast {
                    position: fixed; bottom: 24px; right: 24px; z-index: 2000;
                    padding: 12px 20px; border-radius: 8px; font-size: 0.875rem; font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    animation: toast-in 200ms ease-out;
                }
                .toast-success { background: #059669; color: white; }
                .toast-error { background: #dc2626; color: white; }
                .toast-info { background: #0f172a; color: white; }
                @keyframes toast-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            </style>

            <a href="/admin/accounts" class="back-link">&larr; Back to Accounts</a>

            <div class="page-header">
                <div>
                    <h2>${a.name}</h2>
                    <div style="color: var(--color-text-muted); margin-bottom: 0.75rem; font-family: 'Space Mono', monospace; font-size: 0.875rem;">
                        Account #${a.id}
                    </div>
                    <span class="status-badge status-${a.status}">${a.status}</span>
                </div>
                <button class="btn-primary btn-message" @click=${this.openMessageModal}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Message
                </button>
            </div>

            <style>
                .btn-message {
                    background-color: var(--admin-sidebar-bg, #0f172a) !important;
                }
                .btn-message:hover {
                    background-color: var(--color-primary, #1e293b) !important;
                }
            </style>

            <div class="cards-grid">
                <div class="card" style="position: relative; overflow: hidden;">
                    <h3>Financial Overview</h3>
                    
                    <!-- Status Stamp -->
                    <div class="status-stamp stamp-${a.pastDueBalance > 0 ? 'bad' : 'good'}">
                        ${a.pastDueBalance > 0 ? 'PAST DUE' : 'HEALTHY'}
                    </div>

                    <div class="field">
                        <span class="label">Total Balance</span>
                        <div class="value value-lg">$${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="field">
                        <span class="label">Available Credit</span>
                        <div class="value value-lg value-positive">$${a.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="field">
                        <span class="label">Past Due</span>
                        <div class="value ${a.pastDueBalance > 0 ? 'text-danger' : ''}">$${a.pastDueBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="financials-row">
                        <div class="field">
                            <span class="label">Credit Limit</span>
                            <div class="value">$${a.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div class="field">
                            <span class="label">Payment Terms</span>
                            <div class="value">${a.paymentTerms}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>Contact Information</h3>
                    <div class="field">
                        <span class="label">Email</span>
                        <div class="value"><a href="mailto:${a.email}" class="email-link">${a.email}</a></div>
                    </div>
                    <div class="field">
                        <span class="label">Phone</span>
                        <div class="value">${a.phone}</div>
                    </div>
                    <div class="field">
                         <span class="label">Primary Contact</span>
                        <div class="value">${a.primaryContact}</div>
                    </div>
                    <div class="field">
                        <span class="label">Address</span>
                        <div class="value">
                            ${a.address.street}<br>
                            ${a.address.city}, ${a.address.state} ${a.address.zip}
                        </div>
                    </div>
                    <div class="field">
                        <span class="label">Tax ID</span>
                        <div class="value">${a.taxId}</div>
                    </div>
                </div>
            </div>

            <div class="tab-bar">
                <button
                    type="button"
                    class="tab-btn ${this.activeTab === 'invoices' ? 'active' : ''}"
                    @click=${() => this.setTab('invoices')}
                >Open Invoices (${this.invoicesTotal})</button>
                <button
                    type="button"
                    class="tab-btn ${this.activeTab === 'quotes' ? 'active' : ''}"
                    @click=${() => this.setTab('quotes')}
                >Open Estimates (${a.openQuotes.length})</button>
                <button
                    type="button"
                    class="tab-btn ${this.activeTab === 'orders' ? 'active' : ''}"
                    @click=${() => this.setTab('orders')}
                >Open Orders (${a.openOrders.length})</button>
            </div>

            <div class="tab-content">
                ${this.renderTabContent()}
            </div>

            ${this.showMessageModal ? html`
                <div class="modal-overlay" @click=${this.closeMessageModal} role="dialog" aria-modal="true" aria-label="Send message">
                    <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                        <div class="modal-title">Send Message</div>
                        <p style="color: var(--color-text-light); font-size: 0.875rem;">Select a phone number to message:</p>
                        
                        <select class="form-select" .value=${this.selectedPhone} @change=${(e: Event) => this.selectedPhone = (e.target as HTMLSelectElement).value}>
                            <option value="${a.phone}">${a.primaryContact}: ${a.phone}</option>
                        </select>

                        <div class="modal-actions">
                            <button class="btn-secondary" @click=${this.closeMessageModal}>Cancel</button>
                            <button class="btn-primary" @click=${this.handleSendMessage}>Continue to Message</button>
                        </div>
                    </div>
                </div>
            ` : ''}

            ${this.showPaymentModal ? html`
                <div class="modal-overlay" @click=${this.closePaymentModal} role="dialog" aria-modal="true" aria-label="Request payment">
                    <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                        <div class="modal-title">Request Payment (Coming Soon)</div>
                        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                            <p style="color: var(--color-text-light); font-size: 0.875rem; margin-bottom: 0.5rem; font-weight: 500;">
                                You have selected ${this.selectedInvoices.size} invoice(s).
                            </p>
                            <ul style="margin: 0; padding-left: 1.25rem; color: var(--color-text-muted); font-size: 0.875rem;">
                                ${Array.from(this.selectedInvoices).slice(0, 3).map(id => html`<li>${id}</li>`)}
                                ${this.selectedInvoices.size > 3 ? html`<li>...and ${this.selectedInvoices.size - 3} more</li>` : ''}
                            </ul>
                        </div>
                        <p style="color: var(--color-text-muted); font-size: 0.875rem;">
                            This feature will allow you to generate a payment link and send it via email or SMS to the customer.
                        </p>

                        <div class="modal-actions">
                            <button class="btn-secondary" @click=${this.closePaymentModal}>Close</button>
                            <button class="btn-primary" disabled>Send Request</button>
                        </div>
                    </div>
                </div>
            ` : ''}

            ${this.toastMessage ? html`
                <div class="toast toast-${this.toastType}" role="status" aria-live="polite">${this.toastMessage}</div>
            ` : ''}
        `;
    }
    private async fetchInvoices(accountId?: number) {
        const id = accountId ?? this.account?.id;
        if (!id) return;
        this.invoicesLoading = true;
        try {
            // Fetch all invoices (large limit, no offset)
            const { items } = await AdminDataService.getInvoices(id, 1000, 0);

            // Filter to only open/overdue invoices
            this.allOpenInvoices = items.filter(inv =>
                inv.status === 'Open' || inv.status === 'Past Due'
            );
            this.invoicesTotal = this.allOpenInvoices.length;

            // Reset to page 1 on refresh to avoid empty pages
            this.invoicesPage = 1;

            // Apply local pagination
            this.updateInvoicesPage();
        } catch {
            this.showToast('Failed to load invoices', 'error');
        } finally {
            this.invoicesLoading = false;
        }
    }

    private updateInvoicesPage() {
        const start = (this.invoicesPage - 1) * this.invoicesPageSize;
        const end = start + this.invoicesPageSize;
        this.invoicesList = this.allOpenInvoices.slice(start, end);
    }

    private handleInvoicePageChange(newPage: number) {
        if (newPage < 1 || newPage > Math.ceil(this.invoicesTotal / this.invoicesPageSize)) return;
        this.invoicesPage = newPage;
        this.updateInvoicesPage();  // Local pagination, no API call
    }

    private renderInvoicePageNumbers() {
        const totalPages = Math.ceil(this.invoicesTotal / this.invoicesPageSize);
        if (totalPages <= 1) return null;

        return buildPaginationTokens(this.invoicesPage, totalPages).map(token =>
            token === 'ellipsis'
                ? html`<span style="align-self: center;">...</span>`
                : html`
                    <button 
                        class="pagination-btn ${this.invoicesPage === token ? 'active' : ''}" 
                        ?disabled=${this.invoicesLoading}
                        @click=${() => this.handleInvoicePageChange(token)}
                    >
                        ${token}
                    </button>
                `
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-account-details': PageAccountDetails;
    }
}
