import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import type { Thread, Message } from '../../services/messaging-types.js';
import './message-bubble.js';
import './assign-team-modal.js';

@customElement('messaging-chat-window')
export class ChatWindow extends LitElement {
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            flex: 1;
            height: 100%;
            min-width: 0;
        }

        /* Header */
        .chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            border-bottom: 1px solid var(--color-border, #e2e8f0);
            background: white;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .contact-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: var(--color-primary, #1e293b);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 600;
            flex-shrink: 0;
        }

        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .contact-name {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .contact-name h2 {
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            font-size: 18px;
            font-weight: 600;
            color: var(--color-text, #0f172a);
            margin: 0;
        }

        .account-badge {
            background: #e2e8f0;
            color: #475569;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 500;
        }

        .status-badge {
            font-size: 11px;
            font-weight: 500;
            padding: 3px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }

        .status-badge.open {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }

        .status-badge.assigned {
            background: rgba(234, 179, 8, 0.1);
            color: #ca8a04;
        }

        .status-badge.resolved {
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
        }

        .contact-phone {
            font-size: 13px;
            color: var(--color-text-muted, #94a3b8);
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .btn-assign {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: white;
            border: 1px solid var(--color-border, #e2e8f0);
            border-radius: 8px;
            color: var(--color-text, #0f172a);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 150ms ease;
            font-family: var(--font-body, 'Inter', sans-serif);
        }

        .btn-assign:hover {
            border-color: var(--admin-accent, #6366f1);
            color: var(--admin-accent, #6366f1);
        }

        .btn-menu {
            width: 36px;
            height: 36px;
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

        .btn-menu:hover {
            background: var(--admin-bg, #f1f5f9);
            color: var(--color-text, #0f172a);
        }

        /* Message List */
        .message-list {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: var(--admin-bg, #f1f5f9);
        }

        .date-separator {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px 0;
        }

        .date-separator span {
            background: rgba(0, 0, 0, 0.05);
            padding: 6px 16px;
            border-radius: 999px;
            font-size: 12px;
            color: var(--color-text-muted, #94a3b8);
            font-weight: 500;
        }

        .loading-messages {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: var(--color-text-muted, #94a3b8);
        }

        /* Input Footer */
        .message-footer {
            padding: 16px 24px;
            background: white;
            border-top: 1px solid var(--color-border, #e2e8f0);
        }

        .input-container {
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--admin-bg, #f1f5f9);
            border: 1px solid var(--color-border, #e2e8f0);
            border-radius: 12px;
            padding: 8px 16px;
        }

        .input-container:focus-within {
            border-color: var(--admin-accent, #6366f1);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .input-btn {
            width: 36px;
            height: 36px;
            border: none;
            background: none;
            cursor: pointer;
            color: var(--color-text-muted, #94a3b8);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 150ms ease;
            flex-shrink: 0;
        }

        .input-btn:hover {
            color: var(--admin-accent, #6366f1);
        }

        .message-input {
            flex: 1;
            border: none;
            background: none;
            font-size: 14px;
            font-family: var(--font-body, 'Inter', sans-serif);
            color: var(--color-text, #0f172a);
            outline: none;
            resize: none;
            min-height: 24px;
            max-height: 120px;
        }

        .message-input::placeholder {
            color: var(--color-text-muted, #94a3b8);
        }

        .send-btn {
            width: 40px;
            height: 40px;
            border: none;
            background: var(--admin-accent, #6366f1);
            cursor: pointer;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 150ms ease;
            flex-shrink: 0;
        }

        .send-btn:hover {
            background: var(--admin-accent-hover, #4f46e5);
            transform: scale(1.05);
        }

        .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .input-hints {
            display: flex;
            justify-content: space-between;
            padding: 8px 4px 0;
            font-size: 11px;
            color: var(--color-text-muted, #94a3b8);
        }

        /* File input hidden */
        .file-input {
            display: none;
        }
    `;

    @property({ type: Object }) thread: Thread | null = null;
    @property({ type: Array }) messages: Message[] = [];
    @property({ type: Boolean }) loading = false;

    @state() private messageInput = '';
    @state() private showAssignModal = false;
    @state() private sending = false;

    @query('.message-list') messageListEl!: HTMLDivElement;
    @query('.file-input') fileInputEl!: HTMLInputElement;

    updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has('messages') && this.messages.length > 0) {
            // Scroll to bottom when new messages arrive
            this.updateComplete.then(() => {
                if (this.messageListEl) {
                    this.messageListEl.scrollTop = this.messageListEl.scrollHeight;
                }
            });
        }
    }

    private getInitials(name: string): string {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    private formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday =
            new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

        if (isToday) return 'Today';
        if (isYesterday) return 'Yesterday';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    }

    private groupMessagesByDate(): Map<string, Message[]> {
        const groups = new Map<string, Message[]>();

        for (const message of this.messages) {
            const dateKey = new Date(message.createdAt).toDateString();
            if (!groups.has(dateKey)) {
                groups.set(dateKey, []);
            }
            groups.get(dateKey)!.push(message);
        }

        return groups;
    }

    private handleInputChange(e: Event) {
        const textarea = e.target as HTMLTextAreaElement;
        this.messageInput = textarea.value;

        // Auto-resize textarea
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSend();
        }
    }

    private async handleSend() {
        const text = this.messageInput.trim();
        if (!text || this.sending) return;

        this.sending = true;
        this.messageInput = '';

        try {
            this.dispatchEvent(
                new CustomEvent('send-message', {
                    detail: { text },
                    bubbles: true,
                    composed: true,
                })
            );
        } finally {
            this.sending = false;
        }
    }

    private handleAttachClick() {
        this.fileInputEl?.click();
    }

    private handleFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            this.dispatchEvent(
                new CustomEvent('attach-file', {
                    detail: { file },
                    bubbles: true,
                    composed: true,
                })
            );
            // Reset input
            input.value = '';
        }
    }

    private handleAssignClick() {
        this.showAssignModal = true;
    }

    private handleAssignClose() {
        this.showAssignModal = false;
    }

    private handleAssignSave(e: CustomEvent<{ agentIds: number[] }>) {
        this.dispatchEvent(
            new CustomEvent('assign-agents', {
                detail: e.detail,
                bubbles: true,
                composed: true,
            })
        );
        this.showAssignModal = false;
    }

    render() {
        if (!this.thread) {
            return html`<div class="loading-messages">Select a conversation</div>`;
        }

        const messageGroups = this.groupMessagesByDate();

        return html`
            <div class="chat-header">
                <div class="header-left">
                    <div class="contact-avatar">
                        ${this.getInitials(this.thread.contact.name)}
                    </div>
                    <div class="contact-info">
                        <div class="contact-name">
                            <h2>${this.thread.contact.name}</h2>
                            ${this.thread.contact.accountId
                                ? html`<span class="account-badge">Account #${this.thread.contact.accountId}</span>`
                                : null
                            }
                            <span class="status-badge ${this.thread.status}">${this.thread.status}</span>
                        </div>
                        <span class="contact-phone">${this.thread.contact.phone}</span>
                    </div>
                </div>
                <div class="header-right">
                    <button class="btn-assign" @click=${this.handleAssignClick}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Assign Team
                    </button>
                    <button class="btn-menu" title="More options">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="message-list">
                ${this.loading
                    ? html`<div class="loading-messages">Loading messages...</div>`
                    : Array.from(messageGroups.entries()).map(
                        ([dateKey, msgs]) => html`
                            <div class="date-separator">
                                <span>${this.formatDate(dateKey)}</span>
                            </div>
                            ${msgs.map(
                                (msg, index) => html`
                                    <messaging-message-bubble
                                        .message=${msg}
                                        .showAvatar=${index === msgs.length - 1 ||
                                            msgs[index + 1]?.direction !== msg.direction}
                                    ></messaging-message-bubble>
                                `
                            )}
                        `
                    )
                }
            </div>

            <div class="message-footer">
                <div class="input-container">
                    <button class="input-btn" @click=${this.handleAttachClick} title="Attach file">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                        </svg>
                    </button>
                    <input type="file" class="file-input" @change=${this.handleFileSelect} />
                    <textarea
                        class="message-input"
                        placeholder="Type a message..."
                        aria-label="Message input"
                        rows="1"
                        .value=${this.messageInput}
                        @input=${this.handleInputChange}
                        @keydown=${this.handleKeyDown}
                    ></textarea>
                    <button
                        class="send-btn"
                        @click=${this.handleSend}
                        ?disabled=${!this.messageInput.trim() || this.sending}
                        title="Send message"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
                <div class="input-hints">
                    <span>Press Enter to send</span>
                    <span>Use Shift + Enter for new line</span>
                </div>
            </div>

            <messaging-assign-team-modal
                .open=${this.showAssignModal}
                .currentAgents=${this.thread.assignedAgents}
                @close=${this.handleAssignClose}
                @save=${this.handleAssignSave}
            ></messaging-assign-team-modal>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'messaging-chat-window': ChatWindow;
    }
}
