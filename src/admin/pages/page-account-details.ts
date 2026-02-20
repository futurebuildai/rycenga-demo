import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { AdminDataService } from '../services/admin-data.service.js';
import type { AdminAccountDetails, AdminInvoice, AdminOrder, AdminQuote } from '../services/admin-data.service.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';
import { adminAccountDetailsPageStyles } from '../../styles/pages.js';

interface RouterLocation {
    params: Record<string, string>;
}

type TransactionTab = 'orders' | 'invoices' | 'quotes';

@customElement('admin-page-account-details')
export class PageAccountDetails extends LitElement {
    static styles = [adminAccountDetailsPageStyles];

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
    @state() private ordersPage = 1;
    @state() private ordersPageSize = 10;
    @state() private ordersTotal = 0;
    @state() private ordersList: AdminOrder[] = [];
    @state() private ordersLoading = false;
    @state() private quotesPage = 1;
    @state() private quotesPageSize = 10;
    @state() private quotesTotal = 0;
    @state() private quotesList: AdminQuote[] = [];
    @state() private quotesLoading = false;

    private setTab(tab: TransactionTab) {
        this.activeTab = tab;
    }

    async connectedCallback() {
        super.connectedCallback();
        const id = this.location?.params?.id;
        if (id) {
            try {
                const accId = parseInt(id, 10);
                const account = await AdminDataService.getAccountDetails(accId);
                this.account = account;
                await Promise.all([
                    this.fetchInvoices(accId),
                    this.fetchOrders(accId),
                    this.fetchQuotes(accId),
                ]);
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

        switch (this.activeTab) {
            case 'orders':
                const openOrders = this.ordersList;
                const { start: orderStart, end: orderEnd } = getPaginationBounds(this.ordersPage, this.ordersPageSize, this.ordersTotal);
                return html`
                    ${this.ordersLoading ? html`
                        <div class="refresh-note">Updating orders...</div>
                    ` : ''}
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
                                        <td class="font-medium">
                                            <a href="/admin/orders/${o.internalId}" class="link-primary">
                                                ${o.id}
                                            </a>
                                        </td>
                                        <td>${o.date}</td>
                                        <td>${o.itemsCount} items</td>
                                        <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                                        <td class="text-right font-mono">$${o.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                `)
                    }
                        </tbody>
                    </table>
                    <div class="pagination">
                        <div class="pagination-info">
                            Showing <span>${orderStart}</span> to <span>${orderEnd}</span> of <span>${this.ordersTotal}</span> orders
                        </div>
                        <div class="pagination-actions">
                            <button
                                class="pagination-btn"
                                ?disabled=${this.ordersPage === 1 || this.ordersLoading}
                                @click=${() => this.handleOrderPageChange(this.ordersPage - 1)}
                            >
                                Previous
                            </button>
                            ${this.renderOrderPageNumbers()}
                            <button
                                class="pagination-btn"
                                ?disabled=${this.ordersPage >= Math.ceil(this.ordersTotal / this.ordersPageSize) || this.ordersLoading}
                                @click=${() => this.handleOrderPageChange(this.ordersPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                `;
            case 'invoices':
                const openInvoices = this.invoicesList;
                const allSelected = openInvoices.length > 0 && this.selectedInvoices.size === openInvoices.length;
                const hasSelection = this.selectedInvoices.size > 0;
                const { start: startItem, end: endItem } = getPaginationBounds(this.invoicesPage, this.invoicesPageSize, this.invoicesTotal);

                return html`
                    <div class="tab-header">
                        <h4 class="tab-title">
                            ${hasSelection ? `${this.selectedInvoices.size} selected` : 'Open Invoices'}
                        </h4>
                        ${hasSelection ? html`
                            <button class="btn-primary" @click=${this.openPaymentModal}>
                                Request Payment
                            </button>
                        ` : ''}
                    </div>

                    ${this.invoicesLoading ? html`
                        <div class="refresh-note">Updating invoices...</div>
                    ` : ''}
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th class="col-checkbox">
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
                                            <a href="/admin/invoices/${i.internalId}" class="link-primary">
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
                const openQuotes = this.quotesList;
                const { start: quoteStart, end: quoteEnd } = getPaginationBounds(this.quotesPage, this.quotesPageSize, this.quotesTotal);
                return html`
                    ${this.quotesLoading ? html`
                        <div class="refresh-note">Updating estimates...</div>
                    ` : ''}
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
                                        <td class="font-medium">
                                            <a href="/admin/quotes/${q.internalId}" class="link-primary">
                                                ${q.name}
                                            </a>
                                        </td>
                                        <td class="text-muted">
                                            <a href="/admin/quotes/${q.internalId}" class="link-primary-light">
                                                ${q.id}
                                            </a>
                                        </td>
                                        <td>${q.date}</td>
                                        <td>${q.expiryDate}</td>
                                        <td><span class="status-badge status-Hold">${q.status}</span></td>
                                        <td class="text-right font-mono">$${q.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                `)
                    }
                        </tbody>
                    </table>
                    <div class="pagination">
                        <div class="pagination-info">
                            Showing <span>${quoteStart}</span> to <span>${quoteEnd}</span> of <span>${this.quotesTotal}</span> estimates
                        </div>
                        <div class="pagination-actions">
                            <button
                                class="pagination-btn"
                                ?disabled=${this.quotesPage === 1 || this.quotesLoading}
                                @click=${() => this.handleQuotePageChange(this.quotesPage - 1)}
                            >
                                Previous
                            </button>
                            ${this.renderQuotePageNumbers()}
                            <button
                                class="pagination-btn"
                                ?disabled=${this.quotesPage >= Math.ceil(this.quotesTotal / this.quotesPageSize) || this.quotesLoading}
                                @click=${() => this.handleQuotePageChange(this.quotesPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
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
        if (!this.account || !this.selectedPhone) {
            this.showToast('Please select a phone number.', 'error');
            return;
        }

        const params = new URLSearchParams({
            phone: this.selectedPhone,
            contactName: this.account.primaryContact || this.account.name,
            accountId: String(this.account.id),
            accountName: this.account.name,
        });

        this.closeMessageModal();
        Router.go(`/admin/messaging?${params.toString()}`);
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
            <a href="/admin/accounts" class="back-link">&larr; Back to Accounts</a>

            <div class="page-header">
                <div>
                    <h2>${a.name}</h2>
                    <div class="account-id">
                        Account #${a.id}
                    </div>
                    <span class="status-badge status-${a.status}">${a.status}</span>
                </div>
                <button class="btn-primary btn-message" @click=${this.openMessageModal}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Message
                </button>
            </div>

            <div class="cards-grid">
                <div class="card card-elevated">
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
                >Open Estimates (${this.quotesTotal})</button>
                <button
                    type="button"
                    class="tab-btn ${this.activeTab === 'orders' ? 'active' : ''}"
                    @click=${() => this.setTab('orders')}
                >Open Orders (${this.ordersTotal})</button>
            </div>

            <div class="tab-content">
                ${this.renderTabContent()}
            </div>

            ${this.showMessageModal ? html`
                <div class="modal-overlay" @click=${this.closeMessageModal} role="dialog" aria-modal="true" aria-label="Send message">
                    <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                        <div class="modal-title">Send Message</div>
                        <p class="modal-subtitle">Select a phone number to message:</p>
                        
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
                        <div class="payment-summary">
                            <p class="payment-summary-title">
                                You have selected ${this.selectedInvoices.size} invoice(s).
                            </p>
                            <ul class="payment-summary-list">
                                ${Array.from(this.selectedInvoices).slice(0, 3).map(id => html`<li>${id}</li>`)}
                                ${this.selectedInvoices.size > 3 ? html`<li>...and ${this.selectedInvoices.size - 3} more</li>` : ''}
                            </ul>
                        </div>
                        <p class="payment-summary-note">
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
            const offset = (this.invoicesPage - 1) * this.invoicesPageSize;
            const { items, total } = await AdminDataService.getInvoices(id, this.invoicesPageSize, offset);
            this.invoicesList = items;
            this.invoicesTotal = total;
        } catch {
            this.showToast('Failed to load invoices', 'error');
        } finally {
            this.invoicesLoading = false;
        }
    }

    private async fetchOrders(accountId?: number) {
        const id = accountId ?? this.account?.id;
        if (!id) return;
        this.ordersLoading = true;
        try {
            const offset = (this.ordersPage - 1) * this.ordersPageSize;
            const { items, total } = await AdminDataService.getOrders(id, this.ordersPageSize, offset);
            this.ordersList = items;
            this.ordersTotal = total;
        } catch {
            this.showToast('Failed to load orders', 'error');
        } finally {
            this.ordersLoading = false;
        }
    }

    private async fetchQuotes(accountId?: number) {
        const id = accountId ?? this.account?.id;
        if (!id) return;
        this.quotesLoading = true;
        try {
            const offset = (this.quotesPage - 1) * this.quotesPageSize;
            const { items, total } = await AdminDataService.getQuotes(id, this.quotesPageSize, offset);
            this.quotesList = items;
            this.quotesTotal = total;
        } catch {
            this.showToast('Failed to load estimates', 'error');
        } finally {
            this.quotesLoading = false;
        }
    }

    private async handleInvoicePageChange(newPage: number) {
        if (newPage < 1 || newPage > Math.ceil(this.invoicesTotal / this.invoicesPageSize)) return;
        this.invoicesPage = newPage;
        await this.fetchInvoices();
    }

    private async handleOrderPageChange(newPage: number) {
        if (newPage < 1 || newPage > Math.ceil(this.ordersTotal / this.ordersPageSize)) return;
        this.ordersPage = newPage;
        await this.fetchOrders();
    }

    private async handleQuotePageChange(newPage: number) {
        if (newPage < 1 || newPage > Math.ceil(this.quotesTotal / this.quotesPageSize)) return;
        this.quotesPage = newPage;
        await this.fetchQuotes();
    }

    private renderInvoicePageNumbers() {
        const totalPages = Math.ceil(this.invoicesTotal / this.invoicesPageSize);
        if (totalPages <= 1) return null;

        return buildPaginationTokens(this.invoicesPage, totalPages).map(token =>
            token === 'ellipsis'
                ? html`<span class="pagination-ellipsis-inline">...</span>`
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

    private renderOrderPageNumbers() {
        const totalPages = Math.ceil(this.ordersTotal / this.ordersPageSize);
        if (totalPages <= 1) return null;

        return buildPaginationTokens(this.ordersPage, totalPages).map(token =>
            token === 'ellipsis'
                ? html`<span class="pagination-ellipsis-inline">...</span>`
                : html`
                    <button
                        class="pagination-btn ${this.ordersPage === token ? 'active' : ''}"
                        ?disabled=${this.ordersLoading}
                        @click=${() => this.handleOrderPageChange(token)}
                    >
                        ${token}
                    </button>
                `
        );
    }

    private renderQuotePageNumbers() {
        const totalPages = Math.ceil(this.quotesTotal / this.quotesPageSize);
        if (totalPages <= 1) return null;

        return buildPaginationTokens(this.quotesPage, totalPages).map(token =>
            token === 'ellipsis'
                ? html`<span class="pagination-ellipsis-inline">...</span>`
                : html`
                    <button
                        class="pagination-btn ${this.quotesPage === token ? 'active' : ''}"
                        ?disabled=${this.quotesLoading}
                        @click=${() => this.handleQuotePageChange(token)}
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
