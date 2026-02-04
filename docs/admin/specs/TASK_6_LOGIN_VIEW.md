# Task 6 Spec: Admin Login View

**Objective**: Create a professional login page for the Admin Portal.

**Context**:
- **Target File**: `src/admin/pages/page-login.ts`
- **Component Tag**: `admin-page-login`
- **UI Reference**: `src/components/lb-login.ts` (for pattern only — do NOT import)
- **Auth Dep**: `src/admin/services/admin-auth.service.ts`

## Backend Integration Contract (Strict Guardrails)

No direct API calls from this component. Auth is delegated to `AdminAuthService`.

## Step-by-Step Instructions

1. **Create `src/admin/pages/page-login.ts`**:
    - Lit component `admin-page-login`.
    - **Form Fields**: Email (type="email", required) and Password (type="password", required).
    - **State**: `email`, `password`, `errorMessage` (string), `isLoading` (boolean).
    - **Submit Handler**: Call `AdminAuthService.login(email, password)`. On success, dispatch `CustomEvent('admin-login-success')` with `bubbles: true, composed: true`. On failure, show error message.
    - **Error Messages**:
        - Invalid credentials: "Invalid email or password."
        - Unauthorized role: "Access denied. Admin credentials required."
    - **Styling**:
        - Full viewport centered card (like customer login).
        - Dark background using CSS vars from theme.
        - Card: white background, rounded corners, shadow.
        - Heading: "Lumber Boss" with tagline "Dealer Admin Portal".
        - Button: "Sign In" / "Signing In..." loading state.
    - **Guardrail**: Do NOT import `LbBase`, `LbToast`, or any component from `src/components/`.

## Definition of Done
- `src/admin/pages/page-login.ts` compiles.
- Component renders a professional login form.
- Dispatches `admin-login-success` event on successful auth.
