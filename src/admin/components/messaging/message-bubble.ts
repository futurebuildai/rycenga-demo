import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Message } from '../../services/messaging-types.js';
import { isTextContent, isMediaContent } from '../../services/messaging-types.js';
import { messageBubbleStyles } from '../../../styles/admin-messaging.js';

@customElement('messaging-message-bubble')
export class MessageBubble extends LitElement {
    static styles = messageBubbleStyles;

    @property({ type: Object }) message!: Message;
    @property({ type: Boolean }) showAvatar = true;

    private getDirectionClass(direction: string): 'inbound' | 'outbound' {
        const value = direction.toLowerCase();
        if (value === 'inbound' || value === 'received' || value === 'incoming') return 'inbound';
        return 'outbound';
    }

    private formatTime(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    private formatFileSize(bytes?: number): string {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    private getInitials(name: string): string {
        if (!name || name.length === 0) return '??';
        const parts = name.trim().split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, Math.min(2, name.length)).toUpperCase();
    }

    private getMimeCategory(mimeType: string): 'pdf' | 'image' | 'file' {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType === 'application/pdf') return 'pdf';
        return 'file';
    }

    private renderTextBubble() {
        const content = this.message.content;
        if (!isTextContent(content)) return null;
        const direction = this.getDirectionClass(this.message.direction);

        return html`
            <div class="bubble ${direction}">
                ${content.text}
            </div>
        `;
    }

    private renderFileBubble() {
        const content = this.message.content;
        if (!isMediaContent(content)) return null;
        const direction = this.getDirectionClass(this.message.direction);

        const category = this.getMimeCategory(content.mimeType);
        const isImage = category === 'image';

        return html`
            <div class="bubble ${direction}">
                <div class="file-card">
                    <div class="file-icon ${isImage ? 'image' : ''}">
                        ${isImage
                            ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
                            : html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`
                        }
                    </div>
                    <div class="file-info">
                        <div class="file-name">${content.fileName || 'File'}</div>
                        <div class="file-size">
                            ${this.formatFileSize(content.fileSize)}
                            ${content.mimeType.split('/')[1]?.toUpperCase() || ''}
                        </div>
                    </div>
                    <button
                        class="download-btn"
                        title="Download ${content.fileName || 'file'}"
                        aria-label="Download ${content.fileName || 'file'}"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    private renderStatusIcon() {
        const { status } = this.message;
        const direction = this.getDirectionClass(this.message.direction);
        if (direction !== 'outbound') return null;

        if (status === 'read') {
            return html`
                <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L7 17l-5-5"></path>
                    <path d="M22 6L11 17"></path>
                </svg>
            `;
        }
        if (status === 'delivered') {
            return html`
                <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"></path>
                </svg>
            `;
        }
        return null;
    }

    render() {
        const { type, senderName } = this.message;
        const direction = this.getDirectionClass(this.message.direction);
        const isInbound = direction === 'inbound';

        return html`
            <div class="message-row ${direction}">
                ${isInbound && this.showAvatar
                    ? html`<div class="avatar">${this.getInitials(senderName || 'CU')}</div>`
                    : null
                }
                <div class="bubble-wrapper ${direction}">
                    ${type === 'text' ? this.renderTextBubble() : this.renderFileBubble()}
                    <div class="timestamp ${direction}">
                        ${this.formatTime(this.message.createdAt)}
                        ${this.renderStatusIcon()}
                    </div>
                </div>
                ${!isInbound && this.showAvatar
                    ? html`<div class="avatar outbound">${this.getInitials(senderName || 'ME')}</div>`
                    : null
                }
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'messaging-message-bubble': MessageBubble;
    }
}
