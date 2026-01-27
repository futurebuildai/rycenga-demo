// ============================================
// My Account Lite - Type Definitions
// Source: .system-docs/api-schema-mapping.json
// ============================================

// ============================================
// Enums (from api-schema-mapping.json)
// ============================================

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'ready_for_pickup'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'closed';

export type InvoiceStatus =
    | 'open'
    | 'paid'
    | 'overdue'
    | 'cancelled'
    | 'void';

export type EstimateStatus =
    | 'sent'
    | 'accepted'
    | 'rejected'
    | 'expired'
    | 'converted';

export type ProjectStatus =
    | 'active'
    | 'completed'
    | 'archived';

export type UserRole =
    | 'retail'
    | 'pro'
    | 'admin';

export type TeamMemberRole =
    | 'owner'
    | 'admin'
    | 'purchaser'
    | 'viewer';

export type PaymentTerms =
    | 'NET30'
    | 'NET60'
    | 'COD';

export type DeliveryType =
    | 'pickup'
    | 'delivery';

// ============================================
// Auth
// ============================================

export interface Session {
    email: string;
    loginTime: string;
}

// ============================================
// User Schema
// ============================================

export interface User {
    id: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt?: string;
    lastLoginAt?: string;
}

// ============================================
// ProAccount Schema
// ============================================

export interface ProAccount {
    id: string;
    userId: string;
    companyName: string;
    creditLimit?: number;
    creditAvailable?: number;
    paymentTerms?: PaymentTerms;
    erpCustomerId?: string;
    taxExempt?: boolean;
    taxId?: string | null;
    autoPayEnabled?: boolean;
    defaultLocationId?: string;
}

// ============================================
// Address (nested object)
// ============================================

export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
}

// ============================================
// Project Schema
// ============================================

export interface Project {
    id: string;
    userId: string;
    name: string;
    address?: Address;
    status: ProjectStatus;
    color?: string;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

// ============================================
// OrderLine Schema
// ============================================

export interface OrderLine {
    id: string;
    orderId?: string;
    productId: string;
    sku?: string;
    name?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

// ============================================
// Order Schema
// ============================================

export interface Order {
    id: number;
    orderNumber: string;
    userId: string;
    projectId?: string | null;
    locationId?: string;
    status: OrderStatus;
    deliveryType?: DeliveryType;
    deliveryAddress?: Address | null;
    requestedDate?: string;
    estimatedDelivery?: string | null;
    poNumber?: string | null;
    erpOrderId?: string | null;
    subtotal?: number;
    tax?: number;
    total: number;
    createdAt?: string;
    updatedAt?: string;
    lines?: OrderLine[];
}

// ============================================
// Invoice Schema
// ============================================

export interface Invoice {
    id: number;
    invoiceNumber: string;
    userId?: string;
    orderId?: string | null;
    projectId?: string | null;
    status: InvoiceStatus;
    dueDate?: string;
    subtotal?: number;
    tax?: number;
    total: number;
    amountPaid?: number;
    amountDue: number;
    erpInvoiceId?: string;
    createdAt?: string;
    lines?: InvoiceLine[];
}

// ============================================
// InvoiceLine Schema
// ============================================

export interface InvoiceLine {
    id: string;
    invoiceId?: number;
    productId: string;
    sku?: string;
    name?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

// ============================================
// Estimate Schema
// ============================================

export interface Estimate {
    id: number;
    estimateNumber: string;
    userId?: string;
    projectId?: string | null;
    status: EstimateStatus;
    validUntil: string;
    subtotal?: number;
    tax?: number;
    total: number;
    markupPercentage?: number | null;
    convertedOrderId?: string | null;
    erpQuoteId?: string | null;
    createdAt?: string;
    lines?: OrderLine[];
}

// ============================================
// Location Schema
// ============================================

export interface Location {
    id: string;
    name: string;
    address?: Address;
    phone?: string;
    hours?: Record<string, string>;
}

// ============================================
// Team & Support (from account.json)
// ============================================

export interface TeamMember {
    name: string;
    email: string;
    role: TeamMemberRole | string;
    initials: string;
}

export interface Support {
    phone: string;
    email: string;
}

// ============================================
// Composite AccountData (for mock JSON)
// ============================================

export interface AccountData {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        initials: string;
        email: string;
        phone: string;
    };
    company: {
        id: string;
        name: string;
        limit: number;
        available: number;
        balance: number;
    };
    support: Support;
    team: TeamMember[];
    location: string;
}

// ============================================
// Routing
// ============================================

export type RouteId =
    | 'overview'
    | 'billing'
    | 'projects'
    | 'orders'
    | 'estimates'
    | 'wallet'
    | 'team'
    | 'settings'
    | 'login';

// ============================================
// Toast Events
// ============================================

export type ToastType =
    | 'info'
    | 'success'
    | 'warning'
    | 'error';

export interface ToastEvent {
    message: string;
    type: ToastType;
    duration?: number;
}

// ============================================
// Custom Event Declaration
// ============================================

declare global {
    interface WindowEventMap {
        'show-toast': CustomEvent<ToastEvent>;
        'route-changed': CustomEvent<{ route: RouteId }>;
    }
}

// ============================================
// Dashboard Schema
// ============================================

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
