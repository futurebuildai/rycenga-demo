import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Message } from '../../services/messaging-types.js';
import { isTextContent, isMediaContent } from '../../services/messaging-types.js';

@customElement('messaging-message-bubble')
export class MessageBubble extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .message-row {
            display: flex;
            gap: 12px;
            max-width: 100%;
            margin-bottom: 4px;
        }

        .message-row.inbound {
            justify-content: flex-start;
        }

        .message-row.outbound {
            justify-content: flex-end;
        }

        .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--color-primary, #1e293b);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
            align-self: flex-end;
        }

        .avatar.outbound {
            background: var(--admin-accent, #6366f1);
        }

        .bubble-wrapper {
            display: flex;
            flex-direction: column;
            max-width: 70%;
        }

        .bubble-wrapper.outbound {
            align-items: flex-end;
        }

        .bubble {
            padding: 12px 16px;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        .bubble.inbound {
            background: #f1f5f9;
            color: var(--color-text, #0f172a);
            border-radius: 16px 16px 16px 4px;
        }

        .bubble.outbound {
            background: var(--admin-accent, #6366f1);
            color: white;
            border-radius: 16px 16px 4px 16px;
        }

        .timestamp {
            font-size: 11px;
            color: var(--color-text-muted, #94a3b8);
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .timestamp.outbound {
            justify-content: flex-end;
        }

        .status-icon {
            width: 14px;
            height: 14px;
        }

        /* File Card Styles */
        .file-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: white;
            border: 1px solid var(--color-border, #e2e8f0);
            border-radius: 12px;
            min-width: 240px;
        }

        .bubble.outbound .file-card {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .file-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: #fee2e2;
            color: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .file-icon.image {
            background: #dbeafe;
            color: #2563eb;
        }

        .bubble.outbound .file-icon {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .file-info {
            flex: 1;
            min-width: 0;
        }

        .file-name {
            font-size: 13px;
            font-weight: 500;
            color: var(--color-text, #0f172a);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .bubble.outbound .file-name {
            color: white;
        }

        .file-size {
            font-size: 11px;
            color: var(--color-text-muted, #94a3b8);
        }

        .bubble.outbound .file-size {
            color: rgba(255, 255, 255, 0.7);
        }

        .download-btn {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: var(--admin-accent, #6366f1);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: background 150ms ease;
        }

        .download-btn:hover {
            background: var(--admin-accent-hover, #4f46e5);
        }

        .bubble.outbound .download-btn {
            background: rgba(255, 255, 255, 0.2);
        }

        .bubble.outbound .download-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    `;

    @property({ type: Object }) message!: Message;
    @property({ type: Boolean }) showAvatar = true;

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

        return html`
            <div class="bubble ${this.message.direction}">
                ${content.text}
            </div>
        `;
    }

    private renderFileBubble() {
        const content = this.message.content;
        if (!isMediaContent(content)) return null;

        const category = this.getMimeCategory(content.mimeType);
        const isImage = category === 'image';

        return html`
            <div class="bubble ${this.message.direction}">
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
        const { status, direction } = this.message;
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
        const { direction, type, senderName } = this.message;
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
