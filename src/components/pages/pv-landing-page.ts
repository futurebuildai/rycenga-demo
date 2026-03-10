/**
 * PvLandingPage - Branded entry point for portal demos
 */

import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { RouterService } from '../../services/router.service.js';

@customElement('pv-landing-page')
export class PvLandingPage extends PvBase {
  static styles = [
    ...PvBase.styles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        width: 100%;
        background-color: #f1f5f9;
        color: #1e293b;
        font-family: 'Inter', sans-serif;
        box-sizing: border-box;
      }

      .landing-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 1000px;
        width: 100%;
        margin: 0 auto;
        text-align: center;
        animation: fadeIn 0.8s ease-out;
        padding-top: 15vh;
        padding-bottom: 4rem;
        padding-left: 2rem;
        padding-right: 2rem;
        box-sizing: border-box;
        flex: 1;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .logo-container {
        margin-bottom: var(--space-2xl);
        display: flex;
        justify-content: center;
      }

      .rycenga-logo {
        height: 180px;
        width: auto;
        max-width: 100%;
      }

      .title {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--color-accent);
        margin-bottom: var(--space-3xl);
        text-transform: uppercase;
      }

      .portal-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: var(--space-2xl);
        margin-bottom: var(--space-3xl);
      }

      .portal-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: var(--space-2xl);
        text-align: left;
        transition: all 0.3s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .portal-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-4px);
        background: #f8fafc;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }

      .card-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: var(--space-md);
        color: #0f172a;
      }

      .card-description {
        font-size: 14px;
        color: #475569;
        line-height: 1.6;
        margin-bottom: var(--space-xl);
        flex-grow: 1;
      }

      .card-link {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-accent);
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
      }

      .footer {
        font-size: 12px;
        color: #4b5563;
        margin-top: var(--space-2xl);
      }

      .footer a {
        color: #dc2626; /* BuilderWire red */
        font-weight: 600;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }


      @media (max-width: 640px) {
        .portal-cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ];

  private navigateToPortal() {
    sessionStorage.removeItem('demo_modal_dismissed_customer');
    RouterService.navigate('overview');
  }

  private navigateToAdmin() {
    sessionStorage.removeItem('demo_modal_dismissed_admin');
    window.location.assign('/admin');
  }

  render() {
    return html`
      <div class="landing-container">
        <div class="logo-container">
          <img src="/assets/rycenga-logo.png" alt="Rycenga Building Center Logo" class="rycenga-logo" />
        </div>

        <h1 class="title">VELOCITY DEMO</h1>

        <div class="portal-cards">
          <div class="portal-card" @click=${this.navigateToPortal}>
            <div>
              <h2 class="card-title">Customer Portal</h2>
              <p class="card-description">
                Account overview dashboard, billing and invoice payments, saved payment methods, 
                quote conversion, AI-powered Quick Quoting, document management and sharing, team management, and account settings.
              </p>
            </div>
            <div class="card-link">
              Enter Portal <span>&rarr;</span>
            </div>
          </div>

          <div class="portal-card" @click=${this.navigateToAdmin}>
            <div>
              <h2 class="card-title">Admin / AR Center</h2>
              <p class="card-description">
                Admin dashboard, account and user management, document management and sharing, invoice/order/quote details, 
                messaging, and the AR Center with payment requests and automations.
              </p>
            </div>
            <div class="card-link">
              Enter Admin <span>&rarr;</span>
            </div>
          </div>
        </div>


        <div class="footer">
          Powered by <a href="https://builderwire.com" target="_blank" rel="noopener noreferrer">BuilderWire</a>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-landing-page': PvLandingPage;
  }
}
