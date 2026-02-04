import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminAuthService } from '../services/admin-auth.service.js';

@customElement('admin-page-login')
export class PageLogin extends LitElement {
    static styles = css`
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            font-family: var(--font-body, 'Inter', sans-serif);
        }

        .login-container {
            width: 100%;
            max-width: 420px;
            padding: 2rem;
        }

        .login-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 3rem 2.5rem;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.16);
        }

        .login-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-bottom: 2.5rem;
        }

        .login-logo-icon {
            font-size: 3rem;
            color: var(--color-primary, #1e293b);
            margin-bottom: 1rem;
        }

        .logo-name {
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--color-primary, #1e293b);
            letter-spacing: 0.05em;
        }

        .logo-tagline {
            font-size: 0.875rem;
            color: #94a3b8;
            margin-top: 0.25rem;
        }

        .login-error {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            padding: 1rem;
            border-radius: 6px;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #0f172a;
            margin-bottom: 0.25rem;
        }

        .input-wrap {
            position: relative;
        }

        .input-wrap svg {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            pointer-events: none;
        }

        .input-wrap input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.75rem;
            border: 2px solid #e2e8f0;
            border-radius: 6px;
            font-size: 1rem;
            font-family: var(--font-body, 'Inter', sans-serif);
            transition: border-color 150ms ease;
            box-sizing: border-box;
        }

        .input-wrap input:focus {
            outline: none;
            border-color: var(--color-accent, #f97316);
        }

        .btn-login {
            width: 100%;
            padding: 0.75rem 2rem;
            background: var(--color-accent, #f97316);
            color: #ffffff;
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            font-size: 1rem;
            font-weight: 700;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 200ms ease;
            margin-top: 0.5rem;
        }

        .btn-login:hover:not(:disabled) {
            background: var(--color-accent-dark, #ea580c);
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }

        .btn-login:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
    `;

    @state() private email = '';
    @state() private password = '';
    @state() private errorMessage = '';
    @state() private isLoading = false;

    connectedCallback() {
        super.connectedCallback();
        document.title = 'Dealer Portal | Lumber Boss';
    }

    private async handleSubmit(e: Event) {
        e.preventDefault();
        this.errorMessage = '';
        this.isLoading = true;

        try {
            const result = await AdminAuthService.login(this.email, this.password);

            if (result.success) {
                // Auth state change triggers re-render via AdminAuthService subscription
            } else {
                this.errorMessage = result.reason ?? 'Login failed.';
            }
        } catch {
            this.errorMessage = 'An unexpected error occurred.';
        } finally {
            this.isLoading = false;
        }
    }

    render() {
        return html`
            <div class="login-container">
                <div class="login-card">
                    <div class="login-header">
                        <div class="login-logo-icon">⬡</div>
                        <span class="logo-name">LUMBER BOSS ADMIN</span>
                        <span class="logo-tagline">Dealer Portal Access</span>
                    </div>

                    <form @submit=${this.handleSubmit}>
                        ${this.errorMessage ? html`
                            <div class="login-error">${this.errorMessage}</div>
                        ` : ''}

                        <div class="form-group">
                            <label for="admin-email">Email Address</label>
                            <div class="input-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <input
                                    type="email"
                                    id="admin-email"
                                    placeholder="admin@company.com"
                                    required
                                    .value=${this.email}
                                    @input=${(e: Event) => { this.email = (e.target as HTMLInputElement).value; }}
                                >
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="admin-password">Password</label>
                            <div class="input-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <input
                                    type="password"
                                    id="admin-password"
                                    placeholder="••••••••"
                                    required
                                    .value=${this.password}
                                    @input=${(e: Event) => { this.password = (e.target as HTMLInputElement).value; }}
                                >
                            </div>
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
        'admin-page-login': PageLogin;
    }
}
