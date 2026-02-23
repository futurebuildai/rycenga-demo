import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AdminDataService, type AdminAccount, type AdminUser } from '../../services/admin-data.service.js';
import { newThreadModalStyles } from '../../../styles/admin-messaging.js';

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
    static styles = newThreadModalStyles;

    @property({ type: Boolean }) open = false;

    @state() private mode: 'existing' | 'new' = 'existing';
    @state() private accounts: AccountOption[] = [];
    @state() private users: UserOption[] = [];
    @state() private selectedAccountId: number | null = null;
    @state() private selectedUserId: number | null = null;
    @state() private loadingAccounts = false;
    @state() private loadingUsers = false;
    @state() private accountSearchQuery = '';
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
            const response = await AdminDataService.getAccounts(50, 0);
            this.allAccounts = response.items.map((a: AdminAccount) => ({
                id: a.id,
                name: a.name,
                phone: a.phone,
            }));
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
