# AR Center — Backend Requirements

This document specifies the exact API endpoints, database schema, and integrations the frontend expects. Generated from the implemented frontend code.

---

## API Endpoints

All endpoints require `Authorization: Bearer <token>` and return JSON.

### Payment Requests

| # | Method | Endpoint | Request Body | Response | Used By |
|---|--------|----------|-------------|----------|---------|
| 1 | GET | `/v1/admin/payment-requests/summary` | — | `ARSummary` | Summary cards |
| 2 | GET | `/v1/admin/payment-requests?limit=&offset=&status=&search=&sort=` | — | `{ items: PaymentRequest[], total: number }` | Requests table |
| 3 | GET | `/v1/admin/payment-requests/{id}` | — | `PaymentRequest` | Detail drawer |
| 4 | POST | `/v1/admin/payment-requests` | `CreatePaymentRequestPayload` | `PaymentRequest` | Payment request modal (account details) |
| 5 | POST | `/v1/admin/payment-requests/{id}/remind` | `{ delivery: "sms" \| "email" \| "both" }` | `{ success: boolean, message: string, reminderCount: number }` | Reminder modal |
| 6 | PUT | `/v1/admin/payment-requests/{id}/cancel` | — | `PaymentRequest` | Cancel action |
| 7 | POST | `/v1/admin/payment-requests/bulk` | `{ requests: CreatePaymentRequestPayload[] }` | `{ created: number, failed: number }` | Bulk send wizard |
| 8 | GET | `/v1/admin/payment-requests/bulk-preview?condition=` | — | `BulkPreviewAccount[]` | Bulk send step 2 |

### Automations

| # | Method | Endpoint | Request Body | Response | Used By |
|---|--------|----------|-------------|----------|---------|
| 9 | GET | `/v1/admin/automations` | — | `AutomationRule[]` | Automations table |
| 10 | POST | `/v1/admin/automations` | `AutomationRulePayload` | `AutomationRule` | Create rule modal |
| 11 | PUT | `/v1/admin/automations/{id}` | `AutomationRulePayload` | `AutomationRule` | Edit rule modal |
| 12 | DELETE | `/v1/admin/automations/{id}` | — | `void` | Delete rule |
| 13 | PUT | `/v1/admin/automations/{id}/toggle` | — | `AutomationRule` | Toggle switch |

### Contractor-Side (Existing Billing Page)

| # | Method | Endpoint | Request Body | Response | Used By |
|---|--------|----------|-------------|----------|---------|
| 14 | GET | `/v1/payment-requests/{id}` | — | `PaymentRequest` | Deep link resolution (A5) |
| 15 | POST | `/v1/payment-requests/{id}/viewed` | — | `void` | View tracking (A5) |

---

## Query Parameters — Endpoint #2

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `limit` | number | 10 | Page size |
| `offset` | number | 0 | Skip count |
| `status` | string | — | Filter: `sent`, `viewed`, `paid`, `partially_paid`, `overdue`, `cancelled` |
| `search` | string | — | Search account name or invoice number |
| `sort` | string | `newest` | Options: `newest`, `oldest`, `amount-desc`, `amount-asc` |

---

## Type Definitions

These are defined in `src/connect/types/domain.ts`:

```typescript
type PaymentRequestStatus = 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

interface PaymentRequestInvoice {
    invoiceId: number;
    invoiceNumber: string;
    amountAtRequest: number;
    amountPaid: number;
}

interface PaymentRequest {
    id: number;
    accountId: number;
    accountName: string;
    createdByUserId: number;
    status: PaymentRequestStatus;
    totalAmount: number;
    remainingAmount: number;
    messageSubject: string;
    messageBody: string;
    deliverySms: boolean;
    deliveryEmail: boolean;
    recipientPhone: string | null;
    recipientEmail: string | null;
    reminderCount: number;
    lastReminderAt: string | null;  // ISO 8601
    viewedAt: string | null;        // ISO 8601
    paidAt: string | null;          // ISO 8601
    invoices: PaymentRequestInvoice[];
    createdAt: string;              // ISO 8601
    updatedAt: string;              // ISO 8601
}

interface CreatePaymentRequestPayload {
    accountId: number;
    invoiceIds: number[];
    deliverySms: boolean;
    deliveryEmail: boolean;
    recipientPhone?: string;
    recipientEmail?: string;
    messageSubject?: string;
    messageBody?: string;
}

interface ARSummary {
    totalOutstanding: number;
    openRequests: number;
    paidThisMonth: number;
    overdueCount: number;
}

type AutomationCondition = 'past_due' | 'due_in_3_days' | 'due_in_7_days' | 'due_today';

interface AutomationRule {
    id: number;
    name: string;
    condition: AutomationCondition;
    messageTemplate: string;
    followUpIntervalDays: number;
    maxFollowUps: number;
    isActive: boolean;
    activeInvoices: number;
    totalSent: number;
    totalCollected: number;
    createdAt: string;              // ISO 8601
    updatedAt: string;              // ISO 8601
}

interface BulkPreviewAccount {
    accountId: number;
    accountName: string;
    invoiceIds: number[];            // actual invoice IDs for bulk request creation
    invoiceCount: number;
    totalAmount: number;
}
```

---

## Database Tables

