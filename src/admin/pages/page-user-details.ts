import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { AdminDataService } from '../services/admin-data.service.js';
import type { AdminAccountAssignmentInput, AdminUser } from '../services/admin-data.service.js';
import type { UserRole } from '../../connect/types/domain.js';

interface RouterLocation {
    params: Record<string, string>;
}

@customElement('admin-page-user-details')
export class PageUserDetails extends LitElement {
    static styles = css`
        :host { display: block; }

        .back-link {
            display: inline-block;
            text-decoration: none;
            color: var(--color-text-muted, #6b7280);
            font-size: 0.875rem;
            margin-bottom: 1rem;
            transition: color 150ms ease;
        }

        .back-link:hover { color: var(--color-text, #0f172a); }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.5rem;
            gap: 1rem;
        }

        .page-header h2 {
            margin: 0 0 0.35rem;
            color: var(--color-text, #0f172a);
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
        }

        .subtitle { color: var(--color-text-muted, #64748b); }

        .card {
            background: #ffffff;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            margin-bottom: 1.5rem;
        }

        .card h3 {
            margin: 0 0 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #e5e7eb;
            color: var(--color-text, #111827);
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            font-size: 1rem;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
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

        .toggle {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.88rem;
            color: #475569;
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

        .form-actions {
            margin-top: 1rem;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .danger { color: #b91c1c; font-size: 0.88rem; }
        .success { color: #15803d; font-size: 0.88rem; }
        .muted { color: #64748b; font-size: 0.88rem; }

        .assignment-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr auto;
            gap: 0.75rem;
            align-items: end;
            padding: 0.75rem 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .assignment-row:last-child { border-bottom: none; }

        @media (max-width: 900px) {
            .form-grid { grid-template-columns: 1fr; }
            .assignment-row { grid-template-columns: 1fr; }
            .form-actions { justify-content: flex-start; }
        }
    `;

    @state() private loading = true;
    @state() private error = '';
    @state() private saving = false;
    @state() private success = '';

    @state() private userId: number | null = null;
    @state() private name = '';
    @state() private email = '';
    @state() private phone = '';
    @state() private userRole: UserRole = 'account_user';
    @state() private isActive = true;
    @state() private assignments: { accountId: string; assignmentType: string; isPrimary: boolean }[] = [];

    @property({ attribute: false }) location?: RouterLocation;

    async connectedCallback() {
        super.connectedCallback();
        await this.loadUser();
    }

    private async loadUser() {
        this.loading = true;
        this.error = '';
        this.success = '';
        const rawId = this.location?.params?.id;
        const id = rawId ? Number(rawId) : NaN;
        if (!Number.isFinite(id)) {
            this.error = 'Invalid user ID.';
            this.loading = false;
            return;
        }

        this.userId = id;

        try {
            const user = await AdminDataService.getUser(id);
            this.applyUser(user);
        } catch (e) {
            this.error = e instanceof Error ? e.message : 'Failed to load user.';
        } finally {
            this.loading = false;
        }
    }

    private applyUser(user: AdminUser) {
        this.name = user.name === '(No Name)' ? '' : user.name;
        this.email = user.email;
        this.phone = user.phone ?? '';
        this.userRole = user.role as UserRole;
        this.isActive = user.isActive;
        this.assignments = (user.accountAssignments ?? []).map((assignment) => ({
            accountId: String(assignment.accountId),
            assignmentType: assignment.assignmentType,
            isPrimary: assignment.isPrimary,
        }));
    }

    private addAssignment() {
        this.assignments = [
            ...this.assignments,
            { accountId: '', assignmentType: 'primary_sales_rep', isPrimary: this.assignments.length === 0 },
        ];
    }

    private updateAssignment(index: number, patch: Partial<{ accountId: string; assignmentType: string; isPrimary: boolean }>) {
        this.assignments = this.assignments.map((assignment, i) => {
            if (i !== index) {
                return patch.isPrimary ? { ...assignment, isPrimary: false } : assignment;
            }
            return { ...assignment, ...patch };
        });
    }

    private removeAssignment(index: number) {
        const next = this.assignments.filter((_, i) => i !== index);
        if (next.length > 0 && !next.some(a => a.isPrimary)) {
            next[0] = { ...next[0], isPrimary: true };
        }
        this.assignments = next;
    }

