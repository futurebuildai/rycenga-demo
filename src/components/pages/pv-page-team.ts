/**
 * PvPageTeam - Team management page component
 * Displays team members with roles
 */

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { AuthService } from '../../services/auth.service.js';
import { MembersService } from '../../connect/services/members.js';
import { PvToast } from '../atoms/pv-toast.js';
import { pageShellStyles } from '../../styles/shared.js';
import { teamPageStyles } from '../../styles/pages.js';
import type { TeamMember, TeamMemberRole, InviteMemberPayload, UserRole } from '../../connect/types/domain.js';
import '../atoms/pv-page-tour-modal.js';

@customElement('pv-page-team')
export class PvPageTeam extends PvBase {
  static styles = [
    ...PvBase.styles,
    pageShellStyles,
    teamPageStyles,
  ];

  @state() private teamMembers: TeamMember[] = [];
  @state() private loading = true;
  @state() private inviting = false;
  @state() private showInviteModal = false;
  @state() private inviteEmail = '';
  @state() private inviteRole: TeamMemberRole = 'viewer';
  @state() private currentUserRole: UserRole | null = null;

  private getAccountId(): number {
    return DataService.getCurrentAccountId() || 1;
  }

  async connectedCallback() {
    super.connectedCallback();
    try {
      this.currentUserRole = AuthService.getUser()?.role ?? null;
      const members = await MembersService.getMembers(this.getAccountId());
      this.teamMembers = members.map(m => ({
        ...m,
        initials: m.initials || this.getInitials(m.name, m.email),
      }));
    } catch (e) {
      console.error('Failed to load team data', e);
      PvToast.show('Failed to load team', 'error');
    } finally {
      this.loading = false;
    }
  }

  private getRoleClass(role: string): string {
    if (role.toLowerCase() === 'owner') return 'owner';
    return '';
  }

  private getInitials(name: string, email: string): string {
    const source = (name || '').trim() || email.split('@')[0] || '';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  }

  private handleInvite() {
    if (!this.canManageTeam()) {
      PvToast.show('Only owners can manage team members', 'warning');
      return;
    }
    this.showInviteModal = true;
  }

  private closeInviteModal() {
    if (this.inviting) return;
    this.showInviteModal = false;
    this.inviteEmail = '';
    this.inviteRole = 'viewer';
  }

  private handleInviteOverlayClick(e: Event) {
    if (e.target === e.currentTarget) {
      this.closeInviteModal();
    }
  }