### `payment_requests`

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PRIMARY KEY | |
| `account_id` | INTEGER NOT NULL | FK → accounts.id |
| `created_by_user_id` | INTEGER NOT NULL | FK → users.id |
| `status` | VARCHAR(20) NOT NULL | Enum: sent, viewed, paid, partially_paid, overdue, cancelled |
| `total_amount` | DECIMAL(12,2) | Sum of invoice amounts at creation |
| `remaining_amount` | DECIMAL(12,2) | Decreases as payments come in |
| `message_subject` | TEXT | |
| `message_body` | TEXT | |
| `delivery_sms` | BOOLEAN DEFAULT false | |
| `delivery_email` | BOOLEAN DEFAULT false | |
| `recipient_phone` | VARCHAR(20) | Nullable |
| `recipient_email` | VARCHAR(255) | Nullable |
| `reminder_count` | INTEGER DEFAULT 0 | |
| `last_reminder_at` | TIMESTAMP | Nullable |
| `viewed_at` | TIMESTAMP | Nullable, set when contractor opens link |
| `paid_at` | TIMESTAMP | Nullable, set when fully paid |
| `created_at` | TIMESTAMP DEFAULT NOW() | |
| `updated_at` | TIMESTAMP DEFAULT NOW() | |

### `payment_request_invoices`

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PRIMARY KEY | |
| `payment_request_id` | INTEGER NOT NULL | FK → payment_requests.id |
| `invoice_id` | INTEGER NOT NULL | FK → invoices.id |
| `amount_at_request` | DECIMAL(12,2) | Balance at time of request creation |
| `amount_paid` | DECIMAL(12,2) DEFAULT 0 | Updated when payments come in |

### `automation_rules`

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PRIMARY KEY | |
| `tenant_id` | INTEGER NOT NULL | FK → tenants.id |
| `name` | VARCHAR(255) | |
| `condition` | VARCHAR(20) NOT NULL | Enum: past_due, due_in_3_days, due_in_7_days, due_today |
| `message_template` | TEXT | Supports {contactName}, {invoiceNumbers}, {totalAmount}, {dealerName} |
| `follow_up_interval_days` | INTEGER DEFAULT 7 | 0 = no follow-up |
| `max_follow_ups` | INTEGER DEFAULT 3 | |
| `is_active` | BOOLEAN DEFAULT true | |
| `created_at` | TIMESTAMP DEFAULT NOW() | |
| `updated_at` | TIMESTAMP DEFAULT NOW() | |

### `automation_enrollments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PRIMARY KEY | |
| `automation_rule_id` | INTEGER NOT NULL | FK → automation_rules.id |
| `invoice_id` | INTEGER NOT NULL | FK → invoices.id |
| `payment_request_id` | INTEGER | FK → payment_requests.id (created request) |
| `follow_ups_sent` | INTEGER DEFAULT 0 | |
| `last_follow_up_at` | TIMESTAMP | |
| `enrolled_at` | TIMESTAMP DEFAULT NOW() | |

---

## Notification Services

### SMS — Twilio

- Send payment request notification with deep link
- Send reminder messages
- Track delivery status (optional, for future analytics)

### Email — Resend

- Send payment request notification with deep link
- Send reminder emails
- Template variables: `{contactName}`, `{invoiceNumbers}`, `{totalAmount}`, `{dealerName}`

### Deep Link URL Format

```
https://{tenant-slug}.velocity.app/billing?pr={requestId}&invoices={csv-of-invoice-ids}
```

---

## Post-Payment Hook

When a payment is processed via `POST /v1/payments`:

1. Check if any `payment_request_invoices` match the paid invoice IDs
2. Update `amount_paid` on matching `payment_request_invoices` rows
3. Recalculate `remaining_amount` on the parent `payment_request`
4. If `remaining_amount` reaches 0 → set `status = 'paid'` and `paid_at = NOW()`
5. If partial payment → set `status = 'partially_paid'`

---

## Automation Cron Job

**Schedule:** Daily (recommended: 6 AM tenant timezone)

**Logic:**

1. Query all active `automation_rules` for the tenant
2. For each rule, find invoices matching the condition:
   - `past_due`: `due_date < TODAY AND status = 'open'`
   - `due_today`: `due_date = TODAY AND status = 'open'`
   - `due_in_3_days`: `due_date = TODAY + 3 AND status = 'open'`
   - `due_in_7_days`: `due_date = TODAY + 7 AND status = 'open'`
3. For each matching invoice NOT already enrolled:
   - Create `automation_enrollment` record
   - Create `payment_request` with the rule's message template
   - Send via configured delivery channels (SMS/email)
4. For existing enrollments where `follow_ups_sent < max_follow_ups` and interval has elapsed:
   - Send reminder via `POST /v1/admin/payment-requests/{id}/remind`
   - Increment `follow_ups_sent`
5. Update rule aggregate stats (`active_invoices`, `total_sent`, `total_collected`)

---

## ARSummary Computation

For endpoint #1 (`GET /v1/admin/payment-requests/summary`):

```sql
-- totalOutstanding: sum of remaining_amount where status NOT IN ('cancelled', 'paid')
-- openRequests: count where status NOT IN ('cancelled', 'paid')
-- paidThisMonth: sum of total_amount where status = 'paid' AND paid_at >= first_day_of_month
-- overdueCount: count where status = 'overdue'
```
