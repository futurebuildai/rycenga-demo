import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('admin-page-ar-center')
export class PageArCenter extends LitElement {
    static styles = css`
        :host {
            display: block;
            height: 100%;
        }

        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 60vh;
            text-align: center;
            background: var(--admin-card-bg, #ffffff);
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 40px;
        }

        .icon-circle {
            width: 80px;
            height: 80px;
            background: var(--status-success-bg, #f0fdf4);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            color: var(--status-success-text, #16a34a);
        }

        h2 {
            font-family: var(--font-heading);
            font-size: 2rem;
            color: var(--color-text, #1e293b);
            margin: 0 0 16px;
        }

        p {
            color: var(--color-text-muted, #64748b);
            font-size: 1.125rem;
            max-width: 480px;
            line-height: 1.6;
            margin: 0 0 32px;
        }

        .badge {
            background: var(--color-success, #16a34a);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 24px;
        }
    `;

    render() {
        return html`
            <div class="container">
                <span class="badge">Coming Soon</span>
                <div class="icon-circle">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <h2>AR Center</h2>
                <p>Advanced Accounts Receivable management. Automate collections, track aging reports, and streamline your cash flow.</p>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-ar-center': PageArCenter;
    }
}
