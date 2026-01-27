/**
 * LbPageWallet - Wallet/Payment Methods page component
 * Displays saved payment methods and allows management
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import { BillingService } from '../../connect/services/billing.js';
import { LbToast } from '../atoms/lb-toast.js';
import type { PaymentMethod } from '../../connect/types/domain.js';

@customElement('lb-page-wallet')
export class LbPageWallet extends LbBase {
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

      .wallet-actions {
        display: flex;
        gap: var(--space-md);
        margin-bottom: var(--space-xl);
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

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .loading-text {
        color: var(--color-text-muted);
        padding: var(--space-xl);
        text-align: center;
      }

      .error-text {
        color: #dc2626;
        padding: var(--space-xl);
        text-align: center;
      }
    `,
  ];

  @state() private paymentMethods: PaymentMethod[] = [];
  @state() private loading = true;
  @state() private error: string | null = null;
  @state() private adding = false;
  @state() private processingId: number | null = null;

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

  private async handleAddMethod() {
    // In production, this would open a payment form modal (Stripe Elements, etc.)
    this.adding = true;
    try {
      const newMethod: Omit<PaymentMethod, 'id'> = {
        type: 'card',
        brand: 'Visa',
        last4: '1234',
        expMonth: 1,
        expYear: 28,
        isDefault: false,
      };
      const added = await BillingService.addPaymentMethod(newMethod);
      this.paymentMethods = [...this.paymentMethods, added];
      LbToast.show('Payment method added', 'success');
    } catch (e) {
      console.error('Failed to add payment method', e);
      LbToast.show('Failed to add payment method', 'error');
    } finally {
      this.adding = false;
    }
  }

  private async handleSetDefault(method: PaymentMethod) {
    if (method.isDefault) return;

    this.processingId = method.id;
    try {
      await BillingService.setDefaultPaymentMethod(method.id);
      this.paymentMethods = this.paymentMethods.map(m => ({
        ...m,
        isDefault: m.id === method.id,
      }));
      LbToast.show(`${this.getPaymentLabel(method)} set as default`, 'success');
    } catch (e) {
      console.error('Failed to set default', e);
      LbToast.show('Failed to set default payment method', 'error');
    } finally {
      this.processingId = null;
    }
  }

  private getPaymentLabel(method: PaymentMethod) {
    if (method.type === 'card') {
      return `${method.brand || 'Card'} ••••${method.last4 || '****'}`;
    }
    return 'Bank Account';
  }

  private getPaymentExpiry(method: PaymentMethod) {
    if (method.expMonth && method.expYear) {
      return `${method.expMonth.toString().padStart(2, '0')}/${method.expYear}`;
    }
    return '';
  }

  private async handleRemove(method: PaymentMethod) {
    if (method.isDefault) {
      LbToast.show('Cannot remove default payment method', 'warning');
      return;
    }

    this.processingId = method.id;
    try {
      await BillingService.removePaymentMethod(method.id);
      this.paymentMethods = this.paymentMethods.filter(m => m.id !== method.id);
      LbToast.show('Payment method removed', 'success');
    } catch (e) {
      console.error('Failed to remove payment method', e);
      LbToast.show('Failed to remove payment method', 'error');
    } finally {
      this.processingId = null;
    }
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

  render() {
    if (this.loading) {
      return html`<p class="loading-text">Loading payment methods...</p>`;
    }

    if (this.error) {
      return html`
        <p class="error-text">${this.error}</p>
        <button class="btn btn-primary" @click=${this.loadPaymentMethods}>Retry</button>
      `;
    }

    return html`
      <div class="section-header">
        <div>
          <h1 class="section-title">Wallet</h1>
          <p class="section-subtitle">Manage your payment methods</p>
        </div>
      </div>

      <div class="wallet-actions">
        <button 
          class="btn btn-primary" 
          @click=${this.handleAddMethod}
          ?disabled=${this.adding}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          ${this.adding ? 'Adding...' : 'Add Payment Method'}
        </button>
      </div>

      ${this.paymentMethods.length > 0 ? html`
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
                ${!method.isDefault ? html`
                  <button 
                    class="btn btn-outline btn-sm" 
                    @click=${() => this.handleSetDefault(method)}
                    ?disabled=${this.processingId === method.id}
                  >${this.processingId === method.id ? 'Setting...' : 'Set Default'}</button>
                ` : ''}
                <button 
                  class="btn btn-outline btn-sm" 
                  @click=${() => this.handleRemove(method)}
                  ?disabled=${this.processingId === method.id || method.isDefault}
                >${this.processingId === method.id ? 'Removing...' : 'Remove'}</button>
              </div>
            </div>
          `)}
        </div>
      ` : html`
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
          <h3>No Payment Methods</h3>
          <p>Add a credit card or bank account to get started.</p>
        </div>
      `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-page-wallet': LbPageWallet;
  }
}

