import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminDataService } from '../services/admin-data.service.js';
import type { AdminOrderDetails } from '../services/admin-data.service.js';
import { adminEntityDetailPageStyles } from '../../styles/pages.js';

interface RouterLocation {
    params: Record<string, string>;
}

@customElement('admin-page-order-details')
export class PageOrderDetails extends LitElement {
    static styles = [adminEntityDetailPageStyles];

    @state() private order: AdminOrderDetails | null = null;
    @state() private loading = true;
    location?: RouterLocation;

    async onBeforeEnter(location: RouterLocation) {
        this.location = location;
        const id = location.params.id;
        if (id) {
            await this.fetchOrder(id);
        }
    }

    private async fetchOrder(id: string) {
        this.loading = true;
        try {
            const numericId = parseInt(id, 10);
            if (isNaN(numericId)) {
                this.order = null;
                return;
            }
            this.order = await AdminDataService.getOrder(numericId);
        } finally {
            this.loading = false;
        }
    }

    render() {
        if (this.loading) {
            return html`<div class="loading-state">Loading order details...</div>`;
        }

        if (!this.order) {
            return html`
                <div class="empty-state">
                    <a href="/admin/accounts" class="back-btn">← Back to Accounts</a>
                    <div class="message">Order not found.</div>
                </div>
            `;
        }

        return html`
            <a href="javascript:history.back()" class="back-btn">← Back</a>

            <div class="header">
                <h1>
                    Order #${this.order.id}
                    <span class="status-badge status-${this.order.status}">${this.order.status}</span>
                </h1>
            </div>

            <div class="meta">
                <div class="meta-item">
                    <label>Date</label>
                    <div class="value">${this.order.date}</div>
                </div>
                <div class="meta-item">
                    <label>Subtotal</label>
                    <div class="value font-mono">$${this.order.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="meta-item">
                    <label>Tax</label>
                    <div class="value font-mono">$${this.order.taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="meta-item">
                    <label>Total</label>
                    <div class="value font-mono">$${this.order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>

            <h3 class="line-items-title">Line Items</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Item Code</th>
                        <th>Description</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.order.lines.map(line => html`
                        <tr>
                            <td>${line.itemCode}</td>
                            <td>${line.description}</td>
                            <td class="text-right">${line.quantity}</td>
                            <td class="text-right font-mono">$${line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td class="text-right font-mono">$${line.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    `)}
                    ${this.order.lines.length === 0 ? html`<tr><td colspan="5" class="text-center">No line items found.</td></tr>` : ''}
                </tbody>
            </table>
        `;
    }
}
