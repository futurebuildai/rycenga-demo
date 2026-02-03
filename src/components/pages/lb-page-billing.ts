/**
 * LbPageBilling - Billing page component
 * Displays invoices with tabs and drill-down detail view
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import { DataService } from '../../services/data.service.js';
import { BillingService } from '../../connect/services/billing.js';
import { DocumentsService } from '../../connect/services/documents.js';
import { LbToast } from '../atoms/lb-toast.js';
import type { Invoice, InvoiceLine } from '../../types/index.js';
import type { Statement } from '../../connect/types/domain.js';
import '../../features/billing/components/lb-payment-history-table.js';
import '../../features/billing/components/lb-payment-modal.js';

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

      .line-items-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: var(--space-xl);
      }

      .line-items-table th {
        text-align: left;
        padding: var(--space-md);
        border-bottom: 2px solid var(--color-border);
        color: var(--color-text-muted);
        font-size: var(--text-sm);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .line-items-table td {
        padding: var(--space-md);
        border-bottom: 1px solid var(--color-border);
      }

      .line-sku {
        font-family: monospace;
        color: var(--color-text-muted);
        font-size: var(--text-sm);
      }

      .line-qty {
        text-align: center;
      }

      .line-price, .line-total {
        text-align: right;
      }

      .loading-lines {
        padding: var(--space-xl);
        text-align: center;
        color: var(--color-text-muted);
      }
    `,
  ];

  @state() private invoices: Invoice[] = [];
  @state() private loading = true;
  @state() private currentView: 'list' | 'detail' = 'list';
  @state() private selectedInvoice: Invoice | null = null;
  @state() private activeTab = 'invoices';
  @state() private selectedInvoiceLines: InvoiceLine[] = [];
  @state() private loadingLines = false;
  @state() private statements: Statement[] = [];

  // Payment Modal State
  @state() private paymentModalOpen = false;
  @state() private paymentAmount = 0;
  @state() private paymentInvoiceId: number | undefined;

  async connectedCallback() {
    super.connectedCallback();
    await Promise.all([
      this.loadInvoices(),
      this.loadStatements(),
    ]);
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

  private async loadStatements() {
    try {
      this.statements = await BillingService.getStatements();
    } catch (e) {
      console.error('Failed to load statements', e);
    }
  }

  private async viewInvoiceDetail(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.currentView = 'detail';
    this.selectedInvoiceLines = [];

    // Fetch line items
    this.loadingLines = true;
    try {
      this.selectedInvoiceLines = await DataService.getInvoiceLines(invoice.id);
    } catch (e) {
      console.error('Failed to load invoice lines', e);
      LbToast.show('Failed to load line items', 'error');
    } finally {
      this.loadingLines = false;
    }
  }

  private backToList() {
    this.currentView = 'list';
    this.selectedInvoice = null;
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

  private openPaymentModal(invoice: Invoice) {
    this.paymentInvoiceId = invoice.id;
    this.paymentAmount = invoice.amountDue;
    this.paymentModalOpen = true;
  }

  private handlePaymentSuccess() {
    this.loadInvoices(); // Refresh invoices to show updated status
    if (this.selectedInvoice && this.paymentInvoiceId === this.selectedInvoice.id) {
      // Ideally we'd re-fetch the specific invoice, but for now we can infer payment
      // or just depend on loadInvoices to update the list view.
      // If we stay in detail view, we might want to manually update the selectedInvoice status or close detail view.
      this.backToList();
    }
    this.paymentInvoiceId = undefined;
    this.paymentAmount = 0;
  }

  private async downloadInvoicePdf(invoice: Invoice) {
    try {
      LbToast.show('Preparing PDF...', 'info');
      const response = await DocumentsService.getDocumentPdf({
        type: 'invoice',
        id: invoice.id,
        idType: 'internal',
      });

      const url = URL.createObjectURL(response.blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error('[LbPageBilling] Failed to download invoice PDF', err);
      LbToast.show('Failed to download PDF. Please try again.', 'error');
    }
  }

  private async downloadStatementPdf(statement: Statement) {
    try {
      LbToast.show('Preparing PDF...', 'info');
      const response = await DocumentsService.getDocumentPdf({
        type: 'statement',
        id: statement.id,
        idType: 'internal',
      });

      const url = URL.createObjectURL(response.blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error('[LbPageBilling] Failed to download statement PDF', err);
      LbToast.show('Failed to download PDF. Please try again.', 'error');
    }
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
              @click=${() => this.openPaymentModal(invoice)}
              ?disabled=${invoice.status === 'paid' || invoice.status === 'void' || invoice.status === 'cancelled'}
            >Pay</button>
          </div>
        `)}
      ` : this.activeTab === 'statements' ? html`
        ${this.statements.length === 0 ? html`
          <p class="text-muted">No monthly account statements found.</p>
        ` : this.statements.map(statement => html`
          <div class="invoice-row">
            <div class="invoice-info">
              <span class="invoice-number">${statement.statementNumber || `Statement #${statement.id}`}</span>
              <span class="invoice-project">Date: ${this.formatDate(statement.statementDate)}</span>
            </div>
            <div class="invoice-amount">${this.formatCurrency(statement.closingBalance)}</div>
            <span class="status-badge status-paid">Settled</span>
            <button class="btn btn-outline btn-sm" @click=${() => this.downloadStatementPdf(statement)}>Download PDF</button>
            <span></span>
          </div>
        `)}
      ` : html`
        <lb-payment-history-table></lb-payment-history-table>
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
        <button class="btn btn-outline btn-sm" @click=${() => this.downloadInvoicePdf(invoice)}>Download PDF</button>
      </div>

      <div class="detail-card">
        <div class="detail-title-row">
          <div>
            <h2 class="detail-id">${invoice.invoiceNumber}</h2>
            <p class="detail-project-info">Due: ${this.formatDate(invoice.dueDate || '')}</p>
          </div>
          <span class="status-badge ${this.getStatusClass(invoice.status)}">${invoice.status}</span>
        </div>

        ${this.loadingLines ? html`
          <div class="loading-lines">Loading line items...</div>
        ` : html`
          <table class="line-items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th class="line-qty">Qty</th>
                <th class="line-price">Price</th>
                <th class="line-total">Total</th>
              </tr>
            </thead>
            <tbody>
              ${this.selectedInvoiceLines.length === 0 ? html`
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: var(--space-xl);">
                    No line items found.
                  </td>
                </tr>
              ` : this.selectedInvoiceLines.map(line => html`
                <tr>
                  <td>
                    <div style="font-weight: 500;">${line.name}</div>
                  </td>
                  <td><span class="line-sku">${line.sku || '—'}</span></td>
                  <td class="line-qty">${line.quantity}</td>
                  <td class="line-price">${this.formatCurrency(line.unitPrice)}</td>
                  <td class="line-total" style="font-weight: 600;">${this.formatCurrency(line.lineTotal)}</td>
                </tr>
              `)}
            </tbody>
          </table>
        `}

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
            @click=${() => this.openPaymentModal(invoice)}
            ?disabled=${invoice.status === 'paid' || invoice.status === 'void' || invoice.status === 'cancelled'}
          >Pay Invoice</button>
          <button class="btn btn-outline" @click=${() => this.downloadInvoicePdf(invoice)}>Download PDF</button>
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

      <lb-payment-modal
        .open=${this.paymentModalOpen}
        .amount=${this.paymentAmount}
        .invoiceId=${this.paymentInvoiceId}
        type="invoice"
        @close=${() => this.paymentModalOpen = false}
        @payment-success=${this.handlePaymentSuccess}
      ></lb-payment-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-page-billing': LbPageBilling;
  }
}
