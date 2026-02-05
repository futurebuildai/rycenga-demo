/**
 * PvPageOverview - Dashboard overview page
 * Displays quick stats and account summary
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { RouterService } from '../../services/router.service.js';
import { PvToast } from '../atoms/pv-toast.js';
import type { AccountData } from '../../types/index.js';
import '../../features/billing/components/pv-payment-modal.js';

@customElement('pv-page-overview')
export class PvPageOverview extends PvBase {
  static styles = [
    ...PvBase.styles,
    css`
      :host {
        display: block;
      }

      .section-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: var(--space-xl);
        gap: var(--space-lg);
      }

      .section-title {
        font-family: var(--font-heading);
        font-size: var(--text-3xl);
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: var(--space-xs);
      }

      .section-subtitle {
        color: var(--color-text-muted);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-lg);
      }

      .stat-card {
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .stat-card-balance {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
        color: white;
      }

      .stat-card-balance .stat-label,
      .stat-card-balance .stat-meta {
        color: rgba(255, 255, 255, 0.8);
      }

      .stat-card-balance .stat-value {
        color: white;
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        font-weight: 500;
      }

      .stat-value {
        font-family: var(--font-heading);
        font-size: var(--text-3xl);
        font-weight: 700;
        color: var(--color-text);
      }

      .stat-meta {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      .stat-action {
        margin-top: auto;
      }

      .stat-progress {
        height: 6px;
        background: var(--color-border);
        border-radius: var(--radius-full);
        overflow: hidden;
      }

      .progress-bar {
        height: 100%;
        background: var(--color-accent);
        border-radius: var(--radius-full);
      }

      .stat-link {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-accent);
        margin-top: auto;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
        text-decoration: none;
      }

      .stat-link:hover {
        color: var(--color-primary);
      }

      .btn-cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-md) var(--space-xl);
        background: var(--color-accent);
        color: white;
        font-family: var(--font-heading);
        font-weight: 700;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-base);
      }

      .btn-cta:hover {
        background: var(--color-cta-hover);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .btn-cta:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    `,
  ];

  @state() private accountData: AccountData | null = null;
  @state() private loading = true;
  @state() private activeOrdersCount = 0;
  @state() private pendingEstimatesCount = 0;
  @state() private openInvoicesTotal = 0;
  @state() private creditLimit = 0;
  @state() private creditAvailable = 0;

  // Payment Modal
  @state() private paymentModalOpen = false;
  @state() private paymentAmount = 0;

  async connectedCallback() {
    super.connectedCallback();
    this.refreshDashboard();
  }

  private async refreshDashboard() {
    try {
      const [account, summary] = await Promise.all([
        DataService.getAccountData(),
        DataService.getDashboardSummary() // Fetches aggregated stats from /dashboard/summary
      ]);

      this.accountData = account;

      // Hydrate state from backend summary
      // Note: creditAvailable is computed as creditLimit - currentBalance
      this.creditLimit = summary.creditLimit ?? 0;
      this.openInvoicesTotal = summary.currentBalance;
      this.creditAvailable = this.creditLimit - this.openInvoicesTotal;
      this.activeOrdersCount = summary.activeOrdersCount;
      this.pendingEstimatesCount = summary.pendingQuotesCount;

    } catch (e) {
      console.error('Failed to load dashboard data', e);
      PvToast.show('Failed to load dashboard summary', 'error');
    } finally {
      this.loading = false;
    }
  }

  private handlePayNow() {
    this.paymentAmount = this.openInvoicesTotal;
    this.paymentModalOpen = true;
  }

  private handlePaymentSuccess() {
    this.refreshDashboard();
    this.paymentModalOpen = false;
  }


  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  render() {
    if (this.loading) {
      return html`<p>Loading...</p>`;
    }

    const user = this.accountData?.user;
    const creditPercent = this.creditLimit > 0 ? (this.openInvoicesTotal / this.creditLimit) * 100 : 0;

    return html`
      <div class="section-header">
        <div>
          <h1 class="section-title">Welcome back, ${user?.firstName ?? 'User'}</h1>
          <p class="section-subtitle">Here's what's happening with your account</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-card-balance">
          <div class="stat-content">
            <span class="stat-label">Balance Due</span>
            <span class="stat-value">${this.formatCurrency(this.openInvoicesTotal)}</span>
            <span class="stat-meta">From open invoices</span>
          </div>
          <button class="btn-cta stat-action" @click=${this.handlePayNow} ?disabled=${this.openInvoicesTotal <= 0}>Pay Now</button>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Credit Available</span>
            <span class="stat-value">${this.formatCurrency(this.creditAvailable)}</span>
            <span class="stat-meta">of ${this.formatCurrency(this.creditLimit)} limit</span>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" style="width: ${creditPercent}%"></div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Active Orders</span>
            <span class="stat-value">${this.activeOrdersCount}</span>
            <span class="stat-meta">${this.activeOrdersCount === 1 ? '1 order' : `${this.activeOrdersCount} orders`} in progress</span>
          </div>
          <button class="stat-link" @click=${() => RouterService.navigate('orders')}>View Orders →</button>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Pending Estimates</span>
            <span class="stat-value">${this.pendingEstimatesCount}</span>
            <span class="stat-meta">${this.pendingEstimatesCount === 1 ? '1 estimate' : `${this.pendingEstimatesCount} estimates`} awaiting review</span>
          </div>
          <button class="stat-link" @click=${() => RouterService.navigate('estimates')}>Review →</button>
        </div>
      </div>

      <pv-payment-modal
        .open=${this.paymentModalOpen}
        .amount=${this.paymentAmount}
        type="balance"
        @close=${() => this.paymentModalOpen = false}
        @payment-success=${this.handlePaymentSuccess}
      ></pv-payment-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-overview': PvPageOverview;
  }
}
