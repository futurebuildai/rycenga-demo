/**
 * PvPageOverview - Dashboard overview page
 * Displays quick stats and account summary
 */

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { RouterService } from '../../services/router.service.js';
import { PvToast } from '../atoms/pv-toast.js';
import { pageShellStyles } from '../../styles/shared.js';
import { overviewPageStyles } from '../../styles/pages.js';
import type { AccountData } from '../../types/index.js';
import '../../features/billing/components/pv-payment-modal.js';
import '../../features/estimates/components/pv-quick-quote-modal.js';
import { pvState } from '../../store/pv-state.js';
import '../atoms/pv-page-tour-modal.js';

@customElement('pv-page-overview')
export class PvPageOverview extends PvBase {
  static styles = [
    ...PvBase.styles,
    pageShellStyles,
    overviewPageStyles,
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

  // Quick Quote Modal
  @state() private quickQuoteModalOpen = false;

  async connectedCallback() {
    super.connectedCallback();
    this.refreshDashboard();
  }

  private async refreshDashboard() {
    try {
      const summary = await DataService.getDashboardSummary(); // Fetches aggregated stats from /dashboard/summary
      const account = await DataService.getAccountData();

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
    const creditPercentRaw = this.creditLimit > 0 ? (this.openInvoicesTotal / this.creditLimit) * 100 : 0;
    const creditPercent = Math.max(0, Math.min(100, creditPercentRaw));

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
          <progress class="credit-progress" value=${creditPercent} max="100"></progress>
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

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Quick Quote</span>
            <span class="stat-value">Start New</span>
            <span class="stat-meta">Upload list or manual entry</span>
          </div>
          <button class="stat-link" @click=${() => this.quickQuoteModalOpen = true}>Start Now →</button>
        </div>
      </div>

      <pv-payment-modal
        .open=${this.paymentModalOpen}
        .amount=${this.paymentAmount}
        type="balance"
        @close=${() => this.paymentModalOpen = false}
        @payment-success=${this.handlePaymentSuccess}
      ></pv-payment-modal>

      <pv-quick-quote-modal
        .open=${this.quickQuoteModalOpen}
        @close=${() => this.quickQuoteModalOpen = false}
        @submitted=${() => {
        this.quickQuoteModalOpen = false;
        this.refreshDashboard();
      }}
      ></pv-quick-quote-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-overview': PvPageOverview;
  }
}
