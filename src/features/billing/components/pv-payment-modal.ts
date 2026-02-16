/**
 * PvPaymentModal - Reusable modal for processing payments
 * Supports Paying Invoices and paying Total Balance
 */

import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { PvBase } from '../../../components/pv-base.js';
import { BillingService } from '../../../connect/services/billing.js';
import { PvToast } from '../../../components/atoms/pv-toast.js';
import type { PaymentMethod } from '../../../connect/types/domain.js';

@customElement('pv-payment-modal')
export class PvPaymentModal extends PvBase {
  static styles = [
    ...PvBase.styles,
    css`
      :host {
        display: block;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--space-lg);
      }

      .modal-content {
        background: var(--color-bg);
        border-radius: var(--radius-lg);
        width: 100%;
        max-width: 500px;
        box-shadow: var(--shadow-xl);
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-xl);
        border-bottom: 1px solid var(--color-border);
      }

      .modal-title {
        font-family: var(--font-heading);
        font-size: var(--text-xl);
        font-weight: 600;
        margin: 0;
      }

      .close-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        transition: all var(--transition-fast);
        background: transparent;
        border: none;
        cursor: pointer;
      }

      .close-btn:hover {
        background: var(--color-border);
        color: var(--color-text);
      }

      .modal-body {
        padding: var(--space-xl);
      }

      .payment-summary {
        background: var(--color-bg-alt);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
        margin-bottom: var(--space-xl);
        text-align: center;
      }

      .amount-label {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        margin-bottom: var(--space-xs);
      }

      .amount-context {
        margin-top: var(--space-sm);
      }

      .amount-value {
        font-family: var(--font-heading);
        font-size: var(--text-4xl);
        font-weight: 700;
        color: var(--color-text);
      }

      .section-label {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-text-muted);
        margin-bottom: var(--space-md);
        display: block;
      }

      .payment-methods-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        margin-bottom: var(--space-xl);
      }

      .payment-method-option {
        display: flex;
        align-items: center;
        padding: var(--space-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .payment-method-option:hover {
        border-color: var(--color-primary);
        background: var(--color-bg-alt);
      }

      .payment-method-option.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-light-10); /* subtle blue tint */
        box-shadow: 0 0 0 1px var(--color-primary);
      }

      .method-icon {
        width: 24px;
        margin-right: var(--space-md);
        color: var(--color-text-muted);
      }

      .method-details {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .method-name {
        font-weight: 500;
        color: var(--color-text);
      }

      .method-meta {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }

      .radio-circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid var(--color-border);
        margin-left: var(--space-md);
        position: relative;
      }

      .payment-method-option.selected .radio-circle {
        border-color: var(--color-primary);
      }

      .payment-method-option.selected .radio-circle::after {
        content: '';
        position: absolute;
        top: 4px;
        left: 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-primary);
      }

      .empty-state {
        text-align: center;
        padding: var(--space-lg);
        color: var(--color-text-muted);
        background: var(--color-bg-alt);
        border-radius: var(--radius-md);
      }

      .empty-state-add {
        margin-top: 10px;
        color: var(--color-primary);
      }

      .methods-loading {
        text-align: center;
        padding: 20px;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-md);
        padding: var(--space-xl);
        border-top: 1px solid var(--color-border);
      }

      .btn-cancel {
        padding: var(--space-md) var(--space-lg);
        background: transparent;
        color: var(--color-text-muted);
        border: none;
        font-weight: 500;
        cursor: pointer;
        border-radius: var(--radius-md);
      }

      .btn-cancel:hover {
        color: var(--color-text);
        background: var(--color-bg-alt);
      }

      .btn-confirm {
        padding: var(--space-md) var(--space-xl);
        background: var(--color-primary);
        color: white;
        border: none;
        font-weight: 600;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-base);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .btn-confirm:hover:not(:disabled) {
        background: var(--color-primary-dark);
      }

      .btn-confirm:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ];

  @property({ type: Boolean }) open = false;
  @property({ type: Number }) amount = 0;
  @property({ type: Number }) invoiceId?: number;
  @property({ type: String }) type: 'balance' | 'invoice' = 'invoice';

  @state() private paymentMethods: PaymentMethod[] = [];
  @state() private selectedMethodId: number | null = null;
  @state() private loading = false;
  @state() private processing = false;

  async updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open') && this.open) {
      this.loadPaymentMethods();
    }
  }

  private async loadPaymentMethods() {
    this.loading = true;
    try {
      this.paymentMethods = await BillingService.getPaymentMethods();
      // Select default if available, otherwise first one
      const defaultMethod = this.paymentMethods.find(pm => pm.isDefault);
      if (defaultMethod) {
        this.selectedMethodId = defaultMethod.id;
      } else if (this.paymentMethods.length > 0) {
        this.selectedMethodId = this.paymentMethods[0].id;
      }
    } catch (e) {
      console.error('Failed to load payment methods', e);
      PvToast.show('Failed to load payment methods', 'error');
    } finally {
      this.loading = false;
    }
  }

  private handleClose() {
    if (this.processing) return;
    this.dispatchEvent(new CustomEvent('close'));
  }

  private handleOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.handleClose();
    }
  }

  private selectMethod(id: number) {
    if (this.processing) return;
    this.selectedMethodId = id;
  }

  private async handlePay() {
    if (!this.selectedMethodId) {
      PvToast.show('Please select a payment method', 'warning');
      return;
    }

    this.processing = true;

    try {
      const payload: any = {
        amount: this.amount,
        paymentMethodId: this.selectedMethodId,
        currency: 'USD',
        type: this.type,
      };

      if (this.type === 'invoice' && this.invoiceId) {
        payload.allocations = [{
          invoiceId: this.invoiceId,
          amount: this.amount
        }];
      } else if (this.type === 'balance') {
        // Balance payment usually doesn't need allocations, backend applies auto-cache logic 
        // or we might need to fetch open invoices to allocate. 
        // For now, following backend API "PaymentType = balance"
      }

      await BillingService.createPayment(payload);

      PvToast.show('Payment successful!', 'success');
      this.dispatchEvent(new CustomEvent('payment-success'));
      this.handleClose();

    } catch (e) {
      console.error('Payment failed', e);
      PvToast.show('Payment failed. Please try again.', 'error');
    } finally {
      this.processing = false;
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  private renderPaymentMethod(method: PaymentMethod) {
    const isSelected = this.selectedMethodId === method.id;
    const isCard = method.type === 'card';
    const label = isCard ? `Card ending in ${method.last4}` : `Bank Account ending in ${method.last4}`;
    const meta = isCard
      ? `${method.brand || 'Card'} • Exp ${method.expMonth}/${method.expYear}`
      : 'ACH Direct Debit';

    return html`
      <div 
        class="payment-method-option ${isSelected ? 'selected' : ''}"
        @click=${() => this.selectMethod(method.id)}
      >
        <div class="method-icon">
            ${isCard ? html`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
            ` : html`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                   <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            `}
        </div>
        <div class="method-details">
          <span class="method-name">${label}</span>
          <span class="method-meta">${meta}</span>
        </div>
        <div class="radio-circle"></div>
      </div>
    `;
  }

  render() {
    if (!this.open) return nothing;

    return html`
      <div class="modal-overlay" @click=${this.handleOverlayClick}>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Confirm Payment</h2>
            <button class="close-btn" @click=${this.handleClose} ?disabled=${this.processing}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="payment-summary">
              <div class="amount-label">Total Amount</div>
              <div class="amount-value">${this.formatCurrency(this.amount)}</div>
              <div class="amount-label amount-context">
                ${this.type === 'invoice' ? `Paying Invoice #${this.invoiceId}` : 'Paying Balance Due'}
              </div>
            </div>

            <span class="section-label">Select Payment Method</span>
            
            ${this.loading ? html`
                <div class="methods-loading">Loading payment methods...</div>
            ` : this.paymentMethods.length === 0 ? html`
                <div class="empty-state">
                    <p>No payment methods found.</p>
                    <button class="btn-cancel empty-state-add">+ Add Payment Method</button>
                </div>
            ` : html`
                <div class="payment-methods-list">
                    ${this.paymentMethods.map(pm => this.renderPaymentMethod(pm))}
                </div>
            `}

          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click=${this.handleClose} ?disabled=${this.processing}>
              Cancel
            </button>
            <button 
                class="btn-confirm" 
                @click=${this.handlePay} 
                ?disabled=${this.processing || !this.selectedMethodId}
            >
                ${this.processing ? html`<div class="spinner"></div> Processing...` : `Pay ${this.formatCurrency(this.amount)}`}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-payment-modal': PvPaymentModal;
  }
}
