import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Agent, AssignedAgent } from '../../services/messaging-types.js';
import { AdminMessagingService } from '../../services/admin-messaging.service.js';
import { assignTeamModalStyles } from '../../../styles/admin-messaging.js';

@customElement('messaging-assign-team-modal')
export class AssignTeamModal extends LitElement {
    static styles = assignTeamModalStyles;

    @property({ type: Boolean }) open = false;
    @property({ type: Array }) currentAgents: AssignedAgent[] = [];

    @state() private agents: Agent[] = [];
    @state() private selectedIds: Set<number> = new Set();
    @state() private loading = true;
    @state() private saving = false;

    async updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has('open') && this.open) {
            await this.loadAgents();
            // Pre-select currently assigned agents
            this.selectedIds = new Set(this.currentAgents.map((a) => a.id));
        }
    }

    private async loadAgents() {
        this.loading = true;
        try {
            this.agents = await AdminMessagingService.getAgents();
        } finally {
            this.loading = false;
        }
    }

    private getInitials(name: string): string {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    private toggleAgent(agentId: number) {
        const newSelected = new Set(this.selectedIds);
        if (newSelected.has(agentId)) {
            newSelected.delete(agentId);
        } else {
            newSelected.add(agentId);
        }
        this.selectedIds = newSelected;
    }

    private handleAgentKeyDown(e: KeyboardEvent, agentId: number) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleAgent(agentId);
        }
    }

    private handleOverlayClick(e: Event) {
        if (e.target === e.currentTarget && !this.saving) {
            this.close();
        }
    }

    private close() {
        this.dispatchEvent(
            new CustomEvent('close', { bubbles: true, composed: true })
        );
    }

    private async handleSave() {
        if (this.saving) return;
        this.saving = true;

        try {
            this.dispatchEvent(
                new CustomEvent('save', {
                    detail: { agentIds: Array.from(this.selectedIds) },
                    bubbles: true,
                    composed: true,
                })
            );
        } finally {
            this.saving = false;
        }
    }

    private renderAgentItem(agent: Agent) {
        const isSelected = this.selectedIds.has(agent.id);

        return html`
            <div
                class="agent-item ${isSelected ? 'selected' : ''}"
                role="checkbox"
                aria-checked=${isSelected}
                tabindex="0"
                @click=${() => this.toggleAgent(agent.id)}
                @keydown=${(e: KeyboardEvent) => this.handleAgentKeyDown(e, agent.id)}
            >
                <div class="checkbox" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="agent-avatar">${this.getInitials(agent.name)}</div>
                <div class="agent-info">
                    <div class="agent-name">${agent.name}</div>
                    <div class="agent-email">${agent.email}</div>
                </div>
                <span class="status-badge ${agent.isAvailable ? 'available' : 'away'}">
                    ${agent.isAvailable ? 'Available' : 'Away'}
                </span>
            </div>
        `;
    }

    render() {
        return html`
            <div class="modal-overlay ${this.open ? 'open' : ''}" @click=${this.handleOverlayClick}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <h3 class="modal-title">Assign Team Members</h3>
                        <button class="close-btn" @click=${this.close}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="modal-body">
                        ${this.loading
                            ? html`<div class="loading">Loading team members...</div>`
                            : this.agents.length === 0
                                ? html`<div class="loading">No team members available</div>`
                                : html`
                                    <div class="agent-list">
                                        ${this.agents.map((agent) => this.renderAgentItem(agent))}
                                    </div>
                                `
                        }
                    </div>

                    <div class="modal-footer">
                        <button
                            class="btn btn-secondary"
                            @click=${this.close}
                            ?disabled=${this.saving}
                        >
                            Cancel
                        </button>
                        <button
                            class="btn btn-primary"
                            @click=${this.handleSave}
                            ?disabled=${this.saving || this.loading}
                        >
                            ${this.saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'messaging-assign-team-modal': AssignTeamModal;
    }
}
