import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ARCenterService, formatDate, formatCurrency } from '../services/ar-center.service.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';
import { overviewPageStyles } from '../../styles/pages.js';
import { arCenterPageStyles } from '../../styles/pages.js';
import type {
    ARAccountContactPayload,
    ARAccountInvoice,
    ARAccountRow,
    ARAccountStatusFilter,
    ARSummary,
    AutomationCondition,
    AutomationRule,
    BulkPreviewAccount,
} from '../../connect/types/domain.js';

type ArTab = 'accounts' | 'automations';
type SortOption = 'newest' | 'oldest' | 'amount-desc' | 'amount-asc';
type BulkStep = 'condition' | 'preview' | 'sending';

@customElement('admin-page-ar-center')
export class PageArCenter extends LitElement {
    static styles = [overviewPageStyles, arCenterPageStyles];

    @state() private summary: ARSummary | null = null;
    @state() private summaryLoading = true;
    @state() private summaryError = false;

    @state() private activeTab: ArTab = 'accounts';

    @state() private accounts: ARAccountRow[] = [];
    @state() private accountsTotal = 0;
    @state() private accountsPage = 1;
    @state() private accountsPageSize = 10;
    @state() private accountsLoading = false;
    @state() private accountsError = false;
    @state() private statusFilter: ARAccountStatusFilter = '';
    @state() private searchQuery = '';
    @state() private sortOption: SortOption = 'newest';

    @state() private drawerAccount: ARAccountRow | null = null;
    @state() private drawerOpen = false;
    @state() private drawerClosing = false;
    @state() private drawerInvoices: ARAccountInvoice[] = [];
    @state() private drawerInvoicesLoading = false;
    @state() private drawerInvoicesError = false;

    @state() private reminderModal = false;
    @state() private reminderAccount: ARAccountRow | null = null;
    @state() private reminderMessage = '';
    @state() private reminderSending = false;

    @state() private bulkModalOpen = false;
    @state() private bulkStep: BulkStep = 'condition';
    @state() private bulkCondition: AutomationCondition | '' = '';
    @state() private bulkPreview: BulkPreviewAccount[] = [];
    @state() private bulkPreviewLoading = false;
    @state() private bulkSendProgress = 0;
    @state() private bulkSendTotal = 0;
    @state() private bulkSendComplete = false;
    @state() private bulkDeliverySms = true;
    @state() private bulkDeliveryEmail = true;

    @state() private automations: AutomationRule[] = [];
    @state() private automationsLoading = false;
    @state() private automationsError = false;
    @state() private automationModal = false;
    @state() private automationEditing: AutomationRule | null = null;
    @state() private autoFormName = '';
    @state() private autoFormCondition: AutomationCondition = 'past_due';
    @state() private autoFormTemplate = '';
    @state() private autoFormInterval = 7;
    @state() private autoFormMaxFollowUps = 3;
    @state() private autoFormActive = true;
    @state() private autoFormSaving = false;
    @state() private deleteConfirmId: number | null = null;

    @state() private toastMessage = '';
    @state() private toastFading = false;
    @state() private toastType: 'success' | 'error' | 'info' = 'info';

    private searchDebounce?: ReturnType<typeof setTimeout>;
    private bulkProgressInterval?: ReturnType<typeof setInterval>;
    private toastTimer?: ReturnType<typeof setTimeout>;
    private accountsLoadVersion = 0;
    private summaryLoadVersion = 0;
    private automationsLoadVersion = 0;
    private automationsLoaded = false;

    async connectedCallback() {
        super.connectedCallback();
        document.addEventListener('keydown', this.handleKeyDown);
        // Initial page load should hit exactly two endpoints.
        await Promise.all([this.loadSummary(), this.loadAccounts()]);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this.handleKeyDown);
        clearTimeout(this.searchDebounce);
        clearTimeout(this.toastTimer);
        clearInterval(this.bulkProgressInterval);
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        if (this.reminderModal) { this.reminderModal = false; return; }
        if (this.bulkModalOpen) { this.bulkModalOpen = false; return; }
        if (this.automationModal) { this.automationModal = false; return; }
        if (this.deleteConfirmId !== null) { this.deleteConfirmId = null; return; }
        if (this.drawerOpen) { this.closeDrawer(); }
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