  private handleInviteEmailInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.inviteEmail = target.value;
  }

  private handleInviteRoleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.inviteRole = target.value as TeamMemberRole;
  }

  private async submitInvite() {
    if (!this.canManageTeam()) {
      PvToast.show('Only owners can manage team members', 'warning');
      return;
    }
    const email = this.inviteEmail.trim();
    if (!email) {
      PvToast.show('Email is required', 'warning');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      PvToast.show('Please enter a valid email address', 'warning');
      return;
    }

    const payload: InviteMemberPayload = {
      email,
      role: this.inviteRole,
    };

    this.inviting = true;
    try {
      await MembersService.inviteMember(this.getAccountId(), payload);
      PvToast.show(`Invitation sent to ${email}`, 'success');
      this.closeInviteModal();
    } catch (e) {
      console.error('Failed to invite member', e);
      PvToast.show('Failed to send invitation', 'error');
    } finally {
      this.inviting = false;
    }
  }

  private async handleEditMember(member: TeamMember) {
    if (!this.canManageTeam()) {
      PvToast.show('Only owners can manage team members', 'warning');
      return;
    }
    // In production, this would open a modal to edit role
    const newRole = prompt(`Edit role for ${member.name} (owner/purchaser/viewer):`, member.role.toLowerCase());
    if (!newRole) return;

    const validRoles: TeamMemberRole[] = ['owner', 'purchaser', 'viewer'];
    if (!validRoles.includes(newRole as TeamMemberRole)) {
      PvToast.show('Invalid role. Use: owner, purchaser, or viewer', 'warning');
      return;
    }

    try {
      await MembersService.updateMember(this.getAccountId(), member.id, newRole as TeamMemberRole);
      PvToast.show(`Role updated for ${member.name}`, 'success');
      // Optimistic update using email for matching
      this.teamMembers = this.teamMembers.map(m =>
        m.email === member.email ? { ...m, role: newRole as TeamMemberRole } : m
      );
    } catch (e) {
      console.error('Failed to update member', e);
      PvToast.show('Failed to update member', 'error');
    }
  }

  private async handleResendInvite(member: TeamMember) {
    if (!this.canManageTeam()) {
      PvToast.show('Only owners can manage team members', 'warning');
      return;
    }
    if (!member.id) return;
    try {
      await MembersService.resendInvite(this.getAccountId(), member.id);
      PvToast.show(`Invitation resent to ${member.email}`, 'success');
    } catch (e) {
      console.error('Failed to resend invite', e);
      PvToast.show('Failed to resend invitation', 'error');
    }
  }

  private canManageTeam(): boolean {
    return this.currentUserRole === 'account_admin' ||
      this.currentUserRole === 'tenant_owner' ||
      this.currentUserRole === 'tenant_staff';
  }

  render() {
    if (this.loading) {
      return html`<p>Loading team...</p>`;
    }

    return html`
      <pv-page-tour-modal 
          pageId="customer-team"
          heading="Team Management"
          .features=${[
        { title: 'Role-Based Access', description: 'Assign Owner, Purchaser, or Viewer roles to team members to control their access and purchasing abilities.' },
        { title: 'Invite Members', description: 'Easily send email invitations to new team members to join your company account.' },
        { title: 'Manage Users', description: 'Edit roles, resend invitations, or manage existing users all from this centralized dashboard.' }
      ]}
      ></pv-page-tour-modal>
      <div class="section-header">
        <div>
          <h1 class="section-title">Team</h1>
          <p class="section-subtitle">Manage team members and permissions</p>
        </div>
      </div>

      <div class="team-actions">
        <button 
          class="btn btn-primary" 
          @click=${this.handleInvite}
          ?disabled=${!this.canManageTeam()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Invite Team Member
        </button>
      </div>

      ${this.showInviteModal ? html`
        <div
          class="invite-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Invite team member"
          @click=${this.handleInviteOverlayClick}
        >
          <div class="invite-modal" @click=${(e: Event) => e.stopPropagation()}>
            <div class="invite-modal-header">
              <h3 class="invite-modal-title">Invite Team Member</h3>
              <button
                class="invite-modal-close"
                @click=${this.closeInviteModal}
                aria-label="Close invite modal"
                ?disabled=${this.inviting}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="invite-modal-body">
              <div class="form-group">
                <label for="invite-email">Email address</label>
                <input
                  id="invite-email"
                  class="form-input"
                  type="email"
                  .value=${this.inviteEmail}
                  @input=${this.handleInviteEmailInput}
                  placeholder="teammate@company.com"
                  ?disabled=${this.inviting}
                />
              </div>

              <div class="form-group">
                <label for="invite-role">Role</label>
                <select
                  id="invite-role"
                  class="invite-role-select"
                  .value=${this.inviteRole}
                  @change=${this.handleInviteRoleChange}
                  ?disabled=${this.inviting}
                >
                  <option value="owner">Owner</option>
                  <option value="purchaser">Purchaser</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>

            <div class="invite-modal-footer">
              <button
                class="btn btn-outline btn-sm"
                @click=${this.closeInviteModal}
                ?disabled=${this.inviting}
              >
                Cancel
              </button>
              <button
                class="btn btn-primary btn-sm"
                @click=${this.submitInvite}
                ?disabled=${this.inviting}
              >
                ${this.inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="team-list">
        ${this.teamMembers.map(member => html`
          <div class="team-card">
            <div class="team-info">
              <div class="team-avatar">${member.initials}</div>
              <div class="team-details">
                <span class="team-name">${member.name}</span>
                <span class="team-email">${member.email}</span>
              </div>
            </div>
            <div class="team-actions-cell">
              <span class="team-role ${this.getRoleClass(member.role)}">${member.role}</span>
              ${member.status === 'invited' ? html`<span class="team-role">Invited</span>` : ''}
              ${member.status === 'invited' && this.canManageTeam() ? html`
                <button class="btn btn-outline btn-sm" @click=${() => this.handleResendInvite(member)}>Resend</button>
              ` : ''}
              ${this.canManageTeam() ? html`<button class="btn btn-outline btn-sm" @click=${() => this.handleEditMember(member)}>Edit</button>` : ''}
            </div>
          </div>
        `)}
      </div>

      <div class="permissions-note">
        <h4>Team Permissions</h4>
        <ul>
          <li><strong>Owner:</strong> Full access to all features including billing and team management</li>
          <li><strong>Purchaser:</strong> Can place orders on behalf of the account</li>
          <li><strong>Viewer:</strong> View-only access to orders and projects</li>
        </ul>
        ${!this.canManageTeam() ? html`<p>Team management actions are restricted to Owner users.</p>` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-team': PvPageTeam;
  }
}
