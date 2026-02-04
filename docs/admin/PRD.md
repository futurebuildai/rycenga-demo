# PRD: Dealer Admin Portal (Velocity)

**Status:** Planning
**Target User:** Dealer Owners, Sales Managers, IT Staff (Tenant Staff)

## 1. Problem Statement
Dealers need a central, professional interface to monitor sync health, manage their staff, and most importantly, gain deep visibility into their customer accounts. This interface must be branded to the dealer to maintain their professional image and must be capable of aggregating data from any ERP (BisTrack, Spruce, etc.) via the Velocity backend.

## 2. User Roles
*   **Tenant Owner**: Full access to dealer settings, branding, and billing.
*   **Tenant Staff**: Access to customer data, sync status, and user management.

## 3. Functional Requirements

### 3.1 Architecture & Access
*   **Separate Application**: The Admin Portal will be a distinct single-page application (SPA) served from the same domain but with a separate entry point (e.g., `domain.com/admin/`).
*   **Authentication**: Separate login flow for staff.
*   **ERP Agnostic**: The UI must not contain any ERP-specific logic; all data normalization happens at the backend/API layer.

### 3.2 Branding & White-labeling
*   **Tenant Branding**: The Admin UI must reflect the dealer's brand identity (Logo, Primary Colors) just like the customer portal.
*   **Professional Aesthetic**: "Lumber Boss" defaults, overridden by tenant configuration.

### 3.3 accounts Dashboard (Core Feature)
*   **Unified Account List**: A searchable, sortable list of all customer accounts pulled from the ERP.
*   **Account Drill-Down**: Clicking an account provides a detailed view containing:
    *   **Financials**: Outstanding Balance, Credit Limit, Available Credit.
    *   **Transactions**:
        *   **Orders**: List of Active/Recent Orders with status (Open, Processing, Delivered).
        *   **Invoices**: List of Open/Past Due Invoices with "Pay Now" capability (future).
        *   **Quotes**: List of open Estimates/Quotes.
    *   **Status**: Active/Inactive sort statuses.
    *   **Sync Health**: Last sync timestamp for this specific account.

### 3.4 User Management (Constraint)
*   **External Provisioning**: Dealer Admin users are provisioned externally (e.g., via database seeding or support request).
*   **No UI Creation**: The Admin Portal will **not** include features to create, invite, or manage staff users in Phase 1/2.

### 3.5 Sync & Management
*   **Sync Dashboard**: Visual indicator of global sync health.
*   **Manual Trigger**: Ability to force syncs for accounts or products.

## 4. Technical Requirements
*   **Multi-Page App (Vite)**: distinct `admin.html` and entry point.
*   **Shared Design System**: Reuse `lit` components from the main app where possible (buttons, inputs) but allow for a denser, data-heavy layout.
*   **API**: Uses `velocity-backend` endpoints (`/v1/accounts`, `/v1/admin/*`).

## 5. Success Metrics
*   Dealer adoption of the Accounts Dashboard for daily checks.
*   Reduction in "What is my balance?" calls from customers (as dealers can now proactively see/manage this).
