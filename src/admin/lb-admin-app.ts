import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { initRouter } from './router.js';
import { AdminAuthService } from './services/admin-auth.service.js';
import './layouts/admin-layout.js';
import './pages/page-login.js';

@customElement('lb-admin-app')
export class LbAdminApp extends LitElement {
    static styles = css`
        :host {
            display: block;
            height: 100vh;
        }
    `;

    @state() private isAuthenticated = false;

    private unsubscribe?: () => void;
    private routerInitialized = false;

    connectedCallback() {
        super.connectedCallback();
        this.isAuthenticated = AdminAuthService.isAuthenticated();
        this.unsubscribe = AdminAuthService.subscribe((authed) => {
            this.isAuthenticated = authed;
            if (!authed) {
                this.routerInitialized = false;
            }
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribe?.();
    }

    protected updated() {
        if (this.isAuthenticated && !this.routerInitialized) {
            const outlet = this.renderRoot.querySelector<HTMLDivElement>('#outlet');
            if (outlet) {
                initRouter(outlet);
                this.routerInitialized = true;
            }
        }
    }

    render() {
        if (!this.isAuthenticated) {
            return html`<admin-page-login></admin-page-login>`;
        }

        return html`
            <admin-layout>
                <div id="outlet"></div>
            </admin-layout>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'lb-admin-app': LbAdminApp;
    }
}
