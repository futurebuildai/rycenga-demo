import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { initRouter } from './router.js';
import { AdminAuthService } from './services/admin-auth.service.js';
import { BrandingService } from '../services/branding.service.js';
import './layouts/admin-layout.js';
import './pages/page-login.js';
import '../components/pv-demo-welcome-modal.js';

@customElement('pv-admin-app')
export class PvAdminApp extends LitElement {
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
        this.updateTitle();
        this.unsubscribe = AdminAuthService.subscribe((authed) => {
            this.isAuthenticated = authed;
            this.updateTitle();
            if (!authed) {
                this.routerInitialized = false;
            }
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribe?.();
    }

    private async updateTitle() {
        await BrandingService.getBranding();
        document.title = BrandingService.getAdminTitle();
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
            <pv-demo-welcome-modal portalType="admin"></pv-demo-welcome-modal>
            <admin-layout>
                <div id="outlet"></div>
            </admin-layout>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'pv-admin-app': PvAdminApp;
    }
}
