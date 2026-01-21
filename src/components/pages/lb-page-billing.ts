/**
 * LbPageBilling - Billing page component
 * Displays invoices with tabs and drill-down detail view
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import { DataService } from '../../services/data.service.js';
import { BillingService } from '../../connect/services/billing.js';
import { LbToast } from '../atoms/lb-toast.js';
import type { Invoice } from '../../types/index.js';

@customElement('lb-page-billing')
export class LbPageBilling extends LbBase {
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

      .billing-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--space-lg);
        margin-bottom: var(--space-xl);
      }

      .summary-card {
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
      }

      .summary-card.balance {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
        color: white;
      }

      .summary-label {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        margin-bottom: var(--space-xs);
      }

      .summary-card.balance .summary-label {
        color: rgba(255, 255, 255, 0.8);
      }

      .summary-value {
        font-family: var(--font-heading);
        font-size: var(--text-2xl);
        font-weight: 700;
      }

      .billing-tabs {
        display: flex;
        gap: var(--space-sm);
        border-bottom: 2px solid var(--color-border);
        margin-bottom: var(--space-xl);
      }

      .billing-tab {
        padding: var(--space-md) var(--space-lg);
        background: none;
        border: none;
        font-weight: 500;
        color: var(--color-text-light);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition: all var(--transition-fast);
      }

      .billing-tab:hover {
        color: var(--color-text);
      }

      .billing-tab.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }

      .invoice-row {
        display: grid;
        grid-template-columns: 1fr 150px 100px 120px 120px;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-lg);
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-md);
      }

      @media (max-width: 768px) {
        .invoice-row {
          grid-template-columns: 1fr 1fr;
        }
      }

      .invoice-info {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .invoice-number {
        font-weight: 600;
      }

      .invoice-project {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      .invoice-amount {
        font-weight: 600;
      }

      /* Detail View */
      .detail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-xl);
      }

      .btn-back {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        background: transparent;
        color: var(--color-primary);
        border: 2px solid var(--color-primary);
        border-radius: var(--radius-md);
        font-weight: 600;
        cursor: pointer;
      }

      .btn-back:hover {
        background: var(--color-primary);
        color: white;
      }

      .detail-card {
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
      }

      .detail-title-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: var(--space-xl);
      }

      .detail-id {
        font-family: var(--font-heading);
        font-size: var(--text-2xl);
        font-weight: 700;
        margin-bottom: var(--space-xs);
      }

      .detail-project-info {
        color: var(--color-text-muted);
      }

      .detail-totals {
        margin-top: var(--space-xl);
        padding-top: var(--space-lg);
        border-top: 1px solid var(--color-border);
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        padding: var(--space-sm) 0;
      }

      .total-row.grand {
        font-weight: 700;
        font-size: var(--text-lg);
        padding-top: var(--space-md);
        border-top: 2px solid var(--color-border);
      }

      .detail-actions {
        margin-top: var(--space-xl);
        display: flex;
        gap: var(--space-md);
      }
    `,
  ];

  @state() private invoices: Invoice[] = [];
  @state() private loading = true;
  @state() private currentView: 'list' | 'detail' = 'list';
  @state() private selectedInvoice: Invoice | null = null;
  @state() private activeTab = 'invoices';
  @state() private payingInvoiceId: string | null = null;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadInvoices();
  }

  private async loadInvoices() {
    try {
      this.invoices = await DataService.getInvoices();
    } catch (e) {
      console.error('Failed to load invoices', e);
    } finally {
      this.loading = false;
    }
  }

  private viewInvoiceDetail(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.currentView = 'detail';
  }

  private backToList() {
    this.currentView = 'list';
    this.selectedInvoice = null;
  }

  private async handlePayInvoice(invoice: Invoice) {
    // In production, this would open a modal to select payment method
    this.payingInvoiceId = invoice.id;
    try {
      await BillingService.payInvoice(parseInt(invoice.id), { paymentMethodId: 'pm-1' });
      LbToast.show(`Payment submitted for ${invoice.invoiceNumber}`, 'success');
      // Optimistic update
      this.invoices = this.invoices.map(i =>
        i.id === invoice.id ? { ...i, status: 'paid' as const, amountDue: 0 } : i
      );
      if (this.selectedInvoice?.id === invoice.id) {
        this.selectedInvoice = { ...this.selectedInvoice, status: 'paid' as const, amountDue: 0 };
      }
    } catch (e) {
      console.error('Failed to pay invoice', e);
      LbToast.show('Failed to process payment', 'error');
    } finally {
      this.payingInvoiceId = null;
    }
  }

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'open': 'status-open',
      'paid': 'status-paid',
      'overdue': 'status-expired',
      'cancelled': 'status-cancelled',
      'void': 'status-cancelled',
    };
    return statusMap[status] || 'status-pending';
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // TODO: Replace with GET /billing/summary from backend
  // Backend should provide: balanceDue, openInvoicesCount, overdueInvoicesCount, lastPaymentDate
  private get totalBalance(): number {
    // TEMPORARY: Computing until backend provides BillingSummary
    return this.invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
  }

  private get openInvoicesCount(): number {
    // TEMPORARY: Computing until backend provides BillingSummary
    return this.invoices.filter(i => i.status === 'open' || i.status === 'overdue').length;
  }

  private renderListView() {
    return html`
      <div class="billing-summary">
        <div class="summary-card balance">
          <div class="summary-label">Balance Due</div>
          <div class="summary-value">${this.formatCurrency(this.totalBalance)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Outstanding Invoices</div>
          <div class="summary-value">${this.openInvoicesCount}</div>
        </div>
        <div class="summary-card">
          <!-- TODO: Backend should provide lastPaymentDate in BillingSummary -->
          <div class="summary-label">Last Payment</div>
          <div class="summary-value">—</div>
        </div>
      </div>

      <div class="billing-tabs">
        <button class="billing-tab ${this.activeTab === 'invoices' ? 'active' : ''}" @click=${() => this.activeTab = 'invoices'}>Open Invoices</button>
        <button class="billing-tab ${this.activeTab === 'statements' ? 'active' : ''}" @click=${() => this.activeTab = 'statements'}>Statements</button>
        <button class="billing-tab ${this.activeTab === 'history' ? 'active' : ''}" @click=${() => this.activeTab = 'history'}>Payment History</button>
      </div>

      ${this.activeTab === 'invoices' ? html`
        ${this.invoices.map(invoice => html`
          <div class="invoice-row">
            <div class="invoice-info">
              <span class="invoice-number">${invoice.invoiceNumber}</span>
              <span class="invoice-project">Due: ${this.formatDate(invoice.dueDate || '')}</span>
            </div>
            <div class="invoice-amount">${this.formatCurrency(invoice.amountDue)}</div>
            <span class="status-badge ${this.getStatusClass(invoice.status)}">${invoice.status}</span>
            <button class="btn btn-outline btn-sm" @click=${() => this.viewInvoiceDetail(invoice)}>View</button>
            <button 
              class="btn btn-cta btn-sm" 
              @click=${() => this.handlePayInvoice(invoice)}
              ?disabled=${this.payingInvoiceId === invoice.id || invoice.status === 'paid'}
            >${this.payingInvoiceId === invoice.id ? 'Paying...' : 'Pay'}</button>
          </div>
        `)}
      ` : this.activeTab === 'statements' ? html`
        <p class="text-muted">Monthly account statements will be displayed here.</p>
      ` : html`
        <p class="text-muted">Payment history will be displayed here.</p>
      `}
    `;
  }

  private renderDetailView() {
    if (!this.selectedInvoice) return html``;

    const invoice = this.selectedInvoice;

    return html`
      <div class="detail-header">
        <button class="btn-back" @click=${this.backToList}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Invoices
        </button>
        <button class="btn btn-outline btn-sm" @click=${() => LbToast.show('PDF download coming soon', 'info')}>Download PDF</button>
      </div>

      <div class="detail-card">
        <div class="detail-title-row">
          <div>
            <h2 class="detail-id">${invoice.invoiceNumber}</h2>
            <p class="detail-project-info">Due: ${this.formatDate(invoice.dueDate || '')}</p>
          </div>
          <span class="status-badge ${this.getStatusClass(invoice.status)}">${invoice.status}</span>
        </div>

        <div class="detail-totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${this.formatCurrency(invoice.subtotal || 0)}</span>
          </div>
          <div class="total-row">
            <span>Tax</span>
            <span>${this.formatCurrency(invoice.tax || 0)}</span>
          </div>
          <div class="total-row">
            <span>Amount Paid</span>
            <span>${this.formatCurrency(invoice.amountPaid || 0)}</span>
          </div>
          <div class="total-row grand">
            <span>Amount Due</span>
            <span>${this.formatCurrency(invoice.amountDue)}</span>
          </div>
        </div>

        <div class="detail-actions">
          <button 
            class="btn btn-cta" 
            @click=${() => this.handlePayInvoice(invoice)}
            ?disabled=${this.payingInvoiceId === invoice.id || invoice.status === 'paid'}
          >${this.payingInvoiceId === invoice.id ? 'Paying...' : 'Pay Invoice'}</button>
          <button class="btn btn-outline" @click=${() => LbToast.show('PDF download coming soon', 'info')}>Download PDF</button>
        </div>
      </div>
    `;
  }

  render() {
    if (this.loading) {
      return html`<p>Loading billing...</p>`;
    }

    return html`
      <div class="section-header">
        <div>
          <h1 class="section-title">Billing</h1>
          <p class="section-subtitle">Manage invoices and payments</p>
        </div>
      </div>

      ${this.currentView === 'list' ? this.renderListView() : this.renderDetailView()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-page-billing': LbPageBilling;
  }
}
