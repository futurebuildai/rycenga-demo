/**
 * pv-demo-welcome-modal.ts
 * Reusable modal component for the demo welcome screen.
 */

import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { PvBase } from './pv-base.js';

@customElement('pv-demo-welcome-modal')
export class PvDemoWelcomeModal extends PvBase {
    static styles = [
        ...PvBase.styles,
        css`
      :host {
        display: block;
      }

      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-xl);
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .modal-card {
        background: #ffffff;
        border-radius: 12px;
        width: 100%;
        max-width: 600px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        padding: 32px;
        position: relative;
        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: var(--space-lg);
      }

      .demo-badge {
        background: #d97706; /* Amber-600 */
        color: white;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      h2 {
        font-family: var(--font-heading);
        font-size: 24px;
        font-weight: 700;
        color: var(--color-text);
        margin: 0;
      }

      .intro-text {
        font-size: 15px;
        color: var(--color-text-muted);
        line-height: 1.6;
        margin-bottom: var(--space-xl);
      }

      .intro-text strong {
        color: var(--color-text);
      }

      ul {
        list-style-type: disc;
        padding-left: 24px;
        margin-bottom: var(--space-xl);
      }

      li {
        font-size: 14px;
        color: var(--color-text);
        line-height: 1.7;
        margin-bottom: 8px;
        position: relative;
      }
      
      li::marker {
        color: var(--color-text-muted);
      }

      .disclaimer {
        font-size: 13px;
        color: var(--color-text-muted);
        margin-bottom: var(--space-2xl);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dismiss-btn {
        width: 100%;
        background: var(--color-primary, #ea580c);
        color: var(--color-on-primary, white);
        border: none;
        padding: 14px 24px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .dismiss-btn:hover {
        background: var(--color-primary-hover, #c2410c);
      }
    `
    ];

    @property({ type: String }) portalType: 'customer' | 'admin' = 'customer';
    @state() private isVisible = false;

    connectedCallback() {
        super.connectedCallback();
        this.checkVisibility();
    }

    private checkVisibility() {
        const storageKey = `demo_modal_dismissed_${this.portalType}`;
        const hasDismissed = sessionStorage.getItem(storageKey);
        if (!hasDismissed) {
            this.isVisible = true;
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }
    }

    private dismiss() {
        const storageKey = `demo_modal_dismissed_${this.portalType}`;
        sessionStorage.setItem(storageKey, 'true');
        this.isVisible = false;
        document.body.style.overflow = '';
    }

    private renderCustomerScope() {
        return html`
      <ul>
        <li>Overview dashboard with account summary and stats</li>
        <li>Billing with invoices, payments, and payment history</li>
        <li>Wallet for saved payment methods</li>
        <li>Quote conversion and AI-powered Quick Quoting</li>
        <li>Document management and sharing</li>
        <li>Team management with roles and invitations</li>
        <li>Account settings and notification preferences</li>
      </ul>
    `;
    }

    private renderAdminScope() {
        return html`
      <ul>
        <li>Admin dashboard with summary stats and KPIs</li>
        <li>Account and user management with search and filtering</li>
        <li>Document management and sharing</li>
        <li>Invoice, order, and quote detail views</li>
        <li>Messaging with threaded conversations</li>
        <li>AR Center with payment requests and automation rules</li>
      </ul>
    `;
    }

    render() {
        if (!this.isVisible) return html``;

        const title = this.portalType === 'admin' ? 'Admin / AR Center Demo' : 'Customer Portal Demo';

        return html`
      <div class="backdrop" @click=${this.dismiss}>
        <div class="modal-card" @click=${(e: Event) => e.stopPropagation()}>
          <div class="header">
            <span class="demo-badge">Demo</span>
            <h2>${title}</h2>
          </div>
          
          <p class="intro-text">
            You're viewing a <strong>demo environment</strong> of the Velocity ${this.portalType === 'admin' ? 'dealer admin' : 'customer'} portal. 
            All data shown is sample data for demonstration purposes.
          </p>
          
          ${this.portalType === 'admin' ? this.renderAdminScope() : this.renderCustomerScope()}
          
          <div class="disclaimer">
            All data is simulated — actions won't affect real systems.
          </div>
          
          <button class="dismiss-btn" @click=${this.dismiss}>
            Got it, explore the demo
          </button>
        </div>
      </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'pv-demo-welcome-modal': PvDemoWelcomeModal;
    }
}
