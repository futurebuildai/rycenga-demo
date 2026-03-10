/**
 * PvPageDocs - Contractor "My Docs" page
 * View dealer-shared documents, upload files to dealer, organize persisted folders, acknowledge docs
 */

import { html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DocsService } from '../../connect/services/docs.service.js';
import { PvToast } from '../atoms/pv-toast.js';
import { pageShellStyles } from '../../styles/shared.js';
import { docsPageStyles, myDocsPageStyles } from '../../styles/pages.js';
import type {
    ContractorDocumentDTO,
    ContractorDocsSummary,
    ContractorDocsTab,
    DocsSortOption,
} from '../../connect/types/domain.js';
import '../atoms/pv-page-tour-modal.js';

@customElement('pv-page-docs')
export class PvPageDocs extends PvBase {
    static styles = [
        ...PvBase.styles,
        pageShellStyles,
        docsPageStyles,
        myDocsPageStyles,
    ];

    // Tab & filters
    @state() private activeTab: ContractorDocsTab = 'all';
    @state() private searchQuery = '';
    @state() private sortOption: DocsSortOption = 'newest';
    @state() private activeFolder: string | null = null;

    // File list
    @state() private docs: ContractorDocumentDTO[] = [];
    @state() private total = 0;
    @state() private page = 1;
    @state() private pageSize = 20;
    @state() private loading = true;
    @state() private error: string | null = null;

    // Summary
    @state() private summary: ContractorDocsSummary | null = null;
    @state() private summaryLoading = true;

    // Folders
    @state() private folders: string[] = [];
    @state() private pendingFolders: string[] = [];

    // Upload modal
    @state() private uploadModalOpen = false;
    @state() private uploadFile: File | null = null;
    @state() private uploadDragover = false;
    @state() private uploadMemo = '';
    @state() private uploadAttentionTo = '';
    @state() private uploadUploading = false;
    @state() private uploadProgress = 0;

    // Acknowledge modal
    @state() private ackModalOpen = false;
    @state() private ackDoc: ContractorDocumentDTO | null = null;
    @state() private ackLoading = false;

    // Folder modal
    @state() private createFolderModalOpen = false;
    @state() private newFolderName = '';
    @state() private moveFolderModalOpen = false;
    @state() private moveDoc: ContractorDocumentDTO | null = null;
    @state() private selectedFolderName: string | null = null;

    // Preview drawer
    @state() private previewOpen = false;
    @state() private previewDoc: ContractorDocumentDTO | null = null;
    @state() private previewUrl = '';
    @state() private previewContentType = '';
    @state() private previewLoading = false;
    @state() private previewError: string | null = null;

    private debounceTimer?: number;
    private loadVersion = 0;
    private uploadInputRef: HTMLInputElement | null = null;
    private previewObjectUrl: string | null = null;
    private static readonly pendingFoldersStorageKey = 'pv-docs-pending-folders';

    connectedCallback() {
        super.connectedCallback();
        this.loadPendingFolders();
        void Promise.all([this.loadDocs(), this.loadSummary(), this.loadFolders()]);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.revokePreviewObjectUrl();
    }

    // ── Data Loading ──

    private async loadDocs() {
        const version = ++this.loadVersion;
        this.loading = true;
        this.error = null;

        try {
            const result = await DocsService.getMyDocs({
                search: this.searchQuery || undefined,
                tab: this.activeTab,
                filePath: this.activeFolder ?? undefined,
                sort: this.sortOption,
                page: this.page,
                pageSize: this.pageSize,
            });
            if (version !== this.loadVersion) return;
            this.docs = result.items;
            this.total = result.total;
        } catch (e) {
            if (version !== this.loadVersion) return;
            console.error('Failed to load documents', e);
            this.error = 'Failed to load documents. Please try again.';
        } finally {
            if (version === this.loadVersion) {
                this.loading = false;
            }
        }
    }

    private async loadSummary() {
        this.summaryLoading = true;
        try {
            this.summary = await DocsService.getSummary();
        } catch (e) {
            console.error('Failed to load summary', e);
        } finally {
            this.summaryLoading = false;
        }
    }

