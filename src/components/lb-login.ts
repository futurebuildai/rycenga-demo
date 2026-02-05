/**
 * LbLogin - Login screen component
 * Uses BrandingService for dynamic dealer branding with email/password authentication
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from './lb-base.js';
import { AuthService } from '../services/auth.service.js';
import { LbToast } from './atoms/lb-toast.js';
import { BrandingService, type DealerBranding } from '../services/branding.service.js';

@customElement('lb-login')
export class LbLogin extends LbBase {
  static styles = [
    ...LbBase.styles,
    css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      }

      .login-container {
        width: 100%;
        max-width: 420px;
        padding: var(--space-xl);
      }

      .login-card {
        background: white;
        border-radius: var(--radius-xl);
        padding: var(--space-2xl);
        box-shadow: var(--shadow-xl);
      }

      .login-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: var(--space-2xl);
      }

      .login-logo-icon {
        font-size: 3rem;
        color: var(--color-primary);
        margin-bottom: var(--space-md);
      }

      .logo-name-main {
        font-family: var(--font-heading);
        font-size: var(--text-xl);
        font-weight: 800;
        color: var(--color-primary);
        letter-spacing: 0.05em;
        display: block;
      }

      .logo-tagline-lite {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        margin-top: var(--space-xs);
        display: block;
      }

      .logo-image {
        max-height: 60px;
        max-width: 220px;
        object-fit: contain;
        margin-bottom: var(--space-md);
      }

      .login-error {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        padding: var(--space-md);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        margin-bottom: var(--space-lg);
        text-align: center;
      }

      .form-group {
        margin-bottom: var(--space-lg);
      }

      .form-group label {
        display: block;
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--color-text);
        margin-bottom: var(--space-xs);
      }

      .input-with-icon {
        position: relative;
      }

      .input-with-icon svg {
        position: absolute;
        left: var(--space-md);
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-muted);
        pointer-events: none;
      }

      .input-with-icon input {
        width: 100%;
        padding: var(--space-md);
        padding-left: calc(var(--space-md) * 2 + 18px);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-md);
        font-size: var(--text-base);
        transition: border-color var(--transition-fast);
      }

      .input-with-icon input:focus {
        outline: none;
        border-color: var(--color-accent);
      }

      .form-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-lg);
        font-size: var(--text-sm);
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        cursor: pointer;
        color: var(--color-text-light);
      }

      .forgot-password {
        color: var(--color-accent);
        font-weight: 500;
      }

      .forgot-password:hover {
        text-decoration: underline;
      }

      .btn-login {
        width: 100%;
        padding: var(--space-md) var(--space-xl);
        background: var(--color-accent);
        color: white;
        font-family: var(--font-heading);
        font-size: var(--text-base);
        font-weight: 700;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-base);
      }

      .btn-login:hover {
        background: var(--color-cta-hover);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

    `,
  ];

  @state() private email = '';
  @state() private password = '';
  @state() private showError = false;
  @state() private isLoading = false;
  @state() private branding: DealerBranding = BrandingService.getBrandingSync();

  async connectedCallback() {
    super.connectedCallback();
    // Fetch branding for login page (public endpoint, no auth needed)
    this.branding = await BrandingService.getBranding();
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    this.showError = false;
    this.isLoading = true;

    try {
      const success = await AuthService.login(this.email, this.password);

      if (success) {
        LbToast.show('Welcome back!', 'success');
        this.dispatchEvent(new CustomEvent('login-success', {
          bubbles: true,
          composed: true
        }));
      } else {
        this.showError = true;
      }
    } catch (e) {
      this.showError = true;
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    return html`
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            ${this.branding.logoUrl
              ? html`<img class="logo-image" src=${this.branding.logoUrl} alt=${this.branding.companyName} />`
              : html`<div class="login-logo-icon">⬡</div>`}
            <div class="login-logo-text">
              <span class="logo-name-main">${this.branding.companyName.toUpperCase()}</span>
              <span class="logo-tagline-lite">My Account Portal</span>
            </div>
          </div>

          <form @submit=${this.handleSubmit}>
            ${this.showError ? html`
              <div class="login-error">
                Invalid email or password. Please try again.
              </div>
            ` : ''}

            <div class="form-group">
              <label for="login-email">Email Address</label>
              <div class="input-with-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input 
                  type="email" 
                  id="login-email" 
                  placeholder="name@company.com" 
                  required
                  .value=${this.email}
                  @input=${(e: Event) => this.email = (e.target as HTMLInputElement).value}
                >
              </div>
            </div>

            <div class="form-group">
              <label for="login-password">Password</label>
              <div class="input-with-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                  type="password" 
                  id="login-password" 
                  placeholder="••••••••" 
                  required
                  .value=${this.password}
                  @input=${(e: Event) => this.password = (e.target as HTMLInputElement).value}
                >
              </div>
            </div>

            <div class="form-footer">
              <label class="checkbox-label">
                <input type="checkbox" id="login-remember">
                <span>Remember me</span>
              </label>
              <a href="#" class="forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" class="btn-login" ?disabled=${this.isLoading}>
              ${this.isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-login': LbLogin;
  }
}
