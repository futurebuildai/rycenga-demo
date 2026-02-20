import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminDataService } from '../services/admin-data.service.js';
import type { AdminQuoteDetails } from '../services/admin-data.service.js';
import { adminEntityDetailPageStyles } from '../../styles/pages.js';

interface RouterLocation {
    params: Record<string, string>;
}

@customElement('admin-page-quote-details')
export class PageQuoteDetails extends LitElement {
    static styles = [adminEntityDetailPageStyles];

    @state() private quote: AdminQuoteDetails | null = null;
    @state() private loading = true;
    location?: RouterLocation;

    async onBeforeEnter(location: RouterLocation) {
        this.location = location;
        const id = location.params.id;
        if (id) {
            await this.fetchQuote(id);
        }
    }

    private async fetchQuote(id: string) {
        this.loading = true;
        try {
            const numericId = parseInt(id, 10);
            if (isNaN(numericId)) {
                this.quote = null;
                return;
            }
            this.quote = await AdminDataService.getQuote(numericId);
        } finally {
            this.loading = false;
        }
    }

    render() {
        if (this.loading) {
            return html`<div class="loading-state">Loading estimate details...</div>`;
        }

        if (!this.quote) {
            return html`
                <div class="empty-state">
                    <a href="/admin/accounts" class="back-btn">← Back to Accounts</a>
                    <div class="message">Estimate not found.</div>
                </div>
            `;
        }

        return html`
            <a href="javascript:history.back()" class="back-btn">← Back</a>

            <div class="header">
                <h1>
                    Estimate #${this.quote.id}
                    <span class="status-badge status-${this.quote.status}">${this.quote.status}</span>
                </h1>
            </div>

            <div class="meta">
                <div class="meta-item">
                    <label>Date</label>
                    <div class="value">${this.quote.date}</div>
                </div>
                <div class="meta-item">
                    <label>Expires</label>
                    <div class="value">${this.quote.expiryDate}</div>
                </div>
                <div class="meta-item">
                    <label>Total</label>
                    <div class="value font-mono">$${this.quote.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
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
                    ${this.quote.lines.map(line => html`
                        <tr>
                            <td>${line.itemCode}</td>
                            <td>${line.description}</td>
                            <td class="text-right">${line.quantity}</td>
                            <td class="text-right font-mono">$${line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td class="text-right font-mono">$${line.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    `)}
                    ${this.quote.lines.length === 0 ? html`<tr><td colspan="5" class="text-center">No line items found.</td></tr>` : ''}
                </tbody>
            </table>
        `;
    }
}