    private async loadFolders() {
        try {
            this.folders = await DocsService.getFolders();
            this.reconcilePendingFolders();
        } catch (e) {
            console.error('Failed to load folders', e);
        }
    }

    // ── Actions ──

    private handleTabChange(tab: ContractorDocsTab) {
        this.activeTab = tab;
        this.page = 1;
        this.activeFolder = null;
        void this.loadDocs();
    }

    private handleSearchInput(e: InputEvent) {
        const value = (e.target as HTMLInputElement).value;
        this.searchQuery = value;
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = window.setTimeout(() => {
            this.page = 1;
            void this.loadDocs();
        }, 300);
    }

    private handleSortChange(e: Event) {
        this.sortOption = (e.target as HTMLSelectElement).value as DocsSortOption;
        this.page = 1;
        void this.loadDocs();
    }

    private handleFolderClick(folderName: string) {
        if (this.activeFolder === folderName) {
            this.activeFolder = null;
        } else {
            this.activeFolder = folderName;
        }
        this.page = 1;
        void this.loadDocs();
    }

    private openCreateFolderModal() {
        this.createFolderModalOpen = true;
        this.newFolderName = '';
    }

    private closeCreateFolderModal() {
        this.createFolderModalOpen = false;
        this.newFolderName = '';
    }

    private handlePrevPage() {
        if (this.page > 1) {
            this.page--;
            void this.loadDocs();
        }
    }

    private handleNextPage() {
        if (this.page * this.pageSize < this.total) {
            this.page++;
            void this.loadDocs();
        }
    }

    // ── Preview ──

    private async handlePreviewDoc(doc: ContractorDocumentDTO) {
        this.previewDoc = doc;
        this.previewOpen = true;
        this.previewLoading = true;
        this.previewError = null;
        this.revokePreviewObjectUrl();
        this.previewUrl = '';
        this.previewContentType = '';

        try {
            const { blob, contentType } = await DocsService.getFileContent(doc.assignmentId);
            this.previewObjectUrl = URL.createObjectURL(blob);
            this.previewUrl = this.previewObjectUrl;
            this.previewContentType = contentType;
        } catch (e) {
            console.error('Failed to load preview', e);
            this.previewError = 'Failed to load preview.';
        } finally {
            this.previewLoading = false;
        }
    }

    private closePreview() {
        this.revokePreviewObjectUrl();
        this.previewOpen = false;
        this.previewDoc = null;
        this.previewUrl = '';
        this.previewContentType = '';
    }

    // ── Acknowledge ──

    private openAckModal(doc: ContractorDocumentDTO) {
        this.ackDoc = doc;
        this.ackModalOpen = true;
    }

    private closeAckModal() {
        this.ackModalOpen = false;
        this.ackDoc = null;
    }

    private async confirmAcknowledge() {
        if (!this.ackDoc) return;
        this.ackLoading = true;

        try {
            await DocsService.acknowledgeDocument(this.ackDoc.assignmentId);
            PvToast.show('Document acknowledged', 'success');
            this.closeAckModal();
            void this.loadDocs();
            void this.loadSummary();
        } catch (e) {
            console.error('Failed to acknowledge', e);
            PvToast.show('Failed to acknowledge document', 'error');
        } finally {
            this.ackLoading = false;
        }
    }

    // ── Upload to Dealer ──

    private openUploadModal() {
        this.uploadModalOpen = true;
        this.uploadFile = null;
        this.uploadMemo = '';
        this.uploadAttentionTo = '';
        this.selectedFolderName = this.activeFolder;
        this.uploadUploading = false;
        this.uploadProgress = 0;
        this.uploadDragover = false;
    }

    private closeUploadModal() {
        if (this.uploadUploading) return;
        this.uploadModalOpen = false;
        this.selectedFolderName = null;
    }

    private handleUploadDragOver(e: DragEvent) {
        e.preventDefault();
        this.uploadDragover = true;
    }

    private handleUploadDragLeave() {
        this.uploadDragover = false;
    }

    private handleUploadDrop(e: DragEvent) {
        e.preventDefault();
        this.uploadDragover = false;
        const file = e.dataTransfer?.files[0];
        if (file) this.uploadFile = file;
    }

