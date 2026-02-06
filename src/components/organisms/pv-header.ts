/**
 * PvHeader - Main header component
 * Displays logo and utility navigation
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { BrandingService, type BrandingInfo } from '../../services/branding.service.js';

@customElement('pv-header')
export class PvHeader extends PvBase {
    static styles = [
        ...PvBase.styles,
        css`
      :host {
        display: block;
        height: var(--header-height, 80px);
        background: white;
        border-bottom: 1px solid var(--color-border);
        position: sticky;
        top: var(--impersonation-banner-height, 0px);
        z-index: 1000;
      }

      .header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 0;
      }

      .header-left {
        width: var(--sidebar-width, 280px);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .home-link {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-light);
        transition: color var(--transition-fast);
      }

      .home-link:hover {
        color: var(--color-accent);
      }

      .logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 4px;
        flex: 1;
        text-decoration: none;
      }

      .logo-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: color-mix(in srgb, var(--color-primary) 12%, transparent);
        color: var(--color-primary);
        display: grid;
        place-items: center;
        font-size: 1.25rem;
        line-height: 1;
      }

      .logo-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      .logo-name {
        font-family: var(--font-heading);
        font-size: 1.125rem;
        font-weight: 800;
        color: var(--color-primary);
        letter-spacing: 0.05em;
        line-height: 1;
      }

      .header-right {
        width: var(--sidebar-width, 280px);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--space-lg);
        padding-right: var(--space-xl);
      }

      .utility-nav {
        display: flex;
        align-items: center;
        gap: var(--space-md);
      }

      .utility-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs);
        color: var(--color-text);
        font-size: var(--text-xs);
        transition: color var(--transition-fast);
        text-decoration: none;
      }

      .utility-link:hover {
        color: var(--color-accent);
      }

      .utility-link.active {
        color: var(--color-accent);
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
          padding-left: var(--space-md);
        }

        .header-right {
          width: auto;
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
    private unsubscribeBranding?: () => void;

    connectedCallback() {
        super.connectedCallback();
        BrandingService.getBranding().then((branding) => {
            this.branding = branding;
        });
        this.unsubscribeBranding = BrandingService.subscribe((branding) => {
            this.branding = branding;
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribeBranding?.();
    }

    render() {
        const tenantName = this.branding.tenantName || 'Velocity';
        const logoUrl = this.branding.logoBase64 && this.branding.logoType
            ? `data:${this.branding.logoType};base64,${this.branding.logoBase64}`
            : null;
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

        <a href="/" class="logo">
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
