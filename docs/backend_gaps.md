# Backend Gaps - Frontend Required Calculations

This document tracks fields or calculations that the **frontend currently computes locally** because the backend does not provide them. These are candidates for backend enhancement to improve data consistency and reduce client-side logic.

---

## Dashboard Summary (`GET /v1/dashboard/summary`)

### Gap 1: `creditAvailable`
| Field | Type | Description |
|-------|------|-------------|
| `creditAvailable` | `number` | `creditLimit - currentBalance` |

**Current Workaround**: Frontend computes this as `creditLimit - currentBalance`.

**Impact**: Low. Simple subtraction is safe to perform client-side.

**Suggested Backend Change**: Optionally add `credit_available` for consistency, though this is a minor gap.

---

## Future Considerations

### Recent Activity Widgets
The backend provides `recentInvoices`, `recentOrders`, and `recentQuotes` as JSON arrays. These are not currently used by the frontend but could power:
- "Recent Orders" widget
- "Recent Invoices" widget
- "Recent Estimates" widget

**Action Required**: Define the exact schema of objects within these arrays in `backend_api_reference.md` when the frontend is ready to consume them.

---

## Status Legend
- 🔴 **Critical**: Blocks UI functionality
- 🟡 **Moderate**: Frontend workaround exists but suboptimal
- 🟢 **Low**: Nice-to-have for consistency

| Gap | Severity |
|-----|----------|
| `creditAvailable` | 🟢 Low |

