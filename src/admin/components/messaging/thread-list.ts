import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Thread, ThreadTab } from '../../services/messaging-types.js';
import { AdminMessagingService } from '../../services/admin-messaging.service.js';

@customElement('messaging-thread-list')
export class ThreadList extends LitElement {
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            width: 350px;
            height: 100%;
            background: var(--admin-card-bg, #ffffff);
            border-right: 1px solid var(--color-border, #e2e8f0);
        }

        .header {
            padding: 20px;
            border-bottom: 1px solid var(--color-border, #e2e8f0);
        }

        .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .header-title {
            font-family: var(--font-heading, 'Space Grotesk', sans-serif);
            font-size: 18px;
            font-weight: 600;
            color: var(--color-text, #0f172a);
            margin: 0;
        }

        .btn-new-thread {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            background: var(--admin-accent, #6366f1);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 150ms ease;
            font-family: var(--font-body, 'Inter', sans-serif);
        }

        .btn-new-thread:hover {
            background: var(--admin-accent-hover, #4f46e5);
        }

        .search-container {
            position: relative;
        }

        .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-text-muted, #94a3b8);
            pointer-events: none;
        }

        .search-input {
            width: 100%;
            padding: 10px 12px 10px 40px;
            border: 1px solid var(--color-border, #e2e8f0);
            border-radius: 8px;
            font-size: 14px;
            font-family: var(--font-body, 'Inter', sans-serif);
            background: var(--admin-bg, #f1f5f9);
            transition: border-color 150ms ease, box-shadow 150ms ease;
            box-sizing: border-box;
        }

        .search-input:focus {
            outline: none;
            border-color: var(--admin-accent, #6366f1);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .search-input::placeholder {
            color: var(--color-text-muted, #94a3b8);
        }

        .tabs {
            display: flex;
            gap: 0;
            padding: 0 20px;
            border-bottom: 1px solid var(--color-border, #e2e8f0);
        }

        .tab {
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text-muted, #94a3b8);
            background: none;
            border: none;
            cursor: pointer;
            position: relative;
            font-family: var(--font-body, 'Inter', sans-serif);
            transition: color 150ms ease;
        }

        .tab:hover {
            color: var(--color-text, #0f172a);
        }

        .tab.active {
            color: var(--admin-accent, #6366f1);
        }

        .tab.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--admin-accent, #6366f1);
            border-radius: 2px 2px 0 0;
        }

        .thread-list {
            flex: 1;
            overflow-y: auto;
        }

        .thread-item {
            display: flex;
            gap: 12px;
            padding: 16px 20px;
            cursor: pointer;
            transition: background 150ms ease;
            border-left: 4px solid transparent;
        }

        .thread-item:hover {
            background: var(--admin-bg, #f1f5f9);
        }

        .thread-item.active {
            background: rgba(99, 102, 241, 0.08);
            border-left-color: var(--admin-accent, #6366f1);
        }

        .thread-avatar {
            width: 48px;
            height: 48px;
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

        .thread-content {
            flex: 1;
            min-width: 0;
        }

        .thread-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;
        }

        .thread-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--color-text, #0f172a);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .thread-time {
            font-size: 12px;
            color: var(--admin-accent, #6366f1);
            flex-shrink: 0;
            margin-left: 8px;
        }

        .thread-preview {
            font-size: 13px;
            color: var(--color-text-muted, #94a3b8);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .thread-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 4px;
        }

        .phone-number {
            font-size: 12px;
            color: var(--admin-accent, #6366f1);
            font-weight: 500;
        }

        .unread-badge {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--admin-accent, #6366f1);
            flex-shrink: 0;
        }

        .status-badge {
            font-size: 10px;
            font-weight: 500;
            padding: 2px 6px;
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

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: var(--color-text-muted, #94a3b8);
            text-align: center;
        }

        .empty-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: var(--color-text-muted, #94a3b8);
        }

        .section-label {
            padding: 8px 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-text-muted, #94a3b8);
        }
    `;

    @property({ type: Array }) threads: Thread[] = [];
    @property({ type: String }) selectedId: string | null = null;
    @property({ type: Boolean }) loading = false;

    @state() private currentTab: ThreadTab = 'my-threads';
    @state() private searchQuery = '';
    @state() private searchTimeout: number | null = null;

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
    }

    private getInitials(name: string): string {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    private getMessagePreview(thread: Thread): string {
        if (!thread.lastMessage) return 'No messages yet';

        const content = thread.lastMessage.content;
        if ('text' in content && content.text) {
            return content.text;
        }
        if ('fileName' in content && content.fileName) {
            return `Sent a file: ${content.fileName}`;
        }
        return 'Attachment';
    }

    private handleTabClick(tab: ThreadTab) {
        this.currentTab = tab;
        this.dispatchEvent(
            new CustomEvent('tab-change', {
                detail: { tab },
                bubbles: true,
                composed: true,
            })
        );
    }

    private handleSearchInput(e: Event) {
        const input = e.target as HTMLInputElement;
        this.searchQuery = input.value;

        // Debounce search
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = window.setTimeout(() => {
            this.dispatchEvent(
                new CustomEvent('search', {
                    detail: { query: this.searchQuery },
                    bubbles: true,
                    composed: true,
                })
            );
        }, 300);
    }

    private handleThreadClick(thread: Thread) {
        this.dispatchEvent(
            new CustomEvent('thread-select', {
                detail: { threadId: thread.id },
                bubbles: true,
                composed: true,
            })
        );
    }

    private handleNewThreadClick() {
        this.dispatchEvent(
            new CustomEvent('new-thread', {
                bubbles: true,
                composed: true,
            })
        );
    }

    private renderThreadItem(thread: Thread) {
        const isActive = this.selectedId === thread.id;
        const hasUnread = thread.unreadCount > 0;

        return html`
            <div
                class="thread-item ${isActive ? 'active' : ''}"
                @click=${() => this.handleThreadClick(thread)}
            >
                <div class="thread-avatar">
                    ${this.getInitials(thread.contact.name)}
                </div>
                <div class="thread-content">
                    <div class="thread-header">
                        <span class="thread-name">${thread.contact.name}</span>
                        <span class="thread-time">
                            ${AdminMessagingService.getRelativeTime(thread.updatedAt)}
                        </span>
                    </div>
                    <div class="thread-meta">
                        <span class="phone-number">${thread.contact.phone}</span>
                        <span class="status-badge ${thread.status}">${thread.status}</span>
                        ${hasUnread ? html`<span class="unread-badge"></span>` : null}
                    </div>
                    <div class="thread-preview">
                        ${this.getMessagePreview(thread)}
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        const unreadThreads = this.threads.filter((t) => t.unreadCount > 0);
        const readThreads = this.threads.filter((t) => t.unreadCount === 0);

        return html`
            <div class="header">
                <div class="header-row">
                    <h2 class="header-title">Messages</h2>
                    <button class="btn-new-thread" @click=${this.handleNewThreadClick}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New
                    </button>
                </div>
                <div class="search-container">
                    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        class="search-input"
                        placeholder="Search Name/Phone"
                        aria-label="Search conversations by name or phone number"
                        .value=${this.searchQuery}
                        @input=${this.handleSearchInput}
                    />
                </div>
            </div>

            <div class="tabs">
                <button
                    class="tab ${this.currentTab === 'my-threads' ? 'active' : ''}"
                    @click=${() => this.handleTabClick('my-threads')}
                >
                    My Threads
                </button>
                <button
                    class="tab ${this.currentTab === 'all-threads' ? 'active' : ''}"
                    @click=${() => this.handleTabClick('all-threads')}
                >
                    All Threads
                </button>
            </div>

            <div class="thread-list">
                ${this.loading
                    ? html`<div class="loading">Loading threads...</div>`
                    : this.threads.length === 0
                        ? html`
                            <div class="empty-state">
                                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <p>No ${this.searchQuery ? 'matching ' : ''}messages</p>
                            </div>
                        `
                        : html`
                            ${unreadThreads.length > 0 ? html`
                                <div class="section-label">Unread</div>
                                ${unreadThreads.map((t) => this.renderThreadItem(t))}
                            ` : null}
                            ${readThreads.length > 0 ? html`
                                <div class="section-label">${unreadThreads.length > 0 ? 'Earlier' : 'Conversations'}</div>
                                ${readThreads.map((t) => this.renderThreadItem(t))}
                            ` : null}
                        `
                }
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'messaging-thread-list': ThreadList;
    }
}
