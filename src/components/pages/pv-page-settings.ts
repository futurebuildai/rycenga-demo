/**
 * PvPageSettings - Account settings page component
 * Displays user profile and preferences
 */

import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { AuthService } from '../../connect/services/auth.js';
import { PvToast } from '../atoms/pv-toast.js';
import type { AccountData } from '../../types/index.js';
import type { NotificationPreferences } from '../../connect/types/domain.js';

@customElement('pv-page-settings')
export class PvPageSettings extends PvBase {
  static styles = [
    ...PvBase.styles,
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

      .toggle-switch.disabled {
        opacity: 0.5;
        cursor: not-allowed;
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

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ];

  @state() private accountData: AccountData | null = null;
  @state() private loading = true;
  @state() private savingProfile = false;
  @state() private savingPassword = false;
  @state() private savingNotifications = false;
  @state() private emailNotifications = true;
  @state() private smsNotifications = false;
  @state() private orderUpdates = true;
  @state() private phoneValue = '';
  @state() private currentPassword = '';
  @state() private newPassword = '';

  @query('#phone-input') phoneInput!: HTMLInputElement;

  async connectedCallback() {
    super.connectedCallback();
    try {
      this.accountData = await DataService.getAccountData();
      this.phoneValue = this.accountData?.user?.phone ?? '';
    } catch (e) {
      console.error('Failed to load account data', e);
      PvToast.show('Failed to load settings', 'error');
    } finally {
      this.loading = false;
    }
  }

  private async handleSave() {
    const phone = this.phoneValue.trim();
    if (phone && !/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
      PvToast.show('Please enter a valid phone number', 'warning');
      return;
    }

    this.savingProfile = true;
    try {
      const userId = this.accountData?.user?.id;
      if (!userId) throw new Error('User ID not found');

      await AuthService.updateProfile(parseInt(userId), { phone });
      PvToast.show('Profile saved successfully', 'success');
    } catch (e) {
      console.error('Failed to save profile', e);
      PvToast.show('Failed to save profile', 'error');
    } finally {
      this.savingProfile = false;
    }
  }

  private handleCancel() {
    this.phoneValue = this.accountData?.user?.phone ?? '';
    PvToast.show('Changes discarded', 'info');
  }

  private async handlePasswordChange() {
    if (!this.currentPassword || !this.newPassword) {
      PvToast.show('Please fill in both password fields', 'warning');
      return;
    }
    if (this.newPassword.length < 8) {
      PvToast.show('New password must be at least 8 characters', 'warning');
      return;
    }

    this.savingPassword = true;
    try {
      await AuthService.changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      });
      this.currentPassword = '';
      this.newPassword = '';
      PvToast.show('Password changed successfully', 'success');
    } catch (e) {
      console.error('Failed to change password', e);
      PvToast.show('Failed to change password', 'error');
    } finally {
      this.savingPassword = false;
    }
  }

  private async handleToggleNotification(key: keyof NotificationPreferences) {
    const userId = this.accountData?.user?.id;
    if (!userId) return;

    // Optimistic UI update
    if (key === 'emailNotifications') this.emailNotifications = !this.emailNotifications;
    else if (key === 'smsNotifications') this.smsNotifications = !this.smsNotifications;
    else if (key === 'orderUpdates') this.orderUpdates = !this.orderUpdates;

    this.savingNotifications = true;
    try {
      await AuthService.updateNotifications(parseInt(userId), {
        emailNotifications: this.emailNotifications,
        smsNotifications: this.smsNotifications,
        orderUpdates: this.orderUpdates,
      });
      PvToast.show('Notification preference updated', 'success');
    } catch (e) {
      console.error('Failed to update notifications', e);
      // Revert optimistic update
      if (key === 'emailNotifications') this.emailNotifications = !this.emailNotifications;
      else if (key === 'smsNotifications') this.smsNotifications = !this.smsNotifications;
      else if (key === 'orderUpdates') this.orderUpdates = !this.orderUpdates;
      PvToast.show('Failed to update notification preference', 'error');
    } finally {
      this.savingNotifications = false;
    }
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
            <input 
              id="phone-input"
              type="tel" 
              .value="${this.phoneValue}"
              @input=${(e: Event) => this.phoneValue = (e.target as HTMLInputElement).value}
            >
          </div>
          <div class="form-group">
            <label>Company</label>
            <input type="text" value="${company?.name ?? ''}" readonly>
          </div>
        </div>
        <div class="settings-actions">
          <button 
            class="btn btn-primary" 
            @click=${this.handleSave}
            ?disabled=${this.savingProfile}
          >${this.savingProfile ? 'Saving...' : 'Save Changes'}</button>
          <button class="btn btn-outline" @click=${this.handleCancel}>Cancel</button>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="settings-section-title">Security</h2>
        <div class="settings-form">
          <div class="form-group">
            <label>Current Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              .value="${this.currentPassword}"
              @input=${(e: Event) => this.currentPassword = (e.target as HTMLInputElement).value}
            >
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              .value="${this.newPassword}"
              @input=${(e: Event) => this.newPassword = (e.target as HTMLInputElement).value}
            >
          </div>
        </div>
        <div class="settings-actions">
          <button 
            class="btn btn-primary" 
            @click=${this.handlePasswordChange}
            ?disabled=${this.savingPassword}
          >${this.savingPassword ? 'Changing...' : 'Change Password'}</button>
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
            class="toggle-switch ${this.emailNotifications ? 'active' : ''} ${this.savingNotifications ? 'disabled' : ''}"
            @click=${() => !this.savingNotifications && this.handleToggleNotification('emailNotifications')}
          ></div>
        </div>

        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">SMS Notifications</span>
            <span class="toggle-desc">Get text alerts for delivery updates</span>
          </div>
          <div 
            class="toggle-switch ${this.smsNotifications ? 'active' : ''} ${this.savingNotifications ? 'disabled' : ''}"
            @click=${() => !this.savingNotifications && this.handleToggleNotification('smsNotifications')}
          ></div>
        </div>

        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">Order Status Updates</span>
            <span class="toggle-desc">Notifications when your order status changes</span>
          </div>
          <div 
            class="toggle-switch ${this.orderUpdates ? 'active' : ''} ${this.savingNotifications ? 'disabled' : ''}"
            @click=${() => !this.savingNotifications && this.handleToggleNotification('orderUpdates')}
          ></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-settings': PvPageSettings;
  }
}
