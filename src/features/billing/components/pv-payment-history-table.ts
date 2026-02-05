/**
 * PvPaymentHistoryTable - Read-only table displaying payment transactions
 * Shows status badges with color + text for accessibility
 */

import { html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../../../components/pv-base.js';
import { BillingService } from '../../../connect/services/billing.js';
import { PvToast } from '../../../components/atoms/pv-toast.js';
import type { PaymentTransaction, PaymentStatus } from '../../../connect/types/domain.js';

@customElement('pv-payment-history-table')
export class PvPaymentHistoryTable extends PvBase {
  static styles = [
    ...PvBase.styles,
    css`
      :host {
        display: block;
      }

      .table-container {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        text-align: left;
        padding: var(--space-md) var(--space-lg);
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-text-muted);
        border-bottom: 2px solid var(--color-border);
        white-space: nowrap;
      }

      th.text-right {
        text-align: right;
      }

      td {
        padding: var(--space-md) var(--space-lg);
        border-bottom: 1px solid var(--color-border);
        font-size: var(--text-sm);
        vertical-align: middle;
      }

      td.text-right {
        text-align: right;
      }

      tr:hover {
        background: var(--color-bg-alt);
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding: 4px 12px;
        font-size: var(--text-xs);
        font-weight: 600;
        border-radius: var(--radius-full);
        white-space: nowrap;
      }

      .status-settled {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      .status-pending,
      .status-submitted {
        background: rgba(234, 179, 8, 0.1);
        color: #eab308;
      }

      .status-failed {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        cursor: help;
      }

      .status-cancelled,
      .status-refunded {
        background: rgba(71, 85, 105, 0.1);
        color: #475569;
      }

      .amount {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .ref-number {
        font-family: monospace;
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }

      .loading-state,
      .error-state,
      .empty-state {
        padding: var(--space-3xl);
        text-align: center;
        color: var(--color-text-muted);
      }

      .error-state {
        color: #dc2626;
      }

      .empty-state svg {
        margin-bottom: var(--space-lg);
        color: var(--color-border);
      }

      .empty-state h3 {
        font-family: var(--font-heading);
        color: var(--color-text);
        margin-bottom: var(--space-sm);
      }

      .tooltip {
        position: relative;
      }

      .tooltip-content {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-text);
        color: var(--color-bg);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-md);
        font-size: var(--text-xs);
        font-weight: 400;
        white-space: nowrap;
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: 0;
        visibility: hidden;
        transition: opacity var(--transition-fast), visibility var(--transition-fast);
        z-index: 10;
        box-shadow: var(--shadow-md);
      }

      .tooltip-content::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: var(--color-text);
      }

      .tooltip:hover .tooltip-content,
      .tooltip:focus-within .tooltip-content {
        opacity: 1;
        visibility: visible;
      }
    `,
  ];

  @state() private transactions: PaymentTransaction[] = [];
  @state() private loading = true;
  @state() private error: string | null = null;

  private currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  private dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  async connectedCallback() {
    super.connectedCallback();
    await this.loadTransactions();
  }

  private async loadTransactions() {
    this.loading = true;
    this.error = null;

    try {
      this.transactions = await BillingService.getPaymentHistory();
    } catch (e) {
      console.error('Failed to load payment history', e);
      this.error = 'Failed to load payment history. Please try again.';
      PvToast.show('Failed to load payment history', 'error');
    } finally {
      this.loading = false;
    }
  }

  private formatAmount(amount: number): string {
    return this.currencyFormatter.format(amount);
  }

  private formatDate(dateString: string): string {
    try {
      return this.dateFormatter.format(new Date(dateString));
    } catch {
      return dateString;
    }
  }

  private getStatusLabel(status: PaymentStatus): string {
    const labels: Record<PaymentStatus, string> = {
      pending: 'Pending',
      submitted: 'Processing',
      settled: 'Settled',
      failed: 'Failed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      processing: 'Processing',
      authorized: 'Authorized',
      captured: 'Captured',
      initiated: 'Initiated',
      voided: 'Voided',
    };
    return labels[status] || status;
  }

  private getDescription(transaction: PaymentTransaction): string {
    const typeLabel = transaction.paymentMethodType === 'card' ? 'Card Payment' :
                      transaction.paymentMethodType === 'ach' ? 'Bank Payment' : 'Payment';
    return typeLabel;
  }

  private renderStatusBadge(transaction: PaymentTransaction) {
    const status = transaction.status;
    const label = this.getStatusLabel(status);

    if (status === 'failed' && transaction.failureMessage) {
      return html`
        <div class="tooltip">
          <span class="status-badge status-${status}" tabindex="0" role="button" aria-describedby="tooltip-${transaction.id}">
            ${label}
          </span>
          <span id="tooltip-${transaction.id}" class="tooltip-content" role="tooltip">
            ${transaction.failureMessage}
          </span>
        </div>
      `;
    }

    return html`<span class="status-badge status-${status}">${label}</span>`;
  }

  private renderEmptyIcon() {
    return html`
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    `;
  }

  render() {
    if (this.loading) {
      return html`<div class="loading-state">Loading payment history...</div>`;
    }

    if (this.error) {
      return html`
        <div class="error-state">
          <p>${this.error}</p>
          <button class="btn btn-primary" @click=${this.loadTransactions}>Retry</button>
        </div>
      `;
    }

    if (this.transactions.length === 0) {
      return html`
        <div class="empty-state">
          ${this.renderEmptyIcon()}
          <h3>No Payment History</h3>
          <p>Your payment transactions will appear here.</p>
        </div>
      `;
    }

    return html`
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Status</th>
              <th class="text-right">Amount</th>
              <th>Ref #</th>
            </tr>
          </thead>
          <tbody>
            ${this.transactions.map(transaction => html`
              <tr>
                <td>${this.formatDate(transaction.submittedAt)}</td>
                <td>${this.getDescription(transaction)}</td>
                <td>${this.renderStatusBadge(transaction)}</td>
                <td class="text-right amount">${this.formatAmount(transaction.totalCharged)}</td>
                <td class="ref-number">${transaction.externalId || '-'}</td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-payment-history-table': PvPaymentHistoryTable;
  }
}
