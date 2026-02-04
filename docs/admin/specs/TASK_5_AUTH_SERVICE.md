# Task 5 Spec: Admin Auth Infrastructure

**Objective**: Create the authentication layer for the Admin Portal — an isolated API client and auth service with admin role validation.

**Context**:
- **Target Dir**: `src/admin/services/`
- **Existing Reference**: `src/connect/client.ts`, `src/connect/services/auth.ts`, `src/services/auth.service.ts`
- **Isolation**: The admin app is a separate Vite build. We MUST NOT import from `src/services/` or `src/components/`. We MAY import shared types from `src/connect/types/domain.ts`.

## Backend Integration Contract (Strict Guardrails)

| Action | Endpoint | Method | Notes |
| :--- | :--- | :--- | :--- |
| **Login** | `/auth/login` | `POST` | Body: `{ email, password }`. Returns `{ token, user }`. |
| **Get Profile** | `/auth/me` | `GET` | Returns `User` object. Used to validate role after login. |

**Allowed Admin Roles**: `tenant_owner`, `tenant_staff`

## Step-by-Step Instructions

1. **Create `src/admin/services/admin-client.ts`**:
    - Implement a minimal API client mirroring the pattern of `src/connect/client.ts`.
    - **Token Storage Key**: `admin_auth_token` (NOT `auth_token` — avoids localStorage collision with customer app).
    - **Base URL**: `/api/v1` (same proxy as customer app).
    - Methods: `setToken(token)`, `clearToken()`, `request<T>(endpoint, options)`.
    - Attach `Authorization: Bearer {token}` header when token exists.
    - Handle 401 via `onUnauthorized` callback.
    - **Guardrail**: Do NOT import `src/connect/client.ts`. Create a standalone client.

2. **Create `src/admin/services/admin-auth.service.ts`**:
    - Singleton class `AdminAuthService`.
    - **Session Storage Key**: `admin_session` (NOT `lumberboss_session`).
    - `login(email, password)`: Call `POST /auth/login`, store token, validate role, store session. Return `true` on success.
    - **Role Gate**: After login, if `user.role` is NOT `tenant_owner` or `tenant_staff`, call `logout()` and return `false`.
    - `logout()`: Clear token and session from localStorage.
    - `isAuthenticated()`: Check if session exists.
    - `getUser()`: Return cached user or parse from session.
    - `subscribe(listener)`: Reactive listener for auth state changes.
    - **Guardrail**: Do NOT import from `src/services/auth.service.ts`.

## Definition of Done
- `src/admin/services/admin-client.ts` compiles and is isolated.
- `src/admin/services/admin-auth.service.ts` compiles with role validation logic.
- `tsc --noEmit` passes.
