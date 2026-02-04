/**
 * LbSidebar - Navigation sidebar component
 * Displays user info, navigation links, and support footer
 */

import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import { RouterService } from '../../services/router.service.js';
import { AuthService } from '../../services/auth.service.js';
import { DataService } from '../../services/data.service.js';
import type { RouteId, AccountData, Estimate, Invoice } from '../../types/index.js';

@customElement('lb-sidebar')
export class LbSidebar extends LbBase {
  static styles = [
    ...LbBase.styles,
    css`
      :host {
        display: block;
        width: var(--sidebar-width, 280px);
        background: var(--color-bg-alt);
        border-right: 1px solid var(--color-border);
        height: calc(100vh - var(--header-height, 80px));
        position: sticky;
        top: var(--header-height, 80px);
        overflow-y: auto;
      }

      .account-user {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-xl);
        border-bottom: 1px solid var(--color-border);
      }

      .account-avatar {
        width: 48px;
        height: 48px;
        background: var(--color-primary);
        color: white;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-heading);
        font-weight: 600;
        font-size: var(--text-lg);
        flex-shrink: 0;
      }

      .account-user-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .account-user-name {
        font-weight: 600;
        color: var(--color-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .account-company {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      .account-nav {
        padding: var(--space-md);
        flex: 1;
      }

      .account-nav-item {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md) var(--space-lg);
        color: var(--color-text-light);
        font-weight: 500;
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
        margin-bottom: var(--space-xs);
        cursor: pointer;
        text-decoration: none;
      }

      .account-nav-item:hover {
        background: white;
        color: var(--color-text);
      }

      .account-nav-item.active {
        background: var(--color-primary);
        color: white;
      }

      .account-nav-item svg {
        flex-shrink: 0;
      }

      .nav-badge {
        margin-left: auto;
        background: var(--color-accent);
        color: white;
        font-size: var(--text-xs);
        font-weight: 600;
        padding: 2px 8px;
        border-radius: var(--radius-full);
      }

      .nav-badge.alert {
        background: #dc2626;
        margin-left: var(--space-xs);
      }

      .account-sidebar-footer {
        padding: var(--space-lg);
        border-top: 1px solid var(--color-border);
        margin-top: auto;
      }

      .account-support {
        margin-bottom: var(--space-lg);
      }

      .support-label {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        margin-bottom: var(--space-xs);
      }

      .support-phone,
      .support-email {
        display: block;
        font-size: var(--text-sm);
        color: var(--color-accent);
        font-weight: 500;
        text-decoration: none;
      }

      .support-phone:hover,
      .support-email:hover {
        text-decoration: underline;
      }

      .sign-out-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        padding: var(--space-md);
        background: transparent;
        color: var(--color-primary);
        border: 2px solid var(--color-primary);
        border-radius: var(--radius-md);
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .sign-out-btn:hover {
        background: var(--color-primary);
        color: white;
      }

      @media (max-width: 1023px) {
        :host {
          position: fixed;
          left: -280px;
          top: var(--header-height, 80px);
          z-index: 100;
          transition: left var(--transition-base);
        }

        :host(.open) {
          left: 0;
        }
      }
    `,
  ];

  @property({ type: String }) activeRoute: RouteId = 'overview';
  @state() private accountData: AccountData | null = null;
  @state() private pendingEstimatesCount = 0;
  @state() private openInvoicesCount = 0;
  @state() private overdueInvoicesCount = 0;

  private get navItems(): { id: RouteId; label: string; icon: string; badge?: number; alertBadge?: number }[] {
    return [
      { id: 'overview', label: 'Overview', icon: 'grid' },
      { id: 'billing', label: 'Billing', icon: 'credit-card', badge: this.openInvoicesCount > 0 ? this.openInvoicesCount : undefined, alertBadge: this.overdueInvoicesCount > 0 ? this.overdueInvoicesCount : undefined },
      { id: 'projects', label: 'Projects', icon: 'folder' },
      { id: 'orders', label: 'Orders', icon: 'package' },
      { id: 'estimates', label: 'Estimates', icon: 'file-text', badge: this.pendingEstimatesCount > 0 ? this.pendingEstimatesCount : undefined },
      { id: 'wallet', label: 'Wallet', icon: 'wallet' },
      { id: 'team', label: 'Team', icon: 'users' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ];
  }

  async connectedCallback() {
    super.connectedCallback();
    try {
      this.accountData = await DataService.getAccountData();
      // Fetch pending estimates count
      const { items: estimates } = await DataService.getEstimates(1000, 0);
      this.pendingEstimatesCount = estimates.filter((e: Estimate) => e.status === 'sent').length;
      // Fetch open invoices count
      const invoices = await DataService.getInvoices();
      this.openInvoicesCount = invoices.filter((i: Invoice) => i.status === 'open').length;
      this.overdueInvoicesCount = invoices.filter((i: Invoice) => i.status === 'overdue').length;
    } catch (e) {
      console.error('Failed to load account data', e);
    }
  }

  private handleNavClick(route: RouteId) {
    RouterService.navigate(route);
  }

  private handleSignOut() {
    AuthService.logout();
    DataService.clearCache();
  }

  private renderIcon(icon: string) {
    const icons: Record<string, ReturnType<typeof html>> = {
      'grid': html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>`,
      'credit-card': html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </svg>`,
      'folder': html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      </svg>`,
      'package': html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>`,
      'file-text': html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>`,
      'wallet': html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <circle cx="16" cy="12" r="2"></circle>
      </svg>`,
      'users': html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>`,
      'settings': html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>`,
    };
    return icons[icon] || html``;
  }

  render() {
    const user = this.accountData?.user;
    const company = this.accountData?.company;
    const support = this.accountData?.support;

    return html`
      <div class="account-user">
        <div class="account-avatar">${user?.initials ?? 'U'}</div>
        <div class="account-user-info">
          <span class="account-user-name">${user?.fullName ?? 'User'}</span>
          <span class="account-company">${company?.name ?? 'Company'}</span>
        </div>
      </div>

      <nav class="account-nav">
        ${this.navItems.map(item => html`
          <a 
            class="account-nav-item ${this.activeRoute === item.id ? 'active' : ''}"
            @click=${() => this.handleNavClick(item.id)}
          >
            ${this.renderIcon(item.icon)}
            ${item.label}
            ${item.badge ? html`<span class="nav-badge">${item.badge}</span>` : ''}
            ${item.alertBadge ? html`<span class="nav-badge alert">${item.alertBadge}</span>` : ''}
          </a>
        `)}
      </nav>

      <div class="account-sidebar-footer">
        <div class="account-support">
          <p class="support-label">Need Help?</p>
          <a href="tel:${(support?.phone ?? '(555) 123-4567').replace(/\D/g, '')}" class="support-phone">
            ${support?.phone ?? '(555) 123-4567'}
          </a>
          <a href="mailto:${support?.email ?? 'support@velocity.com'}" class="support-email">
            ${support?.email ?? 'support@velocity.com'}
          </a>
        </div>
        <button class="sign-out-btn" @click=${this.handleSignOut}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-sidebar': LbSidebar;
  }
}
