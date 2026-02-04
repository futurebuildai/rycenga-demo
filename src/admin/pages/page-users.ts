import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminDataService } from '../services/admin-data.service.js';
import { AdminAuthService } from '../services/admin-auth.service.js';
import type { AdminUser } from '../services/admin-data.service.js';

@customElement('admin-page-users')
export class PageUsers extends LitElement {
    static styles = css`
        :host { display: block; }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            gap: 1rem;
        }
        .header h2 {
            margin: 0;
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            color: var(--color-text, #0f172a);
        }
        .subtitle {
            margin-top: 4px;
            color: var(--color-text-muted, #64748b);
        }
        .search-input {
            padding: 0.55rem 0.8rem;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            min-width: 280px;
            font-size: 0.9rem;
        }
        .btn {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            background: #fff;
            color: #0f172a;
            padding: 0.45rem 0.75rem;
            cursor: pointer;
            font-size: 0.88rem;
            font-weight: 600;
        }
        .btn:hover:not(:disabled) { background: #f1f5f9; }
        .btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-primary {
            background: #0f172a;
            border-color: #0f172a;
            color: #fff;
        }
        .btn-primary:hover:not(:disabled) { background: #1e293b; }
        .danger { color: #b91c1c; font-size: 0.88rem; }
        .muted { color: #64748b; font-size: 0.88rem; }
        table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        th, td {
            text-align: left;
            padding: 0.9rem;
            border-bottom: 1px solid #e2e8f0;
        }
        th {
            background: #f8fafc;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            font-size: 0.78rem;
            color: #475569;
        }
        .mono {
            font-size: 0.78rem;
            color: #64748b;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        .badge {
            border-radius: 9999px;
            padding: 0.2rem 0.55rem;
            font-size: 0.72rem;
            font-weight: 700;
            display: inline-block;
        }
        .badge-on { background: #dcfce7; color: #166534; }
        .badge-off { background: #fee2e2; color: #991b1b; }
        .pager {
            margin-top: 0.85rem;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 0.6rem;
        }
    `;

    @state() private users: AdminUser[] = [];
    @state() private totalCount = 0;
    @state() private loading = true;
    @state() private error = '';
    @state() private page = 1;
    @state() private pageSize = 25;
    @state() private search = '';

    @state() private selectedUserID: number | null = null;
    @state() private impersonationError = '';
    @state() private impersonationLoading = false;

    async connectedCallback() {
        super.connectedCallback();
        await this.loadUsers();
    }

    private async loadUsers() {
        this.loading = true;
        this.error = '';
        try {
            const offset = (this.page - 1) * this.pageSize;
            const response = await AdminDataService.getUsers(this.pageSize, offset, this.search);
            this.users = response.items;
            this.totalCount = response.total;
        } catch {
            this.error = 'Failed to load users.';
        } finally {
            this.loading = false;
        }
    }

    private async onSearch(e: Event) {
        this.search = (e.target as HTMLInputElement).value;
        this.page = 1;
        await this.loadUsers();
    }

    private async startImpersonation(user: AdminUser) {
        this.selectedUserID = user.id;
        this.impersonationLoading = true;
        this.impersonationError = '';
        const result = await AdminAuthService.startImpersonation(user.id, user.email);
        this.impersonationLoading = false;
        if (!result.success) {
            this.impersonationError = result.reason || 'Failed to start impersonation.';
            return;
        }
        window.location.assign('/');
    }

    private async changePage(newPage: number) {
        const maxPage = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
        if (newPage < 1 || newPage > maxPage) return;
        this.page = newPage;
        await this.loadUsers();
    }

    render() {
        const maxPage = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
        return html`
            <div class="header">
                <div>
                    <h2>Users</h2>
                    <div class="subtitle">Search tenant users and start impersonation.</div>
                </div>
                <input
                    type="text"
                    class="search-input"
                    placeholder="Search by name or email..."
                    .value=${this.search}
                    @input=${this.onSearch}
                />
            </div>

            ${this.impersonationError ? html`<p class="danger">${this.impersonationError}</p>` : ''}

            ${this.loading ? html`<p>Loading users...</p>` : ''}
            ${this.error ? html`<p class="danger">${this.error}</p>` : ''}

            ${!this.loading && !this.error ? html`
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Primary Account</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.users.length === 0
                            ? html`<tr><td colspan="6">No users found.</td></tr>`
                            : this.users.map((user) => html`
                                <tr>
                                    <td>
                                        <div>${user.name}</div>
                                        <div class="mono">ID: ${user.id}</div>
                                    </td>
                                    <td>${user.email}</td>
                                    <td>${user.role}</td>
                                    <td>${user.accountId ?? '-'}</td>
                                    <td>
                                        <span class="badge ${user.isActive ? 'badge-on' : 'badge-off'}">
                                            ${user.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-primary" ?disabled=${this.impersonationLoading && this.selectedUserID === user.id} @click=${() => this.startImpersonation(user)}>
                                            ${this.impersonationLoading && this.selectedUserID === user.id ? 'Starting...' : 'Impersonate'}
                                        </button>
                                    </td>
                                </tr>
                            `)}
                    </tbody>
                </table>
                <div class="pager">
                    <button class="btn" ?disabled=${this.page <= 1} @click=${() => this.changePage(this.page - 1)}>Previous</button>
                    <span class="muted">Page ${this.page} of ${maxPage}</span>
                    <button class="btn" ?disabled=${this.page >= maxPage} @click=${() => this.changePage(this.page + 1)}>Next</button>
                </div>
            ` : ''}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-users': PageUsers;
    }
}
