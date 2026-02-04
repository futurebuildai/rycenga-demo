# Task 10 Spec: Dashboard Stats Page

**Objective**: Implement the admin dashboard with aggregate stats cards.

**Context**:
- **Target File**: `src/admin/pages/page-dashboard.ts`
- **Data Source**: `AdminDataService.getDashboardSummary()` (mock data)

## Backend Integration Contract
Dashboard uses mock data only (tenant aggregate endpoint gap).

## Step-by-Step Instructions

1. **Rewrite `src/admin/pages/page-dashboard.ts`**:
    - Use `AdminDashboardSummary` type from data service (no `any`).
    - Render stats grid: Total Accounts, Active Orders, Credit Extended, Accounts At Risk.
    - Loading state while data fetches.
    - Error state if fetch fails.
    - **Guardrail**: Zero `any` types. Use CSS custom properties from theme where possible.

## Definition of Done
- Dashboard renders stats from mock data.
- Zero `any` types.
- `tsc --noEmit` passes.
