import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Thread, ThreadTab } from '../../services/messaging-types.js';
import { AdminMessagingService } from '../../services/admin-messaging.service.js';
import { threadListStyles } from '../../../styles/admin-messaging.js';

@customElement('messaging-thread-list')
export class ThreadList extends LitElement {
    static styles = threadListStyles;

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
