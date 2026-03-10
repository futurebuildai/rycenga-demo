import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { AdminDataService } from '../services/admin-data.service.js';
import type { AdminAccount } from '../services/admin-data.service.js';
import type { AdminAccountSort } from '../services/admin-data.service.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';
import { adminAccountsPageStyles } from '../../styles/pages.js';
import '../../components/atoms/pv-page-tour-modal.js';

@customElement('admin-page-accounts')
export class PageAccounts extends LitElement {
    static styles = [adminAccountsPageStyles];

    @state() private accounts: AdminAccount[] = [];
    @state() private searchQuery = '';
    @state() private filter: 'all' | 'past-due' = 'all';
    @state() private sort: AdminAccountSort = 'name';
    @state() private loading = true;
    @state() private accountsLoading = false;
    @state() private error = false;

    @state() private page = 1;
    @state() private pageSize = 10;
    @state() private totalCount = 0;

    async connectedCallback() {
        super.connectedCallback();
        await this.fetchAccounts(true);
    }

    private async fetchAccounts(initialLoad = false) {
        if (initialLoad) {
            this.loading = true;
            this.error = false;
        } else {
            this.accountsLoading = true;
        }
        try {
            const limit = this.pageSize;
            const offset = (this.page - 1) * this.pageSize;
            const { items, total } = await AdminDataService.getAccounts(limit, offset, this.filter === 'past-due', this.sort);
            this.accounts = items;
            this.totalCount = total;
        } catch {
            this.error = true;
        } finally {
            this.loading = false;
            this.accountsLoading = false;
        }
    }

    private get processedAccounts(): AdminAccount[] {
        let result = [...this.accounts];

        // 1. Search
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter(
                (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
            );
        }

        // 2. Quick Filters
        // Handled by backend now

        return result;
    }

    private handleSearch(e: Event) {
        this.searchQuery = (e.target as HTMLInputElement).value;
    }

    private async setFilter(filter: 'all' | 'past-due') {
        this.filter = filter;
        this.page = 1; // Reset to first page
        await this.fetchAccounts();
    }

    private async setSort(sort: AdminAccountSort) {
        this.sort = sort;
        this.page = 1; // Reset to first page
        await this.fetchAccounts();
    }

    private navigateToAccount(id: number) {
        Router.go(`/admin/accounts/${id}`);
    }

    private async handlePageChange(newPage: number) {
        if (newPage < 1 || newPage > Math.ceil(this.totalCount / this.pageSize)) return;
        this.page = newPage;
        await this.fetchAccounts();
    }

    private async handlePageSizeChange(e: Event) {
        const newSize = parseInt((e.target as HTMLSelectElement).value, 10);
        this.pageSize = newSize;
        this.page = 1; // Reset to first page
        await this.fetchAccounts();
    }

