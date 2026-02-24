import { css } from 'lit';

export const pageMessagingStyles = css`
    :host {
        display: block;
        height: calc(100vh - 64px);
    }

    .messaging-container {
        display: flex;
        height: 100%;
        background: var(--admin-card-bg, #ffffff);
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .empty-state {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--color-text-muted, #94a3b8);
        background: var(--admin-bg, #f1f5f9);
    }

    .empty-icon {
        width: 80px;
        height: 80px;
        margin-bottom: 20px;
        opacity: 0.5;
    }

    .empty-title {
        font-family: var(--font-heading, 'Space Grotesk', sans-serif);
        font-size: 20px;
        font-weight: 600;
        color: var(--color-text, #0f172a);
        margin: 0 0 8px;
    }

    .empty-description {
        font-size: 14px;
        color: var(--color-text-muted, #94a3b8);
        margin: 0;
    }
`;

export const threadListStyles = css`
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
        background: var(--admin-messaging-thread-active-bg, rgba(99, 102, 241, 0.08));
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

export const chatWindowStyles = css`
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
        background: var(--admin-messaging-surface-bg, var(--admin-card-bg, #ffffff));
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
        background: var(--admin-messaging-chip-bg, var(--color-bg-alt));
        color: var(--admin-messaging-chip-color, var(--color-text-light));
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
        background: var(--admin-messaging-control-bg, var(--app-control-bg, #ffffff));
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
        background: var(--admin-messaging-date-chip-bg, rgba(0, 0, 0, 0.05));
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
        background: var(--admin-messaging-surface-bg, var(--admin-card-bg, #ffffff));
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

export const messageBubbleStyles = css`
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
        background: var(--admin-messaging-surface-bg, var(--admin-card-bg, #ffffff));
        border: 1px solid var(--color-border, #e2e8f0);
        box-shadow: var(--shadow-sm);
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
        background: var(--admin-messaging-surface-bg, var(--admin-card-bg, #ffffff));
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
        background: var(--status-error-bg);
        color: var(--status-error-text);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .file-icon.image {
        background: var(--status-info-bg);
        color: var(--status-info-text);
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

export const assignTeamModalStyles = css`
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
        background: var(--admin-messaging-surface-bg, var(--admin-card-bg, #ffffff));
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
        background: var(--admin-messaging-control-hover-bg, var(--admin-bg, #f1f5f9));
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

export const newThreadModalStyles = css`
    :host {
        display: contents;
    }

    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        overflow-y: auto;
        padding: 24px 16px;
        transition: opacity 200ms ease, visibility 200ms ease;
    }

    .overlay.open {
        opacity: 1;
        visibility: visible;
    }

    .modal {
        background: var(--admin-messaging-surface-bg, var(--admin-card-bg, #ffffff));
        border-radius: 12px;
        width: 100%;
        max-width: 520px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        margin: auto;
        transform: scale(0.95);
        transition: transform 200ms ease;
    }

    .overlay.open .modal {
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

    .btn-close {
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

    .btn-close:hover {
        background: var(--admin-bg, #f1f5f9);
        color: var(--color-text, #0f172a);
    }

    form {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
    }

    .modal-body {
        padding: 24px;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group:last-child {
        margin-bottom: 0;
    }

    .form-label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text, #0f172a);
        margin-bottom: 8px;
    }

    .form-input, .form-select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 8px;
        font-size: 14px;
        font-family: var(--font-body, 'Inter', sans-serif);
        transition: border-color 150ms ease, box-shadow 150ms ease;
        box-sizing: border-box;
        background: var(--admin-messaging-control-bg, var(--app-control-bg, #ffffff));
        color: var(--color-text, #0f172a);
    }

    .form-select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 40px;
    }

    .form-input:focus, .form-select:focus {
        outline: none;
        border-color: var(--admin-accent, #6366f1);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .form-input::placeholder {
        color: var(--color-text-muted, #94a3b8);
    }

    .form-input:disabled, .form-select:disabled {
        background: var(--admin-bg, #f1f5f9);
        cursor: not-allowed;
        opacity: 0.7;
    }

    .form-textarea {
        resize: vertical;
        min-height: 100px;
    }

    .form-hint {
        font-size: 12px;
        color: var(--color-text-muted, #94a3b8);
        margin-top: 6px;
    }

    .form-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 24px 0;
        color: var(--color-text-muted, #94a3b8);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .form-divider::before,
    .form-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--color-border, #e2e8f0);
    }

    .toggle-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
    }

    .toggle-btn {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid var(--color-border, #e2e8f0);
        background: var(--admin-messaging-control-bg, var(--app-control-bg, #ffffff));
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-muted, #64748b);
        cursor: pointer;
        transition: all 150ms ease;
        font-family: var(--font-body, 'Inter', sans-serif);
    }

    .toggle-btn:hover {
        border-color: var(--admin-accent, #6366f1);
        color: var(--admin-accent, #6366f1);
    }

    .toggle-btn.active {
        background: var(--admin-messaging-toggle-active-bg, rgba(99, 102, 241, 0.1));
        border-color: var(--admin-accent, #6366f1);
        color: var(--admin-accent, #6366f1);
    }

    .modal-footer {
        display: flex;
        align-items: center;
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

    .btn-cancel {
        background: var(--admin-messaging-control-bg, var(--app-control-bg, #ffffff));
        border: 1px solid var(--color-border, #e2e8f0);
        color: var(--color-text, #0f172a);
    }

    .btn-cancel:hover {
        background: var(--admin-messaging-control-hover-bg, var(--admin-bg, #f1f5f9));
    }

    .btn-primary {
        background: var(--admin-accent, #6366f1);
        border: none;
        color: white;
    }

    .btn-primary:hover {
        background: var(--admin-accent-hover, #4f46e5);
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .loading-text {
        font-size: 13px;
        color: var(--color-text-muted, #94a3b8);
        font-style: italic;
    }

    .no-phone-warning {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: var(--status-warning-bg);
        border-radius: 8px;
        font-size: 13px;
        color: var(--status-warning-text);
        margin-top: 8px;
    }

    .no-phone-warning svg {
        flex-shrink: 0;
    }

    .form-error {
        font-size: 12px;
        color: var(--color-error);
        margin-top: 6px;
    }

    .form-input.error {
        border-color: var(--color-error);
    }

    .form-input.error:focus {
        border-color: var(--color-error);
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .account-search-container {
        position: relative;
        margin-bottom: 8px;
    }

    .account-search {
        width: 100%;
        padding: 8px 12px 8px 36px;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 6px;
        font-size: 13px;
        font-family: var(--font-body, 'Inter', sans-serif);
        box-sizing: border-box;
        background: var(--admin-messaging-control-bg, var(--app-control-bg, #ffffff));
        color: var(--color-text, #0f172a);
    }

    .account-search:focus {
        outline: none;
        border-color: var(--admin-accent, #6366f1);
    }

    .account-search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-muted, #94a3b8);
        pointer-events: none;
    }
`;
