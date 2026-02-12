import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Agent, AssignedAgent } from '../../services/messaging-types.js';
import { AdminMessagingService } from '../../services/admin-messaging.service.js';

@customElement('messaging-assign-team-modal')
export class AssignTeamModal extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }

        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
            opacity: 0;
            visibility: hidden;
            transition: opacity 200ms ease, visibility 200ms ease;
        }

        .modal-overlay.open {
            opacity: 1;
            visibility: visible;
        }

        .modal {
            background: white;
            border-radius: 12px;
            width: min(400px, 100%);
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
            overflow: hidden;
            transform: scale(0.95);
            transition: transform 200ms ease;
        }

        .modal-overlay.open .modal {
            transform: scale(1);
        }

        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--color-border, #e2e8f0);
        }

        .modal-title {
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            font-size: 18px;
            font-weight: 600;
            color: var(--color-text, #0f172a);
            margin: 0;
        }

        .close-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: none;
            cursor: pointer;
            color: var(--color-text-muted, #94a3b8);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 150ms ease;
        }

        .close-btn:hover {
            background: var(--admin-bg, #f1f5f9);
            color: var(--color-text, #0f172a);
        }

        .modal-body {
            padding: 16px 24px;
            max-height: 320px;
            overflow-y: auto;
        }

        .agent-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .agent-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: background 150ms ease;
        }

        .agent-item:hover {
            background: var(--admin-bg, #f1f5f9);
        }

        .agent-item.selected {
            background: rgba(99, 102, 241, 0.08);
        }

        .checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid var(--color-border, #e2e8f0);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 150ms ease;
        }

        .agent-item.selected .checkbox {
            background: var(--admin-accent, #6366f1);
            border-color: var(--admin-accent, #6366f1);
        }

        .checkbox svg {
            color: white;
            opacity: 0;
            transition: opacity 150ms ease;
        }

        .agent-item.selected .checkbox svg {
            opacity: 1;
        }

        .agent-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--color-primary, #1e293b);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
        }

        .agent-info {
            flex: 1;
            min-width: 0;
        }

        .agent-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text, #0f172a);
        }

        .agent-email {
            font-size: 12px;
            color: var(--color-text-muted, #94a3b8);
        }

        .status-badge {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 999px;
            font-weight: 500;
        }

        .status-badge.available {
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
        }

        .status-badge.away {
            background: rgba(234, 179, 8, 0.1);
            color: #eab308;
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 24px;
            border-top: 1px solid var(--color-border, #e2e8f0);
        }

        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 150ms ease;
            font-family: var(--font-body, 'Inter', sans-serif);
        }

        .btn-secondary {
            background: none;
            border: 1px solid var(--color-border, #e2e8f0);
            color: var(--color-text, #0f172a);
        }

        .btn-secondary:hover {
            background: var(--admin-bg, #f1f5f9);
        }

        .btn-primary {
            background: var(--admin-accent, #6366f1);
            border: none;
            color: white;
        }

        .btn-primary:hover {
            background: var(--admin-accent-hover, #4f46e5);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: var(--color-text-muted, #94a3b8);
        }
    `;

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
