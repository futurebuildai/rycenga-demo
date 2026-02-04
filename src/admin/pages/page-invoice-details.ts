import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminDataService } from '../services/admin-data.service.js';
import type { AdminInvoiceDetails } from '../services/admin-data.service.js';

interface RouterLocation {
    params: Record<string, string>;
}

@customElement('admin-page-invoice-details')
export class PageInvoiceDetails extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 2rem;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        h1 {
            font-size: 1.875rem;
            font-weight: 600;
            color: var(--color-text);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .back-btn {
            font-size: 1rem;
            color: var(--color-text-muted);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .back-btn:hover {
            color: var(--color-primary);
        }

        .invoice-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid var(--color-border);
            margin-bottom: 2rem;
        }

        .meta-item label {
            display: block;
            font-size: 0.875rem;
            color: var(--color-text-muted);
            margin-bottom: 0.25rem;
        }

        .meta-item .value {
            font-size: 1.125rem;
            font-weight: 500;
            color: var(--color-text);
        }

        .status-badge {
            display: inline-flex;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
            text-transform: capitalize;
        }

        .status-Open { background: #dbeafe; color: #1e40af; }
        .status-Paid { background: #dcfce7; color: #166534; }
        .status-Overdue, .status-Past { background: #fee2e2; color: #991b1b; }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--color-border);
        }

        .data-table th,
        .data-table td {
            text-align: left;
            padding: 1rem;
            border-bottom: 1px solid var(--color-border);
        }

        .data-table th {
            background: var(--color-bg-alt);
            font-weight: 500;
            color: var(--color-text-muted);
            font-size: 0.875rem;
        }

        .data-table td {
            color: var(--color-text);
            font-size: 0.9375rem;
        }

        .text-right { text-align: right !important; }
        .font-mono { font-family: ui-monospace, monospace; }
        .font-medium { font-weight: 500; }
        .text-muted { color: var(--color-text-muted); }
    `;

    @state() private invoice: AdminInvoiceDetails | null = null;
    @state() private loading = true;
    location?: RouterLocation;

    async onBeforeEnter(location: RouterLocation) {
        this.location = location;
        const id = location.params.id;
        if (id) {
            await this.fetchInvoice(id);
        }
    }

    private async fetchInvoice(id: string) {
        this.loading = true;
        try {
            const numericId = parseInt(id, 10);
            if (isNaN(numericId)) {
                console.error('Invalid invoice ID');
                this.invoice = null;
                return;
            }
            this.invoice = await AdminDataService.getInvoice(numericId);
        } catch (e) {
            console.error('Failed to load invoice', e);
        } finally {
            this.loading = false;
        }
    }

    render() {
        if (this.loading) {
            return html`<div style="padding: 2rem;">Loading invoice details...</div>`;
        }

        if (!this.invoice) {
            return html`
                <div style="padding: 2rem;">
                    <a href="/admin/accounts" class="back-btn">← Back to Accounts</a>
                    <div style="margin-top: 2rem; color: var(--color-text-muted);">Invoice not found.</div>
                </div>
            `;
        }

        return html`
            <a href="javascript:history.back()" class="back-btn">← Back</a>
            
            <div class="header">
                <h1>
                    Invoice #${this.invoice.id}
                    <span class="status-badge status-${this.invoice.status.split(' ')[0]}">${this.invoice.status}</span>
                </h1>
                ${this.invoice.pdfUrl ? html`
                    <a href="${this.invoice.pdfUrl}" target="_blank" class="btn-primary" style="text-decoration: none; padding: 0.5rem 1rem; background: var(--color-primary); color: white; border-radius: 6px;">
                        Download PDF
                    </a>
                ` : ''}
            </div>

            <div class="invoice-meta">
                <div class="meta-item">
                    <label>Date</label>
                    <div class="value">${this.invoice.date}</div>
                </div>
                <div class="meta-item">
                    <label>Due Date</label>
                    <div class="value">${this.invoice.dueDate}</div>
                </div>
                <div class="meta-item">
                    <label>Balance Due</label>
                    <div class="value font-mono">$${this.invoice.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="meta-item">
                    <label>Total Amount</label>
                    <div class="value font-mono">$${this.invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>

            <h3 style="margin-bottom: 1rem; color: var(--color-text);">Line Items</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 15%;">Item Code</th>
                        <th>Description</th>
                        <th class="text-right" style="width: 10%;">Qty</th>
                        <th class="text-right" style="width: 15%;">Unit Price</th>
                        <th class="text-right" style="width: 15%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.invoice.lines.map(line => html`
                        <tr>
                            <td class="font-medium">${line.itemCode}</td>
                            <td>${line.description}</td>
                            <td class="text-right">${line.quantity}</td>
                            <td class="text-right font-mono">$${line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td class="text-right font-mono">$${line.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    `)}
                    ${this.invoice.lines.length === 0 ? html`<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No line items found.</td></tr>` : ''}
                </tbody>
            </table>
        `;
    }
}
