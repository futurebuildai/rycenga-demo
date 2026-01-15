/**
 * LbPageSettings - Account settings page component
 * Displays user profile and preferences
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import { DataService } from '../../services/data.service.js';
import { LbToast } from '../atoms/lb-toast.js';
import type { AccountData } from '../../types/index.js';

@customElement('lb-page-settings')
export class LbPageSettings extends LbBase {
    static styles = [
        ...LbBase.styles,
        css`
      :host {
        display: block;
      }

      .section-header {
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

      .settings-section {
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
        margin-bottom: var(--space-xl);
      }

      .settings-section-title {
        font-family: var(--font-heading);
        font-size: var(--text-lg);
        font-weight: 600;
        margin-bottom: var(--space-lg);
        padding-bottom: var(--space-md);
        border-bottom: 1px solid var(--color-border);
      }

      .settings-form {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-lg);
      }

      @media (max-width: 768px) {
        .settings-form {
          grid-template-columns: 1fr;
        }
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .form-group.full-width {
        grid-column: span 2;
      }

      @media (max-width: 768px) {
        .form-group.full-width {
          grid-column: span 1;
        }
      }

      .form-group label {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--color-text);
      }

      .form-group input,
      .form-group select {
        padding: var(--space-md);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-md);
        font-size: var(--text-base);
        background: white;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: var(--color-accent);
      }

      .form-group input:read-only {
        background: var(--color-bg);
        color: var(--color-text-muted);
      }

      .form-hint {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }

      .settings-actions {
        display: flex;
        gap: var(--space-md);
        margin-top: var(--space-lg);
        padding-top: var(--space-lg);
        border-top: 1px solid var(--color-border);
      }

      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md) 0;
        border-bottom: 1px solid var(--color-border);
      }

      .toggle-row:last-child {
        border-bottom: none;
      }

      .toggle-info {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .toggle-label {
        font-weight: 500;
      }

      .toggle-desc {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      .toggle-switch {
        position: relative;
        width: 48px;
        height: 26px;
        background: var(--color-border);
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: background var(--transition-fast);
      }

      .toggle-switch.active {
        background: var(--color-accent);
      }

      .toggle-switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: var(--radius-full);
        transition: transform var(--transition-fast);
      }

      .toggle-switch.active::after {
        transform: translateX(22px);
      }
    `,
    ];

    @state() private accountData: AccountData | null = null;
    @state() private loading = true;
    @state() private emailNotifications = true;
    @state() private smsNotifications = false;
    @state() private orderUpdates = true;

    async connectedCallback() {
        super.connectedCallback();
        try {
            this.accountData = await DataService.getAccountData();
        } catch (e) {
            console.error('Failed to load account data', e);
        } finally {
            this.loading = false;
        }
    }

    private handleSave() {
        LbToast.show('Settings saved successfully', 'success');
    }

    private handleCancel() {
        LbToast.show('Changes discarded', 'info');
    }

    private handlePasswordChange() {
        LbToast.show('Password change coming soon', 'info');
    }

    render() {
        if (this.loading) {
            return html`<p>Loading settings...</p>`;
        }

        const user = this.accountData?.user;
        const company = this.accountData?.company;

        return html`
      <div class="section-header">
        <h1 class="section-title">Settings</h1>
        <p class="section-subtitle">Manage your account preferences</p>
      </div>

      <div class="settings-section">
        <h2 class="settings-section-title">Profile Information</h2>
        <div class="settings-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" value="${user?.fullName ?? ''}" readonly>
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" value="${user?.email ?? ''}" readonly>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" value="${user?.phone ?? ''}">
          </div>
          <div class="form-group">
            <label>Company</label>
            <input type="text" value="${company?.name ?? ''}" readonly>
          </div>
        </div>
        <div class="settings-actions">
          <button class="btn btn-primary" @click=${this.handleSave}>Save Changes</button>
          <button class="btn btn-outline" @click=${this.handleCancel}>Cancel</button>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="settings-section-title">Security</h2>
        <div class="settings-form">
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" placeholder="••••••••">
          </div>
        </div>
        <div class="settings-actions">
          <button class="btn btn-primary" @click=${this.handlePasswordChange}>Change Password</button>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="settings-section-title">Notifications</h2>
        
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">Email Notifications</span>
            <span class="toggle-desc">Receive order updates and invoices via email</span>
          </div>
          <div 
            class="toggle-switch ${this.emailNotifications ? 'active' : ''}"
            @click=${() => this.emailNotifications = !this.emailNotifications}
          ></div>
        </div>

        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">SMS Notifications</span>
            <span class="toggle-desc">Get text alerts for delivery updates</span>
          </div>
          <div 
            class="toggle-switch ${this.smsNotifications ? 'active' : ''}"
            @click=${() => this.smsNotifications = !this.smsNotifications}
          ></div>
        </div>

        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">Order Status Updates</span>
            <span class="toggle-desc">Notifications when your order status changes</span>
          </div>
          <div 
            class="toggle-switch ${this.orderUpdates ? 'active' : ''}"
            @click=${() => this.orderUpdates = !this.orderUpdates}
          ></div>
        </div>
      </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'lb-page-settings': LbPageSettings;
    }
}
