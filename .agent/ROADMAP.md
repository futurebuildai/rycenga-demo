# Feature Roadmap - My Account Lite

## Phase 0: Product Manager Audit ✅
- [x] Review `docs/PRD.md` for core portal requirements
- [x] Audit all 10 existing portal sections against the PRD
- [x] Identify features/pages for removal (Pruning Plan)
- [x] Execute removals to align strictly with PRD
- [x] Update [ARCHITECTURE.md](../docs/ARCHITECTURE.md) to match finalized feature set

## Phase 1: Portal Foundation ✅
- [x] Responsive Account Portal with 10 core sections
- [x] Visual redesign (Slate/Orange palette)
- [x] Standalone Refactor — Removed e-commerce legacy (Cart, PLP, PDP)
- [x] Utility Consolidation — Moved Toast & Nav logic to `account.js`
- [x] Spec Hardening — Updated documentation for "Lite" scope

---

## Phase 2: UI Page Review & Customization (Frontend Polish)
- [x] **Overview Page (Dashboard)**: Review layout, widgets, and "Pay Now" calls to action.
- [x] **Projects Page**: Read-only job list, search/filter, deep links to Orders/Estimates/Invoices.
- [x] **Orders Page**: Review history list, filters availability, and mobile responsive view.
- [x] **Estimates Page**: Review quote approval flow and expiration logic visuals.
- [x] **Billing Page**: Review Invoices, Statements, and Payments tabs and Drill-Down logic.
- [x] **Header UI Review**: Global navigation, search bar, profile menu, and responsive behavior.
- [x] **Settings Page**: Restored Profile management section, updated demo user data.
- [x] **Wallet & Team**: Review payment method cards and team member list styling.
- [x] **Auth Flows**: Review Login/Sign-up visual flows (mocked).
- [x] **Admin Portal**: Implemented Financial Overview Status, Account Number, and Payment Request flow.

---

## Phase 3: Backend Mapping & API Integration ✅
- [x] Integrate Account & Profile Data from Backend API (Sprint Task #1)
- [x] Finalize Data Spine mapping for Accounts, Invoices, and Quotes
- [x] Define JSON API contracts for all portal sections
- [ ] Document User Authentication requirements (JWT/X-Tenant-ID details)
- [ ] Map ERP sync fields (`BisTrack` field matching documentation)
- [ ] Outline Real-time pricing & credit sync protocols
- [x] Implement Wallet page with real API integration (Payments)
- [x] Implement Orders/Invoices/Quotes API integration via SalesService
- [x] Fetch Invoice Line Items (Sprint Task #6) & Backend Alignment

---

## Phase 4: Portability & Widget Mode
- [ ] Optimize for iframe/widget embedding
- [ ] Implement OAuth2/SSO for dealer sites
- [ ] Customizable theme overrides via CSS variables

---

## Future Ideas (Backlog)
| Feature | Priority | Notes |
|---------|----------|-------|
| Document Upload | High | Insurance, tax, permit docs |
| Team Permissions | High | Role-based access (Purchaser vs Viewer) |
| Live Order Tracking | Medium | GPS sync with delivery trucks |
| Bill of Materials | Medium | Upload takeoff → Auto-build project list |