    render() {
        if (this.loading) return html`<p>Loading accounts...</p>`;
        if (this.error) return html`<p class="error-msg">Failed to load accounts.</p>`;

        const rows = this.processedAccounts;
        const { start, end } = getPaginationBounds(this.page, this.pageSize, this.totalCount);

        return html`
            <pv-page-tour-modal 
                pageId="admin-accounts"
                heading="Accounts Dashboard"
                .features=${[
                { title: 'Global Directory', description: 'Search, filter, and view all registered contractor accounts.' },
                { title: 'Receivables Overview', description: 'Quickly identify accounts with open invoices, high balances, and past-due amounts.' },
                { title: 'Detailed Drilling', description: 'Click into any account to view their specific orders, invoices, users, and detailed settings.' }
            ]}
            ></pv-page-tour-modal>
            ${this.accountsLoading ? html`
                <div style="margin-bottom: 0.75rem; color: var(--color-text-muted); font-size: 0.875rem;">Updating accounts...</div>
            ` : ''}
            <div class="page-header">
                <div>
                    <h2>Accounts Dashboard</h2>
                    <p class="page-subtitle">Overview of account health and receivables.</p>
                </div>
                <input
                    type="text"
                    class="search-input"
                    placeholder="Search accounts..."
                    aria-label="Search accounts"
                    .value=${this.searchQuery}
                    @input=${this.handleSearch}
                >
            </div>

            <!-- Quick Filters & Sort Controls -->
            <div class="controls-row">
                <div class="filter-group">
                    <span class="filter-label">Filter:</span>
                    <button class="filter-btn ${this.filter === 'all' ? 'active' : ''}" @click=${() => this.setFilter('all')}>All Accounts</button>
                    <button class="filter-btn ${this.filter === 'past-due' ? 'active' : ''}" @click=${() => this.setFilter('past-due')}>Past Due Only</button>
                </div>
                
                <div class="filter-group spacer">
                    <span class="filter-label">Sort By:</span>
                    <select
                        class="sort-select"
                        aria-label="Sort accounts"
                        .value=${this.sort}
                        @change=${(e: Event) => this.setSort((e.target as HTMLSelectElement).value as AdminAccountSort)}
                    >
                        <option value="name">Name (A-Z)</option>
                        <option value="balance-desc">Highest Balance</option>
                        <option value="past-due-desc">Highest Past Due</option>
                        <option value="age-desc">Oldest Balance (Age)</option>
                    </select>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 25%;">Company</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Open Invoices</th>
                        <th>Balance</th>
                        <th>Past Due</th>
                        <th>Age</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.length === 0
                ? html`<tr class="empty-row"><td colspan="8">No accounts match your criteria.</td></tr>`
                : rows.map((a) => html`
                            <tr @click=${() => this.navigateToAccount(a.id)}>
                                <td>
                                    <div class="company-name">${a.name}</div>
                                    <div class="company-id">ID: ${a.id}</div>
                                </td>
                                <td>
                                    <div class="contact-name">${a.primaryContact}</div>
                                    <div class="contact-phone">${a.phone}</div>
                                </td>
                                <td>
                                    <span class="status-badge status-${a.status}">${a.status}</span>
                                </td>
                                <td style="text-align: center;">
                                    ${a.openInvoicesCount > 0
                        ? html`<span style="font-weight: 600; color: var(--color-primary);">${a.openInvoicesCount}</span>`
                        : html`<span class="zero-value">-</span>`
                    }
                                </td>
                                <td>
                                    <div class="metric-value">$${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <div class="credit-limit">Limit: $${(a.creditLimit / 1000).toFixed(0)}k</div>
                                </td>
                                <td>
                                    ${a.pastDueBalance > 0
                        ? html`<div class="metric-value text-danger">$${a.pastDueBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`
                        : html`<span class="zero-value">-</span>`
                    }
                                </td>
                                <td>
                                    <span class="badge-age ${a.aging === '90+' ? 'age-plus' : `age-${a.aging}`}">
                                        ${a.aging === 'Current' ? 'Current' : a.aging + ' Days'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn-view" @click=${(e: Event) => { e.stopPropagation(); this.navigateToAccount(a.id); }}>View</button>
                                </td>
                            </tr>
                        `)
            }
                </tbody>
            </table>

            <!-- Pagination Controls -->
            <div class="pagination">
                <div class="pagination-info">
                    Showing <span>${start}</span> to 
                    <span>${end}</span> of 
                    <span>${this.totalCount}</span> accounts
                    
                    <span class="pagination-divider">|</span>
                    
                    <label class="per-page-label">
                        Per page:
                        <select 
                            class="per-page-select"
                            .value=${String(this.pageSize)}
                            ?disabled=${this.accountsLoading}
                            @change=${this.handlePageSizeChange}
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </label>
                </div>
                <div class="pagination-actions">
                    <button 
                        class="pagination-btn" 
                        ?disabled=${this.page === 1 || this.accountsLoading}
                        @click=${() => this.handlePageChange(this.page - 1)}
                    >
                        Previous
                    </button>
                    ${this.renderPageNumbers()}
                    <button 
                        class="pagination-btn" 
                        ?disabled=${this.page >= Math.ceil(this.totalCount / this.pageSize) || this.accountsLoading}
                        @click=${() => this.handlePageChange(this.page + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        `;
    }

    private renderPageNumbers() {
        const totalPages = Math.ceil(this.totalCount / this.pageSize);
        if (totalPages <= 1) return null;

        return buildPaginationTokens(this.page, totalPages).map(token =>
            token === 'ellipsis'
                ? html`<span class="pagination-ellipsis-inline">...</span>`
                : html`
                    <button 
                        class="pagination-btn ${this.page === token ? 'active' : ''}" 
                        ?disabled=${this.accountsLoading}
                        @click=${() => this.handlePageChange(token)}
                    >
                        ${token}
                    </button>
                `
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-accounts': PageAccounts;
    }
}
