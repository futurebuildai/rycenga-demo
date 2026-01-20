/**
 * LbPageOverview - Dashboard overview page
 * Displays quick stats and account summary
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import { DataService } from '../../services/data.service.js';
import { RouterService } from '../../services/router.service.js';
import { LbToast } from '../atoms/lb-toast.js';
import type { AccountData, Order, Estimate, Invoice } from '../../types/index.js';

@customElement('lb-page-overview')
export class LbPageOverview extends LbBase {
  static styles = [
    ...LbBase.styles,
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
  @state() private pendingEstimatesTotal = 0;
  @state() private openInvoicesTotal = 0;
  @state() private creditLimit = 0;
  @state() private creditAvailable = 0;

  async connectedCallback() {
    super.connectedCallback();
    try {
      this.accountData = await DataService.getAccountData();

      // TODO: Replace with single backend call: GET /dashboard/summary
      // Backend should return DashboardSummary with pre-computed values:
      // - balanceDue (sum of open + overdue invoices)
      // - creditLimit, creditAvailable
      // - activeOrdersCount
      // - pendingEstimatesCount, pendingEstimatesTotal
      //
      // TEMPORARY: Using legacy account data for now
      const company = this.accountData?.company;
      this.creditLimit = company?.limit ?? 0;
      this.openInvoicesTotal = company?.balance ?? 0;
      this.creditAvailable = this.creditLimit - this.openInvoicesTotal;

      // TEMPORARY: Fetching and computing until backend provides summary
      const orders = await DataService.getOrders();
      this.activeOrdersCount = orders.filter((o: Order) =>
        o.status !== 'delivered' && o.status !== 'closed' && o.status !== 'cancelled'
      ).length;

      const estimates = await DataService.getEstimates();
      const pendingEstimates = estimates.filter((e: Estimate) => e.status === 'sent');
      this.pendingEstimatesCount = pendingEstimates.length;
      this.pendingEstimatesTotal = pendingEstimates.reduce((sum, e) => sum + e.total, 0);

    } catch (e) {
      console.error('Failed to load account data', e);
    } finally {
      this.loading = false;
    }
  }

  private handlePayNow() {
    // Navigate to billing page where full payment flow is implemented
    RouterService.navigate('billing');
    LbToast.show('Navigate to Billing to pay open invoices', 'info');
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
          <button class="btn-cta stat-action" @click=${this.handlePayNow}>Pay Now</button>
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
            <span class="stat-meta">${this.formatCurrency(this.pendingEstimatesTotal)} total</span>
          </div>
          <button class="stat-link" @click=${() => RouterService.navigate('estimates')}>Review →</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-page-overview': LbPageOverview;
  }
}
