/**
 * PvPageTeam - Team management page component
 * Displays team members with roles
 */

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { MembersService } from '../../connect/services/members.js';
import { PvToast } from '../atoms/pv-toast.js';
import { pageShellStyles } from '../../styles/shared.js';
import { teamPageStyles } from '../../styles/pages.js';
import type { TeamMember as LegacyTeamMember } from '../../types/index.js';
import type { TeamMember, TeamMemberRole, InviteMemberPayload } from '../../connect/types/domain.js';

@customElement('pv-page-team')
export class PvPageTeam extends PvBase {
  static styles = [
    ...PvBase.styles,
    pageShellStyles,
    teamPageStyles,
  ];

  @state() private teamMembers: LegacyTeamMember[] = [];
  @state() private loading = true;
  @state() private inviting = false;

  private getAccountId(): number {
    return DataService.getCurrentAccountId() || 1;
  }

  async connectedCallback() {
    super.connectedCallback();
    try {
      const accountData = await DataService.getAccountData();
      this.teamMembers = accountData.team;
    } catch (e) {
      console.error('Failed to load team data', e);
      PvToast.show('Failed to load team', 'error');
    } finally {
      this.loading = false;
    }
  }

  private getRoleClass(role: string): string {
    if (role.toLowerCase() === 'owner') return 'owner';
    if (role.toLowerCase() === 'admin') return 'admin';
    return '';
  }

  private async handleInvite() {
    // In production, this would open a modal to get email and role
    const email = prompt('Enter email address to invite:');
    if (!email) return;

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      PvToast.show('Please enter a valid email address', 'warning');
      return;
    }

    const payload: InviteMemberPayload = {
      email,
      role: 'viewer', // Default role
    };

    this.inviting = true;
    try {
      await MembersService.inviteMember(this.getAccountId(), payload);
      PvToast.show(`Invitation sent to ${email}`, 'success');
    } catch (e) {
      console.error('Failed to invite member', e);
      PvToast.show('Failed to send invitation', 'error');
    } finally {
      this.inviting = false;
    }
  }

  private async handleEditMember(member: LegacyTeamMember) {
    // In production, this would open a modal to edit role
    const newRole = prompt(`Edit role for ${member.name} (owner/admin/purchaser/viewer):`, member.role.toLowerCase());
    if (!newRole) return;

    const validRoles: TeamMemberRole[] = ['owner', 'admin', 'purchaser', 'viewer'];
    if (!validRoles.includes(newRole as TeamMemberRole)) {
      PvToast.show('Invalid role. Use: owner, admin, purchaser, or viewer', 'warning');
      return;
    }

    try {
      // Using placeholder ID since legacy TeamMember doesn't have id - backend would lookup by email
      await MembersService.updateMember(this.getAccountId(), 0, newRole as TeamMemberRole);
      PvToast.show(`Role updated for ${member.name}`, 'success');
      // Optimistic update using email for matching
      this.teamMembers = this.teamMembers.map(m =>
        m.email === member.email ? { ...m, role: newRole.charAt(0).toUpperCase() + newRole.slice(1) } : m
      );
    } catch (e) {
      console.error('Failed to update member', e);
      PvToast.show('Failed to update member', 'error');
    }
  }

  render() {
    if (this.loading) {
      return html`<p>Loading team...</p>`;
    }

    return html`
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
          ?disabled=${this.inviting}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          ${this.inviting ? 'Inviting...' : 'Invite Team Member'}
        </button>
      </div>

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
              <button class="btn btn-outline btn-sm" @click=${() => this.handleEditMember(member)}>Edit</button>
            </div>
          </div>
        `)}
      </div>

      <div class="permissions-note">
        <h4>Team Permissions</h4>
        <ul>
          <li><strong>Owner:</strong> Full access to all features including billing and team management</li>
          <li><strong>Admin:</strong> Can place orders and view account data, no billing access</li>
          <li><strong>Purchaser:</strong> Can place orders on behalf of the account</li>
          <li><strong>Viewer:</strong> View-only access to orders and projects</li>
        </ul>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-team': PvPageTeam;
  }
}
