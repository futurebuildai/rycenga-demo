# Task 12 Spec: Account Detail Page with Transaction Tabs

**Objective**: Implement the account detail view with contact info, financial overview, and transaction tabs (Orders, Invoices, Quotes).

**Context**:
- **Target File**: `src/admin/pages/page-account-details.ts`
- **Data Source**: `AdminDataService.getAccountDetails(id)`
- **Route**: `/admin/accounts/:id` (Vaadin Router passes `location.params.id`)

## Backend Integration Contract

| Action | Endpoint | Method | Phase 3 Status |
| :--- | :--- | :--- | :--- |
| Get Account | `/accounts/{id}` | `GET` | Mock fallback |
| Get Financials | `/accounts/{id}/financials` | `GET` | Mock fallback |
| List Orders | `/orders` | `GET` | *Placeholder tab* |
| List Invoices | `/invoices` | `GET` | *Placeholder tab* |
| List Quotes | `/quotes` | `GET` | *Placeholder tab* |

## Step-by-Step Instructions

1. **Rewrite `src/admin/pages/page-account-details.ts`**:
    - Import `AdminAccountDetails` from data service (no `any`).
    - Vaadin Router location: type the `location` property properly (not `any`).
    - **Header**: Account name + status badge + "Back to Accounts" link.
    - **Cards Grid**: Contact Info card + Financial Overview card.
    - **Transaction Tabs**: Add a tab bar with Orders / Invoices / Quotes tabs.
        - Each tab renders placeholder content: "No orders data available — backend integration pending."
        - Tab switching via component state (no routing).
    - Loading and error/not-found states.
    - **Guardrail**: Zero `any` types. The `location` property must use a typed interface.

## Definition of Done
- Account detail renders contact + financials from mock data.
- Transaction tabs are visible and switchable.
- Back link returns to accounts list.
- Zero `any` types.
