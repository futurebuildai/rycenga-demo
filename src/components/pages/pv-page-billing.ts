/**
 * PvPageBilling - Billing page component
 * Displays invoices with tabs and drill-down detail view
 */

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { RouterService } from '../../services/router.service.js';
import { BillingService } from '../../connect/services/billing.js';
import { SalesService } from '../../connect/services/sales.js';
import { DocumentsService } from '../../connect/services/documents.js';
import { PvToast } from '../atoms/pv-toast.js';
import type { Invoice, InvoiceLine } from '../../types/index.js';
import type { Statement } from '../../connect/types/domain.js';
import { activeFilterStyles, detailViewStyles, listStateStyles, pageShellStyles, paginationStyles } from '../../styles/shared.js';
import { billingPageStyles } from '../../styles/pages.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';
import '../../features/billing/components/pv-payment-history-table.js';
import '../../features/billing/components/pv-payment-modal.js';

@customElement('pv-page-billing')
export class PvPageBilling extends PvBase {
  static styles = [
    ...PvBase.styles,
    pageShellStyles,
    detailViewStyles,
    activeFilterStyles,
    paginationStyles,
    listStateStyles,
    billingPageStyles,
  ];

  @state() private invoices: Invoice[] = [];
  @state() private loading = true;
  @state() private currentView: 'list' | 'detail' = 'list';
  @state() private selectedInvoice: Invoice | null = null;
  @state() private activeTab = 'invoices';
  @state() private selectedInvoiceLines: InvoiceLine[] = [];
  @state() private loadingLines = false;
  @state() private statements: Statement[] = [];
  @state() private invoicesLoading = false;
  @state() private outstandingInvoicesCount = 0;
  @state() private outstandingBalance = 0;
  @state() private filterJobId: number | null = null;
  @state() private filterJobName: string | null = null;

  // Pagination State
  @state() private invoicesPage = 1;
  @state() private invoicesPageSize = 10;
  @state() private invoicesTotal = 0;

  // Payment Modal State
  @state() private paymentModalOpen = false;
  @state() private paymentAmount = 0;
  @state() private paymentInvoiceId: number | undefined;

  private unsubscribeRouter?: () => void;

