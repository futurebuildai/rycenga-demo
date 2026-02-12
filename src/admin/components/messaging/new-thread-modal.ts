import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AdminDataService, type AdminAccount, type AdminUser } from '../../services/admin-data.service.js';

interface AccountOption {
    id: number;
    name: string;
    phone: string;
}

interface UserOption {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

@customElement('messaging-new-thread-modal')
export class NewThreadModal extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }

        .overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 200ms ease, visibility 200ms ease;
        }

        .overlay.open {
            opacity: 1;
            visibility: visible;
        }

        .modal {
            background: white;
            border-radius: 12px;
            width: 100%;
            max-width: 520px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
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

        .modal-body {
            padding: 24px;
            flex: 1;
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
            background: white;
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
            background: white;
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
            background: rgba(99, 102, 241, 0.1);
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
            background: white;
            border: 1px solid var(--color-border, #e2e8f0);
            color: var(--color-text, #0f172a);
        }

        .btn-cancel:hover {
            background: var(--admin-bg, #f1f5f9);
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
            background: #fef3c7;
            border-radius: 8px;
            font-size: 13px;
            color: #92400e;
            margin-top: 8px;
        }

        .no-phone-warning svg {
            flex-shrink: 0;
        }

        .form-error {
            font-size: 12px;
            color: #dc2626;
            margin-top: 6px;
        }

        .form-input.error {
            border-color: #dc2626;
        }

        .form-input.error:focus {
            border-color: #dc2626;
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

        .truncation-warning {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 10px;
            background: #fef3c7;
            border-radius: 6px;
            font-size: 12px;
            color: #92400e;
            margin-bottom: 8px;
        }
    `;

    @property({ type: Boolean }) open = false;

    @state() private mode: 'existing' | 'new' = 'existing';
    @state() private accounts: AccountOption[] = [];
    @state() private users: UserOption[] = [];
    @state() private selectedAccountId: number | null = null;
    @state() private selectedUserId: number | null = null;
    @state() private loadingAccounts = false;
    @state() private loadingUsers = false;
    @state() private accountSearchQuery = '';
    @state() private hasMoreAccounts = false;
    private allAccounts: AccountOption[] = [];

    // For new contact
    @state() private contactName = '';
    @state() private contactPhone = '';

    // Common
    @state() private initialMessage = '';
    @state() private sending = false;
    @state() private phoneError = '';

    /**
     * Validates and normalizes phone number to E.164-like format.
     * Accepts: +1234567890, (123) 456-7890, 123-456-7890, 1234567890
     * Returns normalized phone or empty string if invalid.
     */
    private normalizePhone(phone: string): string {
        // Remove all non-digit characters except leading +
        const hasPlus = phone.startsWith('+');
        const digits = phone.replace(/\D/g, '');

        // Minimum 10 digits for valid phone
        if (digits.length < 10) return '';

        // Maximum 15 digits per E.164
        if (digits.length > 15) return '';

        return hasPlus ? `+${digits}` : `+${digits}`;
    }

    private validatePhone(phone: string): boolean {
        if (!phone.trim()) {
            this.phoneError = 'Phone number is required';
            return false;
        }

        const normalized = this.normalizePhone(phone);
        if (!normalized) {
            this.phoneError = 'Enter a valid phone number (10-15 digits)';
            return false;
        }

        this.phoneError = '';
        return true;
    }

    async connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has('open')) {
            if (this.open) {
                this.loadAccounts();
            } else {
                // Reset form when modal closes (externally or via handleClose)
                this.resetForm();
            }
        }
    }

    /**
     * Load accounts for the dropdown.
     * TODO: When backend supports search param, replace client-side filtering
     * with server-side search: getAccounts(limit, offset, { search: query })
     */
    private async loadAccounts() {
        if (this.allAccounts.length > 0) return;

        this.loadingAccounts = true;
        try {
            const response = await AdminDataService.getAccounts(100, 0);
            this.allAccounts = response.items.map((a: AdminAccount) => ({
                id: a.id,
                name: a.name,
                phone: a.phone,
            }));
            this.hasMoreAccounts = response.total > 100;
            this.filterAccounts();
        } catch (e) {
            console.error('Failed to load accounts:', e);
        } finally {
            this.loadingAccounts = false;
        }
    }

    /**
     * TEMPORARY: Client-side filtering until backend supports search parameter.
     * This approach has limitations with large datasets (>100 accounts).
     * TODO: Replace with server-side search when available.
     */
    private filterAccounts() {
        const query = this.accountSearchQuery.toLowerCase().trim();
        if (!query) {
            this.accounts = this.allAccounts;
        } else {
            this.accounts = this.allAccounts.filter(a =>
                a.name.toLowerCase().includes(query) ||
                a.phone.includes(query)
            );
        }
    }

    private handleAccountSearch(e: Event) {
        this.accountSearchQuery = (e.target as HTMLInputElement).value;
        this.filterAccounts();
    }

    /**
     * Load users for the selected account.
     * TEMPORARY: Client-side filtering by accountId until backend supports
     * account_id query parameter: getUsers(limit, offset, { accountId })
     * TODO: Replace with server-side filtering when available.
     */
    private async loadUsers(accountId: number) {
        this.loadingUsers = true;
        this.users = [];
        this.selectedUserId = null;

        try {
            // TODO: Replace with server-side filter when backend supports account_id param
            const response = await AdminDataService.getUsers(100, 0);
            // Client-side filter: users who have this account in their assignments or accountId
            this.users = response.items
                .filter((u: AdminUser) =>
                    u.accountId === accountId ||
                    u.accountAssignments?.some(a => a.accountId === accountId)
                )
                .map((u: AdminUser) => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    phone: u.phone,
                }));
        } catch (e) {
            console.error('Failed to load users:', e);
        } finally {
            this.loadingUsers = false;
        }
    }

    private handleOverlayClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            this.handleClose();
        }
    }

    private handleClose() {
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
        this.resetForm();
    }

    private resetForm() {
        this.mode = 'existing';
        this.selectedAccountId = null;
        this.selectedUserId = null;
        this.users = [];
        this.contactName = '';
        this.contactPhone = '';
        this.initialMessage = '';
        this.sending = false;
        this.phoneError = '';
        this.accountSearchQuery = '';
        this.filterAccounts();
    }

    private handleModeChange(mode: 'existing' | 'new') {
        this.mode = mode;
        this.selectedAccountId = null;
        this.selectedUserId = null;
        this.users = [];
        this.contactName = '';
        this.contactPhone = '';
    }

    private handleAccountChange(e: Event) {
        const select = e.target as HTMLSelectElement;
        const accountId = parseInt(select.value, 10);

        if (isNaN(accountId)) {
            this.selectedAccountId = null;
            this.users = [];
            this.selectedUserId = null;
            return;
        }

        this.selectedAccountId = accountId;
        this.loadUsers(accountId);
    }

    private handleUserChange(e: Event) {
        const select = e.target as HTMLSelectElement;
        const userId = parseInt(select.value, 10);

        if (isNaN(userId)) {
            this.selectedUserId = null;
            return;
        }

        this.selectedUserId = userId;
    }

    private getSelectedAccount(): AccountOption | undefined {
        return this.accounts.find(a => a.id === this.selectedAccountId);
    }

    private getSelectedUser(): UserOption | undefined {
        return this.users.find(u => u.id === this.selectedUserId);
    }

    private getEffectivePhone(): string {
        if (this.mode === 'new') {
            return this.contactPhone;
        }

        const user = this.getSelectedUser();
        if (user?.phone) {
            return user.phone;
        }

        const account = this.getSelectedAccount();
        return account?.phone || '';
    }

    private getEffectiveName(): string {
        if (this.mode === 'new') {
            return this.contactName;
        }

        const user = this.getSelectedUser();
        if (user) {
            return user.name;
        }

        const account = this.getSelectedAccount();
        return account?.name || '';
    }

    private handleSubmit(e: Event) {
        e.preventDefault();

        const phone = this.getEffectivePhone();
        const name = this.getEffectiveName();

        if (!name.trim() || !phone.trim()) {
            return;
        }

        // Validate phone before submitting
        if (!this.validatePhone(phone)) {
            return;
        }

        // Normalize phone to E.164 format
        const normalizedPhone = this.normalizePhone(phone);

        this.sending = true;

        this.dispatchEvent(
            new CustomEvent('create', {
                detail: {
                    contactName: name.trim(),
                    contactPhone: normalizedPhone,
                    initialMessage: this.initialMessage.trim(),
                    accountId: this.mode === 'existing' ? this.selectedAccountId : undefined,
                    accountName: this.mode === 'existing' ? this.getSelectedAccount()?.name : undefined,
                    userId: this.mode === 'existing' ? this.selectedUserId : undefined,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    private isValid(): boolean {
        if (this.mode === 'new') {
            if (this.contactName.trim() === '') return false;
            return this.validatePhone(this.contactPhone);
        }

        // Existing mode
        if (!this.selectedAccountId) return false;

        const phone = this.getEffectivePhone();
        return phone.trim() !== '' && this.normalizePhone(phone) !== '';
    }

    render() {
        const selectedUser = this.getSelectedUser();
        const selectedAccount = this.getSelectedAccount();
        const hasPhone = this.mode === 'new' ? true : (selectedUser?.phone || selectedAccount?.phone);

        return html`
            <div class="overlay ${this.open ? 'open' : ''}" @click=${this.handleOverlayClick}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <h3 class="modal-title">New Conversation</h3>
                        <button class="btn-close" @click=${this.handleClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <form @submit=${this.handleSubmit}>
                        <div class="modal-body">
                            <div class="toggle-row">
                                <button
                                    type="button"
                                    class="toggle-btn ${this.mode === 'existing' ? 'active' : ''}"
                                    @click=${() => this.handleModeChange('existing')}
                                >
                                    Existing Account
                                </button>
                                <button
                                    type="button"
                                    class="toggle-btn ${this.mode === 'new' ? 'active' : ''}"
                                    @click=${() => this.handleModeChange('new')}
                                >
                                    New Contact
                                </button>
                            </div>

                            ${this.mode === 'existing' ? this.renderExistingForm() : this.renderNewForm()}

                            <div class="form-divider">Message</div>

                            <div class="form-group">
                                <label class="form-label">Initial Message (optional)</label>
                                <textarea
                                    class="form-input form-textarea"
                                    placeholder="Type your first message..."
                                    .value=${this.initialMessage}
                                    @input=${(e: Event) => (this.initialMessage = (e.target as HTMLTextAreaElement).value)}
                                ></textarea>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-cancel" @click=${this.handleClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="btn btn-primary"
                                ?disabled=${!this.isValid() || this.sending}
                            >
                                ${this.sending ? 'Creating...' : 'Start Conversation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    private renderExistingForm() {
        const selectedUser = this.getSelectedUser();
        const selectedAccount = this.getSelectedAccount();
        const effectivePhone = this.getEffectivePhone();
        const showNoPhoneWarning = this.selectedAccountId && !effectivePhone && !this.loadingUsers;

        return html`
            <div class="form-group">
                <label class="form-label">Account *</label>
                ${this.loadingAccounts
                    ? html`<span class="loading-text">Loading accounts...</span>`
                    : html`
                        ${this.hasMoreAccounts ? html`
                            <div class="truncation-warning">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                Showing first 100 accounts. Use search to find others.
                            </div>
                        ` : null}
                        ${this.allAccounts.length > 10 ? html`
                            <div class="account-search-container">
                                <svg class="account-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <input
                                    type="text"
                                    class="account-search"
                                    placeholder="Search accounts..."
                                    aria-label="Search accounts"
                                    .value=${this.accountSearchQuery}
                                    @input=${this.handleAccountSearch}
                                />
                            </div>
                        ` : null}
                        <select
                            class="form-select"
                            aria-label="Select account"
                            .value=${this.selectedAccountId?.toString() ?? ''}
                            @change=${this.handleAccountChange}
                        >
                            <option value="">Select an account...</option>
                            ${this.accounts.map(
                                (account) => html`
                                    <option value=${account.id}>${account.name}</option>
                                `
                            )}
                        </select>
                        ${this.accountSearchQuery && this.accounts.length === 0 ? html`
                            <p class="form-hint">No accounts match "${this.accountSearchQuery}"</p>
                        ` : null}
                    `
                }
            </div>

            ${this.selectedAccountId ? html`
                <div class="form-group">
                    <label class="form-label">Contact (optional)</label>
                    ${this.loadingUsers
                        ? html`<span class="loading-text">Loading contacts...</span>`
                        : html`
                            <select
                                class="form-select"
                                .value=${this.selectedUserId?.toString() ?? ''}
                                @change=${this.handleUserChange}
                            >
                                <option value="">Use account phone</option>
                                ${this.users.map(
                                    (user) => html`
                                        <option value=${user.id}>
                                            ${user.name}${user.phone ? ` (${user.phone})` : ' (no phone)'}
                                        </option>
                                    `
                                )}
                            </select>
                        `
                    }
                    <p class="form-hint">
                        ${this.users.length === 0 && !this.loadingUsers
                            ? 'No contacts found for this account'
                            : 'Select a specific contact or use the account phone number'
                        }
                    </p>
                </div>

                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input
                        type="tel"
                        class="form-input"
                        .value=${effectivePhone}
                        disabled
                        placeholder="No phone number available"
                    />
                    ${showNoPhoneWarning ? html`
                        <div class="no-phone-warning">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            No phone number available for this selection
                        </div>
                    ` : null}
                </div>
            ` : null}
        `;
    }

    private renderNewForm() {
        return html`
            <div class="form-group">
                <label class="form-label">Contact Name *</label>
                <input
                    type="text"
                    class="form-input"
                    placeholder="John Doe"
                    .value=${this.contactName}
                    @input=${(e: Event) => (this.contactName = (e.target as HTMLInputElement).value)}
                    required
                />
            </div>

            <div class="form-group">
                <label class="form-label">Phone Number *</label>
                <input
                    type="tel"
                    class="form-input ${this.phoneError ? 'error' : ''}"
                    placeholder="+1 (555) 123-4567"
                    aria-label="Phone number"
                    aria-invalid=${this.phoneError ? 'true' : 'false'}
                    .value=${this.contactPhone}
                    @input=${(e: Event) => {
                        this.contactPhone = (e.target as HTMLInputElement).value;
                        if (this.phoneError) this.validatePhone(this.contactPhone);
                    }}
                    @blur=${() => this.contactPhone && this.validatePhone(this.contactPhone)}
                    required
                />
                ${this.phoneError
                    ? html`<p class="form-error">${this.phoneError}</p>`
                    : html`<p class="form-hint">Enter the phone number to send SMS messages to</p>`
                }
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'messaging-new-thread-modal': NewThreadModal;
    }
}
