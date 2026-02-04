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
    accountAssignments?: AccountAssignment[];
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

export interface AccountAssignment {
    id: number;
    accountId: number;
    userId: number;
    assignmentType: string;
    createdAt: string;
    isPrimary: boolean;
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
 * MIRRORS: velocity-backend-main/internal/domain/finance.go
 * Response from GET /v1/accounts/{id}/financials
 */
export interface AccountFinancials {
    accountId: number;
    accountNumber: string;
    accountName: string;
    currencyCode: string;
    creditLimit: number;
    totalBalance: number;
    availableCredit: number;
    aging30: number;
    aging60: number;
    aging90: number;
    aging90Plus: number;
    aging: 'Current' | '30' | '60' | '90' | '90+';
    pastDueBalance: number;
    lastSyncAt: string;
}

/**
 * MIRRORS: velocity-backend-main/internal/domain/sales.go
 */
export type OrderStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled' | 'closed';
export type InvoiceStatus = 'open' | 'paid' | 'past_due' | 'cancelled' | 'void';
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';
export type LineItemStatus = 'active' | 'cancelled' | 'shipped' | 'returned';

export interface OrderLine {
    id: number;
    orderId: number;
    lineNumber: number;
    itemCode: string;
    description?: string;
    quantityOrdered: number;
    quantityShipped: number;
    quantityBackordered: number;
    unitPrice: number;
    extendedPrice: number;
    status: LineItemStatus;
}

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
    lines?: InvoiceLine[];
}

export interface InvoiceLine {
    id: number;
    invoiceId: number;
    lineNumber: number;
    itemCode: string;
    description?: string;
    quantityBilled: number;
    unitPrice: number;
    extendedPrice: number;
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

export interface QuoteLine {
    id: number;
    quoteId: number;
    lineNumber: number;
    itemCode: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    extendedPrice: number;
}

/**
 * MIRRORS: velocity-backend-main/internal/domain/account.go
 */
export type JobAddressRole = 'primary_site' | 'delivery' | 'staging' | 'administrative';

export interface JobAddress {
    id: number;
    jobId: number;
    addressRole: JobAddressRole;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
}

export interface Job {
    id: number;
    accountId: number;
    jobNumber: string;
    name: string;
    poNumber?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    address?: JobAddress;      // Primary address (optional)
    addresses?: JobAddress[];  // All addresses
}

/**
 * MIRRORS: velocity-backend-main/internal/domain/dashboard.go
 * Response from GET /v1/dashboard/summary
 */
export interface DashboardSummary {
    accountId: number;
    accountName: string | null;
    creditLimit: number | null;
    currentBalance: number;
    pastDueInvoicesCount: number;
    activeOrdersCount: number;
    pendingQuotesCount: number;
    recentInvoices: unknown[];
    recentOrders: unknown[];
    recentQuotes: unknown[];
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
 * MAPS TO: GET/POST/DELETE /payment-methods
 */
export type PaymentMethodType = 'card' | 'ach';

export interface PaymentMethod {
    id: number;
    accountId?: number;
    type: PaymentMethodType;
    providerToken?: string;
    providerKey?: string | null;
    brand?: string | null;
    last4?: string | null;
    expMonth?: number | null;
    expYear?: number | null;
    isDefault: boolean;
    metadata?: unknown;
    createdAt?: string;
}

/**
 * Payload for creating a payment method
 * MAPS TO: POST /payment-methods
 */
export interface PaymentMethodCreatePayload {
    accountToken: string;
    name: string;
    type?: PaymentMethodType;
    brand?: string | null;
    last4?: string | null;
    expMonth?: number | null;
    expYear?: number | null;
    isDefault?: boolean;
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    region?: string | null;
    accountZip?: string | null;
    country?: string | null;
    phone?: string | null;
    email?: string | null;
    custom06?: string | null;
    custom07?: string | null;
    custom08?: string | null;
    custom09?: string | null;
    custom10?: string | null;
    metadata?: unknown;
}

/**
 * Payment config for Runner.js initialization
 * MAPS TO: GET /payment-config
 */
export interface PaymentConfig {
    publicKey: string;
}

/**
 * Account statement
 * MAPS TO: GET /v1/statements
 */
export interface Statement {
    id: number;
    accountId: number;
    statementNumber: string | null;
    periodStart: string;
    periodEnd: string;
    statementDate: string;
    currencyCode: string;
    openingBalance: number;
    closingBalance: number;
    documentId: number | null;
    createdAt: string;
}

/**
 * Card tokenization input for SDK
 * PCI-DSS: NEVER persist this data - only pass to tokenization
 */
export interface CardTokenizeInput {
    cardNumber: string;
    expMonth: number;
    expYear: number;
    cvc: string;
}

/**
 * ACH tokenization input for SDK
 */
export interface ACHTokenizeInput {
    routingNumber: string;
    accountNumber: string;
    accountType: 'checking' | 'savings';
}

/**
 * Token response from Run Payments SDK
 */
export interface TokenResponse {
    token: string;
    last4?: string;
    brand?: string;
    expMonth?: number;
    expYear?: number;
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

/**
 * MIRRORS: velocity-backend/internal/domain/finance.go
 * Payment creation types for POST /v1/payments
 */
export interface PaymentAllocation {
    invoiceId: number;
    amount: number;
}

export type PaymentType = 'balance' | 'invoice' | 'statement' | 'order';

export interface PaymentPayload {
    type: PaymentType;
    referenceId?: number;
    allocations?: PaymentAllocation[];
    amount: number;
    currency: string;
    paymentMethodId: number;
    convenienceFee?: number;
}

export type PaymentStatus =
    | 'pending'
    | 'submitted'
    | 'settled'
    | 'failed'
    | 'cancelled'
    | 'refunded'
    | 'processing'
    | 'authorized'
    | 'captured'
    | 'initiated'
    | 'voided';

export interface PaymentTransaction {
    id: number;
    accountId: number;
    userId: number | null;
    externalId: string | null;
    provider: string;
    status: PaymentStatus;
    currencyCode: string;
    amount: number;
    convenienceFee: number;
    totalCharged: number;
    paymentMethodType: PaymentMethodType | null;
    submittedAt: string;
    settledAt: string | null;
    failureCode: string | null;
    failureMessage: string | null;
    referenceType?: string;
    referenceId?: number;
}
