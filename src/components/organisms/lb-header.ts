/**
 * LbHeader - Main header component
 * Displays logo, location selector, and utility navigation
 */

import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';

@customElement('lb-header')
export class LbHeader extends LbBase {
    static styles = [
        ...LbBase.styles,
        css`
      :host {
        display: block;
        height: var(--header-height, 80px);
        background: white;
        border-bottom: 1px solid var(--color-border);
        position: sticky;
        top: 0;
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
        font-size: 1.25rem;
        line-height: 1;
        color: var(--color-primary);
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

      .location-selector {
        position: relative;
      }

      .location-selector-trigger {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-xs) var(--space-md);
        background: var(--color-bg-alt);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-size: var(--text-sm);
        font-weight: 500;
      }

      .location-selector-trigger:hover {
        background: white;
        box-shadow: var(--shadow-sm);
        border-color: var(--color-accent-light);
      }

      .current-location {
        color: var(--color-primary);
      }

      .location-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 200px;
        background: white;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        padding: var(--space-xs);
        list-style: none;
        z-index: 1001;
        display: none;
      }

      .location-dropdown.active {
        display: block;
        animation: fadeIn 0.15s ease-out;
      }

      .location-option {
        padding: var(--space-sm) var(--space-md);
        cursor: pointer;
        border-radius: var(--radius-sm);
        color: var(--color-text);
        transition: background-color var(--transition-fast);
      }

      .location-option:hover {
        background-color: var(--color-bg-alt);
        color: var(--color-primary);
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

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    ];

    @property({ type: String }) currentLocation = 'Oakdale, TX';
    @state() private dropdownOpen = false;

    private locations = [
        'Oakdale, TX',
        'Austin, TX',
        'Dallas, TX',
        'Houston, TX',
    ];

    private toggleDropdown(e: Event) {
        e.stopPropagation();
        this.dropdownOpen = !this.dropdownOpen;
    }

    private selectLocation(location: string) {
        this.currentLocation = location;
        this.dropdownOpen = false;
        this.dispatchEvent(new CustomEvent('location-changed', {
            detail: { location },
            bubbles: true,
            composed: true,
        }));
    }

    private handleMenuToggle() {
        this.dispatchEvent(new CustomEvent('menu-toggle', {
            bubbles: true,
            composed: true,
        }));
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('click', this.closeDropdown);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('click', this.closeDropdown);
    }

    private closeDropdown = () => {
        if (this.dropdownOpen) {
            this.dropdownOpen = false;
        }
    };

    render() {
        return html`
      <div class="header-inner">
        <div class="header-left">
          <a href="https://builderwire.com" class="home-link" title="Boss Home Site" target="_blank">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </a>
        </div>

        <a href="/" class="logo">
          <div class="logo-icon">⬡</div>
          <span class="logo-name">BOSS LUMBER & MILLWORK</span>
        </a>

        <div class="header-right">
          <div class="location-selector">
            <div class="location-selector-trigger" @click=${this.toggleDropdown}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span class="current-location">${this.currentLocation}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <ul class="location-dropdown ${this.dropdownOpen ? 'active' : ''}">
              ${this.locations.map(loc => html`
                <li class="location-option" @click=${() => this.selectLocation(loc)}>${loc}</li>
              `)}
            </ul>
          </div>

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
        'lb-header': LbHeader;
    }
}
