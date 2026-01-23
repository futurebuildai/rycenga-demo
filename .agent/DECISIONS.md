# Architecture & Design Decisions

This log tracks significant decisions made during development.

---

## DEC-001: Naming Conventions

**Date:** 2024-12-22  
**Status:** Decided

### Context
Standardizing terminology to be more descriptive and customer-friendly.

### Decision
| Former Term | New Term | Rationale |
|-------------|----------|-----------|
| Account | Overview | More descriptive |
| Job Tags | **Projects** | Combined, project-centric |
| Quotes | **Estimates** | More customer-friendly |
| Crew | **Team** | More inclusive |
| Payment Methods | **Wallet** | Modern, familiar |
| Lists | **Saved Lists** | More descriptive |

---

## DEC-002: Color Palette Choice

**Date:** 2024-12-22  
**Status:** Decided

### Context
Establishing a distinct, professional identity for the portal.

### Decision
Adopted a **Slate + Orange** palette:
- Primary: `#1e293b` (Slate 800)
- Accent: `#f97316` (Orange 500)

### Rationale
- Industrial, professional feel
- High contrast for accessibility
- Modern, clean aesthetic

---

## DEC-003: Vanilla JS over Framework

**Date:** 2024-12-22  
**Status:** Decided

### Context
Should we use React, Vue, or vanilla JS?

### Decision
Start with **Vanilla JS** for the prototype.

### Rationale
- Faster to prototype
- No build step required
- Can migrate to React/Next.js later
- HTML structure is clear for backend integration

---

## DEC-004: Project-Centric Organization

**Date:** 2024-12-22  
**Status:** Decided

### Context
Separate "Job Tags" and "Addresses" concepts were consolidated.

### Decision
Combine into a single **Projects** concept where:
- Each project has a name, address, color badge
- Orders can be assigned to projects
- Invoices filter by project
- Documents attach to projects

### Rationale
- Simpler mental model for users
- Mirrors how contractors think (by job)
- Enables project-level reporting

---

## DEC-005: Inventory Status Indicators

**Date:** 2024-12-22  
**Status:** Legacy (Storefront removed)

### Context
Need to display product availability in a way that's clear and actionable.

### Decision
Implement **4 inventory states** with color-coded badges.

### Rationale
- Note: This decision is preserved for historical context but the UI components using these states were removed in the My Account Lite pivot.

---

## DEC-006: Mock JSON Data Layer

**Date:** 2024-12-22  
**Status:** Obsolete (Removed)

### Context
Need product data for frontend development before backend exists.

### Decision
Create `data/products.json` with mock products.

### Rationale
- Removed during the My Account Lite pivot to focus on account-level data (orders, invoices).

---

## DEC-007: Vanilla-Plus Frontend Architecture

**Date:** 2024-12-22  
**Status:** Decided

### Context
Need a scalable, maintainable frontend architecture that avoids framework lock-in while enabling component reuse.

### Decision
Adopt **"Vanilla-Plus" architecture** with:
- **ES Modules** — Native `import/export` with `type="module"` scripts
- **Web Components** — Custom elements (`lb-*` prefix) for reusable UI
- **Zero Runtime Dependencies** — No React, Vue, jQuery
- **Service Modules** — Singleton classes for state (auth, billing, api)

---

## DEC-008: First Web Component Implementation

**Date:** 2024-12-23  
**Status:** Partially Superseded

### Context
Beginning migration from IIFE scripts to Vanilla-Plus architecture (DEC-007).

### Decision
Implemented legacy components (lb-inventory-badge, lb-product-card).

### Rationale
- These components were removed in the My Account Lite pivot, but the "service pattern" and "module registration" remain the target state for future account portal components.

---

## DEC-009: My Account Lite Pivot

**Date:** 2026-01-13  
**Status:** Decided

### Context
The user requested to trim the full e-commerce repository into a focused, standalone "My Account Lite" portal for LBM dealers.

### Decision
- **Remove Storefront**: Deleted all retail-facing pages (`index.html`, `product.html`, `products.html`).
- **Remove Cart**: Deleted shopping cart services and components.
- **Consolidate Utilities**: Moved shared logic (Toast, Mobile Nav) directly into `account.js`.
- **Standalone Mode**: The portal is now the primary entry point, designed to be deployed as a subdomain widget.
- **Documentation Pruning**: Updated all spec files to remove legacy e-commerce references.

### Rationale
- Higher value for LBM dealers who already have a website but need a modern Pro portal.
- Reduced maintenance overhead by removing unused e-commerce architecture.
- Clearer focus for AI agents during development.

---

## Open Questions

- **Q1:** Should the portal support self-registration for new Pro accounts?
- **Q2:** What ERP integration method: direct API or middleware?
- **Q3:** How to handle localized branding/theming for different dealers?

---

## DEC-010: Feature Pruning

**Date:** 2026-01-12
**Status:** Decided

