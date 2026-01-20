# Backend Handoff: Serving the Velocity Frontend

This document provides the backend team with all necessary information to serve the Velocity frontend application.

---

## 1. Serving Static Files

The frontend is a Single Page Application (SPA) built with Vite. After running `npm run build`, all deployable assets are located in the `dist/` directory.

### Requirements
1.  **SPA Fallback**: All non-API, non-asset routes must return `index.html`. The frontend router handles client-side navigation.
2.  **Asset Caching**: Files in `assets/` have content hashes and should be served with long-term cache headers (`Cache-Control: public, max-age=31536000, immutable`).
3.  **`index.html` Caching**: The `index.html` file should NOT be cached (`Cache-Control: no-cache, no-store, must-revalidate`).

### Nginx Example
```nginx
location / {
    root /var/www/velocity-frontend;
    try_files $uri $uri/ /index.html;
}
```

---

## 2. API Contract & Headers

The frontend expects the backend API to be available at the path configured in `VITE_API_URL` (defaults to `/api/v1`).

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Tenant-ID` | Identifies the tenant. Sent by frontend on every request. |
| `Authorization` | `Bearer <token>` for authenticated user requests. |

---

## 3. Required API Endpoints

### 3.1 Summary Endpoints (High Priority)

The frontend requires pre-computed summary data to avoid complex client-side aggregations.

| Endpoint | Method | Response Type | Notes |
|----------|--------|---------------|-------|
| `GET /dashboard/summary` | GET | `DashboardSummary` | Pre-computed metrics for the Overview page |
| `GET /billing/summary` | GET | `BillingSummary` | Pre-computed metrics for the Billing page |

#### `DashboardSummary` Schema
```json
{
  "balanceDue": 12500.00,
  "creditLimit": 50000.00,
  "creditAvailable": 37500.00,
  "activeOrdersCount": 5,
  "pendingEstimatesCount": 3,
  "pendingEstimatesTotal": 8750.00
}
```

#### `BillingSummary` Schema
```json
{
  "balanceDue": 12500.00,
  "openInvoicesCount": 4,
  "overdueInvoicesCount": 1,
  "lastPaymentDate": "2024-12-15T00:00:00Z",
  "lastPaymentAmount": 2500.00
}
```

### 3.2 List & Detail Endpoints

| Endpoint | Method | Notes |
|----------|--------|-------|
| `/api/v1/accounts/{id}` | GET | Fetches account details. |
| `/api/v1/orders` | GET | Must include `subtotal`, `taxTotal`, `total` |
| `/api/v1/orders/{id}` | GET | Fetches single order details. |
| `/api/v1/orders/{id}/lines` | GET | Fetches order line items. |
| `/api/v1/invoices` | GET | Requires `account_id` query param. |
| `/api/v1/invoices/{id}/lines` | GET | Fetches invoice line items. |
| `/api/v1/quotes` | GET | Used for Estimates page. |
| `/api/v1/jobs` | GET | Used for Projects page. |

---

## 4. Data Contracts (Status Enums)

The backend MUST use these exact string values for statuses:

| Type | Valid Values |
|------|--------------|
| `OrderStatus` | `pending`, `confirmed`, `ready_for_pickup`, `shipped`, `delivered`, `cancelled`, `closed` |
| `InvoiceStatus` | `open`, `paid`, `overdue`, `cancelled`, `void` |
| `QuoteStatus` | `pending`, `accepted`, `rejected`, `expired` |

---

## 5. Page & Component Reference

### 5.1 Overview Page (`lb-page-overview.ts`)
**Purpose**: Dashboard showing account summary and quick stats.

| Data Rendered | Source Endpoint | Notes |
|---------------|-----------------|-------|
| Balance Due | `GET /dashboard/summary` | Rendering `balanceDue` |
| Credit Info | `GET /dashboard/summary` | Rendering `creditLimit`, `creditAvailable` |
| Orders Count | `GET /dashboard/summary` | Rendering `activeOrdersCount` |
| Estimates Count | `GET /dashboard/summary` | Rendering `pendingEstimatesCount` |

**User Actions**:
- **Pay Now**: Triggers payment flow (Deferred).
- **View Orders**: Navigates to Orders tab.
- **View All Estimates**: Navigates to Estimates tab.

---

### 5.2 Billing Page (`lb-page-billing.ts`)
**Purpose**: Displays invoices with drill-down detail view and account statements.

| Data Rendered | Source Endpoint | Notes |
|---------------|-----------------|-------|
| Billing Summary | `GET /billing/summary` | `balanceDue`, `openInvoicesCount`, `lastPaymentDate` |
| Invoice List | `GET /invoices` | `invoiceNumber`, `status`, `balanceDue`, `total` |
| Statements | `GET /statements` | (Planned) Monthly account statements |

**User Actions**:
- **View Invoice**: Opens detail view.
- **Pay Invoice**: Triggers payment for specific invoice (Deferred).
- **Tab Switch**: Toggle between "Invoices", "Statements", and "History".

---

### 5.3 Orders Page (`lb-page-orders.ts`)
**Purpose**: Displays order list with status filters and drill-down detail.

| Data Rendered | Source Endpoint | Notes |
|---------------|-----------------|-------|
| Order List | `GET /orders` | Includes `orderNumber`, `status`, `total` |
| Order Detail | `GET /orders/{id}` | Uses backend-provided `subtotal` and `taxTotal` |

**User Actions**:
- **Filter**: Filter by Status (Pending, Confirmed, etc.).
- **Search**: Search by Order ID or PO Number.
- **View Details**: Opens comprehensive order/line-item view.

---

### 5.4 Estimates Page (`lb-page-estimates.ts`)
**Purpose**: Displays quotes/estimates with detail view.

| Data Rendered | Source Endpoint | Notes |
|---------------|-----------------|-------|
| Estimates List | `GET /quotes` | `quoteNumber`, `status`, `total`, `expiresOn` |

**User Actions**:
- **View Estimate**: Opens detail view.
- **Download PDF**: Download formal estimate document.
- **Export Data**: Export estimate lines to CSV/Excel.
- **Accept/Reject**: (OUT OF SCOPE) These actions are not required for this deployment.

---

### 5.5 Projects Page (`lb-page-projects.ts`)
**Purpose**: Displays job sites with aggregated order/invoice counts.

| Data Rendered | Source Endpoint | Notes |
|---------------|-----------------|-------|
| Job List | `GET /jobs` | `jobNumber`, `name`, `poNumber`, `addressLine1` |

**User Actions**:
- **Search**: Filter projects by name or address.
- **Quick Links**: Navigate to Orders, Invoices, or Estimates filtered by this project.

---

### 5.6 Settings, Team, & Wallet

These pages now have **full service layer integration**:

- **Settings**: Profile updates (`PUT /users/{id}`), password changes (`POST /auth/change-password`), notification toggles (`PUT /users/{id}/notifications`).
- **Team**: Member invitations (`POST /account/{id}/members/invite`), role updates (`PUT /account/{id}/members/{id}`), removals (`DELETE /account/{id}/members/{id}`).
- **Wallet**: Add (`POST /payment-methods`), remove (`DELETE /payment-methods/{id}`), and set default (`PUT /payment-methods/{id}/default`) payment methods.

---

## 6. Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api/v1` | Base URL for API requests. |
| `VITE_TENANT_ID` | `demo-tenant` | Default tenant ID for development. |

