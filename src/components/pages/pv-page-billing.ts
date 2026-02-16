/**
 * PvPageBilling - Billing page component
 * Displays invoices with tabs and drill-down detail view
 */

import { html, css } from 'lit';
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
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';
import '../../features/billing/components/pv-payment-history-table.js';
import '../../features/billing/components/pv-payment-modal.js';

@customElement('pv-page-billing')
export class PvPageBilling extends PvBase {
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
        grid-template-columns: 40px 1fr 150px 100px 120px 120px;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-lg);
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-md);
        transition: background var(--transition-fast), box-shadow var(--transition-fast);
      }

      .invoice-row.selected {
        background: rgba(var(--color-primary-rgb, 59, 130, 246), 0.06);
        box-shadow: inset 0 0 0 1px var(--color-primary);
      }

      .invoice-row-header {
        display: grid;
        grid-template-columns: 40px 1fr 150px 100px 120px 120px;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-sm) var(--space-lg);
        margin-bottom: var(--space-xs);
      }

      .invoice-row-header span {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .invoice-row,
        .invoice-row-header {
          grid-template-columns: 32px 1fr 1fr;
        }
        .invoice-row-header {
          display: none;
        }
      }

      .invoice-checkbox {
        width: 18px;
        height: 18px;
        accent-color: var(--color-primary);
        cursor: pointer;
      }

      /* Floating Pay Selected Bar */
      .bulk-pay-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--color-bg);
        border-top: 2px solid var(--color-primary);
        box-shadow: 0 -4px 20px rgba(0,0,0,0.12);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md) var(--space-xl);
        z-index: 100;
        animation: slideUp 0.25s ease-out;
      }

      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }

      .bulk-pay-info {
        display: flex;
        align-items: center;
        gap: var(--space-md);
      }

      .bulk-pay-count {
        font-weight: 600;
        color: var(--color-text);
      }

      .bulk-pay-total {
        font-family: monospace;
        font-weight: 700;
        font-size: var(--text-lg);
        color: var(--color-primary);
      }

      .bulk-pay-actions {
        display: flex;
        align-items: center;
        gap: var(--space-md);
      }

      .btn-clear-selection {
        background: transparent;
        border: 1px solid var(--color-border);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        cursor: pointer;
        font-weight: 500;
        transition: all var(--transition-fast);
      }

      .btn-clear-selection:hover {
        border-color: var(--color-text-muted);
        color: var(--color-text);
      }

      /* Payment request banner */
      .payment-request-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md) var(--space-lg);
        background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.04));
        border: 1px solid rgba(59,130,246,0.2);
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-lg);
      }

      .payment-request-banner .banner-text {
        font-size: var(--text-sm);
        color: var(--color-text);
        font-weight: 500;
      }

      .payment-request-banner .banner-dismiss {
        background: transparent;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        font-size: var(--text-lg);
        line-height: 1;
        padding: var(--space-xs);
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

      /* Pagination */
      .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--space-lg);
        padding: var(--space-md) 0;
      }

      .pagination-info {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      .pagination-actions {
        display: flex;
        gap: var(--space-sm);
      }

      .pagination-btn {
        padding: var(--space-sm) var(--space-md);
        background: var(--color-bg-alt);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 500;
        transition: all var(--transition-fast);
      }

      .pagination-btn:hover:not(:disabled) {
        background: white;
        border-color: var(--color-primary);
        color: var(--color-primary);
      }

      .pagination-btn.active {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }

      .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .active-filter-bar {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: var(--space-lg);
        padding: var(--space-sm) var(--space-md);
        background: var(--color-bg-alt);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      .active-filter-chip {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-xs) var(--space-sm);
        background: var(--color-primary);
        color: white;
        border-radius: var(--radius-md);
        font-size: var(--text-xs);
        font-weight: 600;
        transition: all var(--transition-fast);
      }

      .active-filter-chip button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        cursor: pointer;
        padding: 2px 4px;
        margin-left: var(--space-xs);
        border-radius: var(--radius-sm);
        font-size: var(--text-base);
        line-height: 1;
        transition: all var(--transition-fast);
      }

      .active-filter-chip button:hover {
        background: rgba(255, 255, 255, 0.3);
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

  // Multi-invoice selection state
  @state() private selectedInvoiceIds: Set<number> = new Set();
  @state() private paymentRequestId: string | null = null;
  @state() private showPaymentRequestBanner = false;

  private unsubscribeRouter?: () => void;

  async connectedCallback() {
    super.connectedCallback();
    this.readFilterParams();
    this.readDeepLinkParams();
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

  // --- Deep Link / Payment Request Params ---

  private readDeepLinkParams() {
    const params = RouterService.getParams();

    // Payment request ID from AR Center
    const prId = params.get('pr');
    if (prId) {
      this.paymentRequestId = prId;
      this.showPaymentRequestBanner = true;
    }

    // Pre-select invoices from URL
    const invoiceIdsStr = params.get('invoices');
    if (invoiceIdsStr) {
      const ids = invoiceIdsStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      this.selectedInvoiceIds = new Set(ids);
    }
  }

  // --- Invoice Selection ---

  private toggleInvoice(invoiceId: number) {
    const next = new Set(this.selectedInvoiceIds);
    if (next.has(invoiceId)) {
      next.delete(invoiceId);
    } else {
      next.add(invoiceId);
    }
    this.selectedInvoiceIds = next;
  }

  private toggleAllInvoices() {
    const payableInvoices = this.invoices.filter(
      inv => inv.status !== 'paid' && inv.status !== 'void' && inv.status !== 'cancelled',
    );
    if (this.selectedInvoiceIds.size === payableInvoices.length && payableInvoices.length > 0) {
      this.selectedInvoiceIds = new Set();
    } else {
      this.selectedInvoiceIds = new Set(payableInvoices.map(inv => inv.id));
    }
  }

  private clearSelection() {
    this.selectedInvoiceIds = new Set();
  }

  private get selectedInvoicesTotal(): number {
    return this.invoices
      .filter(inv => this.selectedInvoiceIds.has(inv.id))
      .reduce((sum, inv) => sum + inv.amountDue, 0);
  }

  private get selectedInvoicesList(): { id: number; invoiceNumber: string; amount: number }[] {
    return this.invoices
      .filter(inv => this.selectedInvoiceIds.has(inv.id))
      .map(inv => ({ id: inv.id, invoiceNumber: inv.invoiceNumber, amount: inv.amountDue }));
  }

  private openBulkPayModal() {
    this.paymentModalOpen = true;
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
        ? html`<span style="align-self: center;">...</span>`
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
    // When paying a single invoice from its row, clear multi-selection and use the legacy props
    this.selectedInvoiceIds = new Set([invoice.id]);
    this.paymentInvoiceId = invoice.id;
    this.paymentAmount = invoice.amountDue;
    this.paymentModalOpen = true;
  }

  private handlePaymentSuccess() {
    this.loadInvoices(); // Refresh invoices to show updated status
    this.loadInvoiceSummary();
    if (this.selectedInvoice && this.paymentInvoiceId === this.selectedInvoice.id) {
      this.backToList();
    }
    // Clear all selection state
    this.paymentInvoiceId = undefined;
    this.paymentAmount = 0;
    this.selectedInvoiceIds = new Set();
    this.showPaymentRequestBanner = false;
    // Clear URL params after successful payment
    if (this.paymentRequestId) {
      const url = new URL(window.location.href);
      url.searchParams.delete('pr');
      url.searchParams.delete('invoices');
      window.history.replaceState({}, '', url.toString());
      this.paymentRequestId = null;
    }
  }

  private dismissPaymentRequestBanner() {
    this.showPaymentRequestBanner = false;
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
        ${this.showPaymentRequestBanner ? html`
          <div class="payment-request-banner">
            <span class="banner-text">📩 Your dealer has requested payment for the selected invoices below.</span>
            <button class="banner-dismiss" @click=${this.dismissPaymentRequestBanner} title="Dismiss">&times;</button>
          </div>
        ` : ''}
        ${this.invoicesLoading ? html`
          <div style="margin-bottom: var(--space-md); color: var(--color-text-muted); font-size: var(--text-sm);">
            Updating invoices...
          </div>
        ` : ''}
        <div class="invoice-row-header">
          <span><input
            type="checkbox"
            class="invoice-checkbox"
            .checked=${this.selectedInvoiceIds.size > 0 && this.selectedInvoiceIds.size === this.invoices.filter(i => i.status !== 'paid' && i.status !== 'void' && i.status !== 'cancelled').length}
            @change=${this.toggleAllInvoices}
          /></span>
          <span>Invoice</span>
          <span>Amount Due</span>
          <span>Status</span>
          <span></span>
          <span></span>
        </div>
        ${this.invoices.map(invoice => {
      const isPayable = invoice.status !== 'paid' && invoice.status !== 'void' && invoice.status !== 'cancelled';
      const isSelected = this.selectedInvoiceIds.has(invoice.id);
      return html`
            <div class="invoice-row ${isSelected ? 'selected' : ''}">
              <div>
                ${isPayable ? html`
                  <input
                    type="checkbox"
                    class="invoice-checkbox"
                    .checked=${isSelected}
                    @change=${() => this.toggleInvoice(invoice.id)}
                  />
                ` : html`<span></span>`}
              </div>
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
                ?disabled=${!isPayable}
              >Pay</button>
            </div>
          `;
    })}

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
            <span></span>
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
        .invoices=${this.selectedInvoicesList}
        .paymentRequestId=${this.paymentRequestId ?? undefined}
        type="invoice"
        @close=${() => this.paymentModalOpen = false}
        @payment-success=${this.handlePaymentSuccess}
      ></pv-payment-modal>

      ${this.selectedInvoiceIds.size > 0 && this.currentView === 'list' ? html`
        <div class="bulk-pay-bar">
          <div class="bulk-pay-info">
            <span class="bulk-pay-count">${this.selectedInvoiceIds.size} invoice${this.selectedInvoiceIds.size > 1 ? 's' : ''} selected</span>
            <span class="bulk-pay-total">${this.formatCurrency(this.selectedInvoicesTotal)}</span>
          </div>
          <div class="bulk-pay-actions">
            <button class="btn-clear-selection" @click=${this.clearSelection}>Clear</button>
            <button class="btn btn-cta" @click=${this.openBulkPayModal}>Pay Selected</button>
          </div>
        </div>
      ` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-billing': PvPageBilling;
  }
}
