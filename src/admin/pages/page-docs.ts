import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminDocsService } from '../services/admin-docs.service.js';
import { AdminDataService } from '../services/admin-data.service.js';
import type { AdminAccount } from '../services/admin-data.service.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';
import { overviewPageStyles } from '../../styles/pages.js';
import { arCenterPageStyles } from '../../styles/pages.js';
import { docsPageStyles } from '../../styles/pages.js';
import '../../components/atoms/pv-page-tour-modal.js';
import type {
    SharedDocumentDTO,
    InboxDocumentDTO,
    DocumentDTO,
    DocsSummary,
    DocsStatusFilter,
    InboxFilter,
    DocsSortOption,
} from '../../connect/types/domain.js';

type DocsTab = 'shared' | 'inbox';

@customElement('admin-page-docs')
export class PageDocs extends LitElement {
    static styles = [overviewPageStyles, arCenterPageStyles, docsPageStyles];

    // Summary
    @state() private summary: DocsSummary | null = null;
    @state() private summaryLoading = true;
    @state() private summaryError = false;

    // Active tab
    @state() private activeTab: DocsTab = 'shared';

    // Shared tab state
    @state() private sharedDocs: SharedDocumentDTO[] = [];
    @state() private sharedTotal = 0;
    @state() private sharedPage = 1;
    @state() private sharedPageSize = 10;
    @state() private sharedLoading = false;
    @state() private sharedError = false;
    @state() private sharedStatusFilter: DocsStatusFilter = '';
    @state() private sharedSearchQuery = '';
    @state() private sharedSortOption: DocsSortOption = 'newest';

    // Inbox tab state
    @state() private inboxDocs: InboxDocumentDTO[] = [];
    @state() private inboxTotal = 0;
    @state() private inboxPage = 1;
    @state() private inboxPageSize = 10;
    @state() private inboxLoading = false;
    @state() private inboxError = false;
    @state() private inboxFilter: InboxFilter = '';
    @state() private inboxSearchQuery = '';
    @state() private inboxSortOption: DocsSortOption = 'newest';

    // Upload modal state
    @state() private uploadModalOpen = false;
    @state() private uploadFile: File | null = null;
    @state() private uploadDragover = false;
    @state() private uploadAccountId = '';
    @state() private uploadRequiresAck = true;
    @state() private uploadMemo = '';
    @state() private uploadProgress = 0;
    @state() private uploadUploading = false;
    @state() private availableAccounts: AdminAccount[] = [];

    // Toast
    @state() private toastMessage = '';
    @state() private toastType: 'success' | 'error' | 'info' = 'info';
    @state() private toastFading = false;

    // Preview drawer
    @state() private previewDoc: DocumentDTO | null = null;
    @state() private previewOpen = false;
    @state() private previewClosing = false;
    @state() private previewViewUrl = '';
    @state() private previewContentType = '';
    @state() private previewLoading = false;
    @state() private previewError = false;

    // Internal
    private sharedSearchDebounce?: ReturnType<typeof setTimeout>;
    private inboxSearchDebounce?: ReturnType<typeof setTimeout>;
    private toastTimer?: ReturnType<typeof setTimeout>;
    private summaryLoadVersion = 0;
    private sharedLoadVersion = 0;
    private inboxLoadVersion = 0;
    private inboxLoaded = false;
    private previewObjectUrl: string | null = null;