---

## 7. Authentication Flow

1.  User logs in via `/api/v1/login`.
2.  Backend returns a token.
3.  Frontend stores token and includes it in `Authorization` header.

---

## 8. Payment Flow (Run Payments Integration Ready)

The frontend Wallet and Billing pages are **fully integrated with the service layer** and ready for Run Payments:

| Component | Service Method | Status |
|-----------|----------------|--------|
| Add Payment Method | `POST /payment-methods` | ✅ Plumbed |
| Remove Payment Method | `DELETE /payment-methods/{id}` | ✅ Plumbed |
| Set Default | `PUT /payment-methods/{id}/default` | ✅ Plumbed |
| Pay Invoice | `POST /invoices/{invoiceId}/pay` | ✅ Plumbed |

### Next Steps for Run Payments Integration

1. **Inject SDK**: Load Run Payments JavaScript SDK in `index.html`.
2. **Secure Fields**: Replace "Add Payment Method" button handler with Run Payments secure form.
3. **Tokenization**: On form submit, tokenize card/ACH and pass to `BillingService.addPaymentMethod()`.
4. **Webhooks**: Backend handles Run Payments webhooks to update payment/invoice statuses.

> [!NOTE]
> The UI currently uses `prompt()` dialogs as placeholders. These will be replaced with Run Payments modals—no structural changes required.

