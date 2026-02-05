/**
 * PvPageOrders - Orders page component
 * Displays order list with drill-down to detail view
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { DocumentsService } from '../../connect/services/documents.js';
import { PvToast } from '../atoms/pv-toast.js';
import type { Order } from '../../types/index.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';

@customElement('pv-page-orders')
export class PvPageOrders extends PvBase {
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

      .filters-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-lg);
        margin-bottom: var(--space-xl);
        flex-wrap: wrap;
      }

      .filter-chips {
        display: flex;
        gap: var(--space-sm);
        flex-wrap: wrap;
      }

      .filter-chip {
        padding: var(--space-sm) var(--space-lg);
        background: var(--color-bg-alt);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        font-size: var(--text-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .filter-chip:hover {
        border-color: var(--color-accent);
      }

      .filter-chip.active {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }

      .orders-table {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .order-row {
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        transition: box-shadow var(--transition-fast);
      }

      .order-row:hover {
        box-shadow: var(--shadow-md);
      }

      .order-row-main {
        display: grid;
        grid-template-columns: 140px 160px 1fr 100px 140px 120px;
        align-items: center;
        gap: var(--space-md);
      }

      @media (max-width: 1024px) {
        .order-row-main {
          grid-template-columns: 1fr 1fr;
          gap: var(--space-sm);
        }
      }

      .order-row-info {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .order-number {
        font-weight: 600;
        color: var(--color-text);
      }

      .order-date {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }

      .order-row-project {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-size: var(--text-sm);
      }

      .project-badge {
        width: 10px;
        height: 10px;
        border-radius: var(--radius-full);
        flex-shrink: 0;
      }

      .order-row-summary {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-size: var(--text-sm);
        color: var(--color-text-light);
      }

      .order-row-total {
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
        transition: all var(--transition-fast);
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

      .line-items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: var(--space-lg);
      }

      .line-items-table th,
      .line-items-table td {
        padding: var(--space-md);
        text-align: left;
        border-bottom: 1px solid var(--color-border);
      }

      .line-items-table th {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-text-muted);
      }

      .line-item-name {
        font-weight: 500;
      }

      .line-item-sku {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }

      .grand-total-row td {
        font-weight: 700;
        border-bottom: none;
        padding-top: var(--space-md);
      }

      .detail-actions-footer {
        padding-top: var(--space-lg);
        border-top: 1px solid var(--color-border);
        color: var(--color-text-muted);
        font-size: var(--text-sm);
      }
    `,
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

  private filters = ['All', 'Pending', 'Confirmed', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'];

  async connectedCallback() {
    super.connectedCallback();
    await this.loadOrders(true);
  }

  private async loadOrders(initialLoad = false) {
    try {
      if (initialLoad) {
        this.loading = true;
      } else {
        this.ordersLoading = true;
      }
      const { items, total } = await DataService.getOrders(
        this.pageSize,
        (this.page - 1) * this.pageSize,
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

  private getProjectColor(order: Order): string {
    const colors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7'];
    const index = this.orders.indexOf(order) % colors.length;
    return colors[index];
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  private getOrderSummary(order: Order): string {
    const count = order.lines?.length || 0;
    const names = order.lines?.slice(0, 2).map(l => l.name).join(', ') || '';
    const productsText = count === 1 ? 'product' : 'products';
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
        ? html`<span style="align-self: center; color: var(--color-text-muted);">...</span>`
        : html`
            <button
              class="btn btn-outline btn-sm ${this.page === token ? 'active' : ''}"
              ?disabled=${this.ordersLoading}
              @click=${() => this.handlePageChange(token)}
              style="${this.page === token ? 'background: var(--color-primary); color: white; border-color: var(--color-primary);' : ''}"
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
        <div style="margin-bottom: var(--space-md); color: var(--color-text-muted); font-size: var(--text-sm);">
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
        ${this.orders.map(order => html`
          <div class="order-row">
            <div class="order-row-main">
              <div class="order-row-info">
                <span class="order-number">${order.orderNumber}</span>
                <span class="order-date">${this.formatDate(order.createdAt || '')}</span>
              </div>
              <div class="order-row-project">
                <span class="project-badge" style="background: ${this.getProjectColor(order)};"></span>
                Project ${order.projectId?.slice(-1) || '1'}
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

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-lg);">
        <div style="color: var(--color-text-muted); font-size: var(--text-sm);">
          Showing ${start}-${end} of ${this.totalCount}
        </div>
        <div style="display: flex; gap: var(--space-sm);">
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
            <p class="detail-project-info">Project ${order.projectId?.slice(-1) || '1'} • ${this.formatDate(order.createdAt || '')}</p>
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
                <td colspan="4" class="text-center" style="padding: var(--space-xl);">
                  <div class="loading-spinner"></div>
                  <p>Loading items...</p>
                </td>
              </tr>
            ` : this.lineError ? html`
              <tr>
                <td colspan="4" class="text-center" style="padding: var(--space-xl); color: var(--color-error);">
                  <p>${this.lineError}</p>
                  <button class="btn btn-outline btn-sm" style="margin-top: var(--space-md);" @click=${() => this.viewOrderDetail(order)}>Retry</button>
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
                <td colspan="4" class="text-center" style="padding: var(--space-xl);">
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
      <div class="section-header">
        <div>
          <h1 class="section-title">Orders</h1>
          <p class="section-subtitle">View and track your order history</p>
        </div>
      </div>

      ${this.currentView === 'list' ? this.renderListView() : this.renderDetailView()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-orders': PvPageOrders;
  }
}
