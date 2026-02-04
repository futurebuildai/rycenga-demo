# Task 3 Spec: Admin Routing & Layout

**Objective**: Implement the application shell (Sidebar + Main Content) and client-side routing logic for the Admin Portal.

**Context**:
- **Router**: `@vaadin/router` (Standard for Lit apps, likely already installed)
- **Routes**:
    - `/admin/` -> Dashboard
    - `/admin/accounts` -> Account List
    - `/admin/products` -> Product List

## Backend Integration Contract (Strict Guardrails)
The "Claude Code" agent MUST ensure that any data fetching logic associated with these routes maps EXACTLY to the following endpoints. Do NOT invent new endpoints.

| Route View | Frontend Action | required Backend Endpoint | Notes |
| :--- | :--- | :--- | :--- |
| **/admin/** | View Dashboard | `GET /v1/dashboard/summary?account_id={id}` | *Gap: Tenant dashboard endpoint missing. Use Mock data for Phase 1.* |
| **/admin/accounts** | List Accounts | `GET /v1/accounts` | Returns all accessible accounts for the staff user. |
| **/admin/products** | List Inventory | `GET /v1/products` | Returns global product catalog. |
| **Shared** | Get User Profile | `GET /v1/auth/me` | Used for Admin Header/Profile. |

## Step-by-Step Instructions

1.  **Create Router Configuration (`src/admin/router.ts`)**:
    - Import `Router` from `@vaadin/router`.
    - Export a function `initRouter(outlet: HTMLElement)` that initializes the router on the given element.
    - Define routes:
        - `path: '/admin'`, component: `admin-page-dashboard`
        - `path: '/admin/accounts'`, component: `admin-page-accounts`
        - `path: '/admin/products'`, component: `admin-page-products` (Optional placeholder)
    - **Guardrail**: Ensure strictly that paths start with `/admin`.

2.  **Create Layout Component (`src/admin/layouts/admin-layout.ts`)**:
    - Create component `admin-layout`.
    - **Structure**:
        - Sidebar: `<nav>` with links (`<a href="/admin">`, `<a href="/admin/accounts">`).
        - Main: `<slot>` or specific outlet container.
    - **Styling**: Sidebar on left (fixed width), Main content on right (flex-grow). Use CSS Grid or Flexbox.
    - **Branding**: Add a placeholder logo area in the sidebar header.

3.  **Create Placeholder Pages (`src/admin/pages/*.ts`)**:
    - Create `page-dashboard.ts`: Renders `<h2>Admin Dashboard</h2><p>Welcome to the control plane.</p>`.
    - Create `page-accounts.ts`: Renders `<h2>Accounts</h2><p>Account list loading...</p>`.
    - Register these components (e.g., `customElements.define('admin-page-dashboard', PageDashboard)`).

4.  **Integrate in `src/admin/lb-admin-app.ts`**:
    - Update the root component to render the `<admin-layout>` shell.
    - Inside the layout, render a container `<div id="outlet"></div>`.
    - In `firstUpdated()`, call `initRouter` passing this outlet.

## Definition of Done
- Browsing to `/admin` shows the Dashboard view inside the layout.
- Browsing to `/admin/accounts` shows the Accounts view.
- Sidebar links successfully navigate between views without page reload.
