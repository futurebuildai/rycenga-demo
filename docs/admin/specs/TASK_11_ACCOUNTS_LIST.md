# Task 11 Spec: Accounts List Page

**Objective**: Implement the accounts list with a searchable, styled data table.

**Context**:
- **Target File**: `src/admin/pages/page-accounts.ts`
- **Data Source**: `AdminDataService.getAccounts()`
- **Navigation**: Clicking "View" on a row navigates to `/admin/accounts/{id}`

## Backend Integration Contract

| Action | Endpoint | Method |
| :--- | :--- | :--- |
| List Accounts | `/accounts` | `GET` |

## Step-by-Step Instructions

1. **Rewrite `src/admin/pages/page-accounts.ts`**:
    - Import `AdminAccount` type from data service (no `any`).
    - Render a table: Company Name, Contact, Status (badge), Balance, Credit Limit, Available Credit, Actions (View).
    - "View" button navigates to `/admin/accounts/{id}` via `Router.go()`.
    - Add a search input that filters accounts by name/email client-side.
    - Loading and error states.
    - **Guardrail**: Zero `any` types. Status badges use CSS classes.

## Definition of Done
- Accounts table renders with mock data.
- Search filters rows client-side.
- "View" navigates to detail page.
- Zero `any` types.
