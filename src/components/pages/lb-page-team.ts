/**
 * LbPageTeam - Team management page component
 * Displays team members with roles
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import { DataService } from '../../services/data.service.js';
import { LbToast } from '../atoms/lb-toast.js';
import type { TeamMember } from '../../types/index.js';

@customElement('lb-page-team')
export class LbPageTeam extends LbBase {
    static styles = [
        ...LbBase.styles,
        css`
      :host {
        display: block;
      }

      .section-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: var(--space-xl);
      }

      .section-title {
        font-family: var(--font-heading);
        font-size: var(--text-3xl);
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: var(--space-xs);
      }

      .section-subtitle {
        color: var(--color-text-muted);
      }

      .team-actions {
        margin-bottom: var(--space-xl);
      }

      .team-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .team-card {
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-lg);
      }

      .team-info {
        display: flex;
        align-items: center;
        gap: var(--space-lg);
      }

      .team-avatar {
        width: 56px;
        height: 56px;
        background: var(--color-primary);
        color: white;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-heading);
        font-weight: 600;
        font-size: var(--text-xl);
      }

      .team-details {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .team-name {
        font-weight: 600;
        font-size: var(--text-lg);
      }

      .team-email {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      .team-role {
        padding: 4px 12px;
        background: var(--color-bg);
        border-radius: var(--radius-full);
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--color-text-light);
      }

      .team-role.owner {
        background: rgba(249, 115, 22, 0.1);
        color: var(--color-accent);
      }

      .team-role.admin {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }

      .team-actions-cell {
        display: flex;
        align-items: center;
        gap: var(--space-md);
      }

      .permissions-note {
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        margin-top: var(--space-xl);
      }

      .permissions-note h4 {
        font-family: var(--font-heading);
        margin-bottom: var(--space-sm);
      }

      .permissions-note ul {
        padding-left: var(--space-lg);
        color: var(--color-text-muted);
        font-size: var(--text-sm);
      }

      .permissions-note li {
        list-style: disc;
        margin-bottom: var(--space-xs);
      }
    `,
    ];

    @state() private teamMembers: TeamMember[] = [];
    @state() private loading = true;

    async connectedCallback() {
        super.connectedCallback();
        try {
            const accountData = await DataService.getAccountData();
            this.teamMembers = accountData.team;
        } catch (e) {
            console.error('Failed to load team data', e);
        } finally {
            this.loading = false;
        }
    }

    private getRoleClass(role: string): string {
        if (role.toLowerCase() === 'owner') return 'owner';
        if (role.toLowerCase() === 'admin') return 'admin';
        return '';
    }

    private handleInvite() {
        LbToast.show('Invite team member coming soon', 'info');
    }

    private handleEditMember(member: TeamMember) {
        LbToast.show(`Edit ${member.name} coming soon`, 'info');
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
        <button class="btn btn-primary" @click=${this.handleInvite}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Invite Team Member
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
        'lb-page-team': LbPageTeam;
    }
}
