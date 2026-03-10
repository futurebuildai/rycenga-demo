/**
 * PvPageOrders - Orders page component
 * Displays order list with drill-down to detail view
 */

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { RouterService } from '../../services/router.service.js';
import { DocumentsService } from '../../connect/services/documents.js';
import { PvToast } from '../atoms/pv-toast.js';
import { activeFilterStyles, detailViewStyles, listStateStyles, pageShellStyles, paginationStyles } from '../../styles/shared.js';
import { ordersPageStyles } from '../../styles/pages.js';
import type { Order } from '../../types/index.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';
import '../atoms/pv-page-tour-modal.js';

@customElement('pv-page-orders')
export class PvPageOrders extends PvBase {
  static styles = [
    ...PvBase.styles,
    pageShellStyles,
    detailViewStyles,
    activeFilterStyles,
    paginationStyles,
    listStateStyles,
    ordersPageStyles,
  ];

  @state() private orders: Order[] = [];
  @state() private loading = true;
  @state() private currentView: 'list' | 'detail' = 'list';
  @state() private selectedOrder: Order | null = null;
  @state() private activeFilter = 'All';
  @state() private loadingLines = false;
  @state() private lineError: string | null = null;
  @state() private ordersLoading = false;
  @state() private page = 1;
  @state() private pageSize = 10;
  @state() private totalCount = 0;
  @state() private filterJobId: number | null = null;
  @state() private filterJobName: string | null = null;