  async connectedCallback() {
    super.connectedCallback();
    this.readFilterParams();
    this.unsubscribeRouter = RouterService.subscribe(() => {
      const params = RouterService.getParams();
      const jobIdStr = params.get('jobId');
      const newJobId = jobIdStr ? parseInt(jobIdStr, 10) : null;
      const newJobName = params.get('jobName');
      if ((isNaN(newJobId as number) ? null : newJobId) !== this.filterJobId) {
        this.filterJobId = (newJobId && !isNaN(newJobId)) ? newJobId : null;
        this.filterJobName = newJobName;
        this.invoicesPage = 1;
        this.loadInvoices();
        this.loadInvoiceSummary();
      }
    });
    await Promise.all([
      this.loadInvoices(true),
      this.loadStatements(),
      this.loadInvoiceSummary(),
    ]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeRouter?.();
  }

  private readFilterParams() {
    const params = RouterService.getParams();
    const jobIdStr = params.get('jobId');
    if (jobIdStr) {
      const parsed = parseInt(jobIdStr, 10);
      if (!isNaN(parsed)) {
        this.filterJobId = parsed;
        this.filterJobName = params.get('jobName');
      }
    }
  }

  private clearFilter() {
    RouterService.navigate('billing');
  }

  private async loadInvoices(initialLoad = false) {
    try {
      if (initialLoad) {
        this.loading = true;
      } else {
        this.invoicesLoading = true;
      }

      const fetchSize = this.invoicesPageSize;
      const fetchOffset = (this.invoicesPage - 1) * this.invoicesPageSize;
      const response = await SalesService.getInvoices(fetchSize, fetchOffset, this.filterJobId ?? undefined);

      // Map to legacy format
      const { mapInvoiceToLegacy } = await import('../../connect/mappers.js');
      this.invoices = response.items.map(mapInvoiceToLegacy);
      this.invoicesTotal = response.total;
    } catch (e) {
      console.error('Failed to load invoices', e);
    } finally {
      this.loading = false;
      this.invoicesLoading = false;
    }
  }

  private async handleInvoicePageChange(newPage: number) {
    if (newPage < 1 || newPage > Math.ceil(this.invoicesTotal / this.invoicesPageSize)) return;
    this.invoicesPage = newPage;
    await this.loadInvoices();
  }

  private async loadInvoiceSummary() {
    try {
      const response = await SalesService.getInvoices(1000, 0, this.filterJobId ?? undefined);
      const { mapInvoiceToLegacy } = await import('../../connect/mappers.js');
      const allInvoices = response.items.map(mapInvoiceToLegacy);

      const outstanding = allInvoices.filter((i: Invoice) => i.status === 'open' || i.status === 'overdue');
      this.outstandingInvoicesCount = outstanding.length;
      this.outstandingBalance = outstanding.reduce((sum: number, inv: Invoice) => sum + inv.amountDue, 0);
    } catch (e) {
      console.error('Failed to load invoice summary', e);
    }
  }

  private renderInvoicePageNumbers() {
    const totalPages = Math.ceil(this.invoicesTotal / this.invoicesPageSize);
    return buildPaginationTokens(this.invoicesPage, totalPages).map(token =>
      token === 'ellipsis'
        ? html`<span class="pagination-ellipsis">...</span>`
        : html`
            <button
              class="pagination-btn ${token === this.invoicesPage ? 'active' : ''}"
              ?disabled=${this.invoicesLoading}
              @click=${() => this.handleInvoicePageChange(token)}
            >
              ${token}
            </button>
          `,
    );
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
      PvToast.show('Failed to load line items', 'error');
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

  private openPaymentModal(invoice: Invoice) {
    this.paymentInvoiceId = invoice.id;
    this.paymentAmount = invoice.amountDue;
    this.paymentModalOpen = true;
  }

  private handlePaymentSuccess() {
    this.loadInvoices(); // Refresh invoices to show updated status
    this.loadInvoiceSummary();
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
      PvToast.show('Preparing PDF...', 'info');
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
      console.error('[PvPageBilling] Failed to download invoice PDF', err);
      PvToast.show('Failed to download PDF. Please try again.', 'error');
    }
  }

  private async downloadStatementPdf(statement: Statement) {
    try {
      PvToast.show('Preparing PDF...', 'info');
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
      console.error('[PvPageBilling] Failed to download statement PDF', err);
      PvToast.show('Failed to download PDF. Please try again.', 'error');
    }
  }

  private renderListView() {
    const { start, end } = getPaginationBounds(this.invoicesPage, this.invoicesPageSize, this.invoicesTotal);
    return html`
      <div class="billing-summary">
        <div class="summary-card balance">
          <div class="summary-label">Balance Due</div>
          <div class="summary-value">${this.formatCurrency(this.outstandingBalance)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Outstanding Invoices</div>
          <div class="summary-value">${this.outstandingInvoicesCount}</div>
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
        ${this.invoicesLoading ? html`
          <div class="list-refresh-note">
            Updating invoices...
          </div>
        ` : ''}
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

        <!-- Pagination Controls -->
        <div class="pagination">
          <div class="pagination-info">
            Showing <span>${start}</span> to 
            <span>${end}</span> of 
            <span>${this.invoicesTotal}</span> invoices
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
        <pv-payment-history-table></pv-payment-history-table>
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
          <div class="line-items-message text-center">Loading line items...</div>
        ` : html`
          <table class="line-items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${this.selectedInvoiceLines.length === 0 ? html`
                <tr>
                  <td colspan="5" class="text-center line-items-message">
                    No line items found.
                  </td>
                </tr>
              ` : this.selectedInvoiceLines.map(line => html`
                <tr>
                  <td>
                    <div class="line-item-name">${line.name}</div>
                  </td>
                  <td><span class="line-sku">${line.sku || '—'}</span></td>
                  <td class="text-center">${line.quantity}</td>
                  <td class="text-right">${this.formatCurrency(line.unitPrice)}</td>
                  <td class="text-right line-total-strong">${this.formatCurrency(line.lineTotal)}</td>
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
          <p class="section-subtitle">${this.filterJobName ? `Filtered by project: ${this.filterJobName}` : 'Manage invoices and payments'}</p>
        </div>
      </div>

      ${this.filterJobId ? html`
        <div class="active-filter-bar">
          <span>Filtered by project:</span>
          <span class="active-filter-chip">
            ${this.filterJobName || `Job #${this.filterJobId}`}
            <button @click=${this.clearFilter} title="Clear filter">&times;</button>
          </span>
        </div>
      ` : ''}

      ${this.currentView === 'list' ? this.renderListView() : this.renderDetailView()}

      <pv-payment-modal
        .open=${this.paymentModalOpen}
        .amount=${this.paymentAmount}
        .invoiceId=${this.paymentInvoiceId}
        type="invoice"
        @close=${() => this.paymentModalOpen = false}
        @payment-success=${this.handlePaymentSuccess}
      ></pv-payment-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-billing': PvPageBilling;
  }
}
