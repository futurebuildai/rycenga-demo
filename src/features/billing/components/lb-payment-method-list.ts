/**
 * LbPaymentMethodList - Displays list of saved payment methods with delete capability
 * Shows card/ACH icons, last4 digits, expiry, and default badge
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from '../../../components/lb-base.js';
import { BillingService } from '../../../connect/services/billing.js';
import { LbToast } from '../../../components/atoms/lb-toast.js';
import type { PaymentMethod } from '../../../connect/types/domain.js';

@customElement('lb-payment-method-list')
export class LbPaymentMethodList extends LbBase {
  static styles = [
    ...LbBase.styles,
    css`
      :host {
        display: block;
      }

      .payment-methods {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .payment-card {
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-lg);
      }

      .payment-card.default {
        border: 2px solid var(--color-accent);
      }

      .payment-info {
        display: flex;
        align-items: center;
        gap: var(--space-lg);
      }

      .payment-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-primary);
        color: white;
        border-radius: var(--radius-md);
      }

      .payment-details {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .payment-label {
        font-weight: 600;
      }

      .payment-meta {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      .payment-actions {
        display: flex;
        gap: var(--space-sm);
      }

      .default-badge {
        background: var(--color-accent);
        color: white;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        font-weight: 600;
        margin-left: var(--space-md);
      }

      .empty-state {
        text-align: center;
        padding: var(--space-3xl);
        color: var(--color-text-muted);
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

      .loading-state {
        color: var(--color-text-muted);
        padding: var(--space-xl);
        text-align: center;
      }

      .error-state {
        color: #dc2626;
        padding: var(--space-xl);
        text-align: center;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ];

  @state() private paymentMethods: PaymentMethod[] = [];
  @state() private loading = true;
  @state() private error: string | null = null;
  @state() private removingId: number | null = null;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadPaymentMethods();
  }

  private async loadPaymentMethods() {
    this.loading = true;
    this.error = null;

    try {
      this.paymentMethods = await BillingService.getPaymentMethods();
    } catch (e) {
      console.error('Failed to load payment methods', e);
      this.error = 'Failed to load payment methods. Please try again.';
      LbToast.show('Failed to load payment methods', 'error');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Public method for external refresh (e.g., after adding a new payment method)
   */
  public async refresh() {
    await this.loadPaymentMethods();
  }

  private async handleRemove(method: PaymentMethod) {
    if (method.isDefault) {
      LbToast.show('Cannot remove default payment method', 'warning');
      return;
    }

    this.removingId = method.id;
    try {
      await BillingService.removePaymentMethod(method.id);
      this.paymentMethods = this.paymentMethods.filter(m => m.id !== method.id);
      LbToast.show('Payment method removed', 'success');

      this.dispatchEvent(new CustomEvent('payment-method-removed', {
        bubbles: true,
        composed: true,
        detail: { paymentMethodId: method.id },
      }));
    } catch (e) {
      console.error('Failed to remove payment method', e);
      LbToast.show('Failed to remove payment method', 'error');
    } finally {
      this.removingId = null;
    }
  }

  private getPaymentLabel(method: PaymentMethod): string {
    if (method.type === 'card') {
      return `${method.brand || 'Card'} ••••${method.last4 || '****'}`;
    }
    return `Bank ••••${method.last4 || '****'}`;
  }

  private getPaymentExpiry(method: PaymentMethod): string {
    if (method.expMonth && method.expYear) {
      return `${method.expMonth.toString().padStart(2, '0')}/${method.expYear}`;
    }
    return '';
  }

  private renderCardIcon() {
    return html`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </svg>
    `;
  }

  private renderBankIcon() {
    return html`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    `;
  }

  private renderEmptyIcon() {
    return html`
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </svg>
    `;
  }

  render() {
    if (this.loading) {
      return html`<div class="loading-state">Loading payment methods...</div>`;
    }

    if (this.error) {
      return html`
        <div class="error-state">
          <p>${this.error}</p>
          <button class="btn btn-primary" @click=${this.loadPaymentMethods}>Retry</button>
        </div>
      `;
    }

    if (this.paymentMethods.length === 0) {
      return html`
        <div class="empty-state">
          ${this.renderEmptyIcon()}
          <h3>No Payment Methods</h3>
          <p>Add a credit card or bank account to get started.</p>
        </div>
      `;
    }

    return html`
      <div class="payment-methods">
        ${this.paymentMethods.map(method => html`
          <div class="payment-card ${method.isDefault ? 'default' : ''}">
            <div class="payment-info">
              <div class="payment-icon">
                ${method.type === 'card' ? this.renderCardIcon() : this.renderBankIcon()}
              </div>
              <div class="payment-details">
                <span class="payment-label">
                  ${this.getPaymentLabel(method)}
                  ${method.isDefault ? html`<span class="default-badge">Default</span>` : ''}
                </span>
                <span class="payment-meta">
                  ${method.type === 'card' ? `Expires ${this.getPaymentExpiry(method)}` : 'Bank Account'}
                </span>
              </div>
            </div>
            <div class="payment-actions">
              <button
                class="btn btn-outline btn-sm"
                @click=${() => this.handleRemove(method)}
                ?disabled=${this.removingId === method.id || method.isDefault}
              >${this.removingId === method.id ? 'Removing...' : 'Remove'}</button>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-payment-method-list': LbPaymentMethodList;
  }
}