    private handleUploadFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files?.[0]) {
            this.uploadFile = input.files[0];
        }
    }

    private triggerFileInput() {
        if (!this.uploadInputRef) {
            this.uploadInputRef = document.createElement('input');
            this.uploadInputRef.type = 'file';
            this.uploadInputRef.addEventListener('change', (e) => this.handleUploadFileSelect(e));
        }
        this.uploadInputRef.value = '';
        this.uploadInputRef.click();
    }

    private removeUploadFile() {
        this.uploadFile = null;
    }

    private async submitUpload() {
        if (!this.uploadFile) return;
        this.uploadUploading = true;
        this.uploadProgress = 25;

        try {
            await DocsService.uploadFile(this.uploadFile, {
                memo: this.uploadMemo || undefined,
                attentionTo: this.uploadAttentionTo || undefined,
                filePath: this.selectedFolderName || undefined,
            });
            this.uploadProgress = 100;
            this.finalizePendingFolder(this.selectedFolderName);

            PvToast.show('File uploaded to dealer', 'success');
            this.uploadModalOpen = false;
            void this.loadDocs();
            void this.loadSummary();
            void this.loadFolders();
        } catch (e) {
            console.error('Upload failed', e);
            PvToast.show('Failed to upload file', 'error');
        } finally {
            this.uploadUploading = false;
        }
    }

    private openMoveFolderModal(doc: ContractorDocumentDTO) {
        this.moveDoc = doc;
        this.selectedFolderName = doc.filePath ?? null;
        this.moveFolderModalOpen = true;
    }

    private closeMoveFolderModal() {
        this.moveFolderModalOpen = false;
        this.moveDoc = null;
    }

    private async submitMoveFolder() {
        if (!this.moveDoc) return;

        try {
            await DocsService.moveToFolder(this.moveDoc.assignmentId, this.selectedFolderName);
            this.finalizePendingFolder(this.selectedFolderName);
            PvToast.show('File moved', 'success');
            this.closeMoveFolderModal();
            void this.loadDocs();
            void this.loadFolders();
        } catch (e) {
            console.error('Failed to move file', e);
            PvToast.show('Failed to move file', 'error');
        }
    }

    private async deleteDocument(doc: ContractorDocumentDTO) {
        const confirmed = window.confirm(`Delete "${doc.fileName}"? This cannot be undone.`);
        if (!confirmed) return;

        try {
            await DocsService.deleteDocument(doc.assignmentId);
            if (this.previewDoc?.assignmentId === doc.assignmentId) {
                this.closePreview();
            }
            PvToast.show('File deleted', 'success');
            void this.loadDocs();
            void this.loadSummary();
            void this.loadFolders();
        } catch (e) {
            console.error('Failed to delete file', e);
            PvToast.show('Failed to delete file', 'error');
        }
    }

    // ── Helpers ──

    private revokePreviewObjectUrl() {
        if (!this.previewObjectUrl) return;
        URL.revokeObjectURL(this.previewObjectUrl);
        this.previewObjectUrl = null;
    }

    private loadPendingFolders() {
        try {
            const raw = localStorage.getItem(PvPageDocs.pendingFoldersStorageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return;
            this.pendingFolders = parsed
                .map((value) => String(value).trim())
                .filter((value, index, array) => value && array.indexOf(value) === index);
        } catch {
            this.pendingFolders = [];
        }
    }

    private persistPendingFolders() {
        localStorage.setItem(PvPageDocs.pendingFoldersStorageKey, JSON.stringify(this.pendingFolders));
    }

    private reconcilePendingFolders() {
        const serverFolders = new Set(this.folders);
        const nextPending = this.pendingFolders.filter((folder) => !serverFolders.has(folder));
        if (nextPending.length !== this.pendingFolders.length) {
            this.pendingFolders = nextPending;
            this.persistPendingFolders();
        }
    }

    private createPendingFolder(name: string) {
        const normalized = name.trim();
        if (!normalized || this.folders.includes(normalized) || this.pendingFolders.includes(normalized)) return;
        this.pendingFolders = [...this.pendingFolders, normalized].sort((a, b) => a.localeCompare(b));
        this.persistPendingFolders();
    }

    private finalizePendingFolder(name: string | null) {
        if (!name) return;
        const normalized = name.trim();
        if (!normalized) return;
        if (!this.pendingFolders.includes(normalized)) return;
        this.pendingFolders = this.pendingFolders.filter((folder) => folder !== normalized);
        this.persistPendingFolders();
    }

    private folderItems() {
        const merged = new Map<string, { name: string; pending: boolean }>();
        for (const folder of this.folders) {
            merged.set(folder, { name: folder, pending: false });
        }
        for (const folder of this.pendingFolders) {
            if (!merged.has(folder)) {
                merged.set(folder, { name: folder, pending: true });
            }
        }
        return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
    }

    private folderIconStyle(pending: boolean) {
        return pending ? 'filter: grayscale(1) opacity(0.45);' : nothing;
    }

    private formatFileSize(bytes: number | null | undefined): string {
        if (!bytes || bytes < 0) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    private formatDate(dateStr: string): string {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    }

    private getFileExt(fileName: string): string {
        const dot = fileName.lastIndexOf('.');
        return dot >= 0 ? fileName.substring(dot + 1).toLowerCase() : '';
    }

    private getFileIconClass(fileName: string): string {
        const ext = this.getFileExt(fileName);
        if (ext === 'pdf') return 'file-icon file-icon-pdf';
        if (['doc', 'docx'].includes(ext)) return 'file-icon file-icon-doc';
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'file-icon file-icon-xls';
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'file-icon file-icon-img';
        return 'file-icon file-icon-default';
    }

    private getFileIconLabel(fileName: string): string {
        const ext = this.getFileExt(fileName);
        return ext ? ext.toUpperCase().slice(0, 4) : 'FILE';
    }

    private handleKeydown(e: KeyboardEvent, callback: () => void) {
        if (e.key === 'Escape') callback();
    }

    private handleOverlayClick(e: MouseEvent, callback: () => void) {
        if (e.target === e.currentTarget) callback();
    }

    // ── Render ──

    render() {
        return html`
            <pv-page-tour-modal 
                pageId="customer-docs"
                heading="Document Management"
                .features=${[
                { title: 'Dealer Documents', description: 'View and download catalogs, price lists, and resources shared by the dealer.' },
                { title: 'My Documents', description: 'Securely upload your own documents (certificates, specs) and organize them into folders.' },
                { title: 'Document Acknowledgment', description: 'Sign off on required documents or policies with one click.' }
            ]}
            ></pv-page-tour-modal>
            <div class="docs-page-shell">
                ${this.renderHeader()}
                ${this.renderSummary()}
                ${this.renderTabs()}
                ${this.activeTab === 'all' && this.folderItems().length > 0 ? this.renderFolderBar() : ''}
                ${this.renderToolbar()}
                ${this.renderFileList()}
            </div>
            ${this.ackModalOpen ? this.renderAckModal() : ''}
            ${this.uploadModalOpen ? this.renderUploadModal() : ''}
            ${this.createFolderModalOpen ? this.renderCreateFolderModal() : ''}
            ${this.moveFolderModalOpen ? this.renderMoveFolderModal() : ''}
            ${this.previewOpen ? this.renderPreviewDrawer() : ''}
        `;
    }

    private renderHeader() {
        return html`
            <div class="docs-header">
                <div>
                    <h1 class="section-title">My Docs</h1>
                    <p class="section-subtitle">View shared documents and upload files to your dealer</p>
                </div>
                <div class="docs-header-actions">
                    <button class="btn" @click=${this.openCreateFolderModal}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            <line x1="12" y1="11" x2="12" y2="17"></line>
                            <line x1="9" y1="14" x2="15" y2="14"></line>
                        </svg>
                        New Folder
                    </button>
                    <button class="btn btn-primary" @click=${this.openUploadModal}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Upload to Dealer
                    </button>
                </div>
            </div>
        `;
    }

    private renderSummary() {
        if (this.summaryLoading || !this.summary) {
            return html`
                <div class="docs-summary">
                    ${[1, 2, 3, 4].map(() => html`
                        <div class="docs-summary-card">
                            <span class="summary-value">—</span>
                            <span class="summary-label">Loading...</span>
                        </div>
                    `)}
                </div>
            `;
        }
        return html`
            <div class="docs-summary">
                <div class="docs-summary-card">
                    <span class="summary-value">${this.summary.totalFiles}</span>
                    <span class="summary-label">Total Files</span>
                </div>
                <div class="docs-summary-card card-shared">
                    <span class="summary-value">${this.summary.sharedByDealer}</span>
                    <span class="summary-label">Shared by Dealer</span>
                </div>
                <div class="docs-summary-card card-uploads">
                    <span class="summary-value">${this.summary.myUploads}</span>
                    <span class="summary-label">My Uploads</span>
                </div>
                <div class="docs-summary-card card-pending">
                    <span class="summary-value">${this.summary.pendingAck}</span>
                    <span class="summary-label">Pending Acknowledgment</span>
                </div>
            </div>
        `;
    }

    private renderTabs() {
        const tabs: { key: ContractorDocsTab; label: string }[] = [
            { key: 'all', label: 'All Files' },
            { key: 'shared', label: 'Shared by Dealer' },
            { key: 'uploads', label: 'My Uploads' },
        ];
        return html`
            <div class="docs-tabs">
                ${tabs.map(t => html`
                    <button
                        class="docs-tab ${this.activeTab === t.key ? 'active' : ''}"
                        @click=${() => this.handleTabChange(t.key)}
                    >${t.label}</button>
                `)}
            </div>
        `;
    }

    private renderFolderBar() {
        const folders = this.folderItems();
        return html`
            <div class="docs-folder-bar">
                <button
                    class="folder-chip ${this.activeFolder === null ? 'active' : ''}"
                    @click=${() => { this.activeFolder = null; this.page = 1; void this.loadDocs(); }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    All
                </button>
                ${folders.map((folder) => html`
                    <button
                        class="folder-chip ${this.activeFolder === folder.name ? 'active' : ''}"
                        @click=${() => this.handleFolderClick(folder.name)}
                        title=${folder.pending ? 'Pending until a file is uploaded' : folder.name}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style=${this.folderIconStyle(folder.pending)}>
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        ${folder.name}
                    </button>
                `)}
            </div>
        `;
    }

    private renderToolbar() {
        return html`
            <div class="docs-toolbar">
                <div class="docs-search-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        class="docs-search"
                        placeholder="Search files..."
                        .value=${this.searchQuery}
                        @input=${this.handleSearchInput}
                    />
                </div>
                <select class="docs-sort" .value=${this.sortOption} @change=${this.handleSortChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="size-desc">Largest First</option>
                    <option value="size-asc">Smallest First</option>
                </select>
            </div>
        `;
    }

    private renderFileList() {
        if (this.loading) {
            return html`<p class="loading-text">Loading documents...</p>`;
        }

        if (this.error) {
            return html`
                <p class="error-text">${this.error}</p>
                <div style="text-align:center">
                    <button class="btn-retry" @click=${() => void this.loadDocs()}>Retry</button>
                </div>
            `;
        }

        if (this.docs.length === 0) {
            return this.renderEmptyState();
        }

        const totalPages = Math.ceil(this.total / this.pageSize);
        const start = (this.page - 1) * this.pageSize + 1;
        const end = Math.min(this.page * this.pageSize, this.total);

        return html`
            <div class="docs-file-list">
                ${this.docs.map(doc => this.renderFileItem(doc))}
            </div>
            ${this.total > this.pageSize ? html`
                <div class="docs-pagination">
                    <span>Showing ${start}–${end} of ${this.total}</span>
                    <div class="docs-pagination-controls">
                        <button ?disabled=${this.page <= 1} @click=${this.handlePrevPage}>Previous</button>
                        <span>Page ${this.page} of ${totalPages}</span>
                        <button ?disabled=${this.page >= totalPages} @click=${this.handleNextPage}>Next</button>
                    </div>
                </div>
            ` : ''}
        `;
    }

    private renderFileItem(doc: ContractorDocumentDTO) {
        const needsAck = doc.intent === 'dealer_shared' && doc.requiresAck && !doc.acknowledgedAt;

        return html`
            <div class="docs-file-item">
                <div class="${this.getFileIconClass(doc.fileName)}">
                    ${this.getFileIconLabel(doc.fileName)}
                </div>
                <div class="docs-file-name">
                    <a class="docs-file-name-link" @click=${() => this.handlePreviewDoc(doc)}>
                        ${doc.fileName}
                    </a>
                    <div class="docs-file-meta">
                        ${this.formatFileSize(doc.fileSize)} · ${this.formatDate(doc.createdAt)}
                    </div>
                </div>
                <div class="docs-file-badges">
                    ${this.activeTab === 'all' ? html`
                        <span class="source-badge ${doc.intent === 'dealer_shared' ? 'dealer' : 'contractor'}">${doc.intent === 'dealer_shared' ? 'Dealer' : 'Uploaded'}</span>
                    ` : ''}
                    ${doc.intent === 'dealer_shared' && doc.requiresAck ? html`
                        <span class="ack-badge ${doc.acknowledgedAt ? 'acknowledged' : 'pending'}">
                            ${doc.acknowledgedAt ? 'Acknowledged' : 'Needs Ack'}
                        </span>
                    ` : ''}
                </div>
                <div class="docs-file-actions">
                    ${needsAck ? html`
                        <button class="btn-ack" @click=${() => this.openAckModal(doc)}>Acknowledge</button>
                    ` : ''}
                    <button class="btn-icon" title="Move to folder" @click=${() => this.openMoveFolderModal(doc)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" title="Delete" @click=${() => this.deleteDocument(doc)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14H6L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M9 6V4h6v2"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" title="Preview" @click=${() => this.handlePreviewDoc(doc)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    private renderEmptyState() {
        const messages: Record<ContractorDocsTab, { title: string; desc: string }> = {
            all: { title: 'No Documents Yet', desc: 'Documents shared by your dealer and your uploads will appear here.' },
            shared: { title: 'No Shared Documents', desc: 'Your dealer hasn\'t shared any documents with you yet.' },
            uploads: { title: 'No Uploads', desc: 'You haven\'t uploaded any documents to your dealer yet.' },
        };
        const msg = messages[this.activeTab];

        return html`
            <div class="docs-empty-state">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <h3>${msg.title}</h3>
                <p>${msg.desc}</p>
            </div>
        `;
    }

    // ── Modals ──

    private renderAckModal() {
        return html`
            <div
                class="modal-overlay"
                @click=${(e: MouseEvent) => this.handleOverlayClick(e, () => this.closeAckModal())}
                @keydown=${(e: KeyboardEvent) => this.handleKeydown(e, () => this.closeAckModal())}
            >
                <div class="modal-panel">
                    <button class="modal-close" @click=${this.closeAckModal}>&times;</button>
                    <h2 class="modal-title">Acknowledge Document</h2>
                    <p class="modal-subtitle">Confirm that you have received and reviewed this document.</p>
                    <div class="ack-confirm-content">
                        <strong>${this.ackDoc?.fileName}</strong>
                        By clicking confirm, you acknowledge receipt of this document from your dealer.
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-cancel" @click=${this.closeAckModal}>Cancel</button>
                        <button
                            class="btn btn-warning"
                            ?disabled=${this.ackLoading}
                            @click=${this.confirmAcknowledge}
                        >${this.ackLoading ? 'Acknowledging...' : 'Confirm Acknowledgment'}</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderUploadModal() {
        return html`
            <div
                class="modal-overlay"
                @click=${(e: MouseEvent) => this.handleOverlayClick(e, () => this.closeUploadModal())}
                @keydown=${(e: KeyboardEvent) => this.handleKeydown(e, () => this.closeUploadModal())}
            >
                <div class="modal-panel wide">
                    <button class="modal-close" @click=${this.closeUploadModal}>&times;</button>
                    <h2 class="modal-title">Upload to Dealer</h2>
                    <p class="modal-subtitle">Send a document to your dealer for review.</p>

                    ${!this.uploadFile ? html`
                        <div
                            class="my-upload-dropzone ${this.uploadDragover ? 'dragover' : ''}"
                            @dragover=${this.handleUploadDragOver}
                            @dragleave=${this.handleUploadDragLeave}
                            @drop=${this.handleUploadDrop}
                            @click=${this.triggerFileInput}
                        >
                            <div class="my-upload-dropzone-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                            </div>
                            <div class="my-upload-dropzone-text">Drop file here or click to browse</div>
                            <div class="my-upload-dropzone-hint">Max 50 MB per file</div>
                        </div>
                    ` : html`
                        <div class="my-upload-file-preview">
                            <div class="${this.getFileIconClass(this.uploadFile.name)}">
                                ${this.getFileIconLabel(this.uploadFile.name)}
                            </div>
                            <span class="file-name">${this.uploadFile.name}</span>
                            <span class="file-size">${this.formatFileSize(this.uploadFile.size)}</span>
                            <button class="file-remove" @click=${this.removeUploadFile} ?disabled=${this.uploadUploading}>&times;</button>
                        </div>
                    `}

                    <div class="modal-field">
                        <label>Folder</label>
                        <input
                            type="text"
                            list="docs-folder-options"
                            placeholder="Root or choose/type a folder"
                            .value=${this.selectedFolderName ?? ''}
                            @input=${(e: InputEvent) => {
                const value = (e.target as HTMLInputElement).value.trim();
                this.selectedFolderName = value || null;
            }}
                        />
                        <datalist id="docs-folder-options">
                            ${this.folderItems().map((folder) => html`<option value=${folder.name}></option>`)}
                        </datalist>
                    </div>

                    <div class="modal-field">
                        <label>Attention To</label>
                        <select
                            .value=${this.uploadAttentionTo}
                            @change=${(e: Event) => { this.uploadAttentionTo = (e.target as HTMLSelectElement).value; }}
                        >
                            <option value="">Select (optional)</option>
                            <option value="General">General</option>
                            <option value="Billing">Billing</option>
                            <option value="Legal">Legal</option>
                            <option value="Accounting">Accounting</option>
                        </select>
                    </div>

                    <div class="modal-field">
                        <label>Memo</label>
                        <textarea
                            placeholder="Add a note about this document (optional)"
                            .value=${this.uploadMemo}
                            @input=${(e: InputEvent) => { this.uploadMemo = (e.target as HTMLTextAreaElement).value; }}
                        ></textarea>
                    </div>

                    ${this.uploadUploading ? html`
                        <div class="upload-progress-bar">
                            <div class="fill" style="width: ${this.uploadProgress}%"></div>
                        </div>
                    ` : ''}

                    <div class="modal-actions">
                        <button class="btn btn-cancel" @click=${this.closeUploadModal} ?disabled=${this.uploadUploading}>Cancel</button>
                        <button
                            class="btn btn-primary"
                            ?disabled=${!this.uploadFile || this.uploadUploading}
                            @click=${this.submitUpload}
                        >${this.uploadUploading ? 'Uploading...' : 'Upload'}</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderCreateFolderModal() {
        return html`
            <div
                class="modal-overlay"
                @click=${(e: MouseEvent) => this.handleOverlayClick(e, () => this.closeCreateFolderModal())}
                @keydown=${(e: KeyboardEvent) => this.handleKeydown(e, () => this.closeCreateFolderModal())}
            >
                <div class="modal-panel">
                    <button class="modal-close" @click=${this.closeCreateFolderModal}>&times;</button>
                    <h2 class="modal-title">New Folder</h2>
                    <p class="modal-subtitle">Create a folder locally. It will persist after you upload a file into it.</p>
                    <div class="modal-field">
                        <label>Folder Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Permits, Contracts..."
                            .value=${this.newFolderName}
                            @input=${(e: InputEvent) => { this.newFolderName = (e.target as HTMLInputElement).value; }}
                            @keydown=${(e: KeyboardEvent) => {
                if (e.key !== 'Enter') return;
                const name = this.newFolderName.trim();
                if (!name) return;
                this.createPendingFolder(name);
                this.selectedFolderName = name;
                this.closeCreateFolderModal();
            }}
                        />
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-cancel" @click=${this.closeCreateFolderModal}>Cancel</button>
                        <button
                            class="btn btn-primary"
                            ?disabled=${!this.newFolderName.trim()}
                            @click=${() => {
                const name = this.newFolderName.trim();
                if (!name) return;
                this.createPendingFolder(name);
                this.selectedFolderName = name;
                this.closeCreateFolderModal();
            }}
                        >Create Folder</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderMoveFolderModal() {
        const folders = this.folderItems();
        return html`
            <div
                class="modal-overlay"
                @click=${(e: MouseEvent) => this.handleOverlayClick(e, () => this.closeMoveFolderModal())}
                @keydown=${(e: KeyboardEvent) => this.handleKeydown(e, () => this.closeMoveFolderModal())}
            >
                <div class="modal-panel">
                    <button class="modal-close" @click=${this.closeMoveFolderModal}>&times;</button>
                    <h2 class="modal-title">Move to Folder</h2>
                    <p class="modal-subtitle">Move "${this.moveDoc?.fileName}" to a folder.</p>
                    <div class="modal-field">
                        <label>Select Folder</label>
                        <select
                            .value=${this.selectedFolderName ?? ''}
                            @change=${(e: Event) => {
                const val = (e.target as HTMLSelectElement).value;
                this.selectedFolderName = val || null;
            }}
                        >
                            <option value="">No Folder (Root)</option>
                            ${folders.map((folder) => html`
                                <option value=${folder.name}>${folder.name}</option>
                            `)}
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-cancel" @click=${this.closeMoveFolderModal}>Cancel</button>
                        <button class="btn btn-primary" @click=${this.submitMoveFolder}>Move</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderPreviewDrawer() {
        return html`
            <div
                class="modal-overlay"
                @click=${(e: MouseEvent) => this.handleOverlayClick(e, () => this.closePreview())}
                @keydown=${(e: KeyboardEvent) => this.handleKeydown(e, () => this.closePreview())}
            >
                <div class="my-preview-drawer">
                    <div class="my-preview-drawer-header">
                        <h3>${this.previewDoc?.fileName ?? 'Preview'}</h3>
                        <div class="preview-actions">
                            ${this.previewDoc ? html`
                                <button class="preview-btn-download preview-btn-danger" @click=${() => this.deleteDocument(this.previewDoc!)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6l-1 14H6L5 6"></path>
                                        <path d="M10 11v6"></path>
                                        <path d="M14 11v6"></path>
                                        <path d="M9 6V4h6v2"></path>
                                    </svg>
                                    Delete
                                </button>
                            ` : ''}
                            <button class="modal-close" style="position:static" @click=${this.closePreview}>&times;</button>
                        </div>
                    </div>
                    <div class="my-preview-drawer-body">
                        ${this.previewLoading ? html`
                            <div class="my-preview-loading">Loading preview...</div>
                        ` : this.previewError ? html`
                            <div class="my-preview-error">
                                <span>${this.previewError}</span>
                                <button class="btn-retry" @click=${() => { if (this.previewDoc) void this.handlePreviewDoc(this.previewDoc); }}>Retry</button>
                            </div>
                        ` : this.renderPreviewContent()}
                    </div>
                </div>
            </div>
        `;
    }

    private renderPreviewContent() {
        const ct = this.previewContentType.toLowerCase();

        if (ct.includes('pdf')) {
            return html`<iframe src="${this.previewUrl}" title="Document preview"></iframe>`;
        }

        if (ct.startsWith('image/')) {
            return html`<img src="${this.previewUrl}" alt="${this.previewDoc?.fileName ?? 'Preview'}" />`;
        }

        // Unsupported type — show download fallback
        const ext = this.previewDoc ? this.getFileExt(this.previewDoc.fileName) : '';
        return html`
            <div class="my-preview-unsupported">
                <div class="file-type-icon">${ext.toUpperCase() || 'FILE'}</div>
                <h3>Preview not available</h3>
                <p>This file type cannot be previewed. Use the link below to download it.</p>
                <a href="${this.previewUrl}" target="_blank" rel="noopener noreferrer" class="btn-retry">Download File</a>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'pv-page-docs': PvPageDocs;
    }
}
