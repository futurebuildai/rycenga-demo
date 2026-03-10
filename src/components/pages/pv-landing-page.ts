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
        background-color: #121212;
        color: #ffffff;
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

      .lmc-logo {
        height: 85px; /* Scaled down to match Yoders proportions */
        width: auto;
        max-width: 100%;
        filter: brightness(0) invert(1);
      }

      .title {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #f59e0b;
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
        background: #1e1e1e;
        border: 1px solid #2e2e2e;
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
        border-color: #f59e0b;
        transform: translateY(-4px);
        background: #252525;
      }

      .card-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: var(--space-md);
        color: #ffffff;
      }

      .card-description {
        font-size: 14px;
        color: #9ca3af;
        line-height: 1.6;
        margin-bottom: var(--space-xl);
        flex-grow: 1;
      }

      .card-link {
        font-size: 14px;
        font-weight: 600;
        color: #f59e0b;
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

      .qr-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: var(--space-2xl);
        padding: var(--space-xl);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02));
        border-radius: 16px;
        border: 2px solid rgba(245, 158, 11, 0.3);
        max-width: 350px;
        margin-left: auto;
        margin-right: auto;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .qr-container:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 30px -10px rgba(245, 158, 11, 0.3);
        border-color: rgba(245, 158, 11, 0.6);
      }

      .qr-image {
        width: 220px;
        height: 220px;
        border-radius: 12px;
        margin-bottom: var(--space-lg);
        background: white;
        padding: 8px;
        box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.4);
      }

      .qr-text {
        font-size: 22px;
        font-weight: 800;
        color: #121212;
        background: #f59e0b;
        padding: 10px 28px;
        border-radius: 30px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0;
        margin-top: 8px;
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
        transition: background 0.2s ease;
      }
      
      .qr-container:hover .qr-text {
        background: #fbbf24;
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
          <img src="/assets/lmc-logo-white.png" alt="LMC Logo" class="lmc-logo" />
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

        <div class="qr-container">
          <img src="/assets/lmc-demo-qr.png" alt="Book a Demo QR Code" class="qr-image" />
          <div class="qr-text">Book a Demo</div>
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
