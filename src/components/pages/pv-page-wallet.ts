/**
 * PvPageWallet - Wallet/Payment Methods page component
 * Displays saved payment methods and allows management
 */

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { BillingService } from '../../connect/services/billing.js';
import { PvToast } from '../atoms/pv-toast.js';
import { pageShellStyles } from '../../styles/shared.js';
import { walletPageStyles } from '../../styles/pages.js';
import type { PaymentMethod } from '../../connect/types/domain.js';
import '../../features/billing/components/pv-add-payment-modal.js';

@customElement('pv-page-wallet')
export class PvPageWallet extends PvBase {
  static styles = [
    ...PvBase.styles,
    pageShellStyles,
    walletPageStyles,
  ];

  @state() private paymentMethods: PaymentMethod[] = [];
  @state() private loading = true;
  @state() private error: string | null = null;
  @state() private showAddModal = false;
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
      PvToast.show('Failed to load payment methods', 'error');
    } finally {
      this.loading = false;
    }
  }

  private handleAddMethod() {
    this.showAddModal = true;
  }

  private handleModalClose() {
    this.showAddModal = false;
  }

  private handlePaymentMethodAdded(e: CustomEvent<PaymentMethod>) {
    this.paymentMethods = [...this.paymentMethods, e.detail];
    this.showAddModal = false;
  }

  // [L7 AUDIT] Commented out - Backend endpoint NOT IMPLEMENTED
  // Backend team must add PUT /v1/payment-methods/{id}/default to router.go
  // private async handleSetDefault(method: PaymentMethod) {
  //   if (method.isDefault) return;
  //
  //   this.processingId = method.id;
  //   try {
  //     await BillingService.setDefaultPaymentMethod(method.id);
  //     this.paymentMethods = this.paymentMethods.map(m => ({
  //       ...m,
  //       isDefault: m.id === method.id,
  //     }));
  //     PvToast.show(`${this.getPaymentLabel(method)} set as default`, 'success');
  //   } catch (e) {
  //     console.error('Failed to set default', e);
  //     PvToast.show('Failed to set default payment method', 'error');
  //   } finally {
  //     this.processingId = null;
  //   }
  // }

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
      PvToast.show('Cannot remove default payment method', 'warning');
      return;
    }

    this.processingId = method.id;
    try {
      await BillingService.removePaymentMethod(method.id);
      this.paymentMethods = this.paymentMethods.filter(m => m.id !== method.id);
      PvToast.show('Payment method removed', 'success');
    } catch (e) {
      console.error('Failed to remove payment method', e);
      PvToast.show('Failed to remove payment method', 'error');
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
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Payment Method
        </button>
      </div>

      <pv-add-payment-modal
        .open=${this.showAddModal}
        @close=${this.handleModalClose}
        @payment-method-added=${this.handlePaymentMethodAdded}
      ></pv-add-payment-modal>

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
                ${/* [L7 AUDIT] Set Default button disabled - Backend endpoint NOT IMPLEMENTED
                !method.isDefault ? html`
                  <button
                    class="btn btn-outline btn-sm"
                    @click=${() => this.handleSetDefault(method)}
                    ?disabled=${this.processingId === method.id}
                    aria-label="Set ${this.getPaymentLabel(method)} as default"
                  >${this.processingId === method.id ? 'Setting...' : 'Set Default'}</button>
                ` : '' */ ''}
                <button
                  class="btn btn-outline btn-sm"
                  @click=${() => this.handleRemove(method)}
                  ?disabled=${this.processingId === method.id || method.isDefault}
                  aria-label="Remove ${this.getPaymentLabel(method)}"
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
    'pv-page-wallet': PvPageWallet;
  }
}
