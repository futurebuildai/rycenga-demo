/**
 * LogoUpload - Drag-and-drop logo upload component
 * Validates file type (PNG/JPG/SVG) and size (max 2MB)
 * Shows preview with remove option
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('logo-upload')
export class LogoUpload extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .upload-area {
            border: 2px dashed var(--color-border, #e2e8f0);
            border-radius: 8px;
            padding: 32px;
            text-align: center;
            cursor: pointer;
            transition: all 0.15s ease;
            background: var(--admin-card-bg, #ffffff);
        }

        .upload-area:hover {
            border-color: var(--admin-accent, #6366f1);
            background: rgba(99, 102, 241, 0.02);
        }

        .upload-area.drag-over {
            border-color: var(--admin-accent, #6366f1);
            background: rgba(99, 102, 241, 0.05);
        }

        .upload-area.has-logo {
            border-style: solid;
            padding: 16px;
        }

        .upload-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 16px;
            color: var(--color-text-muted, #94a3b8);
        }

        .upload-text {
            font-size: 14px;
            color: var(--color-text, #0f172a);
            margin-bottom: 4px;
        }

        .upload-hint {
            font-size: 12px;
            color: var(--color-text-muted, #94a3b8);
        }

        .preview-container {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .logo-preview {
            max-width: 200px;
            max-height: 80px;
            object-fit: contain;
            border-radius: 4px;
            background: #f8fafc;
            padding: 8px;
        }

        .preview-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .btn {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            font-family: var(--font-body, 'Inter', sans-serif);
        }

        .btn-change {
            background: var(--admin-accent, #6366f1);
            color: white;
            border: none;
        }

        .btn-change:hover {
            background: var(--admin-accent-hover, #4f46e5);
        }

        .btn-remove {
            background: white;
            color: #ef4444;
            border: 1px solid #fecaca;
        }

        .btn-remove:hover {
            background: #fef2f2;
            border-color: #ef4444;
        }

        .error-message {
            margin-top: 8px;
            padding: 8px 12px;
            background: #fef2f2;
            color: #dc2626;
            border-radius: 6px;
            font-size: 13px;
        }

        .uploading-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            color: var(--color-text-muted);
            font-size: 14px;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid var(--color-border);
            border-top-color: var(--admin-accent);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        input[type="file"] {
            display: none;
        }
    `;

    @property({ type: String }) logoUrl: string | null = null;
    @property({ type: Boolean }) uploading = false;

    @state() private dragOver = false;
    @state() private error = '';
    @state() private previewUrl: string | null = null;

    private fileInput: HTMLInputElement | null = null;

    private handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.dragOver = true;
    }

    private handleDragLeave(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.dragOver = false;
    }

    private handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.dragOver = false;

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            this.processFile(files[0]);
        }
    }

    private handleClick() {
        if (!this.uploading) {
            this.fileInput?.click();
        }
    }

    private handleFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.processFile(input.files[0]);
        }
    }

    private processFile(file: File) {
        this.error = '';

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            this.error = 'Invalid file type. Please upload PNG, JPG, or SVG.';
            return;
        }

        // Validate file size (2MB max)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            this.error = 'File too large. Maximum size is 2MB.';
            return;
        }

        // Create preview
        this.previewUrl = URL.createObjectURL(file);

        // Dispatch event with file
        this.dispatchEvent(new CustomEvent('logo-selected', {
            detail: { file },
            bubbles: true,
            composed: true,
        }));
    }

    private handleRemove(e: Event) {
        e.stopPropagation();

        // Clean up preview URL
        if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
            this.previewUrl = null;
        }

        this.error = '';

        // Reset file input so the same file can be selected again
        if (this.fileInput) {
            this.fileInput.value = '';
        }

        this.dispatchEvent(new CustomEvent('logo-removed', {
            bubbles: true,
            composed: true,
        }));
    }

    private handleChangeClick(e: Event) {
        e.stopPropagation();
        this.fileInput?.click();
    }

    render() {
        const displayUrl = this.previewUrl || this.logoUrl;

        return html`
            <div
                class="upload-area ${this.dragOver ? 'drag-over' : ''} ${displayUrl ? 'has-logo' : ''}"
                @dragover=${this.handleDragOver}
                @dragleave=${this.handleDragLeave}
                @drop=${this.handleDrop}
                @click=${this.handleClick}
            >
                ${this.uploading ? html`
                    <div class="uploading-indicator">
                        <div class="spinner"></div>
                        Uploading...
                    </div>
                ` : displayUrl ? html`
                    <div class="preview-container">
                        <img class="logo-preview" src=${displayUrl} alt="Logo preview" />
                        <div class="preview-actions">
                            <button class="btn btn-change" @click=${this.handleChangeClick}>
                                Change Logo
                            </button>
                            <button class="btn btn-remove" @click=${this.handleRemove}>
                                Remove
                            </button>
                        </div>
                    </div>
                ` : html`
                    <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p class="upload-text">Drop your logo here or click to browse</p>
                    <p class="upload-hint">PNG, JPG, or SVG (max 2MB, recommended 200x80px)</p>
                `}
            </div>

            ${this.error ? html`
                <div class="error-message">${this.error}</div>
            ` : ''}

            <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                @change=${this.handleFileSelect}
            />
        `;
    }

    firstUpdated() {
        this.fileInput = this.renderRoot.querySelector('input[type="file"]');
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Clean up object URL
        if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'logo-upload': LogoUpload;
    }
}
