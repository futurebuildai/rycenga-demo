/**
 * LbApp - Root application shell component
 * Handles auth state, routing, and global toast events
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from './lb-base.js';
import { AuthService } from '../services/auth.service.js';
import { RouterService } from '../services/router.service.js';
import { LbToast } from './atoms/lb-toast.js';
import type { RouteId, ToastEvent } from '../types/index.js';

// Import components
import './lb-login.js';
import './organisms/lb-header.js';
import './organisms/lb-sidebar.js';
import './pages/lb-page-overview.js';
import './pages/lb-page-orders.js';
import './pages/lb-page-estimates.js';
import './pages/lb-page-billing.js';
import './pages/lb-page-projects.js';
import './pages/lb-page-wallet.js';
import './pages/lb-page-team.js';
import './pages/lb-page-settings.js';

@customElement('lb-app')
export class LbApp extends LbBase {
  static styles = [
    ...LbBase.styles,
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
      }

      .app-main {
        flex: 1;
        padding: var(--space-2xl);
        background: white;
        overflow-x: auto;
      }

      .impersonation-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 44px;
        background: linear-gradient(90deg, #7f1d1d, #991b1b);
        color: #fff;
        z-index: 1200;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        font-size: var(--text-sm);
      }

      .impersonation-banner button {
        border: 1px solid rgba(255, 255, 255, 0.45);
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
        border-radius: 6px;
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
    `,
  ];

  @state() private isAuthenticated = false;
  @state() private currentRoute: RouteId = 'overview';
  @state() private sidebarOpen = false;
  @state() private isImpersonating = false;
  @state() private impersonationEmail = '';

  private authUnsubscribe?: () => void;
  private routeUnsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();

    // Initialize router
    RouterService.init();

    // Check initial auth state
    this.isAuthenticated = AuthService.isAuthenticated();
    this.refreshImpersonationState();

    // Subscribe to auth changes
    this.authUnsubscribe = AuthService.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      this.refreshImpersonationState();
      if (!isAuth) {
        this.currentRoute = 'login';
      }
    });

    // Subscribe to route changes
    this.routeUnsubscribe = RouterService.subscribe((route) => {
      this.currentRoute = route;
    });

    // Listen for global toast events
    window.addEventListener('show-toast', this.handleToastEvent as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.authUnsubscribe?.();
    this.routeUnsubscribe?.();
    window.removeEventListener('show-toast', this.handleToastEvent as EventListener);
  }

  private handleToastEvent = (e: CustomEvent<ToastEvent>) => {
    const { message, type, duration } = e.detail;
    LbToast.show(message, type, duration);
  };

  private handleLoginSuccess() {
    this.isAuthenticated = true;
    RouterService.navigate('overview');
  }

  private handleMenuToggle() {
    this.sidebarOpen = !this.sidebarOpen;
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

  private exitImpersonation() {
    localStorage.removeItem('impersonation_session');
    AuthService.logout();
    window.location.assign('/admin');
  }

  private renderPage() {
    switch (this.currentRoute) {
      case 'overview':
        return html`<lb-page-overview></lb-page-overview>`;
      case 'billing':
        return html`<lb-page-billing></lb-page-billing>`;
      case 'projects':
        return html`<lb-page-projects></lb-page-projects>`;
      case 'orders':
        return html`<lb-page-orders></lb-page-orders>`;
      case 'estimates':
        return html`<lb-page-estimates></lb-page-estimates>`;
      case 'wallet':
        return html`<lb-page-wallet></lb-page-wallet>`;
      case 'team':
        return html`<lb-page-team></lb-page-team>`;
      case 'settings':
        return html`<lb-page-settings></lb-page-settings>`;
      default:
        return html`<lb-page-overview></lb-page-overview>`;
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

  render() {
    // Show login if not authenticated
    if (!this.isAuthenticated) {
      return html`<lb-login @login-success=${this.handleLoginSuccess}></lb-login>`;
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
      <lb-header 
        @menu-toggle=${this.handleMenuToggle}
      ></lb-header>
      
      <div class="app-layout">
        <lb-sidebar 
          class="${this.sidebarOpen ? 'open' : ''}"
          .activeRoute=${this.currentRoute}
        ></lb-sidebar>
        
        <main class="app-main">
          ${this.renderPage()}
        </main>
      </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-app': LbApp;
  }
}
