import { LitElement, html, css, svg } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminAuthService } from '../services/admin-auth.service.js';
import type { User } from '../../connect/types/domain.js';
import { BrandingService } from '../../services/branding.service.js';
import { ThemeService } from '../../services/theme.service.js';

@customElement('admin-layout')
export class AdminLayout extends LitElement {
    static styles = css`
        :host {
            display: grid;
            grid-template-columns: 260px 1fr;
            height: 100vh;
            font-family: var(--font-body, 'Inter', sans-serif);
            background: var(--admin-bg, #f1f5f9);
        }

        nav {
            display: flex;
            flex-direction: column;
            background: var(--admin-sidebar-bg, #0f172a);
            border-right: 1px solid rgba(255, 255, 255, 0.05);
            color: var(--admin-sidebar-text, #94a3b8);
        }

        .logo-area {
            padding: 24px 24px;
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            font-weight: 700;
            font-size: 20px;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 10px;
            letter-spacing: -0.02em;
        }

        .logo-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--admin-accent), var(--admin-accent-hover));
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
        }

        .nav-links {
            display: flex;
            flex-direction: column;
            padding: 24px 12px;
            gap: 4px;
            flex: 1;
        }

        .nav-category {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--color-text-muted, #475569);
            font-weight: 600;
            margin: 16px 12px 8px;
        }

        .nav-links a {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            color: var(--admin-sidebar-text);
            transition: all 0.2s ease;
        }

        .nav-links a:hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
        }

        .nav-links a.active {
            background: linear-gradient(to right, rgba(99, 102, 241, 0.15), transparent);
            color: white;
            border-left: 3px solid var(--admin-accent);
        }

        .icon {
            width: 20px;
            height: 20px;
            opacity: 0.8;
        }

        .tag-soon {
            margin-left: auto;
            font-size: 10px;
            background: rgba(99, 102, 241, 0.2);
            color: var(--admin-accent);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
        }

        .sidebar-footer {
            padding: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
        }

        .avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #334155;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 14px;
        }

        .user-info {
            flex: 1;
            overflow: hidden;
        }

        .user-name {
            color: white;
            font-size: 14px;
            font-weight: 500;
        }

        .user-role {
            font-size: 12px;
            color: var(--color-text-muted, #64748b);
        }

        .btn-signout {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 8px 16px;
            background: var(--admin-signout-bg, rgba(255, 255, 255, 0.05));
            border: 1px solid var(--admin-signout-border, rgba(255, 255, 255, 0.1));
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            color: var(--admin-signout-color, #94a3b8);
            cursor: pointer;
            transition: all 150ms ease;
            font-family: var(--font-body, 'Inter', sans-serif);
        }

        .btn-signout:hover {
            background: var(--admin-signout-hover-bg, rgba(239, 68, 68, 0.1));
            border-color: var(--admin-signout-hover-border, rgba(239, 68, 68, 0.2));
            color: var(--admin-signout-hover-color, #ef4444);
        }

        .btn-theme {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            padding: 0;
            margin: 0 0 10px auto;
            background: transparent;
            border: none;
            border-radius: 0;
            color: #94a3b8;
            cursor: pointer;
            transition: all 150ms ease;
            font-family: var(--font-body, 'Inter', sans-serif);
        }

        .btn-theme:hover {
            color: #ffffff;
        }

        main {
            overflow-y: auto;
            padding: 32px 40px;
        }
    `;

    @state() private user: User | null = null;
    @state() private tenantName = '';
    @state() private isDarkMode = ThemeService.isDarkMode();
    @state() private currentPath = window.location.pathname;
    private unsubscribeTheme?: () => void;

    connectedCallback() {
        super.connectedCallback();
        this.user = AdminAuthService.getUser();
        BrandingService.getBranding().then((branding) => {
            this.tenantName = branding.tenantName;
        });
        this.unsubscribeTheme = ThemeService.subscribe((theme) => {
            this.isDarkMode = theme === 'dark';
        });
        window.addEventListener('vaadin-router-location-changed', this.handleRouteChanged as EventListener);
        window.addEventListener('popstate', this.handleRouteChanged);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribeTheme?.();
        window.removeEventListener('vaadin-router-location-changed', this.handleRouteChanged as EventListener);
        window.removeEventListener('popstate', this.handleRouteChanged);
    }

    private get userInitials(): string {
        const name = this.user?.name || 'Admin';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    private get displayRole(): string {
        switch (this.user?.role) {
            case 'tenant_owner': return 'Owner';
            case 'tenant_staff': return 'Staff';
            default: return 'Admin';
        }
    }

    private handleSignOut() {
        AdminAuthService.logout();
    }

    private handleThemeToggle() {
        ThemeService.toggleTheme();
    }

    private handleRouteChanged = () => {
        this.currentPath = window.location.pathname;
    };

    private renderThemeIcon() {
        if (this.isDarkMode) {
            return svg`
                <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            `;
        }

        return svg`
            <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path>
            </svg>
        `;
    }

    render() {
        const path = this.currentPath;
        const isActive = (p: string) => path === p || path.startsWith(p + '/');
        const tenantName = this.tenantName || 'Velocity';

        return html`
            <nav>
                <div class="logo-area">
                    <div class="logo-icon">V</div>
                    ${tenantName} Admin
                </div>
                <div class="nav-links">
                    <div class="nav-category">Overview</div>
                    <a href="/admin" class="${path === '/admin' ? 'active' : ''}">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Dashboard
                    </a>
                    
                    <div class="nav-category">Management</div>
                    <a href="/admin/accounts" class="${isActive('/admin/accounts') ? 'active' : ''}">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Accounts
                    </a>
                    <a href="/admin/users" class="${isActive('/admin/users') ? 'active' : ''}">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
                        Users
                    </a>
                    <a href="/admin/settings" class="${isActive('/admin/settings') ? 'active' : ''}">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Settings
                    </a>

                    <div class="nav-category">Extensions</div>
                    <a href="/admin/messaging" class="${isActive('/admin/messaging') ? 'active' : ''}">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Messaging
                    </a>
                    <a href="/admin/ar-center" class="${isActive('/admin/ar-center') ? 'active' : ''}">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        AR Center
                    </a>
                </div>
                <div class="sidebar-footer">
                    <div class="user-profile">
                        <div class="avatar">${this.userInitials}</div>
                        <div class="user-info">
                            <div class="user-name">${this.user?.name || 'Admin User'}</div>
                            <div class="user-role">${this.displayRole}</div>
                        </div>
                    </div>
                    <button
                        class="btn-theme"
                        @click=${this.handleThemeToggle}
                        aria-label="${this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}"
                        title="${this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}"
                    >
                        ${this.renderThemeIcon()}
                    </button>
                    <button class="btn-signout" @click=${this.handleSignOut}>
                        <svg style="width:16px;height:16px;margin-right:8px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Sign Out
                    </button>
                </div>
            </nav>
            <main>
                <slot></slot>
            </main>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-layout': AdminLayout;
    }
}