    async connectedCallback() {
        super.connectedCallback();
        document.addEventListener('keydown', this.handleKeyDown);
        await Promise.all([this.loadSummary(), this.loadSharedDocs(), this.fetchAvailableAccounts()]);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this.handleKeyDown);
        clearTimeout(this.sharedSearchDebounce);
        clearTimeout(this.inboxSearchDebounce);
        clearTimeout(this.toastTimer);
        this.revokePreviewObjectUrl();
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        if (this.uploadModalOpen) { this.uploadModalOpen = false; return; }
        if (this.previewOpen) { this.closePreview(); }
    };

    private showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
        clearTimeout(this.toastTimer);
        this.toastFading = false;
        this.toastMessage = message;
        this.toastType = type;
        this.toastTimer = setTimeout(() => {
            this.toastFading = true;
            setTimeout(() => {
                this.toastMessage = '';
                this.toastFading = false;
            }, 300);
        }, 3700);
    }

    // --- Data Loading ---

    private async loadSummary() {
        const version = ++this.summaryLoadVersion;
        this.summaryLoading = true;
        this.summaryError = false;
        try {
            const summary = await AdminDocsService.getSummary();
            if (version !== this.summaryLoadVersion) return;
            this.summary = summary;
        } catch {
            if (version !== this.summaryLoadVersion) return;
            this.summaryError = true;
        } finally {
            if (version !== this.summaryLoadVersion) return;
            this.summaryLoading = false;
        }
    }

    private async loadSharedDocs() {
        const version = ++this.sharedLoadVersion;
        this.sharedLoading = true;
        this.sharedError = false;
        try {
            const { items, total } = await AdminDocsService.getSharedDocs({
                search: this.sharedSearchQuery || undefined,
                status: this.sharedStatusFilter || undefined,
                sort: this.sharedSortOption,
                page: this.sharedPage,
                pageSize: this.sharedPageSize,
            });
            if (version !== this.sharedLoadVersion) return;
            this.sharedDocs = items;
            this.sharedTotal = total;
        } catch {
            if (version !== this.sharedLoadVersion) return;
            this.sharedError = true;
        } finally {
            if (version !== this.sharedLoadVersion) return;
            this.sharedLoading = false;
        }
    }

    private async loadInboxDocs() {
        const version = ++this.inboxLoadVersion;
        this.inboxLoading = true;
        this.inboxError = false;
        try {
            const { items, total } = await AdminDocsService.getInboxDocs({
                search: this.inboxSearchQuery || undefined,
                filter: this.inboxFilter || undefined,
                sort: this.inboxSortOption,
                page: this.inboxPage,
                pageSize: this.inboxPageSize,
            });
            if (version !== this.inboxLoadVersion) return;
            this.inboxDocs = items;
            this.inboxTotal = total;
        } catch {
            if (version !== this.inboxLoadVersion) return;
            this.inboxError = true;
        } finally {
            if (version !== this.inboxLoadVersion) return;
            this.inboxLoading = false;
        }
    }

    private async fetchAvailableAccounts() {
        try {
            const { items } = await AdminDataService.getAccounts(200, 0, false, 'name');
            this.availableAccounts = items;
        } catch (e) {
            console.error('Failed to fetch accounts for doc sharing', e);
        }
    }

    // --- Event Handlers ---

    private async handleTabChange(tab: DocsTab) {
        this.activeTab = tab;
        if (tab === 'inbox' && !this.inboxLoaded) {
            this.inboxLoaded = true;
            await this.loadInboxDocs();
        }
    }

    private setSharedStatusFilter(status: DocsStatusFilter) {
        this.sharedStatusFilter = status;
        this.sharedPage = 1;
        this.loadSharedDocs();
    }

    private handleSharedSearchInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        clearTimeout(this.sharedSearchDebounce);
        this.sharedSearchDebounce = setTimeout(() => {
            this.sharedSearchQuery = value;
            this.sharedPage = 1;
            this.loadSharedDocs();
        }, 300);
    }

    private handleSharedSortChange(e: Event) {
        this.sharedSortOption = (e.target as HTMLSelectElement).value as DocsSortOption;
        this.sharedPage = 1;
        this.loadSharedDocs();
    }

    private handleSharedPageChange(page: number) {
        const totalPages = Math.ceil(this.sharedTotal / this.sharedPageSize);
        if (page < 1 || page > totalPages) return;
        this.sharedPage = page;
        this.loadSharedDocs();
    }

    private setInboxFilter(filter: InboxFilter) {
        this.inboxFilter = filter;
        this.inboxPage = 1;
        this.loadInboxDocs();
    }

    private handleInboxSearchInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        clearTimeout(this.inboxSearchDebounce);
        this.inboxSearchDebounce = setTimeout(() => {
            this.inboxSearchQuery = value;
            this.inboxPage = 1;
            this.loadInboxDocs();
        }, 300);
    }

    private handleInboxSortChange(e: Event) {
        this.inboxSortOption = (e.target as HTMLSelectElement).value as DocsSortOption;
        this.inboxPage = 1;
        this.loadInboxDocs();
    }

    private handleInboxPageChange(page: number) {
        const totalPages = Math.ceil(this.inboxTotal / this.inboxPageSize);
        if (page < 1 || page > totalPages) return;
        this.inboxPage = page;
        this.loadInboxDocs();
    }

    // --- Upload Modal ---

    private openUploadModal() {
        this.uploadFile = null;
        this.uploadDragover = false;
        this.uploadAccountId = '';
        this.uploadRequiresAck = true;
        this.uploadMemo = '';
        this.uploadProgress = 0;
        this.uploadUploading = false;
        this.uploadModalOpen = true;
    }

    private handleDragOver(e: DragEvent) {
        e.preventDefault();
        this.uploadDragover = true;
    }

    private handleDragLeave() {
        this.uploadDragover = false;
    }

    private handleDrop(e: DragEvent) {
        e.preventDefault();
        this.uploadDragover = false;
        const file = e.dataTransfer?.files[0];
        if (file) this.uploadFile = file;
    }

    private handleFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) this.uploadFile = file;
        input.value = '';
    }

    private async handleUploadSubmit() {
        if (!this.uploadFile || !this.uploadAccountId.trim()) {
            this.showToast('Please select a file and enter a recipient account.', 'error');
            return;
        }

        this.uploadUploading = true;
        this.uploadProgress = 25;

        try {
            await AdminDocsService.uploadAndShare(this.uploadFile, {
                accountId: parseInt(this.uploadAccountId, 10),
                requiresAck: this.uploadRequiresAck,
                memo: this.uploadMemo.trim() || undefined,
            });
            this.uploadProgress = 100;

            this.showToast('Document shared successfully.', 'success');
            this.uploadModalOpen = false;
            await Promise.all([this.loadSummary(), this.loadSharedDocs()]);
        } catch {
            this.showToast('Failed to upload and share document.', 'error');
        } finally {
            this.uploadUploading = false;
        }
    }

    // --- Preview Drawer ---

    private async openPreview(doc: DocumentDTO) {
        this.previewDoc = doc;
        this.previewOpen = true;
        this.previewClosing = false;
        this.revokePreviewObjectUrl();
        this.previewViewUrl = '';
        this.previewContentType = '';
        this.previewLoading = true;
        this.previewError = false;

        try {
            const { blob, contentType } = await AdminDocsService.getDocumentContent(doc.id);
            if (this.previewDoc?.id !== doc.id) return;
            this.previewObjectUrl = URL.createObjectURL(blob);
            this.previewViewUrl = this.previewObjectUrl;
            this.previewContentType = contentType;
        } catch {
            if (this.previewDoc?.id !== doc.id) return;
            this.previewError = true;
        } finally {
            if (this.previewDoc?.id !== doc.id) return;
            this.previewLoading = false;
        }
    }

    private async deleteDocument(doc: DocumentDTO) {
        const confirmed = window.confirm(`Delete "${doc.fileName}"? This cannot be undone.`);
        if (!confirmed) return;

        try {
            await AdminDocsService.deleteDocument(doc.id);
            this.closePreview();
            this.showToast('Document deleted.', 'success');
            await Promise.all([
                this.loadSummary(),
                this.loadSharedDocs(),
                this.inboxLoaded ? this.loadInboxDocs() : Promise.resolve(),
            ]);
        } catch {
            this.showToast('Failed to delete document.', 'error');
        }
    }

    private closePreview() {
        this.previewClosing = true;
        setTimeout(() => {
            this.revokePreviewObjectUrl();
            this.previewOpen = false;
            this.previewClosing = false;
            this.previewDoc = null;
            this.previewViewUrl = '';
            this.previewContentType = '';
            this.previewLoading = false;
            this.previewError = false;
        }, 200);
    }

    private isPreviewableInBrowser(fileName: string, contentType: string): 'pdf' | 'image' | false {
        const ct = contentType.toLowerCase();
        if (ct === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) return 'pdf';
        if (ct.startsWith('image/')) return 'image';
        const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
        return false;
    }

    // --- Helpers ---

    private getFileIconClass(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
        if (ext === 'pdf') return 'file-icon file-icon-pdf';
        if (['doc', 'docx'].includes(ext)) return 'file-icon file-icon-doc';
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'file-icon file-icon-xls';
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'file-icon file-icon-img';
        return 'file-icon file-icon-default';
    }

    private getFileIconLabel(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
        if (ext === 'pdf') return 'PDF';
        if (['doc', 'docx'].includes(ext)) return 'DOC';
        if (['xls', 'xlsx'].includes(ext)) return 'XLS';
        if (ext === 'csv') return 'CSV';
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'IMG';
        return 'FILE';
    }

    private revokePreviewObjectUrl() {
        if (!this.previewObjectUrl) return;
        URL.revokeObjectURL(this.previewObjectUrl);
        this.previewObjectUrl = null;
    }

    private formatFileSize(bytes: number | null | undefined): string {
        if (!bytes || bytes < 0) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    private formatDate(iso: string): string {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    private getAttentionBadgeClass(attentionTo: string | null): string {
        if (!attentionTo) return 'attention-badge attention-badge-general';
        const lower = attentionTo.toLowerCase();
        if (lower.includes('billing')) return 'attention-badge attention-badge-billing';
        if (lower.includes('legal')) return 'attention-badge attention-badge-legal';
        if (lower.includes('accounting')) return 'attention-badge attention-badge-accounting';
        return 'attention-badge attention-badge-general';
    }

    // --- Render Methods ---

    private renderSummaryCards() {
        if (this.summaryLoading) {
            return html`
                <div class="stats-grid" style="margin-bottom: 1.5rem;">
                    ${[1, 2, 3].map(() => html`<div class="stat-card skeleton skeleton-card"></div>`)}
                </div>
            `;
        }
        if (this.summaryError || !this.summary) {
            return html`
                <div class="error-state">
                    <p>Failed to load summary.</p>
                    <button class="btn-secondary" @click=${() => this.loadSummary()}>Retry</button>
                </div>
            `;
        }

        const s = this.summary;
        return html`
            <div class="stats-grid" style="margin-bottom: 1.5rem;">
                <div class="stat-card stat-card-total-shared">
                    <span class="stat-label">Total Shared</span>
                    <span class="stat-value">${s.totalShared}</span>
                </div>
                <div class="stat-card stat-card-pending-ack">
                    <span class="stat-label">Pending Acknowledgment</span>
                    <span class="stat-value">${s.pendingAck}</span>
                </div>
                <div class="stat-card stat-card-acknowledged">
                    <span class="stat-label">Acknowledged This Month</span>
                    <span class="stat-value">${s.acknowledgedThisMonth}</span>
                </div>
            </div>
        `;
    }

    private renderSharedTab() {
        const statuses: Array<{ label: string; value: DocsStatusFilter }> = [
            { label: 'All', value: '' },
            { label: 'Pending', value: 'pending' },
            { label: 'Acknowledged', value: 'acknowledged' },
        ];

        const totalPages = Math.ceil(this.sharedTotal / this.sharedPageSize);
        const { start, end } = getPaginationBounds(this.sharedPage, this.sharedPageSize, this.sharedTotal);

        return html`
            <div class="controls-row">
                <div class="filter-pills">
                    ${statuses.map((s) => html`
                        <button class="filter-pill ${this.sharedStatusFilter === s.value ? 'active' : ''}" @click=${() => this.setSharedStatusFilter(s.value)}>${s.label}</button>
                    `)}
                </div>
                <div class="spacer"></div>
                <input class="search-input" type="text" placeholder="Search documents..." .value=${this.sharedSearchQuery} @input=${this.handleSharedSearchInput} />
                <select class="sort-select" .value=${this.sharedSortOption} @change=${this.handleSharedSortChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="size-desc">Size (Large-Small)</option>
                    <option value="size-asc">Size (Small-Large)</option>
                </select>
            </div>

            <div class="table-card">
                ${this.sharedLoading && this.sharedDocs.length === 0 ? html`
                    <div class="table-card-body">
                        ${[1, 2, 3, 4, 5].map(() => html`<div class="skeleton skeleton-row"></div>`)}
                    </div>
                ` : this.sharedError ? html`
                    <div class="error-state">
                        <p>Failed to load shared documents.</p>
                        <button class="btn-secondary" @click=${() => this.loadSharedDocs()}>Retry</button>
                    </div>
                ` : this.sharedDocs.length === 0 ? html`
                    <div class="empty-state">
                        <h3>No shared documents</h3>
                        <p>Upload and share your first document with an account.</p>
                        <button class="btn-primary" @click=${() => this.openUploadModal()}>Upload & Share</button>
                    </div>
                ` : html`
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Document Name</th>
                                <th>Shared With</th>
                                <th>Date Sent</th>
                                <th>Size</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.sharedDocs.map((doc) => html`
                                <tr @click=${() => this.openPreview(doc)}>
                                    <td>
                                        <div class="doc-name-cell">
                                            <span class="${this.getFileIconClass(doc.fileName)}">${this.getFileIconLabel(doc.fileName)}</span>
                                            <div>
                                                <span class="doc-name-link">${doc.fileName}</span>
                                                <div class="doc-name-meta">${this.formatFileSize(doc.fileSize)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${doc.accountName}</td>
                                    <td class="text-muted">${this.formatDate(doc.createdAt)}</td>
                                    <td class="text-muted">${this.formatFileSize(doc.fileSize)}</td>
                                    <td>
                                        <span class="status-badge status-${doc.acknowledgedAt ? 'acknowledged' : 'pending'}">
                                            ${doc.acknowledgedAt ? 'Acknowledged' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            `)}
                        </tbody>
                    </table>

                    <div class="pagination">
                        <div class="pagination-info">
                            Showing <span>${start}</span> to <span>${end}</span> of <span>${this.sharedTotal}</span> documents
                        </div>
                        <div class="pagination-actions">
                            <button class="pagination-btn" ?disabled=${this.sharedPage === 1 || this.sharedLoading} @click=${() => this.handleSharedPageChange(this.sharedPage - 1)}>Previous</button>
                            ${buildPaginationTokens(this.sharedPage, totalPages).map((token) =>
            token === 'ellipsis'
                ? html`<span class="pagination-ellipsis">...</span>`
                : html`<button class="pagination-btn ${this.sharedPage === token ? 'active' : ''}" ?disabled=${this.sharedLoading} @click=${() => this.handleSharedPageChange(token as number)}>${token}</button>`
        )}
                            <button class="pagination-btn" ?disabled=${this.sharedPage >= totalPages || this.sharedLoading} @click=${() => this.handleSharedPageChange(this.sharedPage + 1)}>Next</button>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    private renderInboxTab() {
        const filters: Array<{ label: string; value: InboxFilter }> = [
            { label: 'All', value: '' },
            { label: 'Unassigned', value: 'unassigned' },
        ];

        const totalPages = Math.ceil(this.inboxTotal / this.inboxPageSize);
        const { start, end } = getPaginationBounds(this.inboxPage, this.inboxPageSize, this.inboxTotal);

        return html`
            <div class="controls-row">
                <div class="filter-pills">
                    ${filters.map((f) => html`
                        <button class="filter-pill ${this.inboxFilter === f.value ? 'active' : ''}" @click=${() => this.setInboxFilter(f.value)}>${f.label}</button>
                    `)}
                </div>
                <div class="spacer"></div>
                <input class="search-input" type="text" placeholder="Search inbox..." .value=${this.inboxSearchQuery} @input=${this.handleInboxSearchInput} />
                <select class="sort-select" .value=${this.inboxSortOption} @change=${this.handleInboxSortChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                </select>
            </div>

            <div class="table-card">
                ${this.inboxLoading && this.inboxDocs.length === 0 ? html`
                    <div class="table-card-body">
                        ${[1, 2, 3, 4, 5].map(() => html`<div class="skeleton skeleton-row"></div>`)}
                    </div>
                ` : this.inboxError ? html`
                    <div class="error-state">
                        <p>Failed to load inbox documents.</p>
                        <button class="btn-secondary" @click=${() => this.loadInboxDocs()}>Retry</button>
                    </div>
                ` : this.inboxDocs.length === 0 ? html`
                    <div class="empty-state">
                        <h3>No inbox documents</h3>
                        <p>Documents sent by contractors will appear here.</p>
                    </div>
                ` : html`
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Document Name</th>
                                <th>Uploaded By</th>
                                <th>Date Received</th>
                                <th>Attention To</th>
                                <th>Memo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.inboxDocs.map((doc) => html`
                                <tr @click=${() => this.openPreview(doc)}>
                                    <td>
                                        <div class="doc-name-cell">
                                            <span class="${this.getFileIconClass(doc.fileName)}">${this.getFileIconLabel(doc.fileName)}</span>
                                            <div>
                                                <span class="doc-name-link">${doc.fileName}</span>
                                                <div class="doc-name-meta">${this.formatFileSize(doc.fileSize)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${doc.accountName}</td>
                                    <td class="text-muted">${this.formatDate(doc.createdAt)}</td>
                                    <td>${doc.attentionTo ? html`<span class="${this.getAttentionBadgeClass(doc.attentionTo)}">${doc.attentionTo}</span>` : html`<span class="text-muted">—</span>`}</td>
                                    <td class="text-muted">${doc.memo || '—'}</td>
                                </tr>
                            `)}
                        </tbody>
                    </table>

                    <div class="pagination">
                        <div class="pagination-info">
                            Showing <span>${start}</span> to <span>${end}</span> of <span>${this.inboxTotal}</span> documents
                        </div>
                        <div class="pagination-actions">
                            <button class="pagination-btn" ?disabled=${this.inboxPage === 1 || this.inboxLoading} @click=${() => this.handleInboxPageChange(this.inboxPage - 1)}>Previous</button>
                            ${buildPaginationTokens(this.inboxPage, totalPages).map((token) =>
            token === 'ellipsis'
                ? html`<span class="pagination-ellipsis">...</span>`
                : html`<button class="pagination-btn ${this.inboxPage === token ? 'active' : ''}" ?disabled=${this.inboxLoading} @click=${() => this.handleInboxPageChange(token as number)}>${token}</button>`
        )}
                            <button class="pagination-btn" ?disabled=${this.inboxPage >= totalPages || this.inboxLoading} @click=${() => this.handleInboxPageChange(this.inboxPage + 1)}>Next</button>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    private renderUploadModal() {
        return html`
            <div class="modal-overlay" @click=${() => { this.uploadModalOpen = false; }}>
                <div class="modal upload-modal" style="position: relative;" @click=${(e: Event) => e.stopPropagation()}>
                    <button class="upload-modal-close" @click=${() => { this.uploadModalOpen = false; }} aria-label="Close">&times;</button>
                    <div class="modal-title">Upload & Share</div>
                    <div class="upload-modal-subtitle">Upload documents to share securely via Velocity portal.</div>

                    ${this.uploadFile ? html`
                        <div class="upload-file-preview">
                            <span class="${this.getFileIconClass(this.uploadFile.name)}">${this.getFileIconLabel(this.uploadFile.name)}</span>
                            <div class="upload-file-info">
                                <div class="upload-file-name">${this.uploadFile.name}</div>
                                <div class="upload-file-size">${this.formatFileSize(this.uploadFile.size)}</div>
                            </div>
                            <button class="upload-file-remove" @click=${() => { this.uploadFile = null; }} aria-label="Remove file">&times;</button>
                        </div>
                    ` : html`
                        <div
                            class="upload-dropzone ${this.uploadDragover ? 'dragover' : ''}"
                            @dragover=${this.handleDragOver}
                            @dragleave=${this.handleDragLeave}
                            @drop=${this.handleDrop}
                            @click=${() => this.shadowRoot?.querySelector<HTMLInputElement>('#file-input')?.click()}
                        >
                            <div class="upload-dropzone-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                            </div>
                            <div class="upload-dropzone-text">Drag and drop files here</div>
                            <div class="upload-dropzone-hint">Supported formats: PDF, DOCX, XLSX (Max 50MB)</div>
                            <span class="upload-browse-btn">Browse Files</span>
                        </div>
                        <input id="file-input" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg" style="display:none" @change=${this.handleFileSelect} />
                    `}

                    <div class="form-group-inline">
                        <label>Recipient Account <span style="color: var(--color-error);">*</span></label>
                        <select 
                            class="form-input" 
                            .value=${this.uploadAccountId} 
                            @change=${(e: Event) => { this.uploadAccountId = (e.target as HTMLSelectElement).value; }}
                        >
                            <option value="">Select an account...</option>
                            ${this.availableAccounts.map(acc => html`
                                <option value="${acc.id}">${acc.name} (${acc.id})</option>
                            `)}
                        </select>
                    </div>

                    <div class="ack-toggle-row">
                        <div>
                            <div class="ack-toggle-label">Receipt Acknowledgment</div>
                            <div class="ack-toggle-desc">Require recipient to sign off</div>
                        </div>
                        <label class="toggle-switch toggle-switch-cta">
                            <input type="checkbox" .checked=${this.uploadRequiresAck} @change=${(e: Event) => { this.uploadRequiresAck = (e.target as HTMLInputElement).checked; }} />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="memo-group">
                        <label>Memo / Instructions</label>
                        <textarea class="form-input form-textarea" rows="3" placeholder="Add context or instructions for the recipient..." .value=${this.uploadMemo} @input=${(e: Event) => { this.uploadMemo = (e.target as HTMLTextAreaElement).value; }}></textarea>
                    </div>

                    ${this.uploadUploading ? html`
                        <div class="upload-progress">
                            <div class="upload-progress-text">Uploading... ${this.uploadProgress}%</div>
                            <div class="upload-progress-bar">
                                <div class="upload-progress-fill" style="width: ${this.uploadProgress}%"></div>
                            </div>
                        </div>
                    ` : nothing}

                    <div class="modal-actions">
                        <button class="btn-secondary" @click=${() => { this.uploadModalOpen = false; }} ?disabled=${this.uploadUploading}>Cancel</button>
                        <button class="btn-primary" @click=${this.handleUploadSubmit} ?disabled=${this.uploadUploading || !this.uploadFile}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            ${this.uploadUploading ? 'Uploading...' : 'Upload & Share'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderPreviewDrawer() {
        const doc = this.previewDoc;
        if (!doc) return nothing;

        const previewType = this.previewViewUrl ? this.isPreviewableInBrowser(doc.fileName, this.previewContentType) : false;

        return html`
            <div class="preview-overlay ${this.previewClosing ? 'closing' : ''}" @click=${this.closePreview}></div>
            <div class="preview-drawer ${this.previewClosing ? 'closing' : ''}" @click=${(e: Event) => e.stopPropagation()}>
                <div class="preview-header">
                    <div class="preview-header-info">
                        <div class="preview-title">${doc.fileName}</div>
                        <div class="preview-meta">
                            <span>${doc.accountName}</span>
                            <span>${this.formatFileSize(doc.fileSize)}</span>
                            <span>${this.formatDate(doc.createdAt)}</span>
                        </div>
                    </div>
                    <div class="preview-actions">
                        ${this.previewViewUrl ? html`
                            <a class="preview-btn-download" href="${this.previewViewUrl}" target="_blank" rel="noopener noreferrer">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download
                            </a>
                        ` : nothing}
                        <button class="preview-btn-download preview-btn-danger" @click=${() => this.deleteDocument(doc)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6l-1 14H6L5 6"></path>
                                <path d="M10 11v6"></path>
                                <path d="M14 11v6"></path>
                                <path d="M9 6V4h6v2"></path>
                            </svg>
                            Delete
                        </button>
                        <button class="preview-close" @click=${this.closePreview} aria-label="Close">&times;</button>
                    </div>
                </div>

                <div class="preview-body">
                    ${this.previewLoading ? html`
                        <div class="preview-loading">Loading preview...</div>
                    ` : this.previewError ? html`
                        <div class="preview-error">
                            <p>Failed to load document preview.</p>
                            <button class="btn-secondary" @click=${() => this.openPreview(doc)}>Retry</button>
                        </div>
                    ` : previewType === 'pdf' ? html`
                        <iframe class="preview-frame" src="${this.previewViewUrl}" title="Document preview: ${doc.fileName}"></iframe>
                    ` : previewType === 'image' ? html`
                        <div class="preview-image-container">
                            <img class="preview-image" src="${this.previewViewUrl}" alt="${doc.fileName}" />
                        </div>
                    ` : html`
                        <div class="preview-unsupported">
                            <span class="${this.getFileIconClass(doc.fileName)}" style="width:64px;height:64px;font-size:1.5rem;border-radius:12px;">${this.getFileIconLabel(doc.fileName)}</span>
                            <h3>Preview not available</h3>
                            <p>This file type cannot be previewed in the browser. Use the download button to view it locally.</p>
                            ${this.previewViewUrl ? html`
                                <a class="btn-primary" href="${this.previewViewUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Download File
                                </a>
                            ` : nothing}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    render() {
        const inboxCount = this.summary?.inboxNeedsAttention ?? 0;

        return html`
            <pv-page-tour-modal 
                pageId="admin-docs"
                heading="Document Hub"
                .features=${[
                { title: 'Secure Sharing', description: 'Upload and distribute statements, price sheets, and catalogs to specific accounts.' },
                { title: 'Required Acknowledgments', description: 'Force users to digitally sign off on critical documents.' },
                { title: 'Contractor Inbox', description: 'Receive and review documents explicitly submitted by your customers.' }
            ]}
            ></pv-page-tour-modal>
            <div class="page-header">
                <div>
                    <h2>Document Management</h2>
                    <p class="page-subtitle">Share documents securely and manage incoming files from contractors.</p>
                </div>
                <div class="header-actions">
                    <button class="btn-primary" @click=${() => this.openUploadModal()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Upload & Share
                    </button>
                </div>
            </div>

            ${this.renderSummaryCards()}

            <div class="tab-bar">
                <button class="tab-btn ${this.activeTab === 'shared' ? 'active' : ''}" @click=${() => this.handleTabChange('shared')}>Shared with Accounts</button>
                <button class="tab-btn ${this.activeTab === 'inbox' ? 'active' : ''}" @click=${() => this.handleTabChange('inbox')}>
                    Inbox
                    ${inboxCount > 0 ? html`<span class="tab-count">${inboxCount}</span>` : nothing}
                </button>
            </div>

            ${this.activeTab === 'shared' ? this.renderSharedTab() : this.renderInboxTab()}

            ${this.previewOpen || this.previewClosing ? this.renderPreviewDrawer() : nothing}
            ${this.uploadModalOpen ? this.renderUploadModal() : nothing}
            ${this.toastMessage ? html`<div class="toast toast-${this.toastType} ${this.toastFading ? 'toast-out' : ''}" role="status" aria-live="polite">${this.toastMessage}</div>` : nothing}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-docs': PageDocs;
    }
}
