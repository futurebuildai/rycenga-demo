/**
 * PvHeader - Main header component
 * Displays logo and utility navigation
 */

import { html, css, svg } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { BrandingService, type BrandingInfo } from '../../services/branding.service.js';
import { ThemeService } from '../../services/theme.service.js';

@customElement('pv-header')
export class PvHeader extends PvBase {
  static styles = [
    ...PvBase.styles,
    css`
      :host {
        --header-height: 120px;
        display: block;
        height: var(--header-height);
        background: var(--app-header-bg, #ffffff);
        border-bottom: var(--app-header-border-bottom, 1px solid var(--color-border));
        box-shadow: var(--app-header-shadow, none);
        position: sticky;
        top: var(--impersonation-banner-height, 0px);
        z-index: 1000;
      }

      .header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: var(--app-header-inner-padding, 0);
      }

      .header-left {
        width: var(--app-header-left-width, var(--sidebar-width, 280px));
        display: flex;
        align-items: center;
        justify-content: var(--app-header-left-justify, center);
        padding-left: var(--app-header-left-padding-left, 0);
      }

      .home-link {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-light);
        transition: color var(--transition-fast);
      }

      .home-link:hover {
        color: var(--app-header-link-hover, var(--color-accent));
      }

      .logo {
        display: flex;
        flex-direction: var(--app-header-logo-direction, column);
        align-items: var(--app-header-logo-align, center);
        justify-content: var(--app-header-logo-justify, center);
        text-align: var(--app-header-logo-text-align, center);
        gap: var(--app-header-logo-gap, 4px);
        flex: 1;
        text-decoration: none;
        padding: var(--app-header-logo-padding, 0);
      }

      .logo-icon {
        width: var(--app-header-logo-size, 40px);
        height: var(--app-header-logo-size, 40px);
        border-radius: var(--app-header-logo-radius, 10px);
        background: var(--app-header-logo-bg, color-mix(in srgb, var(--color-primary) 12%, transparent));
        color: var(--color-primary);
        display: grid;
        place-items: center;
        font-size: var(--app-header-logo-font-size, 1.25rem);
        line-height: 1;
      }

      .logo.full-logo .logo-icon {
        width: 450px; 
        height: 100px;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logo.full-logo .logo-name {
        display: none;
      }

      .logo-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        filter: var(--app-logo-filter, none);
      }

      .logo-name {
        font-family: var(--font-heading);
        font-size: var(--app-header-logo-name-size, 1.125rem);
        font-weight: 800;
        color: var(--app-logo-text-color, var(--color-primary));
        letter-spacing: var(--app-header-logo-letter-spacing, 0.05em);
        line-height: 1;
        text-transform: var(--app-header-logo-text-transform, none);
      }

      .header-right {
        width: var(--app-header-right-width, var(--sidebar-width, 280px));
        display: flex;
        align-items: center;
        justify-content: var(--app-header-right-justify, flex-end);
        gap: var(--space-lg);
        padding-right: var(--app-header-right-padding-right, var(--space-xl));
      }

      .utility-nav {
        display: flex;
        align-items: center;
        gap: var(--app-header-utility-gap, var(--space-md));
        background: transparent;
        border: 0;
        border-radius: 0;
        padding: 0;
      }

      .utility-link {
        display: flex;
        flex-direction: var(--app-header-utility-direction, column);
        align-items: center;
        gap: var(--space-xs);
        color: var(--color-text);
        font-size: var(--app-header-utility-font-size, var(--text-xs));
        transition: color var(--transition-fast);
        text-decoration: none;
        padding: var(--app-header-utility-link-padding, 0);
        border-radius: var(--app-header-utility-link-radius, 0);
        background: var(--app-header-utility-link-bg, transparent);
      }

      .utility-link:hover {
        color: var(--color-accent);
      }

      .utility-link.active {
        color: var(--color-text);
        background: transparent;
      }

      .theme-toggle {
        border: none;
        cursor: pointer;
        font-family: inherit;
        min-width: 44px;
        justify-content: center;
        padding: var(--space-sm);
        background: transparent;
        color: var(--color-text);
      }

      .menu-toggle {
        display: none;
        align-items: center;
        justify-content: center;
        padding: var(--space-sm);
        color: var(--color-text);
        cursor: pointer;
        background: none;
        border: none;
      }

      @media (max-width: 1023px) {
        .menu-toggle {
          display: flex;
        }

        .header-left {
          width: auto;
          padding-left: var(--app-header-mobile-left-padding, var(--space-md));
        }

        .header-right {
          width: auto;
          padding-right: var(--app-header-mobile-right-padding, var(--space-md));
        }
      }
    `,
  ];

  private handleMenuToggle() {
    this.dispatchEvent(new CustomEvent('menu-toggle', {
      bubbles: true,
      composed: true,
    }));
  }

  @state() private branding: BrandingInfo = BrandingService.getBrandingSync();
  @state() private isDarkMode = ThemeService.isDarkMode();
  private unsubscribeBranding?: () => void;
  private unsubscribeTheme?: () => void;

  connectedCallback() {
    super.connectedCallback();
    BrandingService.getBranding().then((branding) => {
      this.branding = branding;
    });
    this.unsubscribeBranding = BrandingService.subscribe((branding) => {
      this.branding = branding;
    });
    this.unsubscribeTheme = ThemeService.subscribe((theme) => {
      this.isDarkMode = theme === 'dark';
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeBranding?.();
    this.unsubscribeTheme?.();
  }

  private handleThemeToggle() {
    ThemeService.toggleTheme();
  }

  private renderThemeIcon() {
    if (this.isDarkMode) {
      return svg`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            `;
    }

    return svg`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path>
          </svg>
        `;
  }

  render() {
    const tenantName = this.branding.tenantName || 'Velocity';
    const logoUrl = this.branding.logoUrl || (this.branding.logoBase64 && this.branding.logoType
      ? `data:${this.branding.logoType};base64,${this.branding.logoBase64}`
      : null);
    return html`
      <div class="header-inner">
        <div class="header-left">
          <a href="https://builderwire.com" class="home-link" title="${tenantName} Home" target="_blank">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </a>
        </div>

        <a href="/" class="logo ${this.branding.logoUrl ? 'full-logo' : ''}">
          <div class="logo-icon">
            ${logoUrl
        ? html`<img class="logo-image" src="${logoUrl}" alt="${tenantName} logo">`
        : html`⬡`}
          </div>
          <span class="logo-name">${tenantName}</span>
        </a>

        <div class="header-right">
          <nav class="utility-nav">
            <a href="/" class="utility-link active">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Account</span>
            </a>
            <button
              class="utility-link theme-toggle"
              @click=${this.handleThemeToggle}
              aria-label="${this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}"
              title="${this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}"
            >
              ${this.renderThemeIcon()}
            </button>
            <button class="menu-toggle" @click=${this.handleMenuToggle} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </nav>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-header': PvHeader;
  }
}
