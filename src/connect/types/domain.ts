/**
 * MIRRORS: velocity-backend-main/internal/domain/auth.go
 */
export type UserRole = 'tenant_owner' | 'tenant_staff' | 'account_admin' | 'account_user';

export interface User {
    id: number;
    email: string;
    name?: string;
    phone?: string;
    isActive: boolean;
    lastLoginAt?: string; // ISO Date
    role: UserRole;
    accountId?: number;
}

/**
 * MIRRORS: velocity-backend-main/internal/domain/account.go
 */
export type AddressType = 'billing' | 'shipping' | 'job_site' | 'remit_to';

export interface AccountAddress {
    addressId: number;
    accountId: number;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    isDefault: boolean;
    addressType: AddressType;
}

export interface Account {
    id: number;
    name?: string;
    number?: string;
    email?: string;
    phone?: string;
    active: boolean;
    addresses?: AccountAddress[];
    currencyCode: string;
    paymentTermsCode?: string;
    creditLimit: number;
    balance: number;
    availableCredit: number;
}

/**
 * MIRRORS: velocity-backend-main/internal/domain/sales.go
 */
export type OrderStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled' | 'closed';
export type InvoiceStatus = 'open' | 'paid' | 'overdue' | 'cancelled' | 'void';
export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Order {
    id: number;
    orderNumber: string;
    orderDate: string; // ISO Date
    subtotal: number;
    taxTotal: number;
    total: number;
    status: OrderStatus;
    jobId?: number;
    poNumber?: string; // Mapped from ExternalID if needed or added to BE schema
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate?: string;
    total: number;
    balanceDue: number;
    status: InvoiceStatus;
    pdfUrl?: string; // Potential future field
}

// NOTE: Frontend "Estimate" maps to Backend "Quote"
export interface Quote {
    id: number;
    quoteNumber: string;
    quoteDate: string;
    expiresOn?: string;
    total: number;
    status: QuoteStatus;
}

/**
 * MIRRORS: velocity-backend-main/internal/domain/fulfillment.go
 */
export interface Job {
    id: number;
    jobNumber: string;
    name: string;
    poNumber?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    isActive: boolean;
}

/**
 * REQUIRED: Backend should provide this via GET /dashboard/summary
 * Replaces frontend computation of aggregated values
 */
export interface DashboardSummary {
    balanceDue: number;           // Sum of open + overdue invoices
    creditLimit: number;          // From Account
    creditAvailable: number;      // creditLimit - balanceDue
    activeOrdersCount: number;    // Count of orders NOT (delivered, closed, cancelled)
    pendingEstimatesCount: number; // Count of quotes with status = 'pending'
    pendingEstimatesTotal: number; // Sum of totals for pending quotes
}

/**
 * REQUIRED: Backend should provide this via GET /billing/summary
 * Replaces frontend computation of billing aggregates
 */
export interface BillingSummary {
    balanceDue: number;           // Sum of all invoice.balanceDue
    openInvoicesCount: number;    // Count where status = 'open'
    overdueInvoicesCount: number; // Count where status = 'overdue'
    lastPaymentDate?: string;     // ISO date of most recent payment
    lastPaymentAmount?: number;   // Amount of most recent payment
}

/**
 * Payment method for wallet management
 * MAPS TO: Future backend endpoint POST/DELETE /payment-methods
 */
export type PaymentMethodType = 'card' | 'ach';

export interface PaymentMethod {
    id: string;
    type: PaymentMethodType;
    label: string;
    last4: string;
    expiry?: string; // MM/YY for cards
    isDefault: boolean;
}

/**
 * Notification preferences for settings page
 * MAPS TO: PUT /users/{id}/notifications
 */
export interface NotificationPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderUpdates: boolean;
}

/**
 * Team member for account team management
 * MAPS TO: GET/POST/PUT /account/{id}/members
 */
export type TeamMemberRole = 'owner' | 'admin' | 'purchaser' | 'viewer';

export interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: TeamMemberRole;
    initials?: string;
}

/**
 * Payload for updating user profile
 * MAPS TO: PUT /users/{id}
 */
export interface UpdateProfilePayload {
    phone?: string;
}

/**
 * Payload for changing password
 * MAPS TO: POST /auth/change-password
 */
export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

/**
 * Payload for inviting a team member
 * MAPS TO: POST /account/{id}/members/invite
 */
export interface InviteMemberPayload {
    email: string;
    role: TeamMemberRole;
}

/**
 * Payload for paying an invoice
 * MAPS TO: POST /invoices/{id}/pay
 */
export interface PayInvoicePayload {
    paymentMethodId: string;
}