  private filters = ['All', 'Pending', 'Confirmed', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'];
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
        this.page = 1;
        this.loadOrders();
      }
    });
    await this.loadOrders(true);
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
    RouterService.navigate('orders');
  }

  private async loadOrders(initialLoad = false) {
    try {
      if (initialLoad) {
        this.loading = true;
      } else {
        this.ordersLoading = true;
      }

      const fetchSize = this.pageSize;
      const fetchOffset = (this.page - 1) * this.pageSize;

      const { items, total } = await DataService.getOrderSummaries(
        fetchSize,
        fetchOffset,
        this.filterJobId ?? undefined,
      );

      this.orders = items;
      this.totalCount = total;
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      this.loading = false;
      this.ordersLoading = false;
    }
  }

  private async handlePageChange(page: number) {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (page < 1 || page > totalPages || page === this.page) return;
    this.page = page;
    await this.loadOrders();
  }

  private async viewOrderDetail(order: Order) {
    this.selectedOrder = { ...order, lines: [] };
    this.currentView = 'detail';
    this.loadingLines = true;
    this.lineError = null;

    try {
      const lines = await DataService.getOrderLines(order.id);
      this.selectedOrder = { ...order, lines };
    } catch (e) {
      console.error('Failed to load order lines', e);
      this.lineError = 'Failed to load line items. Please try again.';
    } finally {
      this.loadingLines = false;
    }
  }

  private backToList() {
    this.currentView = 'list';
    this.selectedOrder = null;
  }

  private setFilter(filter: string) {
    this.activeFilter = filter;
  }

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'ready_for_pickup': 'status-ready_for_pickup',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled',
      'closed': 'status-delivered',
    };
    return statusMap[status] || 'status-pending';
  }

  private getDisplayStatus(status: string): string {
    const displayMap: Record<string, string> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'ready_for_pickup': 'Ready for Pickup',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'closed': 'Closed',
    };
    return displayMap[status] || status;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  private getOrderSummary(order: Order): string {
    const linesCount = order.lines?.length;
    const count = (typeof linesCount === 'number' && linesCount > 0)
      ? linesCount
      : (order.productCount ?? 0);
    const names = order.lines && order.lines.length > 0
      ? order.lines.slice(0, 2).map(l => l.name).join(', ')
      : '';
    const productsText = count === 1 ? 'product' : 'products';
    if (!names) {
      return `${count} ${productsText}`;
    }
    return `${count} ${productsText}: ${names}${count > 2 ? '...' : ''}`;
  }

  private calculateSubtotal(order: Order): number {
    return order.lines?.reduce((sum, line) => sum + line.lineTotal, 0) || 0;
  }

  private async downloadOrderPdf(order: Order) {
    try {
      PvToast.show('Preparing PDF...', 'info');
      const response = await DocumentsService.getDocumentPdf({
        type: 'order',
        id: order.id,
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
      console.error('[PvPageOrders] Failed to download order PDF', err);
      PvToast.show('Failed to download PDF. Please try again.', 'error');
    }
  }

  private renderPageNumbers() {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (totalPages <= 1) return null;

    return buildPaginationTokens(this.page, totalPages).map(token =>
      token === 'ellipsis'
        ? html`<span class="pagination-ellipsis">...</span>`
        : html`
            <button
              class="btn btn-outline btn-sm page-number-btn ${this.page === token ? 'active' : ''}"
              ?disabled=${this.ordersLoading}
              @click=${() => this.handlePageChange(token)}
            >
              ${token}
            </button>
          `,
    );
  }

  private renderListView() {
    const { start, end } = getPaginationBounds(this.page, this.pageSize, this.totalCount);
    return html`
      ${this.ordersLoading ? html`
        <div class="list-refresh-note">
          Updating orders...
        </div>
      ` : ''}
      <div class="filters-bar">
        <div class="filter-chips">
          ${this.filters.map(filter => html`
            <button 
              class="filter-chip ${this.activeFilter === filter ? 'active' : ''}"
              @click=${() => this.setFilter(filter)}
            >${filter}</button>
          `)}
        </div>
      </div>

      <div class="orders-table">
        ${this.orders.map((order, index) => html`
          <div class="order-row">
            <div class="order-row-main">
              <div class="order-row-info">
                <span class="order-number">${order.orderNumber}</span>
                <span class="order-date">${this.formatDate(order.createdAt || '')}</span>
              </div>
              <div class="order-row-project">
                ${order.jobName || order.jobNumber ? html`
                  <span class="project-badge project-color-${(index % 4) + 1}"></span>
                  <span title="Job #${order.jobNumber || order.projectId || ''}">${order.jobName || order.jobNumber || 'Job'}</span>
                ` : html`
                  <span class="no-job-label">No Job</span>
                `}
              </div>
              <div class="order-row-summary">
                <span>${this.getOrderSummary(order)}</span>
              </div>
              <div class="order-row-total">${this.formatCurrency(order.total)}</div>
              <div>
                <span class="status-badge ${this.getStatusClass(order.status)}">${this.getDisplayStatus(order.status)}</span>
              </div>
              <div>
                <button class="btn btn-outline btn-sm" @click=${() => this.viewOrderDetail(order)}>View Details</button>
              </div>
            </div>
          </div>
        `)}
      </div>

      <div class="pagination-row">
        <div class="pagination-summary">
          Showing ${start}-${end} of ${this.totalCount}
        </div>
        <div class="pagination-nav">
          <button class="btn btn-outline btn-sm" ?disabled=${this.page === 1 || this.ordersLoading} @click=${() => this.handlePageChange(this.page - 1)}>Previous</button>
          ${this.renderPageNumbers()}
          <button class="btn btn-outline btn-sm" ?disabled=${this.page >= Math.ceil(this.totalCount / this.pageSize) || this.ordersLoading} @click=${() => this.handlePageChange(this.page + 1)}>Next</button>
        </div>
      </div>
    `;
  }

  private renderDetailView() {
    if (!this.selectedOrder) return html``;

    const order = this.selectedOrder;
    // Use backend-provided totals instead of computing client-side
    // Backend Order has: subtotal, taxTotal (via taxTotal field), total
    const subtotal = order.subtotal ?? 0;
    const tax = order.tax ?? 0;
    const total = order.total;

    return html`
      <div class="detail-header">
        <button class="btn-back" @click=${this.backToList}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to List
        </button>
        <button class="btn btn-outline btn-sm" @click=${() => this.downloadOrderPdf(order)}>Download PDF</button>
      </div>

      <div class="detail-card">
        <div class="detail-title-row">
          <div>
            <h2 class="detail-id">${order.orderNumber}</h2>
            <p class="detail-project-info">
              ${order.jobName ? html`
                <span>${order.jobName} ${order.jobNumber ? `(#${order.jobNumber})` : ''}</span>
              ` : order.jobNumber ? html`
                <span>Job #${order.jobNumber}</span>
              ` : html`
                <span>No Job Assigned</span>
              `}
              • ${this.formatDate(order.createdAt || '')}
            </p>
          </div>
          <span class="status-badge ${this.getStatusClass(order.status)}">${this.getDisplayStatus(order.status)}</span>
        </div>

        <table class="line-items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${this.loadingLines ? html`
              <tr>
                <td colspan="4" class="text-center line-items-message">
                  <div class="loading-spinner"></div>
                  <p>Loading items...</p>
                </td>
              </tr>
            ` : this.lineError ? html`
              <tr>
                <td colspan="4" class="text-center line-items-message error">
                  <p>${this.lineError}</p>
                  <button class="btn btn-outline btn-sm line-items-retry" @click=${() => this.viewOrderDetail(order)}>Retry</button>
                </td>
              </tr>
            ` : order.lines && order.lines.length > 0 ? order.lines.map(line => html`
              <tr>
                <td>
                  <div class="line-item-name">${line.name}</div>
                  <div class="line-item-sku">SKU: ${line.sku}</div>
                </td>
                <td class="text-right">${line.quantity}</td>
                <td class="text-right">${this.formatCurrency(line.unitPrice)}</td>
                <td class="text-right">${this.formatCurrency(line.lineTotal)}</td>
              </tr>
            `) : html`
              <tr>
                <td colspan="4" class="text-center line-items-message">
                  <p>No line items found for this order.</p>
                </td>
              </tr>
            `}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-right"><strong>Subtotal</strong></td>
              <td class="text-right">${this.formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right">Tax (8.25%)</td>
              <td class="text-right">${this.formatCurrency(tax)}</td>
            </tr>
            <tr class="grand-total-row">
              <td colspan="3" class="text-right"><strong>Total</strong></td>
              <td class="text-right"><strong>${this.formatCurrency(total)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div class="detail-actions-footer">
          <p>Need to return an item? Contact support.</p>
        </div>
      </div>
    `;
  }

  render() {
    if (this.loading) {
      return html`<p>Loading orders...</p>`;
    }

    return html`
      <pv-page-tour-modal 
          pageId="customer-orders"
          heading="Order Management"
          .features=${[
        { title: 'Order Tracking', description: 'Track the status of all your active and past orders submitted to the dealer.' },
        { title: 'Order Details', description: 'Expand an order to see the exact lines, quantities shipped vs ordered, and pricing.' },
        { title: 'Delivery Status', description: 'Monitor delivery types (pickup vs delivery) and estimated delivery dates.' }
      ]}
      ></pv-page-tour-modal>
      <div class="section-header">
        <div>
          <h1 class="section-title">Orders</h1>
          <p class="section-subtitle">${this.filterJobName ? `Filtered by project: ${this.filterJobName}` : 'View and track your order history'}</p>
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-orders': PvPageOrders;
  }
}