### Context
Codebase contained "nice-to-have" features (Saved Lists, Documents, Settings) that were not present in the PRD (v1).

### Decision
Removed these sections from the frontend and architecture.

### Rationale
- Strict alignment with PRD minimizes scope creep.
- "Lite" version should focus only on core Account, Orders, and Billing.
- Settings/Profile management key requirements (e.g. password change) are undefined in PRD, so removed until specified.

---

## DEC-011: Overview Page Scope Reduction

**Date:** 2026-01-12
**Status:** Decided

### Context
The "My Account Lite" Overview page contained "Recent Orders" and "Active Projects" lists, as well as a "Quick Actions" bar, which were deemed distinct features unnecessary for the high-level dashboard view.

### Decision
**Pruned the Overview Page** to a strict "Dashboard" scope:
1.  **Account Summary**: Balance Due & Credit Available.
2.  **Core Action**: "Pay Now" button.
3.  **Activity Cards**: Simple count/status summaries for Orders and Estimates.
4.  **Removed**: Detailed lists, Quick Actions bar, and "New Order" shortcut.

### Rationale
- **Focus**: The Dashboard should provide immediate status awareness, not deep management capabilities.
- **Mobile First**: Reducing clutter improves the mobile experience significantly.
- **Lite Scope**: Aligns with the "Lite" philosophy of doing fewer things better.

---

## DEC-012: Projects Page Read-Only & Deep Linking

**Date:** 2026-01-12
**Status:** Decided

### Context
The PRD specifies that Projects are pulled from the ERP. The "New Project" button implied client-side creation.

### Decision
1.  **Removed** "New Project" button and all client-side creation logic.
2.  **Added** deep-link action buttons (Orders, Estimates, Invoices) to each project card for contextual navigation.
3.  **Added** a search/filter bar for finding projects.

### Rationale
- **ERP Alignment**: Projects are sourced from dealer ERP, not user input.
- **PM Focus**: Design aligns with the Project Manager (PM) persona for job-site coordination.


---

## DEC-013: Mobile Card Layout for Data Sets

**Date:** 2026-01-12
**Status:** Decided

### Context
Table rows (Orders, Invoices) break on mobile screens, requiring horizontal scrolling or resulting in crushed data.

### Decision
Adopt a **Stacked Card Layout** for data rows on screens `< 768px`:
- **CSS Grid** driven layout.
- Order # and Status at the top (Critical info).
- Full-width details below.
- Consistent with "App-like" feel.

### Rationale
- Improves readability on small devices.
- Removes horizontal drift.
- Aligns with "Mobile First" PRD goal.

## DEC-014: Estimates Page Scope Refinement

**Date:** 2026-01-13
**Status:** Decided

### Context
The original codebase and generic e-commerce assumptions included "Convert to Order" and "Markup & Share" functionalities, which are outside the scope of the "Lite" portal (Read-Only ERP Data).

### Decision
1.  **Read-Only Strictness**: Removed "Convert to Order" and "Markup & Share" buttons.
2.  **Status Triggers**: Standardized on PRD statuses: "Pending", "Accepted" (Green), "Expired" (Gray).
3.  **Terminology**: Changed logic to "View Details" only.

### Rationale
- e-Commerce checkout flows are complex and out of scope for the V1 Lite portal.
- "Markup & Share" tool is a feature creep item not in the PRD.

---

## DEC-015: Detail View "Drill-Down" Pattern

**Date:** 2026-01-13
**Status:** Decided

### Context
The Single Page Architecture (SPA) handles main sections well, but detailed views (Order Details, Estimate Details) need a standard UX pattern without full page reloads or complex routing.

### Decision
Adopted a **"View Swap" Pattern**:
- **Container**: Each section (e.g., `#section-estimates`) contains two children: `view-list` (default visible) and `view-detail` (default hidden).
- **JS Logic**: Clicking "View Details" swaps the visibility of these containers and scrolls to top.
- **Back Navigation**: "Back to List" button simply reverses the visibility toggle.

### Rationale
- Keeps the DOM flat and simple (no complex routing library needed).
- Preserves context within the tab.
- Mobile-friendly (feels like a new screen).

---

## DEC-016: Client-Side Mock Data for Detail Views

**Date:** 2026-01-13
**Status:** Decided

### Context
Backend API endpoints for specific Order and Estimate details are not yet available. We need to verify the UI layout and "view swap" logic (DEC-015) immediately.

### Decision
Implement a **const mockData** object directly within `account.js` to drive the detail views.
- **Keys**: ID of the item (e.g., `ORD-478242`).
- **Values**: Complete JSON object mirroring expected API response.
- **Logic**: JS lookup by ID to populate DOM elements.

### Rationale
- Allows full UI/UX verification without backend dependency.
- Defines the "contract" for the future API response structure.
- Easy to replace with `fetch()` calls later.

---

## DEC-017: Billing Page Drill-Down Consistency

**Date:** 2026-01-13
**Status:** Decided

