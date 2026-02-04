# Strategy: Dealer User Management

**Objective**: Define how Dealer Staff (Tenant Users) are managed within the new Admin Portal, given the constraints of the existing backend.

## 1. Current Architecture
The backend `User` model (`internal/domain/auth.go`) supports a single table strategy for both Staff and Customers, differentiated by the `Role` field:

*   **Dealer Staff**:
    *   `Role`: `tenant_owner` or `tenant_staff`
    *   `AccountID`: `nil` (Not tied to a specific customer account)
*   **Customer Users**:
    *   `Role`: `account_admin` or `account_user`
    *   `AccountID`: Links to the specific `account_id`.

## 2. API Gaps & Constraints
**Critical Finding**: An audit of `router.go` reveals **NO** endpoints for user creation or management (e.g., `POST /v1/users`, `invite`, or `register`).
*   Existing Auth Routes: `login`, `me`, `change-password`.
*   Effect: The Frontend **cannot** currently implement a "Create User" or "Invite Staff" feature without backend changes.

## 3. Recommended Approach

### Phase 1: Read-Only / Seeding
Since we are strictly frontend-side:
*   **Assumption**: Dealer Admin users are seeded directly in the database or provisioned via an external process (e.g., Infrastructure-as-Code or manual SQL).
*   **UI Scope**: The "Team Management" page in the Admin UI will be **Implementation Deferred** until a backend endpoint exists, OR we implement a "Profile" page where the *current* user can only manage their own details.

### Phase 2: Future Backend Request
To fully support the requirement, the backend must expose:
*   `GET /v1/tenant/users`: List all users with `tenant_*` roles.
*   `POST /v1/tenant/users`: Invite/Create a new staff member.

## 4. Proposed Admin UI Flow (Post-Backend Update)
1.  **Settings > Team**: A data grid listing `Tenant Staff`.
2.  **Action**: "Invite Member" modal taking Email + Role (Owner/Staff).
3.  **Flow**: Triggers backend email (SMTP) or returns a temporary setup link.

**Conclusion for roadmap**: Phase 3 ("Staff User Management") is blocked on Backend. Phase 1 & 2 can proceed assuming the initial Admin user is pre-provisioned.
