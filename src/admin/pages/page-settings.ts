import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminAuthService } from '../services/admin-auth.service.js';
import { AdminDataService } from '../services/admin-data.service.js';
import { AdminBrandingService, type DealerBranding, DEFAULT_BRANDING } from '../services/admin-branding.service.js';
import '../components/logo-upload.js';

@customElement('admin-page-settings')
export class PageSettings extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        h2 {
            margin: 0 0 0.5rem;
            color: var(--color-text, #0f172a);
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
        }

        .subtitle {
            color: var(--color-text-muted, #94a3b8);
            margin-bottom: 2rem;
        }

        .settings-container {
            display: grid;
            gap: 24px;
            max-width: 800px;
        }

        .card {
            background: var(--admin-card-bg, #ffffff);
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .card-header {
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--color-border, #e2e8f0);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--color-text);
        }

        .form-group {
            margin-bottom: 16px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text-light, #64748b);
        }

        input,
        select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--color-border, #e2e8f0);
            border-radius: 6px;
            font-family: var(--font-body);
            font-size: 14px;
            color: var(--color-text);
            box-sizing: border-box;
            transition: all 0.15s ease;
            background: white;
        }

        input:focus,
        select:focus {
            outline: none;
            border-color: var(--admin-accent, #6366f1);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        input:disabled,
        select:disabled {
            background: #f8fafc;
            color: #94a3b8;
        }

        .btn-primary {
            background: var(--admin-accent, #6366f1);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: 500;
            font-family: var(--font-body);
            cursor: pointer;
            transition: background 0.15s ease;
        }

        .btn-primary:hover:not(:disabled) {
            background: var(--admin-accent-hover, #4f46e5);
        }

        .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        @media (max-width: 600px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }

        .branding-preview {
            margin-top: 16px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 6px;
            font-size: 13px;
            color: var(--color-text-muted);
        }

        .branding-preview strong {
            color: var(--color-text);
        }

        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 2000;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: toast-in 200ms ease-out;
        }
        .toast-success { background: #059669; color: white; }
        .toast-error { background: #dc2626; color: white; }
        .toast-info { background: #0f172a; color: white; }
        @keyframes toast-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    `;

    @state() private user = AdminAuthService.getUser();
    @state() private teamMembers: Array<{name: string; email: string; role: string; status: string; lastLogin: string}> = [];
    @state() private teamUnavailable = true;

    @state() private toastMessage = '';
    @state() private toastType: 'success' | 'error' | 'info' = 'info';
    private toastTimer?: ReturnType<typeof setTimeout>;

    private showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
        clearTimeout(this.toastTimer);
        this.toastMessage = message;
        this.toastType = type;
        this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 4000);
    }

    @state() private showInviteModal = false;
    @state() private inviting = false;
    @state() private inviteName = '';
    @state() private inviteEmail = '';
    @state() private inviteRole = 'TENANT_STAFF';

    // Branding state
    @state() private branding: DealerBranding = DEFAULT_BRANDING;
    @state() private brandingCompanyName = '';
    @state() private brandingContactEmail = '';
    @state() private brandingContactPhone = '';
    @state() private brandingTemplateId = 1;
    @state() private brandingSaving = false;
    @state() private logoUploading = false;
    @state() private pendingLogoFile: File | null = null;

    async connectedCallback() {
        super.connectedCallback();
        this.user = AdminAuthService.getUser();
        if (this.user) {
            this.teamMembers = [{
                name: this.user.name || this.user.email,
                email: this.user.email,
                role: this.user.role.toUpperCase().replace('_', ' '),
                status: 'Active',
                lastLogin: 'Current session',
            }];
        }

        // Load branding configuration
        await this.loadBranding();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Clear toast timer to prevent memory leaks
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }
    }

    private async loadBranding() {
        try {
            this.branding = await AdminBrandingService.getBranding();
            this.brandingCompanyName = this.branding.companyName;
            this.brandingContactEmail = this.branding.contactEmail;
            this.brandingContactPhone = this.branding.contactPhone;
            this.brandingTemplateId = this.branding.templateId || 1;
        } catch {
            // Use defaults on error
        }
    }

    private handleLogoSelected(e: CustomEvent<{ file: File }>) {
        this.pendingLogoFile = e.detail.file;
    }

    private handleLogoRemoved() {
        this.pendingLogoFile = null;
        // If there's an existing logo, mark it for deletion
        if (this.branding.logoUrl) {
            this.branding = { ...this.branding, logoUrl: null };
        }
    }

    private async saveBranding() {
        this.brandingSaving = true;

        try {
            // Upload logo if there's a pending file
            if (this.pendingLogoFile) {
                this.logoUploading = true;
                try {
                    await AdminBrandingService.uploadLogo(this.pendingLogoFile);
                    this.pendingLogoFile = null;
                } catch (e) {
                    const msg = e instanceof Error ? e.message : 'Failed to upload logo.';
                    this.showToast(msg, 'error');
                    return;
                } finally {
                    this.logoUploading = false;
                }
            }

            // Delete logo if it was removed
            if (this.branding.logoUrl === null && AdminBrandingService.getBrandingSync().logoUrl) {
                try {
                    await AdminBrandingService.deleteLogo();
                } catch (e) {
                    const msg = e instanceof Error ? e.message : 'Failed to remove logo.';
                    this.showToast(msg, 'error');
                    return;
                }
            }

            // Update branding metadata
            const updated = await AdminBrandingService.updateBranding({
                companyName: this.brandingCompanyName,
                contactEmail: this.brandingContactEmail,
                contactPhone: this.brandingContactPhone,
                templateId: this.brandingTemplateId,
            });

            this.branding = updated;
            this.showToast('Branding saved successfully', 'success');
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to save branding.';
            this.showToast(msg, 'error');
        } finally {
            this.brandingSaving = false;
        }
    }

    private handleInvite() {
        this.inviteName = '';
        this.inviteEmail = '';
        this.inviteRole = 'TENANT_STAFF';
        this.showInviteModal = true;
    }

    private closeInviteModal() {
        this.showInviteModal = false;
    }

    private async submitInvite() {
        if (!this.inviteEmail || !this.inviteName) return;

        this.inviting = true;
        try {
            await AdminDataService.inviteTeamMember(this.inviteEmail, this.inviteName, this.inviteRole);

            this.teamMembers = [
                ...this.teamMembers,
                {
                    name: this.inviteName,
                    email: this.inviteEmail,
                    role: this.inviteRole,
                    status: 'Invited',
                    lastLogin: '-'
                }
            ];

            this.showToast(`Invitation sent to ${this.inviteEmail}`, 'success');
            this.closeInviteModal();
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to send invite.';
            this.showToast(msg, 'error');
        } finally {
            this.inviting = false;
        }
    }

    render() {
        return html`
            <div style="margin-bottom: 2rem;">
                <h2>Settings</h2>
                <p class="subtitle">Manage your dealer portal branding and team.</p>
            </div>

            <div class="settings-container">
                <!-- Branding Section -->
                <div class="card">
                    <div class="card-header">
                        <h3>Branding</h3>
                    </div>

                    <div class="form-group">
                        <label>Logo</label>
                        <logo-upload
                            .logoUrl=${this.branding.logoUrl}
                            .uploading=${this.logoUploading}
                            @logo-selected=${this.handleLogoSelected}
                            @logo-removed=${this.handleLogoRemoved}
                        ></logo-upload>
                    </div>

                    <div class="form-group">
                        <label>Company Name</label>
                        <input
                            type="text"
                            placeholder="Your Company Name"
                            .value=${this.brandingCompanyName}
                            @input=${(e: Event) => this.brandingCompanyName = (e.target as HTMLInputElement).value}
                        />
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Contact Email</label>
                            <input
                                type="email"
                                placeholder="support@company.com"
                                .value=${this.brandingContactEmail}
                                @input=${(e: Event) => this.brandingContactEmail = (e.target as HTMLInputElement).value}
                            />
                        </div>

                        <div class="form-group">
                            <label>Contact Phone</label>
                            <input
                                type="tel"
                                placeholder="(555) 123-4567"
                                .value=${this.brandingContactPhone}
                                @input=${(e: Event) => this.brandingContactPhone = (e.target as HTMLInputElement).value}
                            />
                        </div>

                        <div class="form-group">
                            <label>Portal Template</label>
                            <select
                                class="form-select"
                                .value=${String(this.brandingTemplateId)}
                                @change=${(e: Event) => this.brandingTemplateId = Number((e.target as HTMLSelectElement).value)}
                            >
                                <option value="1">Template 1 (Default)</option>
                                <option value="2">Template 2 (Split Layout)</option>
                            </select>
                        </div>
                    </div>

                    <div class="branding-preview">
                        <strong>Preview:</strong> Your branding and selected template will appear on customer login pages, portal headers, and the account shell after users refresh.
                    </div>

                    <div style="margin-top: 20px;">
                        <button class="btn-primary" @click=${this.saveBranding} ?disabled=${this.brandingSaving}>
                            ${this.brandingSaving ? 'Saving...' : 'Save Branding'}
                        </button>
                    </div>
                </div>

                <!-- Team Section Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--color-text);">Team</h3>
                    <button class="btn-primary" @click=${this.handleInvite} ?disabled=${this.teamUnavailable}>
                        <svg width="16" height="16" style="margin-right: 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        Invite Member${this.teamUnavailable ? html`<span style="margin-left: 8px; font-size: 10px; background: rgba(99, 102, 241, 0.2); color: var(--admin-accent); padding: 2px 6px; border-radius: 4px; font-weight: 600;">SOON</span>` : ''}
                    </button>
                </div>
                <!-- Team Members List -->
                <div class="card">
                    <div class="card-header">
                        <h3>Team Members</h3>
                        <span style="font-size: 13px; color: var(--color-text-muted);">${this.teamMembers.length} active users</span>
                    </div>
                    
                    <div class="team-list">
                        <style>
                            .team-list { display: flex; flex-direction: column; gap: 0; }
                            .team-row { 
                                display: grid; 
                                grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr; 
                                padding: 16px 0; 
                                border-bottom: 1px solid var(--color-border, #e2e8f0);
                                align-items: center;
                                font-size: 14px;
                            }
                            .team-row:last-child { border-bottom: none; }
                            .team-header { 
                                font-weight: 600; 
                                color: var(--color-text-muted); 
                                text-transform: uppercase; 
                                font-size: 11px; 
                                letter-spacing: 0.05em;
                                padding-bottom: 8px;
                            }
                            .role-badge {
                                display: inline-flex;
                                align-items: center;
                                padding: 2px 8px;
                                border-radius: 12px;
                                font-size: 11px;
                                font-weight: 600;
                            }
                            .role-owner { background: #eff6ff; color: #1d4ed8; }
                            .role-staff { background: #f1f5f9; color: #475569; }
                            
                            .status-active { color: #15803d; font-weight: 500; display: flex; align-items: center; gap: 6px; }
                            .status-active::before { content: ''; width: 6px; height: 6px; background: currentColor; border-radius: 50%; }
                            
                            .status-invited { color: #d97706; font-weight: 500; display: flex; align-items: center; gap: 6px; }
                            .status-invited::before { content: ''; width: 6px; height: 6px; background: currentColor; border-radius: 50%; }
                            
                            .action-btn { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; border-radius: 4px; }
                            .action-btn:hover { background: #f1f5f9; color: #ef4444; }
                        </style>

                        <div class="team-row team-header">
                            <div>User</div>
                            <div>Email</div>
                            <div>Role</div>
                            <div>Status</div>
                            <div style="text-align: right">Actions</div>
                        </div>

                        ${this.teamMembers.map(member => html`
                            <div class="team-row">
                                <div style="font-weight: 500; color: var(--color-text);">${member.name}</div>
                                <div style="color: var(--color-text-light);">${member.email}</div>
                                <div>
                                    <span class="role-badge ${member.role === 'TENANT_OWNER' ? 'role-owner' : 'role-staff'}">
                                        ${member.role.replace('_', ' ')}
                                    </span>
                                </div>
                                <div>
                                    <span class="${member.status === 'Active' ? 'status-active' : 'status-invited'}">
                                        ${member.status}
                                    </span>
                                </div>
                                <div style="text-align: right">
                                    ${member.role !== 'TENANT_OWNER' ? html`
                                        <button class="action-btn" title="Remove User" aria-label="Remove ${member.name}">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `)}
                    </div>
                    ${this.teamUnavailable ? html`
                        <div style="padding: 16px; background: #f8fafc; border-radius: 6px; margin-top: 12px; font-size: 13px; color: var(--color-text-muted, #94a3b8);">
                            Full team management is coming soon. Currently showing only your account.
                        </div>
                    ` : ''}
                </div>

                <!-- Organization Info (Read Only) -->
                <div class="card" style="opacity: 0.8;">
                    <div class="card-header">
                        <h3>Organization Info</h3>
                        <span class="role-badge role-staff">Read Only</span>
                    </div>
                    <div class="form-group">
                        <label>Company Name</label>
                        <input type="text" .value=${this.user?.name || 'Organization'} disabled />
                    </div>
                    <div class="form-group">
                        <label>Account Email</label>
                        <input type="email" .value=${this.user?.email || ''} disabled />
                    </div>
                    <div class="form-group">
                        <label>Operating Region</label>
                        <input type="text" value="Not available" disabled />
                    </div>
                </div>
            </div>

            ${this.toastMessage ? html`
                <div class="toast toast-${this.toastType}" role="status" aria-live="polite">${this.toastMessage}</div>
            ` : ''}

            ${this.showInviteModal ? html`
                <div class="modal-overlay" @click=${this.closeInviteModal} role="dialog" aria-modal="true" aria-label="Invite team member">
                    <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                        <div class="modal-title">Invite Team Member</div>
                        <p style="color: var(--color-text-light); font-size: 0.875rem; margin-bottom: 1.5rem;">
                            Send an invitation to join your organization's admin portal.
                        </p>
                        
                        <div class="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Jane Doe"
                                .value=${this.inviteName}
                                @input=${(e: Event) => this.inviteName = (e.target as HTMLInputElement).value}
                            />
                        </div>

                        <div class="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                placeholder="name@company.com"
                                .value=${this.inviteEmail}
                                @input=${(e: Event) => this.inviteEmail = (e.target as HTMLInputElement).value}
                            />
                        </div>

                        <div class="form-group">
                            <label>Role</label>
                            <select 
                                class="form-select"
                                .value=${this.inviteRole}
                                @change=${(e: Event) => this.inviteRole = (e.target as HTMLSelectElement).value}
                            >
                                <option value="TENANT_STAFF">Tenant Staff (Standard)</option>
                                <option value="TENANT_OWNER">Tenant Owner (Admin)</option>
                            </select>
                        </div>

                        <div class="modal-actions">
                            <button class="btn-secondary" @click=${this.closeInviteModal}>Cancel</button>
                            <button class="btn-primary" ?disabled=${this.inviting} @click=${this.submitInvite}>
                                ${this.inviting ? 'Sending...' : 'Send Invitation'}
                            </button>
                        </div>
                    </div>
                </div>

                <style>
                    /* Modal Styles */
                    .modal-overlay {
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
                        z-index: 1000;
                    }
                    .modal {
                        background: white; padding: 2rem; border-radius: 8px; width: 400px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    .modal-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; font-family: var(--font-heading); }
                    .modal-actions { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 0.75rem; }
                    .btn-secondary { background: white; border: 1px solid #e2e8f0; color: var(--color-text); padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;}
                    .form-select {
                        width: 100%; padding: 10px 12px; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px;
                        font-family: var(--font-body); font-size: 14px; color: var(--color-text);
                        background: white;
                    }
                </style>
            ` : ''}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-settings': PageSettings;
    }
}
