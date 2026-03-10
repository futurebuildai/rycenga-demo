/**
 * pv-convert-estimate-modal - Modal for accepting and converting an estimate
 */

import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { PvBase } from '../../../components/pv-base.js';
import { SalesService } from '../../../connect/services/sales.js';
import { BillingService } from '../../../connect/services/billing.js';
import { PvToast } from '../../../components/atoms/pv-toast.js';
import type { Estimate } from '../../../types/index.js';
import type { PaymentMethod, AccountFinancials } from '../../../connect/types/domain.js';

@customElement('pv-convert-estimate-modal')
export class PvConvertEstimateModal extends PvBase {
    static styles = [
        ...PvBase.styles,
        css`
      :host {
        display: block;
      }

      .modal-content {
        max-width: 520px;
        width: 100%;
      }

      .estimate-summary {
        background: var(--color-bg-alt);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
        margin-bottom: var(--space-xl);
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--space-xs);
        font-size: var(--text-sm);
      }

      .summary-label {
        color: var(--color-text-muted);
      }

      .summary-value {
        font-weight: 600;
        color: var(--color-text);
      }

      .total-row {
        margin-top: var(--space-md);
        padding-top: var(--space-md);
        border-top: 1px solid var(--color-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .total-label {
        font-weight: 700;
        font-size: var(--text-md);
      }

      .total-value {
        font-family: var(--font-heading);
        font-size: var(--text-xl);
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

      .payment-options {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        margin-bottom: var(--space-xl);
      }

      .payment-option {
        display: flex;
        align-items: center;
        padding: var(--space-lg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        background: var(--color-bg);
      }

      .payment-option:hover {
        border-color: var(--color-primary);
        background: var(--color-bg-alt);
      }

      .payment-option.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-light-10);
        box-shadow: 0 0 0 1px var(--color-primary);
      }

      .option-icon {
        width: 24px;
        height: 24px;
        margin-right: var(--space-lg);
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .option-details {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .option-title {
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: 2px;
      }

      .option-subtitle {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        line-height: 1.4;
      }

      .credit-info {
        margin-top: 4px;
        font-size: var(--text-xs);
        font-weight: 500;
      }

      .credit-available {
        color: var(--color-text-muted);
      }

      .credit-amount {
        color: var(--color-text);
        font-weight: 600;
      }

      .radio-circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid var(--color-border);
        margin-left: var(--space-md);
        position: relative;
        flex-shrink: 0;
      }

      .payment-option.selected .radio-circle {
        border-color: var(--color-primary);
      }

      .payment-option.selected .radio-circle::after {
        content: '';
        position: absolute;
        top: 4px;
        left: 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-primary);
      }

      .stored-methods-dropdown {
        margin-top: var(--space-md);
        padding-left: 44px;
      }

      .method-select {
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        background: var(--color-bg);
        font-family: inherit;
        font-size: var(--text-sm);
        color: var(--color-text);
        cursor: pointer;
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
    @property({ type: Object }) estimate: Estimate | null = null;
    @property({ type: Number }) accountId?: number;

    @state() private paymentType: 'account' | 'method' = 'account';
    @state() private paymentMethods: PaymentMethod[] = [];
    @state() private selectedMethodId: number | null = null;
    @state() private financials: AccountFinancials | null = null;
    @state() private loadingData = false;
    @state() private processing = false;

    async updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has('open') && this.open) {
            this.loadData();
        }
    }

    private async loadData() {
        this.loadingData = true;
        try {
            const [methods, financials] = await Promise.all([
                BillingService.getPaymentMethods(),
                this.accountId ? BillingService.getAccountFinancials(this.accountId) : Promise.resolve(null),
            ]);

            this.paymentMethods = methods;
            this.financials = financials;

            // Select default method if available
            const defaultMethod = methods.find(pm => pm.isDefault);
            if (defaultMethod) {
                this.selectedMethodId = defaultMethod.id;
            } else if (methods.length > 0) {
                this.selectedMethodId = methods[0].id;
            }
        } catch (e) {
            console.error('Failed to load conversion data', e);
            PvToast.show('Failed to load payment options', 'error');
        } finally {
            this.loadingData = false;
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

    private async handleConfirm() {
        if (!this.estimate) return;

        const paymentId = this.paymentType === 'account' ? 'account' : this.selectedMethodId;
        if (this.paymentType === 'method' && !paymentId) {
            PvToast.show('Please select a payment method', 'warning');
            return;
        }

        this.processing = true;
        try {
            await SalesService.convertEstimate(this.estimate.id, paymentId as number | 'account');
            PvToast.show('Estimate converted successfully!', 'success');
            this.dispatchEvent(new CustomEvent('converted', { detail: { estimateId: this.estimate.id } }));
            this.handleClose();
        } catch (e) {
            console.error('Failed to convert estimate', e);
            PvToast.show('Failed to convert estimate. Please try again.', 'error');
        } finally {
            this.processing = false;
        }
    }

    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }

    render() {
        if (!this.open || !this.estimate) return nothing;

        const itemsCount = this.estimate.lines?.length || 0;

        return html`
      <div class="modal-overlay" @click=${this.handleOverlayClick}>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Convert Estimate</h2>
            <button class="close-btn" @click=${this.handleClose} ?disabled=${this.processing}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="estimate-summary">
              <div class="summary-row">
                <span class="summary-label">Estimate Number</span>
                <span class="summary-value">${this.estimate.estimateNumber}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Items</span>
                <span class="summary-value">${itemsCount}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Total to Pay</span>
                <span class="total-value">${this.formatCurrency(this.estimate.total)}</span>
              </div>
            </div>

            <span class="section-label">Select Payment Method</span>

            <div class="payment-options">
              <div 
                class="payment-option ${this.paymentType === 'account' ? 'selected' : ''}"
                @click=${() => this.paymentType = 'account'}
              >
                <div class="option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <div class="option-details">
                  <span class="option-title">Pay on Account</span>
                  <span class="option-subtitle">Use your company credit line. Approval required.</span>
                  ${this.financials ? html`
                    <div class="credit-info">
                      <span class="credit-available">Available Credit: </span>
                      <span class="credit-amount">${this.formatCurrency(this.financials.availableCredit)}</span>
                    </div>
                  ` : ''}
                </div>
                <div class="radio-circle"></div>
              </div>

              <div 
                class="payment-option ${this.paymentType === 'method' ? 'selected' : ''}"
                @click=${() => this.paymentType = 'method'}
              >
                <div class="option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
                <div class="option-details">
                  <span class="option-title">Pay with Card or Bank</span>
                  <span class="option-subtitle">Select from your stored payment methods.</span>
                  
                  ${this.paymentType === 'method' && this.paymentMethods.length > 0 ? html`
                    <div class="stored-methods-dropdown" @click=${(e: Event) => e.stopPropagation()}>
                      <select 
                        class="method-select" 
                        .value=${this.selectedMethodId}
                        @change=${(e: any) => this.selectedMethodId = parseInt(e.target.value)}
                      >
                        ${this.paymentMethods.map(m => html`
                          <option value=${m.id}>
                            ${m.type === 'card' ? m.brand : 'Bank'} ending in ${m.last4}
                          </option>
                        `)}
                      </select>
                    </div>
                  ` : ''}
                  
                  ${this.paymentType === 'method' && this.paymentMethods.length === 0 && !this.loadingData ? html`
                    <div class="credit-info" style="color: var(--color-error); margin-top: 8px;">
                      No stored payment methods found.
                    </div>
                  ` : ''}
                </div>
                <div class="radio-circle"></div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click=${this.handleClose} ?disabled=${this.processing}>
              Cancel
            </button>
            <button 
                class="btn-confirm" 
                @click=${this.handleConfirm} 
                ?disabled=${this.processing || (this.paymentType === 'method' && !this.selectedMethodId)}
            >
                ${this.processing ? html`<div class="spinner"></div> Processing...` : 'Confirm & Convert'}
            </button>
          </div>
        </div>
      </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'pv-convert-estimate-modal': PvConvertEstimateModal;
    }
}
