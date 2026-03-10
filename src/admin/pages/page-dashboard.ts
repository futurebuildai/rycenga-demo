import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminDataService } from '../services/admin-data.service.js';
import type { AdminDashboardSummary } from '../services/admin-data.service.js';
import '../../components/atoms/pv-page-tour-modal.js';

@customElement('admin-page-dashboard')
export class PageDashboard extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        h2 {
            margin: 0 0 0.5rem;
            color: var(--color-text, #0f172a);
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
        }

        .subtitle {
            color: var(--color-text-muted, #94a3b8);
            margin-bottom: 1.5rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
        }

        .stat-card {
            background: var(--admin-card-bg, #ffffff);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card-icon.blue { background: #eff6ff; color: #3b82f6; }
        .card-icon.indigo { background: #e0e7ff; color: #6366f1; }
        .card-icon.green { background: #dcfce7; color: #22c55e; }
        .card-icon.red { background: #fef2f2; color: #ef4444; }

        .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--color-text, #111827);
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            line-height: 1.2;
        }

        .stat-label {
            color: var(--color-text-muted, #6b7280);
            font-size: 0.875rem;
            font-weight: 500;
        }
    `;

    @state() private summary: AdminDashboardSummary | null = null;
    @state() private loading = true;
    @state() private error = false;

    async connectedCallback() {
        super.connectedCallback();
        try {
            this.summary = await AdminDataService.getDashboardSummary();
        } catch {
            this.error = true;
        } finally {
            this.loading = false;
        }
    }

    render() {
        if (this.loading) {
            return html`<p>Loading dashboard...</p>`;
        }

        if (this.error || !this.summary) {
            return html`<p class="error-msg">Failed to load dashboard data.</p>`;
        }

        const s = this.summary;

        return html`
            <pv-page-tour-modal 
                pageId="admin-dashboard"
                heading="Admin Dashboard"
                .features=${[
                { title: 'Quick Insights', description: 'Get a high-level view of your customer base, including total accounts, active orders, and total credit.' },
                { title: 'Risk Management', description: 'Instantly spot overdue or at-risk accounts with the highlighted risk metric card.' },
                { title: 'Pulse Check', description: 'Monitor the daily health of your dealer operations at a glance.' }
            ]}
            ></pv-page-tour-modal>
            <h2>Admin Dashboard</h2>
            <p class="subtitle">Welcome to the control plane.</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="card-icon blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div>
                        <div class="stat-value">${s.totalAccounts}</div>
                        <div class="stat-label">Total Accounts</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="card-icon indigo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </div>
                    <div>
                        <div class="stat-value">${s.activeOrders}</div>
                        <div class="stat-label">Active Orders</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="card-icon green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <div>
                        <div class="stat-value">$${formatCompact(s.totalCreditExtended)}</div>
                        <div class="stat-label">Credit Extended</div>
                    </div>
                </div>
                <div class="stat-card risk">
                    <div class="card-icon red">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                    <div>
                        <div class="stat-value">${s.accountsAtRisk}</div>
                        <div class="stat-label">Overdue Accounts</div>
                    </div>
                </div>
            </div>
        `;
    }
}

function formatCompact(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toLocaleString();
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-dashboard': PageDashboard;
    }
}