---

## 9. State-Changing User Actions (Pushes)

This section documents all frontend user actions that trigger backend state changes (POST/PUT/DELETE).

### 9.1 Settings Page (`lb-page-settings.ts`)

| Action | Endpoint | Method | Payload |
|--------|----------|--------|---------|
| Save Profile | `PUT /users/{userId}` | PUT | `UpdateProfilePayload` |
| Change Password | `POST /auth/change-password` | POST | `ChangePasswordPayload` |
| Toggle Notifications | `PUT /users/{userId}/notifications` | PUT | `NotificationPreferences` |

#### `UpdateProfilePayload`
```json
{
  "phone": "+1 555-123-4567"
}
```

#### `ChangePasswordPayload`
```json
{
  "currentPassword": "••••••••",
  "newPassword": "••••••••"
}
```

#### `NotificationPreferences`
```json
{
  "emailNotifications": true,
  "smsNotifications": false,
  "orderUpdates": true
}
```

---

### 9.2 Team Page (`lb-page-team.ts`)

| Action | Endpoint | Method | Payload |
|--------|----------|--------|---------|
| Invite Member | `POST /account/{accountId}/members/invite` | POST | `InviteMemberPayload` |
| Update Member Role | `PUT /account/{accountId}/members/{memberId}` | PUT | `{ role: TeamMemberRole }` |
| Remove Member | `DELETE /account/{accountId}/members/{memberId}` | DELETE | None |

#### `InviteMemberPayload`
```json
{
  "email": "newuser@company.com",
  "role": "viewer"
}
```

#### `TeamMemberRole` Values
- `owner`, `admin`, `purchaser`, `viewer`

---

### 9.3 Wallet Page (`lb-page-wallet.ts`)

| Action | Endpoint | Method | Payload |
|--------|----------|--------|---------|
| Add Payment Method | `POST /payment-methods` | POST | `PaymentMethod` (without id) |
| Remove Payment Method | `DELETE /payment-methods/{id}` | DELETE | None |
| Set Default | `PUT /payment-methods/{id}/default` | PUT | None |

#### `PaymentMethod`
```json
{
  "type": "card",
  "label": "Visa ending in 4242",
  "last4": "4242",
  "expiry": "12/26",
  "isDefault": false
}
```

#### `PaymentMethodType` Values
- `card`, `ach`

---

### 9.4 Billing & Overview Pages (`lb-page-billing.ts`, `lb-page-overview.ts`)

| Action | Endpoint | Method | Payload |
|--------|----------|--------|---------|
| Pay Invoice | `POST /invoices/{invoiceId}/pay` | POST | `PayInvoicePayload` |

#### `PayInvoicePayload`
```json
{
  "paymentMethodId": "pm-1"
}
```

**Note**: The "Pay Now" button on the Overview page navigates to the Billing page where the full payment flow is implemented.

---

### 9.5 Frontend Validation (Zero-Trust)

The frontend performs the following client-side validation before sending requests:

| Field | Validation |
|-------|------------|
| Phone Number | Regex: `/^[+]?[\d\s()-]{7,20}$/` |
| Email | Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| New Password | Minimum 8 characters |
| Team Member Role | Must be one of: `owner`, `admin`, `purchaser`, `viewer` |

---

### 9.6 Error Handling

All push actions include:
- **Loading States**: Buttons show "Saving...", "Paying...", etc. and are disabled during requests.
- **Error Feedback**: Failed requests trigger `LbToast.show(message, 'error')`.
- **Optimistic Updates**: Some actions update UI immediately and revert on failure (e.g., notification toggles).
