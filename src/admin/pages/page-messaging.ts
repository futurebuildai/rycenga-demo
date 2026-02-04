import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('admin-page-messaging')
export class PageMessaging extends LitElement {
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
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 40px;
        }

        .icon-circle {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            color: #4f46e5;
        }

        h2 {
            font-family: var(--font-heading);
            font-size: 2rem;
            color: #1e293b;
            margin: 0 0 16px;
        }

        p {
            color: #64748b;
            font-size: 1.125rem;
            max-width: 480px;
            line-height: 1.6;
            margin: 0 0 32px;
        }

        .badge {
            background: #4f46e5;
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
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h2>Messaging Platform</h2>
                <p>A unified communication hub for your internal team and customers. Chat, notifications, and automated alerts—all in one place.</p>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-messaging': PageMessaging;
    }
}
