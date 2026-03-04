/**
 * PvPageSettings - Account settings page component
 * Displays user profile and preferences
 */

import { html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { AuthService } from '../../connect/services/auth.js';
import { AccountService } from '../../connect/services/account.js';
import { PvToast } from '../atoms/pv-toast.js';
import { pageShellStyles } from '../../styles/shared.js';
import { settingsPageStyles } from '../../styles/pages.js';
import type { AccountData } from '../../types/index.js';
import type { NotificationPreferences } from '../../connect/types/domain.js';

@customElement('pv-page-settings')
export class PvPageSettings extends PvBase {
  static styles = [
    ...PvBase.styles,
    pageShellStyles,
    settingsPageStyles,
  ];

  @state() private accountData: AccountData | null = null;
  @state() private loading = true;
  @state() private savingProfile = false;
  @state() private savingPassword = false;
  @state() private savingNotifications = false;
  @state() private emailNotifications = true;
  @state() private smsNotifications = false;
  @state() private orderUpdates = true;
  @state() private accountId: number | null = null;
  @state() private phoneValue = '';
  @state() private currentPassword = '';
  @state() private newPassword = '';

  @query('#phone-input') phoneInput!: HTMLInputElement;

  async connectedCallback() {
    super.connectedCallback();
    try {
      this.accountData = await DataService.getAccountData();
      this.phoneValue = this.accountData?.user?.phone ?? '';
      this.accountId = DataService.getCurrentAccountId();
      if (this.accountId) {
        const account = await AccountService.getAccount(this.accountId);
        this.smsNotifications = !!account.smsConsent;
      }
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
      if (key === 'smsNotifications') {
        if (!this.accountId) {
          throw new Error('Account ID not found');
        }
        await AccountService.updateSMSConsent(this.accountId, this.smsNotifications);
      } else {
        await AuthService.updateNotifications(parseInt(userId), {
          emailNotifications: this.emailNotifications,
          smsNotifications: this.smsNotifications,
          orderUpdates: this.orderUpdates,
        });
      }
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
            <span class="sms-consent">
              <button class="sms-consent-trigger" type="button" aria-label="View SMS consent disclosure">i</button>
              <span class="sms-consent-label">SMS consent disclosure</span>
              <span class="sms-consent-tooltip" role="tooltip">
                I agree to receive transactional SMS messages including account notifications, verification codes (2FA), and customer care responses. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to unsubscribe or HELP for assistance. View our Privacy Policy at
                <a href="https://www.builderwire.com/privacy-policy" target="_blank" rel="noopener noreferrer">builderwire.com/privacy-policy</a>
                and Terms of Service at
                <a href="https://www.builderwire.com/terms-and-conditions" target="_blank" rel="noopener noreferrer">builderwire.com/terms-and-conditions</a>.
              </span>
            </span>
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
