/**
 * PvApp - Root application shell component
 * Handles auth state, routing, and global toast events
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from './pv-base.js';
import { AuthService } from '../services/auth.service.js';
import { RouterService } from '../services/router.service.js';
import { PvToast } from './atoms/pv-toast.js';
import type { RouteId, ToastEvent } from '../types/index.js';
import { BrandingService, BRANDING_REFRESH_SIGNAL_KEY } from '../services/branding.service.js';

// Import components
import './pv-login.js';
import './organisms/pv-header.js';
import './organisms/pv-sidebar.js';
import './pages/pv-page-overview.js';
import './pages/pv-page-orders.js';
import './pages/pv-page-estimates.js';
import './pages/pv-page-billing.js';
import './pages/pv-page-projects.js';
import './pages/pv-page-wallet.js';
import './pages/pv-page-docs.js';
import './pages/pv-page-team.js';
import './pages/pv-page-settings.js';

@customElement('pv-app')
export class PvApp extends PvBase {
  private static readonly BRANDING_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

  static styles = [
    ...PvBase.styles,
    css`
      :host {
        display: block;
        min-height: 100vh;
        font-family: var(--font-body);
        background: var(--color-bg);
      }

      .app-layout {
        display: flex;
        min-height: calc(100vh - var(--header-height, 80px));
        flex-direction: var(--app-layout-direction, row);
        background: var(--app-layout-background, transparent);
      }

      .app-main {
        flex: 1;
        padding: var(--app-main-padding, var(--space-2xl));
        background: var(--app-main-bg, #ffffff);
        overflow-x: auto;
        margin: var(--app-main-margin, 0);
        border-radius: var(--app-main-radius, 0);
        box-shadow: var(--app-main-shadow, none);
      }

      .impersonation-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 44px;
        background: var(--app-impersonation-bg, linear-gradient(90deg, #7f1d1d, #991b1b));
        color: var(--app-inverse-text, #ffffff);
        z-index: 1200;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        font-size: var(--text-sm);
      }

      .impersonation-banner button {
        border: var(--app-impersonation-button-border, 1px solid rgba(255, 255, 255, 0.45));
        background: var(--app-impersonation-button-bg, rgba(255, 255, 255, 0.15));
        color: var(--app-inverse-text, #ffffff);
        border-radius: var(--app-impersonation-button-radius, 6px);
        padding: 4px 10px;
        font-size: var(--text-xs);
        cursor: pointer;
      }

      .has-impersonation {
        --impersonation-banner-height: 44px;
        padding-top: 44px;
      }

      .placeholder-page {
        padding: var(--space-xl);
      }

      .placeholder-page h1 {
        font-family: var(--font-heading);
        font-size: var(--text-3xl);
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: var(--space-md);
      }

      .placeholder-page p {
        color: var(--color-text-muted);
      }

      .sidebar-backdrop {
        display: none;
      }

      @media (max-width: 1023px) {
        .app-main {
          padding: var(--app-main-padding-mobile, var(--app-main-padding, var(--space-2xl)));
          margin: var(--app-main-margin-mobile, var(--app-main-margin, 0));
          border-radius: var(--app-main-radius-mobile, var(--app-main-radius, 0));
          box-shadow: var(--app-main-shadow-mobile, var(--app-main-shadow, none));
        }

        .sidebar-backdrop {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 150;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }

        .sidebar-backdrop.visible {
          opacity: 1;
          pointer-events: auto;
        }
      }
    `,
  ];

  @state() private isAuthenticated = false;
  @state() private currentRoute: RouteId = 'overview';
  @state() private sidebarOpen = false;
  @state() private isImpersonating = false;
  @state() private impersonationEmail = '';
  @state() private templateId = BrandingService.getBrandingSync().templateId;
  @state() private paletteId = BrandingService.getBrandingSync().paletteId;

  private authUnsubscribe?: () => void;
  private routeUnsubscribe?: () => void;
  private brandingUnsubscribe?: () => void;
  private brandingRefreshTimer?: number;

  connectedCallback() {
    super.connectedCallback();

    // Initialize router
    RouterService.init();
    this.applyBrandingTokens(this.templateId, this.paletteId);
    void BrandingService.refreshBranding();
    this.brandingUnsubscribe = BrandingService.subscribe((branding) => {
      this.templateId = branding.templateId || 1;
      this.paletteId = branding.paletteId || 1;
      this.applyBrandingTokens(this.templateId, this.paletteId);
    });
    this.brandingRefreshTimer = window.setInterval(() => {
      if (this.isAuthenticated) {
        void BrandingService.refreshBranding();
      }
    }, PvApp.BRANDING_REFRESH_INTERVAL_MS);
    window.addEventListener('storage', this.handleBrandingRefreshSignal);

    // Check initial auth state
    this.isAuthenticated = AuthService.isAuthenticated();
    this.refreshImpersonationState();
    if (this.isAuthenticated && AuthService.isPlatformAdminSession() && !this.isImpersonating) {
      window.location.assign('/admin');
      return;
    }

    // Subscribe to auth changes
    this.authUnsubscribe = AuthService.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      this.refreshImpersonationState();
      this.updateTitle();
      if (isAuth && AuthService.isPlatformAdminSession() && !this.isImpersonating) {
        window.location.assign('/admin');
        return;
      }
      if (!isAuth) {
        this.currentRoute = 'login';
      }
    });

    // Subscribe to route changes
    this.routeUnsubscribe = RouterService.subscribe((route) => {
      this.currentRoute = route;
      this.updateTitle();
    });

    // Listen for global toast events
    window.addEventListener('show-toast', this.handleToastEvent as EventListener);

    this.updateTitle();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.authUnsubscribe?.();
    this.routeUnsubscribe?.();
    this.brandingUnsubscribe?.();
    if (this.brandingRefreshTimer !== undefined) {
      window.clearInterval(this.brandingRefreshTimer);
      this.brandingRefreshTimer = undefined;
    }
    window.removeEventListener('storage', this.handleBrandingRefreshSignal);
    window.removeEventListener('show-toast', this.handleToastEvent as EventListener);
  }

  private handleToastEvent = (e: CustomEvent<ToastEvent>) => {
    const { message, type, duration } = e.detail;
    PvToast.show(message, type, duration);
  };

  private handleBrandingRefreshSignal = (event: StorageEvent) => {
    if (event.key === BRANDING_REFRESH_SIGNAL_KEY && this.isAuthenticated) {
      void BrandingService.refreshBranding();
    }
  };

  private applyBrandingTokens(templateId: number, paletteId: number) {
    document.documentElement.setAttribute('data-template', String(templateId > 0 ? templateId : 1));
    document.documentElement.setAttribute('data-palette', String(paletteId > 0 ? paletteId : 1));
  }

  private async updateTitle() {
    await BrandingService.getBranding();
    document.title = BrandingService.getAccountTitle();
  }

  private handleLoginSuccess() {
    this.isAuthenticated = true;
    RouterService.navigate('overview');
  }

  private handleMenuToggle() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private closeSidebar() {
    this.sidebarOpen = false;
  }

  private refreshImpersonationState() {
    const raw = localStorage.getItem('impersonation_session');
    if (!raw) {
      this.isImpersonating = false;
      this.impersonationEmail = '';
      return;
    }
    try {
      const data = JSON.parse(raw) as { active?: boolean; targetEmail?: string };
      this.isImpersonating = !!data.active;
      this.impersonationEmail = data.targetEmail || '';
    } catch {
      this.isImpersonating = false;
      this.impersonationEmail = '';
    }
  }

  private async exitImpersonation() {
    const { AdminAuthService } = await import('../admin/services/admin-auth.service.js');
    await AdminAuthService.stopImpersonation();
    window.location.assign('/admin');
  }

  private renderPage() {
    switch (this.currentRoute) {
      case 'overview':
        return html`<pv-page-overview></pv-page-overview>`;
      case 'billing':
        return html`<pv-page-billing></pv-page-billing>`;
      case 'projects':
        return html`<pv-page-projects></pv-page-projects>`;
      case 'orders':
        return html`<pv-page-orders></pv-page-orders>`;
      case 'estimates':
        return html`<pv-page-estimates></pv-page-estimates>`;
      case 'wallet':
        return html`<pv-page-wallet></pv-page-wallet>`;
      case 'docs':
        return html`<pv-page-docs></pv-page-docs>`;
      case 'team':
        return html`<pv-page-team></pv-page-team>`;
      case 'settings':
        return html`<pv-page-settings></pv-page-settings>`;
      default:
        return html`<pv-page-overview></pv-page-overview>`;
    }
  }

  private renderPlaceholder(title: string, description: string) {
    return html`
      <div class="placeholder-page">
        <h1>${title}</h1>
        <p>${description}</p>
      </div>
    `;
  }

  private renderShell() {
    return html`
      <pv-header 
        @menu-toggle=${this.handleMenuToggle}
      ></pv-header>

      <div class="sidebar-backdrop ${this.sidebarOpen ? 'visible' : ''}" @click=${this.closeSidebar}></div>

      <div class="app-layout">
        <pv-sidebar
          class="${this.sidebarOpen ? 'open' : ''}"
          .activeRoute=${this.currentRoute}
          @nav-select=${this.closeSidebar}
        ></pv-sidebar>

        <main class="app-main">
          ${this.renderPage()}
        </main>
      </div>
    `;
  }

  render() {
    // Show login if not authenticated
    if (!this.isAuthenticated) {
      return html`<pv-login @login-success=${this.handleLoginSuccess}></pv-login>`;
    }

    // Render main app layout
    return html`
      ${this.isImpersonating ? html`
        <div class="impersonation-banner">
          <span>Impersonating ${this.impersonationEmail || 'tenant user'}.</span>
          <button @click=${this.exitImpersonation}>Exit Impersonation</button>
        </div>
      ` : ''}
      <div class="${this.isImpersonating ? 'has-impersonation' : ''}">
      ${this.renderShell()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-app': PvApp;
  }
}
