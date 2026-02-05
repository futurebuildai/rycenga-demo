# Task 7 Spec: Auth Integration & Branding

**Objective**: Wire authentication into the admin app shell — gate the layout behind login, and establish the branding foundation.

**Context**:
- **Target Files**: `src/admin/pv-admin-app.ts`, `src/admin/layouts/admin-layout.ts`
- **Auth Dep**: `src/admin/services/admin-auth.service.ts`

## Backend Integration Contract (Strict Guardrails)

No new endpoints. Auth state is managed by `AdminAuthService`.

## Step-by-Step Instructions

1. **Update `src/admin/pv-admin-app.ts`**:
    - Import `AdminAuthService`.
    - Import `./pages/page-login.js`.
    - Add `@state() private isAuthenticated = false`.
    - In `connectedCallback()`: Check `AdminAuthService.isAuthenticated()`, subscribe to auth changes.
    - In `disconnectedCallback()`: Unsubscribe.
    - **Render Logic**:
        - If NOT authenticated → render `<admin-page-login>`.
        - If authenticated → render `<admin-layout>` with router outlet (existing).
    - Listen for `admin-login-success` event → update state, initialize router.
    - **Router Init**: Only call `initRouter()` when authenticated and layout is rendered.
    - **Guardrail**: Do NOT use hash-based routing for login state. Use component state only.

2. **Update `src/admin/layouts/admin-layout.ts`**:
    - Add a user section in the sidebar footer with a "Sign Out" button/link.
    - On click: call `AdminAuthService.logout()`.
    - **Branding defaults**: The sidebar logo area already says "Project Velocity". This is the default branding. In future phases, this will be overridden by tenant config. No API call needed now.

3. **Update `src/admin/router.ts`**:
    - Ensure the router handles the case where it's initialized after login (not on page load).
    - No route changes needed.

## Definition of Done
- Visiting `/admin.html` shows the login page.
- After successful login (admin role), the layout + dashboard renders.
- Clicking "Sign Out" returns to the login page.
- `tsc --noEmit` passes.
