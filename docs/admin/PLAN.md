# Admin UI Implementation Plan

This document tracks the step-by-step implementation of the Dealer Admin UI. We are tackling this one phase at a time.

## Phase 1: Foundation & Project Setup [COMPLETE]

Goal: collaborative setup of the multi-page Vite app, admin entry point, and basic routing structure.
**Reference PRD**: [PRD.md](PRD.md)

- [x] **Vite Configuration Update**
    > **Spec**: [specs/TASK_1_VITE_CONFIG.md](specs/TASK_1_VITE_CONFIG.md)
    - [x] Update `vite.config.ts` to support multi-page (admin.html).
    - [x] Create `admin.html` entry point.
- [x] **Source Structure Setup**
    > **Spec**: [specs/TASK_2_SOURCE_INIT.md](specs/TASK_2_SOURCE_INIT.md)
    - [x] Create `src/admin` directory structure.
    - [x] Initialize `src/admin/main.ts` and `src/admin/lb-admin-app.ts`.
- [x] **Routing & Layout**
    > **Spec**: [specs/TASK_3_ROUTING_LAYOUT.md](specs/TASK_3_ROUTING_LAYOUT.md)
    - [x] Install/Setup router for Admin (separate from main app).
    - [x] Create basic Admin Layout (Sidebar + Content Area).
- [x] **Verification**
    > **Spec**: [specs/TASK_4_VERIFICATION.md](specs/TASK_4_VERIFICATION.md)
    - [x] Verify `/admin/` loads the new app.
    - [x] Verify `/` still loads the customer app.

## Phase 2: Authentication & Branding [COMPLETE]

Goal: Isolated admin auth layer, login gate, and branding foundation.
> **Note**: Admin users are externally provisioned. No "Sign Up" or "Invite" flows.

- [x] **Auth Infrastructure**
    > **Spec**: [specs/TASK_5_AUTH_SERVICE.md](specs/TASK_5_AUTH_SERVICE.md)
    - [x] Create admin API client (`admin_auth_token` storage key).
    - [x] Create admin auth service with role validation (`tenant_owner`/`tenant_staff`).
- [x] **Admin Login View**
    > **Spec**: [specs/TASK_6_LOGIN_VIEW.md](specs/TASK_6_LOGIN_VIEW.md)
    - [x] Create `admin-page-login` component with email/password form.
- [x] **Auth Integration & Branding**
    > **Spec**: [specs/TASK_7_AUTH_INTEGRATION.md](specs/TASK_7_AUTH_INTEGRATION.md)
    - [x] Gate admin app behind login (render login vs layout based on auth state).
    - [x] Add Sign Out to sidebar.
    - [x] Establish default "Lumber Boss" branding (overridable via tenant config later).
- [x] **Verification**
    > **Spec**: [specs/TASK_8_PHASE2_VERIFY.md](specs/TASK_8_PHASE2_VERIFY.md)
    - [x] Build passes, both entry points present.
    - [x] Existing tests pass.
    - [x] Zero cross-boundary imports from admin into customer modules.

## Phase 3: Accounts Dashboard [COMPLETE]

Goal: Data-driven accounts list, account detail view with financials, and transaction tab placeholders.
> **Note**: Dashboard aggregate endpoint is a backend gap — mock data used. Transaction data endpoints are user-scoped — placeholder tabs for Phase 3.

- [x] **Mock Data & Data Service**
    > **Spec**: [specs/TASK_9_DATA_SERVICE.md](specs/TASK_9_DATA_SERVICE.md)
    - [x] Accept mock JSON fixtures (accounts, dashboard, account-details).
    - [x] Create typed `AdminDataService` with `adminClient` + mock fallback.
- [x] **Dashboard Stats Page**
    > **Spec**: [specs/TASK_10_DASHBOARD.md](specs/TASK_10_DASHBOARD.md)
    - [x] Render aggregate stats cards from mock data.
- [x] **Accounts List Page**
    > **Spec**: [specs/TASK_11_ACCOUNTS_LIST.md](specs/TASK_11_ACCOUNTS_LIST.md)
    - [x] Searchable accounts table with status badges.
    - [x] "View" action navigates to account detail.
- [x] **Account Detail Page**
    > **Spec**: [specs/TASK_12_ACCOUNT_DETAIL.md](specs/TASK_12_ACCOUNT_DETAIL.md)
    - [x] Account header, contact info, financial overview.
    - [x] Transaction tabs: Orders / Invoices / Quotes (placeholder content).
- [x] **Verification**
    > **Spec**: [specs/TASK_13_PHASE3_VERIFY.md](specs/TASK_13_PHASE3_VERIFY.md)
    - [x] Build passes, tests pass.
    - [x] Zero `any` types in admin code.
    - [x] Zero cross-boundary imports.