    private buildAssignmentsPayload(): AdminAccountAssignmentInput[] | null {
        const seen = new Set<string>();
        let primaryCount = 0;
        const payload: AdminAccountAssignmentInput[] = [];

        for (const assignment of this.assignments) {
            const parsed = Number(assignment.accountId.trim());
            if (!Number.isFinite(parsed) || parsed <= 0) {
                this.error = 'Each assignment needs a valid Account ID.';
                return null;
            }
            const key = `${parsed}:${assignment.assignmentType}`;
            if (seen.has(key)) {
                this.error = 'Duplicate assignment entries are not allowed.';
                return null;
            }
            seen.add(key);
            if (assignment.isPrimary) {
                primaryCount += 1;
            }
            payload.push({
                accountId: parsed,
                assignmentType: assignment.assignmentType,
                isPrimary: assignment.isPrimary,
            });
        }

        if (primaryCount > 1) {
            this.error = 'Only one assignment can be primary.';
            return null;
        }

        return payload;
    }

    private async saveUser() {
        if (this.saving || this.userId === null) return;
        this.error = '';
        this.success = '';

        const name = this.name.trim();
        const email = this.email.trim();
        const phone = this.phone.trim();

        if (!name || !email) {
            this.error = 'Name and email are required.';
            return;
        }

        const assignmentsPayload = this.buildAssignmentsPayload();
        if (!assignmentsPayload) return;

        this.saving = true;
        try {
            const updated = await AdminDataService.updateUser({
                id: this.userId,
                name,
                email,
                phone: phone || undefined,
                role: this.userRole,
                isActive: this.isActive,
                accountAssignments: assignmentsPayload,
            });
            this.applyUser(updated);
            this.success = 'User updated.';
        } catch (e) {
            this.error = e instanceof Error ? e.message : 'Failed to update user.';
        } finally {
            this.saving = false;
        }
    }

    render() {
        if (this.loading) {
            return html`<p class="muted">Loading user...</p>`;
        }

        return html`
            <a class="back-link" href="/admin/users">← Back to Users</a>
            <div class="page-header">
                <div>
                    <h2>User Details</h2>
                    <div class="subtitle">Manage profile info and account assignments.</div>
                </div>
                <button class="btn btn-primary" ?disabled=${this.saving} @click=${this.saveUser}>
                    ${this.saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            ${this.error ? html`<p class="danger">${this.error}</p>` : ''}
            ${this.success ? html`<p class="success">${this.success}</p>` : ''}

            <div class="card">
                <h3>Profile</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            .value=${this.name}
                            @input=${(e: Event) => this.name = (e.target as HTMLInputElement).value}
                        />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            .value=${this.email}
                            @input=${(e: Event) => this.email = (e.target as HTMLInputElement).value}
                        />
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input
                            type="tel"
                            placeholder="(555) 123-4567"
                            .value=${this.phone}
                            @input=${(e: Event) => this.phone = (e.target as HTMLInputElement).value}
                        />
                    </div>
                    <div class="form-group">
                        <label>Role</label>
                        <select
                            .value=${this.userRole}
                            @change=${(e: Event) => this.userRole = (e.target as HTMLSelectElement).value as UserRole}
                        >
                            <option value="tenant_owner">Tenant Owner</option>
                            <option value="tenant_staff">Tenant Staff</option>
                            <option value="account_admin">Account Admin</option>
                            <option value="account_manager">Account Manager</option>
                            <option value="account_user">Account User</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <div class="toggle">
                            <input
                                type="checkbox"
                                .checked=${this.isActive}
                                @change=${(e: Event) => this.isActive = (e.target as HTMLInputElement).checked}
                            />
                            <span>${this.isActive ? 'Active' : 'Disabled'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3>Account Assignments</h3>
                ${this.assignments.length === 0 ? html`
                    <p class="muted">No account assignments yet.</p>
                ` : html`
                    ${this.assignments.map((assignment, index) => html`
                        <div class="assignment-row">
                            <div class="form-group">
                                <label>Account ID</label>
                                <input
                                    type="number"
                                    min="1"
                                    .value=${assignment.accountId}
                                    @input=${(e: Event) => this.updateAssignment(index, { accountId: (e.target as HTMLInputElement).value })}
                                />
                            </div>
                            <div class="form-group">
                                <label>Assignment Type</label>
                                <select
                                    .value=${assignment.assignmentType}
                                    @change=${(e: Event) => this.updateAssignment(index, { assignmentType: (e.target as HTMLSelectElement).value })}
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
                                        @change=${(e: Event) => this.updateAssignment(index, { isPrimary: (e.target as HTMLInputElement).checked })}
                                    />
                                    <span>${assignment.isPrimary ? 'Primary' : 'Secondary'}</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <button class="btn" @click=${() => this.removeAssignment(index)}>Remove</button>
                            </div>
                        </div>
                    `)}
                `}
                <div class="form-actions">
                    <button class="btn" @click=${this.addAssignment}>Add Assignment</button>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-user-details': PageUserDetails;
    }
}
