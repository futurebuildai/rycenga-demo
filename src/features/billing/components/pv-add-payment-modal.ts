/**
 * PvAddPaymentModal - Modal for adding Card or ACH payment methods
 * PCI-DSS compliant: sensitive data stored only in @state, cleared after tokenization
 */

import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { PvBase } from '../../../components/pv-base.js';
import { PaymentSDKService } from '../../../connect/services/payment-sdk.js';
import { BillingService } from '../../../connect/services/billing.js';
import { PvToast } from '../../../components/atoms/pv-toast.js';

@customElement('pv-add-payment-modal')
export class PvAddPaymentModal extends PvBase {
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
        max-width: 480px;
        max-height: 90vh;
        overflow-y: auto;
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
      }

      .close-btn:hover {
        background: var(--color-border);
        color: var(--color-text);
      }

      .modal-body {
        padding: var(--space-xl);
      }

      .type-toggle {
        display: flex;
        gap: var(--space-sm);
        margin-bottom: var(--space-xl);
        padding: var(--space-xs);
        background: var(--color-bg-alt);
        border-radius: var(--radius-md);
      }

      .type-btn {
        flex: 1;
        padding: var(--space-md);
        border-radius: var(--radius-md);
        font-weight: 500;
        transition: all var(--transition-fast);
        color: var(--color-text-muted);
      }

      .type-icon {
        display: inline;
        vertical-align: middle;
        margin-right: 6px;
      }

      .type-btn.active {
        background: var(--color-bg);
        color: var(--color-text);
        box-shadow: var(--shadow-sm);
      }

      .type-btn:hover:not(.active) {
        color: var(--color-text);
      }

      .form-row {
        display: flex;
        gap: var(--space-md);
      }

      .form-row > .form-group {
        flex: 1;
      }

      .form-group.half {
        flex: 0 0 calc(50% - var(--space-sm));
      }

      .form-input.error {
        border-color: var(--app-danger-color, var(--color-error));
      }

      .field-error {
        color: var(--app-danger-color, var(--color-error));
        font-size: var(--text-xs);
        margin-top: var(--space-xs);
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-md);
        padding: var(--space-xl);
        border-top: 1px solid var(--color-border);
      }

      .btn-cancel {
        background: transparent;
        color: var(--color-text-muted);
      }

      .btn-cancel:hover {
        color: var(--color-text);
      }

      .hidden {
        display: none;
      }

      select.form-input {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right var(--space-md) center;
        padding-right: calc(var(--space-md) * 2 + 12px);
      }
    `,
  ];

  @property({ type: Boolean }) open = false;

  @state() private paymentType: 'card' | 'ach' = 'card';
  @state() private submitting = false;

  // Card fields (ephemeral - cleared after tokenization)
  @state() private cardName = '';
  @state() private cardNumber = '';
  @state() private cardExpiry = '';
  @state() private cardCvv = '';
  @state() private cardZip = '';

  // ACH fields
  @state() private achName = '';
  @state() private achRouting = '';
  @state() private achAccount = '';
  @state() private achType: 'checking' | 'savings' = 'checking';

  @state() private errors: Record<string, string> = {};

  private boundKeyHandler = this.handleKeyDown.bind(this);

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.boundKeyHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.boundKeyHandler);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.open) {
      this.handleClose();
    }
  }

  private handleOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.handleClose();
    }
  }

  private handleClose() {
    this.clearForm();
    this.dispatchEvent(new CustomEvent('close'));
  }

  private clearForm() {
    // Clear sensitive card data immediately
    this.cardName = '';
    this.cardNumber = '';
    this.cardExpiry = '';
    this.cardCvv = '';
    this.cardZip = '';
    this.achName = '';
    this.achRouting = '';
    this.achAccount = '';
    this.achType = 'checking';
    this.errors = {};
    this.paymentType = 'card';
    this.submitting = false;
  }

  private setPaymentType(type: 'card' | 'ach') {
    this.paymentType = type;
    this.errors = {};
  }

  // Luhn algorithm for card number validation
  private validateLuhn(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private parseExpiry(expiry: string): { month: number; year: number } | null {
    const match = expiry.match(/^(\d{1,2})\/(\d{2})$/);
    if (!match) return null;

    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000;

    if (month < 1 || month > 12) return null;

    // Check if card is expired
    const now = new Date();
    const expDate = new Date(year, month - 1);
    if (expDate < new Date(now.getFullYear(), now.getMonth())) {
      return null;
    }

    return { month, year };
  }

  private validateCardForm(): boolean {
    const errors: Record<string, string> = {};

    if (!this.cardName.trim()) {
      errors.cardName = 'Name is required';
    }

    const cardDigits = this.cardNumber.replace(/\D/g, '');
    if (!cardDigits) {
      errors.cardNumber = 'Card number is required';
    } else if (!this.validateLuhn(cardDigits)) {
      errors.cardNumber = 'Invalid card number';
    }

    if (!this.cardExpiry) {
      errors.cardExpiry = 'Expiration is required';
    } else if (!this.parseExpiry(this.cardExpiry)) {
      errors.cardExpiry = 'Invalid or expired date (MM/YY)';
    }

    if (!this.cardCvv) {
      errors.cardCvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(this.cardCvv)) {
      errors.cardCvv = 'CVV must be 3-4 digits';
    }

    if (!this.cardZip.trim()) {
      errors.cardZip = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(this.cardZip.trim())) {
      errors.cardZip = 'Invalid ZIP code';
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  private validateACHForm(): boolean {
    const errors: Record<string, string> = {};

    if (!this.achName.trim()) {
      errors.achName = 'Account holder name is required';
    }

    if (!this.achRouting) {
      errors.achRouting = 'Routing number is required';
    } else if (!/^\d{9}$/.test(this.achRouting)) {
      errors.achRouting = 'Routing number must be 9 digits';
    }

    if (!this.achAccount) {
      errors.achAccount = 'Account number is required';
    } else if (!/^\d{4,17}$/.test(this.achAccount)) {
      errors.achAccount = 'Invalid account number';
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  private formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  private formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  }

  private handleCardNumberInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this.cardNumber = this.formatCardNumber(input.value);
  }

  private handleExpiryInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this.cardExpiry = this.formatExpiry(input.value);
  }

  private handleCvvInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this.cardCvv = input.value.replace(/\D/g, '').slice(0, 4);
  }

  private handleRoutingInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this.achRouting = input.value.replace(/\D/g, '').slice(0, 9);
  }

  private handleAccountInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this.achAccount = input.value.replace(/\D/g, '').slice(0, 17);
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();

    const isValid = this.paymentType === 'card'
      ? this.validateCardForm()
      : this.validateACHForm();

    if (!isValid) return;

    this.submitting = true;

    try {
      // Initialize SDK if needed
      await PaymentSDKService.initialize();

      let tokenResponse;
      let paymentMethodData;

      if (this.paymentType === 'card') {
        const expiry = this.parseExpiry(this.cardExpiry)!;
        const cardDigits = this.cardNumber.replace(/\D/g, '');

        tokenResponse = await PaymentSDKService.tokenizeCard({
          cardNumber: cardDigits,
          expMonth: expiry.month,
          expYear: expiry.year,
          cvc: this.cardCvv,
        });

        paymentMethodData = {
          accountToken: tokenResponse.token,
          name: this.cardName,
          type: 'card' as const,
          brand: tokenResponse.brand || null,
          last4: tokenResponse.last4 || cardDigits.slice(-4),
          expMonth: tokenResponse.expMonth || expiry.month,
          expYear: tokenResponse.expYear || expiry.year,
          accountZip: this.cardZip,
          isDefault: false,
        };
      } else {
        tokenResponse = await PaymentSDKService.tokenizeACH({
          routingNumber: this.achRouting,
          accountNumber: this.achAccount,
          accountType: this.achType,
        });

        paymentMethodData = {
          accountToken: tokenResponse.token,
          name: this.achName,
          type: 'ach' as const,
          last4: tokenResponse.last4 || this.achAccount.slice(-4),
          isDefault: false,
        };
      }

      // Clear sensitive data immediately after tokenization
      this.cardNumber = '';
      this.cardCvv = '';
      this.cardExpiry = '';
      this.achAccount = '';
      this.achRouting = '';

      // Create payment method with token
      const paymentMethod = await BillingService.createPaymentMethod(paymentMethodData);

      // Clear remaining form data
      this.clearForm();

      PvToast.show('Payment method added successfully', 'success');
      this.dispatchEvent(new CustomEvent('payment-method-added', {
        detail: paymentMethod,
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      console.error('Failed to add payment method:', error);
      PvToast.show('Failed to add payment method. Please try again.', 'error');
    } finally {
      this.submitting = false;
    }
  }

  private renderCardForm() {
    return html`
      <div class="form-group">
        <label for="card-name">Name on Card</label>
        <input
          id="card-name"
          type="text"
          class="form-input ${this.errors.cardName ? 'error' : ''}"
          .value=${this.cardName}
          @input=${(e: InputEvent) => this.cardName = (e.target as HTMLInputElement).value}
          autocomplete="cc-name"
          aria-invalid=${this.errors.cardName ? 'true' : 'false'}
          aria-describedby=${this.errors.cardName ? 'card-name-error' : nothing}
        />
        ${this.errors.cardName ? html`<span id="card-name-error" class="field-error">${this.errors.cardName}</span>` : nothing}
      </div>

      <div class="form-group">
        <label for="card-number">Card Number</label>
        <input
          id="card-number"
          type="text"
          inputmode="numeric"
          class="form-input ${this.errors.cardNumber ? 'error' : ''}"
          .value=${this.cardNumber}
          @input=${this.handleCardNumberInput}
          autocomplete="cc-number"
          placeholder="1234 5678 9012 3456"
          aria-invalid=${this.errors.cardNumber ? 'true' : 'false'}
          aria-describedby=${this.errors.cardNumber ? 'card-number-error' : nothing}
        />
        ${this.errors.cardNumber ? html`<span id="card-number-error" class="field-error">${this.errors.cardNumber}</span>` : nothing}
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="card-expiry">Expiration</label>
          <input
            id="card-expiry"
            type="text"
            inputmode="numeric"
            class="form-input ${this.errors.cardExpiry ? 'error' : ''}"
            .value=${this.cardExpiry}
            @input=${this.handleExpiryInput}
            autocomplete="cc-exp"
            placeholder="MM/YY"
            aria-invalid=${this.errors.cardExpiry ? 'true' : 'false'}
            aria-describedby=${this.errors.cardExpiry ? 'card-expiry-error' : nothing}
          />
          ${this.errors.cardExpiry ? html`<span id="card-expiry-error" class="field-error">${this.errors.cardExpiry}</span>` : nothing}
        </div>

        <div class="form-group">
          <label for="card-cvv">CVV</label>
          <input
            id="card-cvv"
            type="password"
            inputmode="numeric"
            class="form-input ${this.errors.cardCvv ? 'error' : ''}"
            .value=${this.cardCvv}
            @input=${this.handleCvvInput}
            autocomplete="cc-csc"
            placeholder="123"
            maxlength="4"
            aria-invalid=${this.errors.cardCvv ? 'true' : 'false'}
            aria-describedby=${this.errors.cardCvv ? 'card-cvv-error' : nothing}
          />
          ${this.errors.cardCvv ? html`<span id="card-cvv-error" class="field-error">${this.errors.cardCvv}</span>` : nothing}
        </div>
      </div>

      <div class="form-group">
        <label for="card-zip">Billing ZIP Code</label>
        <input
          id="card-zip"
          type="text"
          inputmode="numeric"
          class="form-input ${this.errors.cardZip ? 'error' : ''}"
          .value=${this.cardZip}
          @input=${(e: InputEvent) => this.cardZip = (e.target as HTMLInputElement).value}
          autocomplete="postal-code"
          placeholder="12345"
          aria-invalid=${this.errors.cardZip ? 'true' : 'false'}
          aria-describedby=${this.errors.cardZip ? 'card-zip-error' : nothing}
        />
        ${this.errors.cardZip ? html`<span id="card-zip-error" class="field-error">${this.errors.cardZip}</span>` : nothing}
      </div>
    `;
  }

  private renderACHForm() {
    return html`
      <div class="form-group">
        <label for="ach-name">Account Holder Name</label>
        <input
          id="ach-name"
          type="text"
          class="form-input ${this.errors.achName ? 'error' : ''}"
          .value=${this.achName}
          @input=${(e: InputEvent) => this.achName = (e.target as HTMLInputElement).value}
          autocomplete="name"
          aria-invalid=${this.errors.achName ? 'true' : 'false'}
          aria-describedby=${this.errors.achName ? 'ach-name-error' : nothing}
        />
        ${this.errors.achName ? html`<span id="ach-name-error" class="field-error">${this.errors.achName}</span>` : nothing}
      </div>

      <div class="form-group">
        <label for="ach-routing">Routing Number</label>
        <input
          id="ach-routing"
          type="text"
          inputmode="numeric"
          class="form-input ${this.errors.achRouting ? 'error' : ''}"
          .value=${this.achRouting}
          @input=${this.handleRoutingInput}
          placeholder="9 digits"
          maxlength="9"
          aria-invalid=${this.errors.achRouting ? 'true' : 'false'}
          aria-describedby=${this.errors.achRouting ? 'ach-routing-error' : nothing}
        />
        ${this.errors.achRouting ? html`<span id="ach-routing-error" class="field-error">${this.errors.achRouting}</span>` : nothing}
      </div>

      <div class="form-group">
        <label for="ach-account">Account Number</label>
        <input
          id="ach-account"
          type="text"
          inputmode="numeric"
          class="form-input ${this.errors.achAccount ? 'error' : ''}"
          .value=${this.achAccount}
          @input=${this.handleAccountInput}
          aria-invalid=${this.errors.achAccount ? 'true' : 'false'}
          aria-describedby=${this.errors.achAccount ? 'ach-account-error' : nothing}
        />
        ${this.errors.achAccount ? html`<span id="ach-account-error" class="field-error">${this.errors.achAccount}</span>` : nothing}
      </div>

      <div class="form-group">
        <label for="ach-type">Account Type</label>
        <select
          id="ach-type"
          class="form-input"
          .value=${this.achType}
          @change=${(e: Event) => this.achType = (e.target as HTMLSelectElement).value as 'checking' | 'savings'}
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
      </div>
    `;
  }

  render() {
    if (!this.open) return nothing;

    return html`
      <div
        class="modal-overlay"
        @click=${this.handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">Add Payment Method</h2>
            <button
              class="close-btn"
              @click=${this.handleClose}
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form @submit=${this.handleSubmit}>
            <div class="modal-body">
              <div class="type-toggle" role="tablist">
                <button
                  type="button"
                  class="type-btn ${this.paymentType === 'card' ? 'active' : ''}"
                  @click=${() => this.setPaymentType('card')}
                  role="tab"
                  aria-selected=${this.paymentType === 'card'}
                  aria-controls="card-form"
                >
                  <svg class="type-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Card
                </button>
                <button
                  type="button"
                  class="type-btn ${this.paymentType === 'ach' ? 'active' : ''}"
                  @click=${() => this.setPaymentType('ach')}
                  role="tab"
                  aria-selected=${this.paymentType === 'ach'}
                  aria-controls="ach-form"
                >
                  <svg class="type-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Bank Account
                </button>
              </div>

              <div id="card-form" class="${this.paymentType !== 'card' ? 'hidden' : ''}" role="tabpanel">
                ${this.renderCardForm()}
              </div>

              <div id="ach-form" class="${this.paymentType !== 'ach' ? 'hidden' : ''}" role="tabpanel">
                ${this.renderACHForm()}
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-cancel"
                @click=${this.handleClose}
                ?disabled=${this.submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                ?disabled=${this.submitting}
              >
                ${this.submitting ? 'Adding...' : 'Add Payment Method'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-add-payment-modal': PvAddPaymentModal;
  }
}
