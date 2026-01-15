/**
 * LbPageOrders - Orders page component
 * Displays order list with drill-down to detail view
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import { DataService } from '../../services/data.service.js';
import { LbToast } from '../atoms/lb-toast.js';
import type { Order } from '../../types/index.js';

@customElement('lb-page-orders')
export class LbPageOrders extends LbBase {
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

    private filters = ['All', 'Submitted', 'Confirmed', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Fulfilled'];

    async connectedCallback() {
        super.connectedCallback();
        await this.loadOrders();
    }

    private async loadOrders() {
        try {
            this.orders = await DataService.getOrders();
        } catch (e) {
            console.error('Failed to load orders', e);
        } finally {
            this.loading = false;
        }
    }

    private viewOrderDetail(order: Order) {
        this.selectedOrder = order;
        this.currentView = 'detail';
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
            'delivered': 'status-delivered',
            'shipped': 'status-out-for-delivery',
            'confirmed': 'status-confirmed',
            'submitted': 'status-submitted',
            'picking': 'status-confirmed',
            'cancelled': 'status-expired',
        };
        return statusMap[status] || 'status-pending';
    }

    private getDisplayStatus(status: string): string {
        const displayMap: Record<string, string> = {
            'delivered': 'Delivered',
            'shipped': 'Out for Delivery',
            'confirmed': 'Confirmed',
            'submitted': 'Submitted',
            'picking': 'Processing',
            'cancelled': 'Cancelled',
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
        return `${count} products: ${names}`;
    }

    private calculateSubtotal(order: Order): number {
        return order.lines?.reduce((sum, line) => sum + line.lineTotal, 0) || 0;
    }

    private renderListView() {
        return html`
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
    `;
    }

    private renderDetailView() {
        if (!this.selectedOrder) return html``;

        const order = this.selectedOrder;
        const subtotal = this.calculateSubtotal(order);
        const taxRate = 0.0825;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        return html`
      <div class="detail-header">
        <button class="btn-back" @click=${this.backToList}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to List
        </button>
        <button class="btn btn-outline btn-sm" @click=${() => LbToast.show('PDF download coming soon', 'info')}>Download PDF</button>
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
            ${order.lines?.map(line => html`
              <tr>
                <td>
                  <div class="line-item-name">${line.name}</div>
                  <div class="line-item-sku">SKU: ${line.sku}</div>
                </td>
                <td class="text-right">${line.quantity}</td>
                <td class="text-right">${this.formatCurrency(line.unitPrice)}</td>
                <td class="text-right">${this.formatCurrency(line.lineTotal)}</td>
              </tr>
            `)}
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
        'lb-page-orders': LbPageOrders;
    }
}
