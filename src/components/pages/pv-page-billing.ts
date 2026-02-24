/**
 * PvPageBilling - Billing page component
 * Displays invoices with tabs and drill-down detail view
 */

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { RouterService } from '../../services/router.service.js';
import { AuthService } from '../../services/auth.service.js';
import { BillingService } from '../../connect/services/billing.js';
import { SalesService } from '../../connect/services/sales.js';
import { DocumentsService } from '../../connect/services/documents.js';
import { PvToast } from '../atoms/pv-toast.js';
import type { Invoice, InvoiceLine } from '../../types/index.js';
import type { Statement, UserRole } from '../../connect/types/domain.js';
import { activeFilterStyles, detailViewStyles, listStateStyles, pageShellStyles, paginationStyles } from '../../styles/shared.js';
import { billingPageStyles } from '../../styles/pages.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';
import '../../features/billing/components/pv-payment-history-table.js';
import '../../features/billing/components/pv-payment-modal.js';

const MAX_API_PAGE_SIZE = 200;

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

  // Multi-invoice selection state
  @state() private selectedInvoiceIds: Set<number> = new Set();
  @state() private selectedInvoiceDetails: Map<number, { id: number; invoiceNumber: string; amount: number; isPayable: boolean }> = new Map();
  @state() private paymentRequestId: string | null = null;
  @state() private showPaymentRequestBanner = false;
  @state() private currentUserRole: UserRole | null = null;

  private unsubscribeRouter?: () => void;

  async connectedCallback() {
    super.connectedCallback();
    this.currentUserRole = AuthService.getUser()?.role ?? null;
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

  private isInvoicePayable(status: string): boolean {
    return status !== 'paid' && status !== 'void' && status !== 'cancelled';
  }

  private updateSelectedInvoiceDetailsFromInvoice(invoice: Invoice) {
    if (!this.selectedInvoiceIds.has(invoice.id)) return;
    const next = new Map(this.selectedInvoiceDetails);
    next.set(invoice.id, {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amountDue,
      isPayable: this.isInvoicePayable(invoice.status),
    });
    this.selectedInvoiceDetails = next;
  }

  private syncSelectedInvoiceDetailsFromCurrentPage() {
    const next = new Map(this.selectedInvoiceDetails);
    for (const invoice of this.invoices) {
      if (this.selectedInvoiceIds.has(invoice.id)) {
        next.set(invoice.id, {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amountDue,
          isPayable: this.isInvoicePayable(invoice.status),
        });
      }
    }
    this.selectedInvoiceDetails = next;
  }

  private async hydrateSelectedInvoiceDetailsFromServer() {
    if (this.selectedInvoiceIds.size === 0) return;
    try {
      const { mapInvoiceToLegacy } = await import('../../connect/mappers.js');
      const next = new Map(this.selectedInvoiceDetails);

      const requestedIds = [...this.selectedInvoiceIds];
      const fetchedInvoices = await Promise.all(
        requestedIds.map(async (id) => {
          try {
            const raw = await SalesService.getInvoiceDetails(id);
            return mapInvoiceToLegacy(raw);
          } catch {
            return null;
          }
        }),
      );

      for (const invoice of fetchedInvoices) {
        if (invoice && this.selectedInvoiceIds.has(invoice.id)) {
          next.set(invoice.id, {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amountDue,
            isPayable: this.isInvoicePayable(invoice.status),
          });
        }
      }
      this.selectedInvoiceDetails = next;
    } catch (e) {
      console.error('Failed to hydrate selected invoices', e);
    }
  }

  private toggleInvoice(invoice: Invoice) {
    const next = new Set(this.selectedInvoiceIds);
    const nextDetails = new Map(this.selectedInvoiceDetails);
    if (next.has(invoice.id)) {
      next.delete(invoice.id);
      nextDetails.delete(invoice.id);
    } else {
      next.add(invoice.id);
      nextDetails.set(invoice.id, {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amountDue,
        isPayable: this.isInvoicePayable(invoice.status),
      });
    }
    this.selectedInvoiceIds = next;
    this.selectedInvoiceDetails = nextDetails;
  }

  private toggleAllInvoices() {
    const payableInvoices = this.invoices.filter(inv => this.isInvoicePayable(inv.status));
    const payableIdsOnPage = payableInvoices.map(inv => inv.id);
    const allPageSelected = payableIdsOnPage.length > 0 && payableIdsOnPage.every(id => this.selectedInvoiceIds.has(id));

    const nextIds = new Set(this.selectedInvoiceIds);
    const nextDetails = new Map(this.selectedInvoiceDetails);

    if (allPageSelected) {
      for (const id of payableIdsOnPage) {
        nextIds.delete(id);
        nextDetails.delete(id);
      }
    } else {
      for (const invoice of payableInvoices) {
        nextIds.add(invoice.id);
        nextDetails.set(invoice.id, {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amountDue,
          isPayable: true,
        });
      }
    }
    this.selectedInvoiceIds = nextIds;
    this.selectedInvoiceDetails = nextDetails;
  }

  private clearSelection() {
    this.selectedInvoiceIds = new Set();
    this.selectedInvoiceDetails = new Map();
  }

  private get selectedInvoicesTotal(): number {
    return this.selectedInvoicesList.reduce((sum, inv) => sum + inv.amount, 0);
  }

  private get selectedInvoicesList(): { id: number; invoiceNumber: string; amount: number }[] {
    const selected: { id: number; invoiceNumber: string; amount: number }[] = [];
    for (const id of this.selectedInvoiceIds) {
      const detail = this.selectedInvoiceDetails.get(id);
      if (detail && detail.isPayable) {
        selected.push({ id: detail.id, invoiceNumber: detail.invoiceNumber, amount: detail.amount });
      }
    }
    return selected;
  }

  private get allPayableOnPageSelected(): boolean {
    const payableIdsOnPage = this.invoices.filter(i => this.isInvoicePayable(i.status)).map(i => i.id);
    return payableIdsOnPage.length > 0 && payableIdsOnPage.every(id => this.selectedInvoiceIds.has(id));
  }

  private async openBulkPayModal() {
    if (!this.canManageBilling()) {
      PvToast.show('Only owners can make payments', 'warning');
      return;
    }
    if (this.selectedInvoiceIds.size === 0) return;

    await this.hydrateSelectedInvoiceDetailsFromServer();

    const missingIds = [...this.selectedInvoiceIds].filter(id => !this.selectedInvoiceDetails.has(id));
    if (missingIds.length > 0) {
      PvToast.show('Some selected invoices could not be loaded. Refresh and try again.', 'error');
      return;
    }

    const nonPayableCount = [...this.selectedInvoiceIds]
      .map(id => this.selectedInvoiceDetails.get(id))
      .filter(detail => detail && !detail.isPayable)
      .length;
    if (nonPayableCount > 0) {
      PvToast.show('Selection contains paid/void/cancelled invoices. Adjust selection and retry.', 'warning');
      return;
    }

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
      this.syncSelectedInvoiceDetailsFromCurrentPage();
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
      const { mapInvoiceToLegacy } = await import('../../connect/mappers.js');
      let offset = 0;
      let total = 0;
      let outstandingBalance = 0;

      while (offset < total || offset === 0) {
        const response = await SalesService.getInvoices(MAX_API_PAGE_SIZE, offset, this.filterJobId ?? undefined, 'open');
        total = response.total;
        if (response.items.length === 0) break;

        const invoices = response.items.map(mapInvoiceToLegacy);
        outstandingBalance += invoices.reduce((sum: number, inv: Invoice) => sum + inv.amountDue, 0);
        offset += response.items.length;
      }

      this.outstandingInvoicesCount = total;
      this.outstandingBalance = outstandingBalance;
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
    if (!this.canManageBilling()) {
      PvToast.show('Only owners can make payments', 'warning');
      return;
    }
    // When paying a single invoice from its row, clear multi-selection and use the legacy props
    this.selectedInvoiceIds = new Set([invoice.id]);
    this.selectedInvoiceDetails = new Map();
    this.updateSelectedInvoiceDetailsFromInvoice(invoice);
    this.paymentInvoiceId = invoice.id;
    this.paymentAmount = invoice.amountDue;
    this.paymentModalOpen = true;
  }

  private clearDeepLinkParamsFromHash() {
    const params = new URLSearchParams(RouterService.getParams().toString());
    params.delete('pr');
    params.delete('invoices');
    const nextParams: Record<string, string> = {};
    params.forEach((value, key) => {
      nextParams[key] = value;
    });
    RouterService.navigate('billing', Object.keys(nextParams).length > 0 ? nextParams : undefined);
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
    this.selectedInvoiceDetails = new Map();
    this.showPaymentRequestBanner = false;
    // Clear URL params after successful payment
    if (this.paymentRequestId) {
      this.clearDeepLinkParamsFromHash();
      this.paymentRequestId = null;
    }
  }

  private dismissPaymentRequestBanner() {
    this.showPaymentRequestBanner = false;
  }

  private canManageBilling(): boolean {
    return this.currentUserRole === 'account_admin' ||
      this.currentUserRole === 'tenant_owner' ||
      this.currentUserRole === 'tenant_staff';
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
          <div class="list-refresh-note">
            Updating invoices...
          </div>
        ` : ''}
        <div class="invoice-row-header">
          <span><input
            type="checkbox"
            class="invoice-checkbox"
            .checked=${this.allPayableOnPageSelected}
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
                    @change=${() => this.toggleInvoice(invoice)}
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
                ?disabled=${!isPayable || !this.canManageBilling()}
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
            ?disabled=${invoice.status === 'paid' || invoice.status === 'void' || invoice.status === 'cancelled' || !this.canManageBilling()}
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
            <button class="btn btn-cta" @click=${this.openBulkPayModal} ?disabled=${!this.canManageBilling()}>Pay Selected</button>
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