    private async loadSummary() {
        const version = ++this.summaryLoadVersion;
        this.summaryLoading = true;
        this.summaryError = false;
        try {
            const summary = await ARCenterService.getSummary();
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

    private async loadAccounts() {
        const version = ++this.accountsLoadVersion;
        this.accountsLoading = true;
        this.accountsError = false;
        try {
            const offset = (this.accountsPage - 1) * this.accountsPageSize;
            const { items, total } = await ARCenterService.getAccounts(
                this.accountsPageSize,
                offset,
                this.searchQuery || undefined,
                this.sortOption,
                this.statusFilter === 'overdue'
            );
            if (version !== this.accountsLoadVersion) return;
            this.accounts = items;
            this.accountsTotal = total;
        } catch {
            if (version !== this.accountsLoadVersion) return;
            this.accountsError = true;
        } finally {
            if (version !== this.accountsLoadVersion) return;
            this.accountsLoading = false;
        }
    }

    private async loadAutomations() {
        const version = ++this.automationsLoadVersion;
        this.automationsLoading = true;
        this.automationsError = false;
        try {
            const automations = await ARCenterService.getAutomations();
            if (version !== this.automationsLoadVersion) return;
            this.automations = automations;
        } catch {
            if (version !== this.automationsLoadVersion) return;
            this.automationsError = true;
        } finally {
            if (version !== this.automationsLoadVersion) return;
            this.automationsLoading = false;
        }
    }

    private setStatusFilter(status: ARAccountStatusFilter) {
        this.statusFilter = status;
        this.accountsPage = 1;
        this.loadAccounts();
    }

    private handleSearchInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        clearTimeout(this.searchDebounce);
        this.searchDebounce = setTimeout(() => {
            this.searchQuery = value;
            this.accountsPage = 1;
            this.loadAccounts();
        }, 300);
    }

    private handleSortChange(e: Event) {
        this.sortOption = (e.target as HTMLSelectElement).value as SortOption;
        this.accountsPage = 1;
        this.loadAccounts();
    }

    private handlePageChange(page: number) {
        const totalPages = Math.ceil(this.accountsTotal / this.accountsPageSize);
        if (page < 1 || page > totalPages) return;
        this.accountsPage = page;
        this.loadAccounts();
    }

    private getAccountStatus(account: ARAccountRow): 'overdue' | 'clear' {
        return account.pastDueBalance > 0 ? 'overdue' : 'clear';
    }

    private async loadDrawerInvoices(accountId: number) {
        this.drawerInvoicesLoading = true;
        this.drawerInvoicesError = false;
        this.drawerInvoices = [];
        try {
            const { items } = await ARCenterService.getAccountInvoices(accountId, 25, 0, 'open');
            if (this.drawerAccount?.accountId !== accountId) return;
            this.drawerInvoices = items;
        } catch {
            if (this.drawerAccount?.accountId !== accountId) return;
            this.drawerInvoicesError = true;
        } finally {
            if (this.drawerAccount?.accountId !== accountId) return;
            this.drawerInvoicesLoading = false;
        }
    }

    private openDrawer(account: ARAccountRow) {
        this.drawerAccount = account;
        this.drawerOpen = true;
        void this.loadDrawerInvoices(account.accountId);
    }

    private closeDrawer() {
        this.drawerClosing = true;
        setTimeout(() => {
            this.drawerOpen = false;
            this.drawerClosing = false;
            this.drawerAccount = null;
            this.drawerInvoices = [];
            this.drawerInvoicesLoading = false;
            this.drawerInvoicesError = false;
        }, 200);
    }

    private openReminderModal(account: ARAccountRow) {
        this.reminderAccount = account;
        this.reminderMessage = `Hi {contactName}, this is a reminder that account ${account.accountName} has a balance due of $${formatCurrency(account.totalBalance)}.`;
        this.reminderSending = false;
        this.reminderModal = true;
    }

    private async sendReminder() {
        if (!this.reminderAccount) return;
        this.reminderSending = true;
        try {
            const accountId = this.reminderAccount.accountId;
            const invoiceIds = this.drawerAccount?.accountId === accountId
                ? this.drawerInvoices.map((i) => i.id)
                : [];
            const payload: ARAccountContactPayload = {
                invoiceIds,
                deliverySms: true,
                deliveryEmail: true,
                messageBody: this.reminderMessage.trim() || undefined,
            };
            const result = await ARCenterService.sendAccountContact(accountId, payload);
            if (result.success) {
                this.showToast('Account reminder sent.', 'success');
                this.reminderModal = false;
                await Promise.all([this.loadAccounts(), this.loadSummary()]);
            } else {
                this.showToast(result.message || 'Failed to send reminder.', 'error');
            }
        } catch {
            this.showToast('Failed to send reminder.', 'error');
        } finally {
            this.reminderSending = false;
        }
    }

    private openBulkModal() {
        this.bulkStep = 'condition';
        this.bulkCondition = '';
        this.bulkPreview = [];
        this.bulkSendProgress = 0;
        this.bulkSendTotal = 0;
        this.bulkSendComplete = false;
        this.bulkDeliverySms = true;
        this.bulkDeliveryEmail = true;
        this.bulkModalOpen = true;
    }

    private async bulkLoadPreview() {
        if (!this.bulkCondition) return;
        this.bulkPreviewLoading = true;
        try {
            this.bulkPreview = await ARCenterService.getBulkPreview(this.bulkCondition);
            this.bulkStep = 'preview';
        } catch {
            this.showToast('Failed to load preview.', 'error');
        } finally {
            this.bulkPreviewLoading = false;
        }
    }

    private async bulkSend() {
        this.bulkStep = 'sending';
        this.bulkSendTotal = this.bulkPreview.length;
        this.bulkSendProgress = 0;

        const requests: ARAccountContactPayload[] = this.bulkPreview.map((a) => ({
            accountId: a.accountId,
            invoiceIds: a.invoiceIds,
            deliverySms: this.bulkDeliverySms,
            deliveryEmail: this.bulkDeliveryEmail,
        }));

        try {
            clearInterval(this.bulkProgressInterval);
            this.bulkProgressInterval = setInterval(() => {
                if (this.bulkSendProgress < this.bulkSendTotal - 1) {
                    this.bulkSendProgress++;
                }
            }, 300);

            const result = await ARCenterService.bulkContact({ requests });
            clearInterval(this.bulkProgressInterval);
            this.bulkSendProgress = this.bulkSendTotal;
            this.bulkSendComplete = true;
            this.showToast(`${result.created} account contact(s) sent.`, 'success');
            await Promise.all([this.loadAccounts(), this.loadSummary()]);
        } catch {
            clearInterval(this.bulkProgressInterval);
            this.showToast('Bulk send failed.', 'error');
            this.bulkModalOpen = false;
        }
    }

    private async handleTabChange(tab: ArTab) {
        this.activeTab = tab;
        if (tab === 'automations' && !this.automationsLoaded) {
            this.automationsLoaded = true;
            await this.loadAutomations();
        }
    }

    private formatConditionLabel(c: AutomationCondition): string {
        switch (c) {
            case 'past_due': return 'Past Due';
            case 'due_in_3_days': return 'Due in 3 Days';
            case 'due_in_7_days': return 'Due in 7 Days';
            case 'due_today': return 'Due Today';
        }
    }

    private openAutomationModal(rule?: AutomationRule) {
        this.automationEditing = rule ?? null;
        this.autoFormName = rule?.name ?? '';
        this.autoFormCondition = rule?.condition ?? 'past_due';
        this.autoFormTemplate = rule?.messageTemplate ?? 'Hi {contactName}, invoice {invoiceNumbers} for {totalAmount} is due. Please arrange payment.';
        this.autoFormInterval = rule?.followUpIntervalDays ?? 7;
        this.autoFormMaxFollowUps = rule?.maxFollowUps ?? 3;
        this.autoFormActive = rule?.isActive ?? true;
        this.autoFormSaving = false;
        this.automationModal = true;
    }

    private async saveAutomation() {
        if (!this.autoFormName.trim()) {
            this.showToast('Rule name is required.', 'error');
            return;
        }

        this.autoFormSaving = true;
        try {
            if (this.automationEditing) {
                await ARCenterService.updateAutomation(this.automationEditing.id, {
                    name: this.autoFormName.trim(),
                    condition: this.autoFormCondition,
                    messageTemplate: this.autoFormTemplate.trim(),
                    followUpIntervalDays: this.autoFormInterval,
                    maxFollowUps: this.autoFormMaxFollowUps,
                    isActive: this.autoFormActive,
                });
                this.showToast('Automation rule updated.', 'success');
            } else {
                await ARCenterService.createAutomation({
                    name: this.autoFormName.trim(),
                    condition: this.autoFormCondition,
                    messageTemplate: this.autoFormTemplate.trim(),
                    followUpIntervalDays: this.autoFormInterval,
                    maxFollowUps: this.autoFormMaxFollowUps,
                    isActive: this.autoFormActive,
                });
                this.showToast('Automation rule created.', 'success');
            }
            this.automationModal = false;
            await this.loadAutomations();
        } catch {
            this.showToast('Failed to save automation rule.', 'error');
        } finally {
            this.autoFormSaving = false;
        }
    }

    private async deleteAutomation(id: number) {
        try {
            await ARCenterService.deleteAutomation(id);
            this.showToast('Automation rule deleted.', 'success');
            this.deleteConfirmId = null;
            await this.loadAutomations();
        } catch {
            this.showToast('Failed to delete automation.', 'error');
        }
    }

    private async toggleAutomation(id: number) {
        try {
            await ARCenterService.toggleAutomation(id);
            await this.loadAutomations();
        } catch {
            this.showToast('Failed to toggle automation.', 'error');
        }
    }

    private renderSummaryCards() {
        if (this.summaryLoading) {
            return html`
                <div class="stats-grid" style="margin-bottom: 1.5rem;">
                    ${[1, 2, 3, 4].map(() => html`<div class="stat-card skeleton skeleton-card"></div>`)}
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
                <div class="stat-card stat-card-outstanding">
                    <span class="stat-label">Total Outstanding</span>
                    <span class="stat-value">$${formatCurrency(s.totalOutstanding)}</span>
                </div>
                <div class="stat-card stat-card-open">
                    <span class="stat-label">Accounts with Balance</span>
                    <span class="stat-value">${s.openRequests}</span>
                </div>
                <div class="stat-card stat-card-collected">
                    <span class="stat-label">Paid This Month</span>
                    <span class="stat-value">$${formatCurrency(s.paidThisMonth)}</span>
                </div>
                <div class="stat-card stat-card-overdue">
                    <span class="stat-label">Overdue Invoices</span>
                    <span class="stat-value">${s.overdueCount}</span>
                </div>
            </div>
        `;
    }

    private renderAccountsTab() {
        const statuses: Array<{ label: string; value: ARAccountStatusFilter }> = [
            { label: 'All', value: '' },
            { label: 'Overdue', value: 'overdue' },
        ];

        const totalPages = Math.ceil(this.accountsTotal / this.accountsPageSize);
        const { start, end } = getPaginationBounds(this.accountsPage, this.accountsPageSize, this.accountsTotal);

        return html`
            <div class="controls-row">
                <div class="filter-pills">
                    ${statuses.map((s) => html`
                        <button class="filter-pill ${this.statusFilter === s.value ? 'active' : ''}" @click=${() => this.setStatusFilter(s.value)}>${s.label}</button>
                    `)}
                </div>
                <div class="spacer"></div>
                <input class="search-input" type="text" placeholder="Search accounts..." .value=${this.searchQuery} @input=${this.handleSearchInput} />
                <select class="sort-select" .value=${this.sortOption} @change=${this.handleSortChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount-desc">Amount (High-Low)</option>
                    <option value="amount-asc">Amount (Low-High)</option>
                </select>
            </div>

            <div class="table-card">
                ${this.accountsLoading && this.accounts.length === 0 ? html`
                    <div class="table-card-body">
                        ${[1, 2, 3, 4, 5].map(() => html`<div class="skeleton skeleton-row"></div>`)}
                    </div>
                ` : this.accountsError ? html`
                    <div class="error-state">
                        <p>Failed to load AR accounts.</p>
                        <button class="btn-secondary" @click=${() => this.loadAccounts()}>Retry</button>
                    </div>
                ` : this.accounts.length === 0 ? html`
                    <div class="empty-state">
                        <h3>No matching accounts</h3>
                    </div>
                ` : html`
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>Open Invoices</th>
                                <th class="text-right">Total Balance</th>
                                <th class="text-right">Past Due</th>
                                <th>Last Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.accounts.map((account) => {
                                const status = this.getAccountStatus(account);
                                return html`
                                    <tr @click=${() => this.openDrawer(account)}>
                                        <td><a href="/admin/accounts/${account.accountId}" class="link-primary" @click=${(e: Event) => e.stopPropagation()}>${account.accountName}</a></td>
                                        <td>${account.openInvoiceCount}</td>
                                        <td class="text-right font-mono">$${formatCurrency(account.totalBalance)}</td>
                                        <td class="text-right font-mono">$${formatCurrency(account.pastDueBalance)}</td>
                                        <td class="text-muted">${account.lastPaymentAt ? formatDate(account.lastPaymentAt) : '—'}</td>
                                        <td><span class="status-badge status-${status}">${status === 'overdue' ? 'Overdue' : 'Current'}</span></td>
                                        <td @click=${(e: Event) => e.stopPropagation()}>
                                            <button class="btn-action" @click=${() => this.openDrawer(account)}>View</button>
                                            <button class="btn-action" @click=${() => this.openReminderModal(account)}>Contact</button>
                                        </td>
                                    </tr>
                                `;
                            })}
                        </tbody>
                    </table>

                    <div class="pagination">
                        <div class="pagination-info">
                            Showing <span>${start}</span> to <span>${end}</span> of <span>${this.accountsTotal}</span> accounts
                        </div>
                        <div class="pagination-actions">
                            <button class="pagination-btn" ?disabled=${this.accountsPage === 1 || this.accountsLoading} @click=${() => this.handlePageChange(this.accountsPage - 1)}>Previous</button>
                            ${buildPaginationTokens(this.accountsPage, totalPages).map((token) =>
                                token === 'ellipsis'
                                    ? html`<span class="pagination-ellipsis">...</span>`
                                    : html`<button class="pagination-btn ${this.accountsPage === token ? 'active' : ''}" ?disabled=${this.accountsLoading} @click=${() => this.handlePageChange(token as number)}>${token}</button>`
                            )}
                            <button class="pagination-btn" ?disabled=${this.accountsPage >= totalPages || this.accountsLoading} @click=${() => this.handlePageChange(this.accountsPage + 1)}>Next</button>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    private buildTimeline(account: ARAccountRow): Array<{ label: string; date: string; color: string }> {
        const events: Array<{ label: string; date: string; color: string; ts: number }> = [];
        if (account.lastContactedAt) {
            events.push({
                label: 'Last account contact',
                date: formatDate(account.lastContactedAt),
                color: 'warning',
                ts: new Date(account.lastContactedAt).getTime(),
            });
        }
        if (account.lastPaymentAt) {
            events.push({
                label: 'Last payment received',
                date: formatDate(account.lastPaymentAt),
                color: 'success',
                ts: new Date(account.lastPaymentAt).getTime(),
            });
        }
        if (account.latestInvoiceDate) {
            events.push({
                label: 'Latest invoice posted',
                date: formatDate(account.latestInvoiceDate),
                color: 'info',
                ts: new Date(account.latestInvoiceDate).getTime(),
            });
        }
        if (account.nextActionAt) {
            events.push({
                label: 'Next follow-up',
                date: formatDate(account.nextActionAt),
                color: 'warning',
                ts: new Date(account.nextActionAt).getTime(),
            });
        }
        events.sort((a, b) => b.ts - a.ts);
        return events;
    }

    private renderDrawer() {
        const account = this.drawerAccount;
        if (!account) return nothing;

        const events = this.buildTimeline(account);

        return html`
            <div class="drawer-overlay ${this.drawerClosing ? 'closing' : ''}" @click=${this.closeDrawer}></div>
            <div class="drawer ${this.drawerClosing ? 'closing' : ''}" @click=${(e: Event) => e.stopPropagation()}>
                <div class="drawer-header">
                    <div>
                        <div class="drawer-title">${account.accountName}</div>
                        <span class="status-badge status-${this.getAccountStatus(account)}">${this.getAccountStatus(account) === 'overdue' ? 'Overdue' : 'Current'}</span>
                    </div>
                    <button class="drawer-close" @click=${this.closeDrawer} aria-label="Close">×</button>
                </div>

                <div class="drawer-body">
                    <div class="drawer-section">
                        <div class="drawer-amount">$${formatCurrency(account.totalBalance)}</div>
                        <div class="drawer-amount-remaining">Past due: $${formatCurrency(account.pastDueBalance)}</div>
                    </div>

                    <div class="drawer-section">
                        <div class="drawer-section-title">Open Invoices</div>
                        ${this.drawerInvoicesLoading ? html`<div class="text-muted">Loading invoices...</div>` : nothing}
                        ${this.drawerInvoicesError ? html`<div class="text-muted">Failed to load invoices.</div>` : nothing}
                        ${!this.drawerInvoicesLoading && !this.drawerInvoicesError && this.drawerInvoices.length === 0 ? html`<div class="text-muted">No open invoices.</div>` : nothing}
                        <div class="drawer-invoices">
                            ${this.drawerInvoices.map((inv) => html`
                                <div class="drawer-invoice">
                                    <span>${inv.invoiceNumber}</span>
                                    <span class="font-mono">$${formatCurrency(inv.balanceDue)}</span>
                                </div>
                            `)}
                        </div>
                    </div>

                    <div class="drawer-section">
                        <div class="drawer-section-title">Activity</div>
                        <div class="timeline">
                            ${events.map((ev) => html`
                                <div class="timeline-event">
                                    <div class="timeline-dot timeline-dot-${ev.color}"></div>
                                    <div class="timeline-label">${ev.label}</div>
                                    <div class="timeline-date">${ev.date}</div>
                                </div>
                            `)}
                        </div>
                    </div>
                </div>

                <div class="drawer-footer">
                    <button class="btn-primary" style="flex:1" @click=${() => this.openReminderModal(account)}>Contact Account</button>
                    <button class="btn-secondary" @click=${this.closeDrawer}>Close</button>
                </div>
            </div>
        `;
    }

    private renderReminderModal() {
        const account = this.reminderAccount;
        if (!account) return nothing;

        return html`
            <div class="modal-overlay" @click=${() => { this.reminderModal = false; }}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-title">Contact ${account.accountName}</div>
                    <div class="form-group-inline">
                        <label>Message</label>
                        <textarea class="form-input form-textarea" rows="4" .value=${this.reminderMessage} @input=${(e: Event) => { this.reminderMessage = (e.target as HTMLTextAreaElement).value; }}></textarea>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" @click=${() => { this.reminderModal = false; }} ?disabled=${this.reminderSending}>Cancel</button>
                        <button class="btn-primary" @click=${this.sendReminder} ?disabled=${this.reminderSending}>${this.reminderSending ? 'Sending...' : 'Send'}</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderBulkModal() {
        const conditions: Array<{ value: AutomationCondition; title: string; desc: string }> = [
            { value: 'past_due', title: 'Past Due', desc: 'Invoices that are past their due date' },
            { value: 'due_today', title: 'Due Today', desc: 'Invoices due today' },
            { value: 'due_in_3_days', title: 'Due in 3 Days', desc: 'Invoices due within 3 days' },
            { value: 'due_in_7_days', title: 'Due in 7 Days', desc: 'Invoices due within 7 days' },
        ];

        return html`
            <div class="modal-overlay" @click=${() => { this.bulkModalOpen = false; }}>
                <div class="modal" style="width: 560px;" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-title">Bulk Contact Accounts</div>
                    <div class="wizard-steps">
                        <div class="wizard-step ${this.bulkStep === 'condition' ? 'active' : 'completed'}"><span class="wizard-step-number">1</span> Select Condition</div>
                        <div class="wizard-step ${this.bulkStep === 'preview' ? 'active' : this.bulkStep === 'sending' ? 'completed' : ''}"><span class="wizard-step-number">2</span> Preview</div>
                        <div class="wizard-step ${this.bulkStep === 'sending' ? 'active' : ''}"><span class="wizard-step-number">3</span> Send</div>
                    </div>

                    ${this.bulkStep === 'condition' ? html`
                        <div class="condition-cards">
                            ${conditions.map((c) => html`
                                <div class="condition-card ${this.bulkCondition === c.value ? 'selected' : ''}" @click=${() => { this.bulkCondition = c.value; }}>
                                    <div class="condition-card-title">${c.title}</div>
                                    <div class="condition-card-desc">${c.desc}</div>
                                </div>
                            `)}
                        </div>
                        <div class="modal-actions">
                            <button class="btn-secondary" @click=${() => { this.bulkModalOpen = false; }}>Cancel</button>
                            <button class="btn-primary" ?disabled=${!this.bulkCondition || this.bulkPreviewLoading} @click=${this.bulkLoadPreview}>${this.bulkPreviewLoading ? 'Loading...' : 'Next'}</button>
                        </div>
                    ` : this.bulkStep === 'preview' ? html`
                        <p style="margin-bottom: 1rem; font-size: 0.875rem; color: var(--color-text-muted);">${this.bulkPreview.length} account(s) matched. Review before sending:</p>
                        <div class="preview-list">
                            ${this.bulkPreview.map((a) => html`
                                <div class="preview-account">
                                    <div><strong>${a.accountName}</strong><div class="text-muted" style="font-size: 0.75rem;">${a.invoiceCount} invoice(s)</div></div>
                                    <span class="font-mono">$${formatCurrency(a.totalAmount)}</span>
                                </div>
                            `)}
                        </div>
                        <div class="modal-actions">
                            <button class="btn-secondary" @click=${() => { this.bulkStep = 'condition'; }}>Back</button>
                            <button class="btn-primary" ?disabled=${!this.bulkDeliverySms && !this.bulkDeliveryEmail} @click=${this.bulkSend}>Send ${this.bulkPreview.length}</button>
                        </div>
                    ` : html`
                        <div class="progress-text">${this.bulkSendComplete ? `All ${this.bulkSendTotal} contacts sent.` : `Sending ${this.bulkSendProgress + 1} of ${this.bulkSendTotal}...`}</div>
                        <div class="progress-bar-container"><div class="progress-bar" style="width: ${this.bulkSendTotal > 0 ? (this.bulkSendProgress / this.bulkSendTotal) * 100 : 0}%"></div></div>
                        ${this.bulkSendComplete ? html`<div class="modal-actions"><button class="btn-primary" @click=${() => { this.bulkModalOpen = false; }}>Done</button></div>` : nothing}
                    `}
                </div>
            </div>
        `;
    }

    private renderAutomationsTab() {
        if (this.automationsLoading) {
            return html`<div class="table-card"><div class="table-card-body">${[1, 2, 3].map(() => html`<div class="skeleton skeleton-row"></div>`)}</div></div>`;
        }

        if (this.automationsError) {
            return html`<div class="empty-state"><h3>Automations Coming Soon</h3><p>AR automations are coming soon.</p></div>`;
        }

        return html`
            <div class="controls-row">
                <div class="spacer"></div>
                <button class="btn-primary" @click=${() => this.openAutomationModal()}>New Rule</button>
            </div>

            ${this.automations.length === 0 ? html`
                <div class="empty-state">
                    <h3>No automation rules</h3>
                    <button class="btn-primary" @click=${() => this.openAutomationModal()}>Create First Rule</button>
                </div>
            ` : html`
                <div class="table-card">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Rule Name</th>
                                <th>Condition</th>
                                <th>Follow-Up</th>
                                <th>Active Invoices</th>
                                <th>Total Sent</th>
                                <th>Collected</th>
                                <th>Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.automations.map((rule) => html`
                                <tr>
                                    <td><strong>${rule.name}</strong></td>
                                    <td><span class="condition-badge">${this.formatConditionLabel(rule.condition)}</span></td>
                                    <td class="text-muted">${rule.followUpIntervalDays > 0 ? `Every ${rule.followUpIntervalDays}d (max ${rule.maxFollowUps})` : `Once (max ${rule.maxFollowUps})`}</td>
                                    <td>${rule.activeInvoices}</td>
                                    <td>${rule.totalSent}</td>
                                    <td class="font-mono">$${formatCurrency(rule.totalCollected)}</td>
                                    <td>
                                        <label class="toggle-switch">
                                            <input type="checkbox" .checked=${rule.isActive} @change=${() => this.toggleAutomation(rule.id)} />
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <button class="btn-action" @click=${() => this.openAutomationModal(rule)}>Edit</button>
                                        <button class="btn-action btn-action-danger" @click=${() => { this.deleteConfirmId = rule.id; }}>Delete</button>
                                    </td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
            `}
        `;
    }

    private renderAutomationModal() {
        return html`
            <div class="modal-overlay" @click=${() => { this.automationModal = false; }}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-title">${this.automationEditing ? 'Edit Automation Rule' : 'Create Automation Rule'}</div>
                    <div class="form-group-inline">
                        <label>Rule Name</label>
                        <input class="form-input" type="text" .value=${this.autoFormName} @input=${(e: Event) => { this.autoFormName = (e.target as HTMLInputElement).value; }} />
                    </div>
                    <div class="form-group-inline">
                        <label>Trigger Condition</label>
                        <select class="form-input" .value=${this.autoFormCondition} @change=${(e: Event) => { this.autoFormCondition = (e.target as HTMLSelectElement).value as AutomationCondition; }}>
                            <option value="past_due">Past Due</option>
                            <option value="due_today">Due Today</option>
                            <option value="due_in_3_days">Due in 3 Days</option>
                            <option value="due_in_7_days">Due in 7 Days</option>
                        </select>
                    </div>
                    <div class="form-group-inline">
                        <label>Message Template</label>
                        <textarea class="form-input form-textarea" rows="4" .value=${this.autoFormTemplate} @input=${(e: Event) => { this.autoFormTemplate = (e.target as HTMLTextAreaElement).value; }}></textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group-inline">
                            <label>Follow-up Interval (days)</label>
                            <input class="form-input" type="number" min="0" max="90" .value=${String(this.autoFormInterval)} @input=${(e: Event) => { this.autoFormInterval = parseInt((e.target as HTMLInputElement).value) || 0; }} />
                        </div>
                        <div class="form-group-inline">
                            <label>Max Follow-ups</label>
                            <input class="form-input" type="number" min="1" max="20" .value=${String(this.autoFormMaxFollowUps)} @input=${(e: Event) => { this.autoFormMaxFollowUps = parseInt((e.target as HTMLInputElement).value) || 1; }} />
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" @click=${() => { this.automationModal = false; }} ?disabled=${this.autoFormSaving}>Cancel</button>
                        <button class="btn-primary" @click=${this.saveAutomation} ?disabled=${this.autoFormSaving}>${this.autoFormSaving ? 'Saving...' : this.automationEditing ? 'Update Rule' : 'Create Rule'}</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderDeleteConfirm() {
        return html`
            <div class="modal-overlay" @click=${() => { this.deleteConfirmId = null; }}>
                <div class="modal" style="width: 400px;" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-title">Delete Automation Rule</div>
                    <p style="color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 1rem;">Are you sure you want to delete this automation rule? This action cannot be undone.</p>
                    <div class="modal-actions">
                        <button class="btn-secondary" @click=${() => { this.deleteConfirmId = null; }}>Cancel</button>
                        <button class="btn-primary" style="background: var(--color-error);" @click=${() => this.deleteAutomation(this.deleteConfirmId!)}>Delete</button>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="page-header">
                <div>
                    <h2>AR Center</h2>
                    <p class="page-subtitle">Manage account collections and automate follow-ups.</p>
                </div>
                <div class="header-actions">
                    <button class="btn-secondary" @click=${this.openBulkModal}>Bulk Contact</button>
                    <a href="/admin/accounts" class="btn-primary" style="text-decoration:none;">Go to Accounts</a>
                </div>
            </div>

            ${this.renderSummaryCards()}

            <div class="tab-bar">
                <button class="tab-btn ${this.activeTab === 'accounts' ? 'active' : ''}" @click=${() => this.handleTabChange('accounts')}>Accounts</button>
                <button class="tab-btn ${this.activeTab === 'automations' ? 'active' : ''}" @click=${() => this.handleTabChange('automations')}>Automations</button>
            </div>

            ${this.activeTab === 'accounts' ? this.renderAccountsTab() : this.renderAutomationsTab()}

            ${this.drawerOpen || this.drawerClosing ? this.renderDrawer() : nothing}
            ${this.reminderModal ? this.renderReminderModal() : nothing}
            ${this.bulkModalOpen ? this.renderBulkModal() : nothing}
            ${this.automationModal ? this.renderAutomationModal() : nothing}
            ${this.deleteConfirmId !== null ? this.renderDeleteConfirm() : nothing}
            ${this.toastMessage ? html`<div class="toast toast-${this.toastType} ${this.toastFading ? 'toast-out' : ''}" role="status" aria-live="polite">${this.toastMessage}</div>` : nothing}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-ar-center': PageArCenter;
    }
}
