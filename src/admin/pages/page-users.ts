import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminDataService } from '../services/admin-data.service.js';
import { AdminAuthService } from '../services/admin-auth.service.js';
import type { AdminUser } from '../services/admin-data.service.js';
import type { UserRole } from '../../connect/types/domain.js';

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
        .success { color: #15803d; font-size: 0.88rem; }
        .muted { color: #64748b; font-size: 0.88rem; }
        .card {
            background: #fff;
            border-radius: 10px;
            padding: 0.8rem 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            margin-bottom: 1.25rem;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        .card-header h3 {
            margin: 0;
            font-size: 1rem;
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            color: var(--color-text, #0f172a);
        }
        .form-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
        }
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            font-size: 0.9rem;
            color: var(--color-text, #0f172a);
        }
        .form-group label {
            font-weight: 600;
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #475569;
        }
        .form-group input,
        .form-group select {
            padding: 0.55rem 0.75rem;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 0.9rem;
            background: #fff;
        }
        .form-actions {
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        .toggle {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.88rem;
            color: #475569;
        }
        .pill {
            background: #eef2ff;
            color: #4338ca;
            border-radius: 999px;
            padding: 0.15rem 0.6rem;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        .link {
            color: #0f172a;
            text-decoration: none;
        }
        .link:hover { text-decoration: underline; }
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
        }
        .modal {
            background: #fff;
            border-radius: 12px;
            width: min(720px, 100%);
            padding: 1.5rem;
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
        }
        .modal-title {
            margin: 0 0 0.4rem 0;
            font-size: 1.1rem;
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            color: var(--color-text, #0f172a);
        }
        .modal-subtitle {
            margin: 0 0 1.2rem 0;
            color: var(--color-text-muted, #64748b);
            font-size: 0.9rem;
        }
        .modal-actions {
            margin-top: 1.25rem;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        .btn-secondary {
            background: #fff;
            border: 1px solid #cbd5e1;
            color: #0f172a;
            padding: 0.45rem 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.88rem;
            font-weight: 600;
        }
        @media (max-width: 900px) {
            .form-grid { grid-template-columns: 1fr; }
            .card-header { align-items: flex-start; flex-direction: column; }
        }
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

    @state() private createName = '';
    @state() private createEmail = '';
    @state() private createRole: UserRole = 'account_user';
    @state() private createPassword = '';
    @state() private createActive = true;
    @state() private createLoading = false;
    @state() private createError = '';
    @state() private createSuccess = '';
    @state() private showCreateModal = false;
    @state() private createAssignments: { accountId: string; assignmentType: string; isPrimary: boolean }[] = [];

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

    private openCreateModal() {
        this.createError = '';
        this.createSuccess = '';
        this.showCreateModal = true;
    }

    private closeCreateModal() {
        if (this.createLoading) return;
        this.showCreateModal = false;
    }

    private addCreateAssignment() {
        this.createAssignments = [
            ...this.createAssignments,
            { accountId: '', assignmentType: 'primary_sales_rep', isPrimary: this.createAssignments.length === 0 }
        ];
    }

    private updateCreateAssignment(index: number, patch: Partial<{ accountId: string; assignmentType: string; isPrimary: boolean }>) {
        this.createAssignments = this.createAssignments.map((assignment, i) => {
            if (i !== index) {
                return patch.isPrimary ? { ...assignment, isPrimary: false } : assignment;
            }
            return { ...assignment, ...patch };
        });
    }

    private removeCreateAssignment(index: number) {
        const next = this.createAssignments.filter((_, i) => i !== index);
        if (next.length > 0 && !next.some(a => a.isPrimary)) {
            next[0] = { ...next[0], isPrimary: true };
        }
        this.createAssignments = next;
    }

    private async submitCreateUser() {
        if (this.createLoading) return;
        this.createError = '';
        this.createSuccess = '';

        const name = this.createName.trim();
        const email = this.createEmail.trim();
        const password = this.createPassword.trim();
        const assignmentsPayload = [];

        if (!name || !email || !password) {
            this.createError = 'Name, email, and temporary password are required.';
            return;
        }
        for (const assignment of this.createAssignments) {
            const parsed = Number(assignment.accountId.trim());
            if (!Number.isFinite(parsed) || parsed <= 0) {
                this.createError = 'Each account assignment needs a valid Account ID.';
                return;
            }
            assignmentsPayload.push({
                accountId: parsed,
                assignmentType: assignment.assignmentType,
                isPrimary: assignment.isPrimary,
            });
        }

        this.createLoading = true;
        try {
            const created = await AdminDataService.createUser({
                name,
                email,
                password,
                role: this.createRole,
                isActive: this.createActive,
                accountAssignments: assignmentsPayload,
            });

            this.createSuccess = `Created ${created.email}.`;
            this.createName = '';
            this.createEmail = '';
            this.createPassword = '';
            this.createRole = 'account_user';
            this.createActive = true;
            this.createAssignments = [];
            await this.loadUsers();
            this.showCreateModal = false;
        } catch (e) {
            this.createError = e instanceof Error ? e.message : 'Failed to create user.';
        } finally {
            this.createLoading = false;
        }
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

            <div class="card">
                <div class="card-header">
                    <div>
                        <h3>Admin Actions</h3>
                        <div class="subtitle">Add a new user or manage existing users.</div>
                    </div>
                    <button class="btn btn-primary" @click=${this.openCreateModal}>
                        Create User
                    </button>
                </div>
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
                                        <a class="link" href="/admin/users/${user.id}">
                                            ${user.name}
                                        </a>
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

            ${this.showCreateModal ? html`
                <div class="modal-overlay" @click=${this.closeCreateModal} role="dialog" aria-modal="true" aria-label="Create user">
                    <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                            <div>
                                <h3 class="modal-title">Create User</h3>
                                <p class="modal-subtitle">Add a new user and optionally assign them to an account.</p>
                            </div>
                            <span class="pill">Admin Only</span>
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Jane Doe"
                                    .value=${this.createName}
                                    @input=${(e: Event) => this.createName = (e.target as HTMLInputElement).value}
                                />
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="jane@company.com"
                                    .value=${this.createEmail}
                                    @input=${(e: Event) => this.createEmail = (e.target as HTMLInputElement).value}
                                />
                            </div>
                            <div class="form-group">
                                <label>Role</label>
                                <select
                                    .value=${this.createRole}
                                    @change=${(e: Event) => this.createRole = (e.target as HTMLSelectElement).value}
                                >
                                    <option value="tenant_owner">Tenant Owner</option>
                                    <option value="tenant_staff">Tenant Staff</option>
                                    <option value="account_admin">Account Admin</option>
                                    <option value="account_manager">Account Manager</option>
                                    <option value="account_user">Account User</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Temporary Password</label>
                                <input
                                    type="password"
                                    placeholder="Set a temporary password"
                                    .value=${this.createPassword}
                                    @input=${(e: Event) => this.createPassword = (e.target as HTMLInputElement).value}
                                />
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <div class="toggle">
                                    <input
                                        type="checkbox"
                                        .checked=${this.createActive}
                                        @change=${(e: Event) => this.createActive = (e.target as HTMLInputElement).checked}
                                    />
                                    <span>${this.createActive ? 'Active' : 'Disabled'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button class="btn" @click=${this.addCreateAssignment}>Add Account Assignment</button>
                        </div>
                        ${this.createAssignments.length > 0 ? html`
                            <div style="margin-top: 0.75rem;">
                                ${this.createAssignments.map((assignment, index) => html`
                                    <div class="form-grid" style="align-items: end;">
                                        <div class="form-group">
                                            <label>Account ID</label>
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="1234"
                                                .value=${assignment.accountId}
                                                @input=${(e: Event) => this.updateCreateAssignment(index, { accountId: (e.target as HTMLInputElement).value })}
                                            />
                                        </div>
                                        <div class="form-group">
                                            <label>Assignment Type</label>
                                            <select
                                                .value=${assignment.assignmentType}
                                                @change=${(e: Event) => this.updateCreateAssignment(index, { assignmentType: (e.target as HTMLSelectElement).value })}
                                            >
                                                <option value="primary_sales_rep">Primary Sales Rep</option>
                                                <option value="inside_sales_rep">Inside Sales Rep</option>
                                                <option value="credit_manager">Credit Manager</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Primary</label>
                                            <div class="toggle">
                                                <input
                                                    type="checkbox"
                                                    .checked=${assignment.isPrimary}
                                                    @change=${(e: Event) => this.updateCreateAssignment(index, { isPrimary: (e.target as HTMLInputElement).checked })}
                                                />
                                                <span>${assignment.isPrimary ? 'Primary' : 'Secondary'}</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <button class="btn" @click=${() => this.removeCreateAssignment(index)}>Remove</button>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        ` : ''}
                        ${this.createError ? html`<p class="danger">${this.createError}</p>` : ''}
                        ${this.createSuccess ? html`<p class="success">${this.createSuccess}</p>` : ''}
                        <div class="form-actions">
                            <span class="muted">Passwords can be updated after the first login.</span>
                        </div>
                        <div class="modal-actions">
                            <button class="btn-secondary" @click=${this.closeCreateModal}>Cancel</button>
                            <button class="btn btn-primary" ?disabled=${this.createLoading} @click=${this.submitCreateUser}>
                                ${this.createLoading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </div>
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
