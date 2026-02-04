# Task 9 Spec: Mock Data & Admin Data Service

**Objective**: Establish the data layer for the Accounts Dashboard — mock JSON fixtures and a typed data service that uses `adminClient` with mock fallback.

**Context**:
- **Target Files**: `src/admin/mocks/*.json`, `src/admin/services/admin-data.service.ts`
- **API Client**: `src/admin/services/admin-client.ts`

## Backend Integration Contract (Strict Guardrails)

| Action | Endpoint | Method | Status |
| :--- | :--- | :--- | :--- |
| List Accounts | `/accounts` | `GET` | Available |
| Get Account | `/accounts/{id}` | `GET` | Available |
| Get Financials | `/accounts/{id}/financials` | `GET` | Available |
| Dashboard Summary | `/dashboard/summary?account_id={id}` | `GET` | *Gap: per-account only, no tenant aggregate. Use mock.* |
| List Orders | `/orders` | `GET` | Available (user-scoped) |
| List Invoices | `/invoices` | `GET` | Available (user-scoped) |
| List Quotes | `/quotes` | `GET` | Available (user-scoped) |

## Step-by-Step Instructions

1. **Accept mock JSON files**: Keep `accounts.json`, `dashboard.json`, `account-details.json` as-is.
2. **Rewrite `admin-data.service.ts`**:
    - Import `adminClient` from `./admin-client.js`.
    - Define typed interfaces (no `any`): `AdminAccount`, `AdminDashboardSummary`, `AdminAccountDetails`.
    - `getAccounts()`: Try `adminClient.request('/accounts')`, catch → fall back to mock.
    - `getDashboardSummary()`: Mock only (no tenant aggregate endpoint).
    - `getAccountDetails(id)`: Try `adminClient.request('/accounts/{id}')`, catch → fall back to mock.
    - **Guardrail**: Zero `any` types. Use `as unknown as T` pattern if casting mock JSON.

## Definition of Done
- Data service compiles with zero `any` types.
- Mock data available as fallback.
- `tsc --noEmit` passes.