### Context
The Billing Page previously lacked a detailed breakdown for individual invoices, whereas Orders and Estimates established a "View Details" drill-down pattern.

### Decision
Applied the identical "Three-View Unified Page" pattern to Billing:
1. **Default View**: Invoices listed with "Open" filter active (per PRD).
2. **Navigation**: "View" buttons on each row trigger a detail overlay showing line items and payment CTA.
3. **Styles**: Added `.status-processing` and `.status-rejected` to handle transaction-level payment tracking.

### Rationale
- Ensures consistency in UX across all major transaction-reliant pages.
- Provides a direct path to checkout for specific high-value items.
- Aligns with PRD requirements for "Open" default views.

---

---

## DEC-014: Settings Page Reinstated (Profile Only)

**Date:** 2026-01-13
**Status:** Decided

### Context
Initially, the Settings page was pruned (DEC-010) due to lack of detailed requirements. However, PRD section 5.7 explicitly mentions "Profile" management for user contact info.

### Decision
1.  **Reinstated Settings Page**: Added a "Settings" link to the sidebar.
2.  **Limited Scope**: The page only contains a "Profile" card for managing Name, Email, and Phone.
3.  **Read-Only Company**: "Company Name" is displayed but disabled, requiring support contact to change (standard B2B practice).

### Rationale
- **Compliance**: PRD 5.7 requires profile management.
- **Lite Scope**: Avoiding complex settings (like notifications/security) keeps development focused on core value.
---

## DEC-018: Base Authentication Flow (V1)

**Date:** 2026-01-15
**Status:** Decided

### Context
Need a functional, standalone login system for dealer subdomains to support V1 timeline.

### Decision
1. **Frontend-Driven Auth**: Implemented login UI and session persistence in `account.js` using `localStorage`.
2. **Demo Credentials**: Hardcoded demo user (`HomeProUSA@demo.com` / `MyAccountLite2026`) for V1/Proof-of-Concept.
3. **App Wrapper Pattern**: Wrapped the entire dashboard in a hidden `div` to prevent flash of unauthenticated content.
4. **Protected Routing**: `handleRouting` checks for session presence before rendering components.

### Rationale
- Zero backend setup required for frontend verification.
- Direct support for existing demo workflows.
- Matches PRD technical constraints for V1.

---

## DEC-019: Dynamic Branding (Hexagon Logo)

**Date:** 2026-01-15
**Status:** Decided

### Context
Dealer branding needs to be prominent on the login screen.

### Decision
Replicated the **Boss Lumber & Millwork** branded logo using semantic HTML and CSS (Hexagon character `⬡` + bold typography) rather than hardcoded image files.

### Rationale
- Better scaling/performance than raster images.
- Easier to customize dynamically for different dealers in the future.
- Professional, lightweight industrial aesthetic.
---

## DEC-020: API Integration Layer & Service Refactor

**Date:** 2026-01-22
**Status:** Decided

### Context
Moving from mock JSON data to a production-ready API integration requires a structured approach to bridge the new backend services with the established frontend architecture.

### Decision
1. **Service Layer Implementation**: Created `src/connect/services` providing specialized API clients (Account, Sales, Billing, Jobs) using a centralized `ApiClient`.
2. **Facade Pattern (DataService)**: Refactored existing `DataService` into a facade that fetches real API data and maps it to legacy structures (`AccountData`, `Order`, `Invoice`).
3. **Strict Mapping**: Implemented explicit mappers (`src/connect/mappers.ts`) to ensure UI components receive consistent data shapes even as backend models evolve.
4. **Token/Tenant Handling**: Integrated `X-Tenant-ID` and Bearer token headers into the global request interceptor.

### Rationale
- **Backward Compatibility**: Allows the UI to work with real data without rewriting every component's internal data logic.
- **Single Source of Truth**: `DataService` remains the central hub for state, now backed by live API calls.
- **Type Safety**: End-to-end typing from backend domain models to frontend UI types.
- **Resilience**: Added loading and error states to all API-dependent components.

---

## DEC-021: Backend-Aligned Sales Data Schema

**Date:** 2026-01-22
**Status:** Decided

### Context
Initial frontend domain types and mappers used generic field names (`sku`, `name`, `lineTotal`) which diverged from the actual Go backend (`itemCode`, `description`, `extendedPrice`).

### Decision
1. **Schema Mirroring**: Updated `domain.ts` to exactly match backend structs in `sales.go`.
2. **Explicit Mapping**: Standardized `mappers.ts` to transform backend-specific keys into the specific properties expected by the legacy UI components.
3. **Redundant Path Removal**: Removed hardcoded `/v1` prefixes in service calls to ensure they remain relative to the `BASE_URL`.

### Rationale
- **Zero-Trust Readiness**: Ensures the frontend won't break when connected to the real production API.
- **Maintainability**: Makes it easier for backend engineers to understand the frontend data requirements.
- **Correctness**: Eliminates potential `404` and `undefined` field errors.
