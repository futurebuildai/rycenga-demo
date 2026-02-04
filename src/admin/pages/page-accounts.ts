import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { AdminDataService } from '../services/admin-data.service.js';
import type { AdminAccount } from '../services/admin-data.service.js';

@customElement('admin-page-accounts')
export class PageAccounts extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        h2 {
            margin: 0;
            color: var(--color-text, #0f172a);
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
        }

        .search-input {
            padding: 0.5rem 1rem;
            border: 2px solid var(--color-border, #e2e8f0);
            border-radius: 6px;
            font-size: 0.875rem;
            font-family: var(--font-body, 'Inter', sans-serif);
            min-width: 260px;
            transition: border-color 150ms ease;
        }

        .search-input:focus {
            outline: none;
            border-color: var(--color-accent, #f97316);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        th, td {
            text-align: left;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
        }

        th {
            background: #f9fafb;
            font-weight: 600;
            font-size: 0.8125rem;
            color: var(--color-text-light, #374151);
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }

        tr:last-child td {
            border-bottom: none;
        }

        .company-name {
            font-weight: 500;
        }

        .company-id {
            font-size: 0.8125rem;
            color: var(--color-text-muted, #6b7280);
        }

        .contact-email {
            display: block;
        }

        .contact-phone {
            font-size: 0.8125rem;
            color: var(--color-text-muted, #6b7280);
        }

        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .status-Active { background: #dcfce7; color: #166534; }
        .status-Hold { background: #fef3c7; color: #92400e; }
        .status-Overdue { background: #fee2e2; color: #991b1b; }

        .btn-view {
            color: #2563eb;
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.875rem;
            font-family: var(--font-body, 'Inter', sans-serif);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }

        .btn-view:hover {
            background: #eff6ff;
        }

        .empty-row td {
            text-align: center;
            color: var(--color-text-muted, #6b7280);
            padding: 2rem;
        }

        .error-msg {
            color: var(--color-error, #ef4444);
        }
    `;

    @state() private accounts: AdminAccount[] = [];
    @state() private searchQuery = '';
    @state() private filter: 'all' | 'past-due' = 'all';
    @state() private sort: 'name' | 'balance-desc' | 'past-due-desc' | 'age-desc' = 'name';
    @state() private loading = true;
    @state() private error = false;

    async connectedCallback() {
        super.connectedCallback();
        try {
            this.accounts = await AdminDataService.getAccounts();
        } catch {
            this.error = true;
        } finally {
            this.loading = false;
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
        if (this.filter === 'past-due') {
            result = result.filter(a => a.pastDueBalance > 0);
        }

        // 3. Sorting
        switch (this.sort) {
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'balance-desc':
                result.sort((a, b) => b.balance - a.balance);
                break;
            case 'past-due-desc':
                result.sort((a, b) => b.pastDueBalance - a.pastDueBalance);
                break;
            case 'age-desc':
                const ageMap = { 'Current': 0, '30': 1, '60': 2, '90': 3, '90+': 4 };
                result.sort((a, b) => ageMap[b.aging] - ageMap[a.aging]);
                break;
        }

        return result;
    }

    private handleSearch(e: Event) {
        this.searchQuery = (e.target as HTMLInputElement).value;
    }

    private setFilter(filter: 'all' | 'past-due') {
        this.filter = filter;
    }

    private setSort(sort: typeof this.sort) {
        this.sort = sort;
    }

    private navigateToAccount(id: number) {
        Router.go(`/admin/accounts/${id}`);
    }

    render() {
        if (this.loading) return html`<p>Loading accounts...</p>`;
        if (this.error) return html`<p class="error-msg">Failed to load accounts.</p>`;

        const rows = this.processedAccounts;

        return html`
            <div class="page-header">
                <div>
                    <h2>Accounts Dashboard</h2>
                    <p class="subtitle" style="margin-top: 4px; color: var(--color-text-muted);">Overview of account health and receivables.</p>
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
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center;">
                <div class="filter-group">
                    <span style="font-size: 0.875rem; font-weight: 500; margin-right: 8px;">Filter:</span>
                    <button class="filter-btn ${this.filter === 'all' ? 'active' : ''}" @click=${() => this.setFilter('all')}>All Accounts</button>
                    <button class="filter-btn ${this.filter === 'past-due' ? 'active' : ''}" @click=${() => this.setFilter('past-due')}>Past Due Only</button>
                </div>
                
                <div class="filter-group" style="margin-left: auto;">
                    <span style="font-size: 0.875rem; font-weight: 500; margin-right: 8px;">Sort By:</span>
                    <select class="sort-select" aria-label="Sort accounts" @change=${(e: Event) => this.setSort((e.target as HTMLSelectElement).value as any)}>
                        <option value="name">Name (A-Z)</option>
                        <option value="balance-desc">Highest Balance</option>
                        <option value="past-due-desc">Highest Past Due</option>
                        <option value="age-desc">Oldest Balance (Age)</option>
                    </select>
                </div>
            </div>

            <style>
                .filter-btn {
                    padding: 8px 16px;
                    border: 1px solid var(--color-border);
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--color-text);
                    transition: all 0.2s;
                }
                .filter-btn:hover {
                    border-color: var(--color-primary-light);
                    background: var(--color-bg-alt);
                }
                .filter-btn.active {
                    background: var(--admin-sidebar-bg);
                    color: white;
                    border-color: var(--admin-sidebar-bg);
                }
                .sort-select {
                    padding: 8px 16px;
                    border: 1px solid var(--color-border);
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--color-text);
                    background: white;
                    cursor: pointer;
                    outline: none;
                    height: 35px; /* Match button visually */
                }
                .sort-select:focus {
                    border-color: var(--color-accent);
                }
                tr { cursor: pointer; transition: background 0.15s; }
                tr:hover { background: #f8fafc; }
                
                .metric-value { font-family: 'Space Mono', monospace; letter-spacing: -0.5px; }
                .text-danger { color: #dc2626; font-weight: 600; }
                .text-warning { color: #d97706; }
                .badge-age { 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    font-size: 0.75rem; 
                    font-weight: 600; 
                }
                .age-current { background: #dcfce7; color: #166534; }
                .age-30 { background: #fef9c3; color: #854d0e; }
                .age-60 { background: #ffedd5; color: #9a3412; }
                .age-90 { background: #fee2e2; color: #991b1b; }
                .age-plus { background: #7f1d1d; color: white; }
            </style>

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
                                    <div style="font-weight: 500;">${a.primaryContact}</div>
                                    <div class="contact-phone" style="font-size: 11px;">${a.phone}</div>
                                </td>
                                <td>
                                    <span class="status-badge status-${a.status}">${a.status}</span>
                                </td>
                                <td style="text-align: center;">
                                    ${a.openInvoicesCount > 0
                        ? html`<span style="font-weight: 600; color: var(--color-primary);">${a.openInvoicesCount}</span>`
                        : html`<span style="color: #cbd5e1;">-</span>`
                    }
                                </td>
                                <td>
                                    <div class="metric-value">$${a.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                    <div style="font-size: 11px; color: #64748b;">Limit: $${(a.creditLimit / 1000).toFixed(0)}k</div>
                                </td>
                                <td>
                                    ${a.pastDueBalance > 0
                        ? html`<div class="metric-value text-danger">$${a.pastDueBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>`
                        : html`<span style="color: #cbd5e1;">-</span>`
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
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-accounts': PageAccounts;
    }
}
