# Velocity Frontend Roadmap

This document outlines the development phases for the Velocity customer portal and the Dealer Admin UI.

## Phase 1: Customer Portal (My Account Lite) - [IN PROGRESS]
*   [x] Core Architecture (Lit + TypeScript)
*   [x] Mock API Integration
*   [/] Real Backend Integration (Orders, Invoices, Jobs)
*   [ ] Payment Integration (Wallet & Quick Pay)
*   [ ] Profile & Notification Settings

## Phase 2: Dealer Admin UI (Foundations) - [NEXT]
*   [ ] **Project Setup**: multi-page Vite config, `admin.html`, and router setup.
*   [ ] **Authentication**: Admin Login screen and session management.
*   [ ] **Layout & Branding**: Sidebar layout that consumes Tenant Branding settings.
*   [ ] **Accounts Dashboard**: Data grid of all accounts with search/filter.
*   [ ] **Account Detail View**: Comprehensive view of Balance, Orders, and Invoices for a single account.
*   [ ] **Note**: Staff User Management is deferred; users are externally provisioned.

## Phase 3: Advanced Dealer Features
*   [ ] Impersonation Mode (View as Customer)
*   [ ] Sync Management Board (Errors & Retries)

## Phase 4: Optimization & Scale
*   [ ] Performance monitoring
*   [ ] Multi-tenant isolation audits
*   [ ] Automated end-to-end testing suite
