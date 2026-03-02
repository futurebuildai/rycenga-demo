# AR Center — Backend Handoff

**Status:** Ready for Backend Team  
**Project:** Velocity  
**Created:** February 16, 2026  
**Frontend PRD:** [PRD.md](./PRD.md) | **Frontend Sprints:** [FRONTEND_SPRINTS.md](./FRONTEND_SPRINTS.md)

---

## 1. Overview

This document provides the backend team with everything needed to implement the AR Center feature set. The frontend will be built in parallel using mock data, so the backend team can work independently using the API contracts defined here.

### What Already Exists

| Component | File | Status |
|-----------|------|--------|
| Payment domain models | `internal/domain/finance.go` | ✅ Exists — `PaymentTransaction`, `PaymentAllocation`, `PaymentCreateBody` |
| Payment endpoints | `POST /v1/payments` | ✅ Exists — already supports `allocations[]` |
| SMS messaging | `internal/domain/communication.go` | ✅ Exists — `CommunicationMessage`, `CommunicationConversation` |
| Account models | `internal/domain/account.go` | ✅ Exists |
| Invoice models | `internal/domain/sales.go` | ✅ Exists |
| Multi-tenant scoping | `internal/api/server/account_scope.go` | ✅ Exists |

### What Needs to Be Built

| Component | Priority | Description |
|-----------|----------|-------------|
| Payment Request domain | P0 | New tables + Go structs |
| Payment Request API | P0 | CRUD + remind + bulk endpoints |
| SMS delivery for requests | P0 | Reuse existing SMS provider |
| Email delivery | P1 | New transactional email integration |
| Deep link generation | P0 | URL builder for contractor portal links |
| Payment → Request resolution | P0 | Event listener that updates request status on payment |
| Automation domain | P2 | New tables + Go structs |
| Automation API | P2 | CRUD + toggle endpoints |
| Automation cron job | P2 | Daily scheduler for rule evaluation |

---

## 2. Database Migrations

### Migration 1: `payment_requests` + `payment_request_invoices`

```sql
-- Migration: 20260216_001_create_payment_requests.sql

CREATE TABLE payment_requests (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    account_id      BIGINT NOT NULL REFERENCES accounts(id),
    created_by_user_id BIGINT NOT NULL REFERENCES users(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'sent'
                    CHECK (status IN ('sent','viewed','paid','partially_paid','overdue','cancelled')),
    total_amount    DECIMAL(15,2) NOT NULL,
    remaining_amount DECIMAL(15,2) NOT NULL,
    message_subject TEXT,
    message_body    TEXT NOT NULL,
    delivery_sms    BOOLEAN NOT NULL DEFAULT false,
    delivery_email  BOOLEAN NOT NULL DEFAULT false,
    recipient_phone VARCHAR(20),
    recipient_email VARCHAR(255),
    reminder_count  INT NOT NULL DEFAULT 0,
    last_reminder_at TIMESTAMPTZ,
    viewed_at       TIMESTAMPTZ,
    paid_at         TIMESTAMPTZ,
    automation_rule_id BIGINT,  -- FK added after automation_rules table exists
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_requests_tenant ON payment_requests(tenant_id);
CREATE INDEX idx_payment_requests_account ON payment_requests(account_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(tenant_id, status);
CREATE INDEX idx_payment_requests_created ON payment_requests(tenant_id, created_at DESC);

CREATE TABLE payment_request_invoices (
    id                  BIGSERIAL PRIMARY KEY,
    payment_request_id  BIGINT NOT NULL REFERENCES payment_requests(id) ON DELETE CASCADE,
    invoice_id          BIGINT NOT NULL,  -- FK to invoices (may be ERP-synced)
    invoice_number      VARCHAR(50) NOT NULL,
    amount_at_request   DECIMAL(15,2) NOT NULL,
    amount_paid         DECIMAL(15,2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_pri_request ON payment_request_invoices(payment_request_id);
CREATE INDEX idx_pri_invoice ON payment_request_invoices(invoice_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_payment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_requests_updated_at
    BEFORE UPDATE ON payment_requests
    FOR EACH ROW EXECUTE FUNCTION update_payment_requests_updated_at();
```

### Migration 2: `automation_rules` + `automation_enrollments`

```sql
-- Migration: 20260216_002_create_automation_rules.sql

CREATE TABLE automation_rules (
    id                      BIGSERIAL PRIMARY KEY,
    tenant_id               UUID NOT NULL REFERENCES tenants(id),
    name                    VARCHAR(100) NOT NULL,
    condition               VARCHAR(30) NOT NULL
                            CHECK (condition IN ('past_due','due_in_3_days','due_in_7_days','due_today')),
    message_template        TEXT NOT NULL,
    follow_up_interval_days INT NOT NULL DEFAULT 3,
    max_follow_ups          INT NOT NULL DEFAULT 5,
    is_active               BOOLEAN NOT NULL DEFAULT true,
    created_by_user_id      BIGINT NOT NULL REFERENCES users(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_tenant ON automation_rules(tenant_id);
CREATE INDEX idx_automation_rules_active ON automation_rules(tenant_id, is_active);

-- Now add FK from payment_requests
ALTER TABLE payment_requests
    ADD CONSTRAINT fk_pr_automation_rule
    FOREIGN KEY (automation_rule_id) REFERENCES automation_rules(id) ON DELETE SET NULL;

CREATE TABLE automation_enrollments (
    id                  BIGSERIAL PRIMARY KEY,
    automation_rule_id  BIGINT NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    payment_request_id  BIGINT NOT NULL REFERENCES payment_requests(id) ON DELETE CASCADE,
    invoice_id          BIGINT NOT NULL,
    follow_up_count     INT NOT NULL DEFAULT 0,
    next_follow_up_at   TIMESTAMPTZ,
    status              VARCHAR(20) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','completed','exhausted')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_ae_rule ON automation_enrollments(automation_rule_id);
CREATE INDEX idx_ae_status ON automation_enrollments(status, next_follow_up_at);
CREATE INDEX idx_ae_invoice ON automation_enrollments(invoice_id);

CREATE TRIGGER trg_automation_rules_updated_at
    BEFORE UPDATE ON automation_rules
    FOR EACH ROW EXECUTE FUNCTION update_payment_requests_updated_at();
```

---

## 3. Go Domain Models

### File: `internal/domain/ar.go` (NEW)

```go
package domain

import "time"

// --- Payment Request ---

type PaymentRequestStatus string

const (
    PaymentRequestStatusSent         PaymentRequestStatus = "sent"
    PaymentRequestStatusViewed       PaymentRequestStatus = "viewed"
    PaymentRequestStatusPaid         PaymentRequestStatus = "paid"
    PaymentRequestStatusPartiallyPaid PaymentRequestStatus = "partially_paid"
    PaymentRequestStatusOverdue      PaymentRequestStatus = "overdue"
    PaymentRequestStatusCancelled    PaymentRequestStatus = "cancelled"
)

type PaymentRequest struct {
    ID               int64                `db:"id" json:"id"`
    TenantID         string               `db:"tenant_id" json:"-"`
    AccountID        int64                `db:"account_id" json:"accountId"`
    AccountName      string               `db:"-" json:"accountName"`  // JOIN
    CreatedByUserID  int64                `db:"created_by_user_id" json:"createdByUserId"`
    Status           PaymentRequestStatus `db:"status" json:"status"`
    TotalAmount      float64              `db:"total_amount" json:"totalAmount"`
    RemainingAmount  float64              `db:"remaining_amount" json:"remainingAmount"`
    MessageSubject   *string              `db:"message_subject" json:"messageSubject"`
    MessageBody      string               `db:"message_body" json:"messageBody"`
    DeliverySMS      bool                 `db:"delivery_sms" json:"deliverySms"`
    DeliveryEmail    bool                 `db:"delivery_email" json:"deliveryEmail"`
    RecipientPhone   *string              `db:"recipient_phone" json:"recipientPhone"`
    RecipientEmail   *string              `db:"recipient_email" json:"recipientEmail"`
    ReminderCount    int                  `db:"reminder_count" json:"reminderCount"`
    LastReminderAt   *time.Time           `db:"last_reminder_at" json:"lastReminderAt"`
    ViewedAt         *time.Time           `db:"viewed_at" json:"viewedAt"`
    PaidAt           *time.Time           `db:"paid_at" json:"paidAt"`
    AutomationRuleID *int64               `db:"automation_rule_id" json:"automationRuleId,omitempty"`
    Invoices         []PaymentRequestInvoice `db:"-" json:"invoices"`
    CreatedAt        time.Time            `db:"created_at" json:"createdAt"`
    UpdatedAt        time.Time            `db:"updated_at" json:"updatedAt"`
}

type PaymentRequestInvoice struct {
    ID               int64   `db:"id" json:"id"`
    PaymentRequestID int64   `db:"payment_request_id" json:"paymentRequestId"`
    InvoiceID        int64   `db:"invoice_id" json:"invoiceId"`
    InvoiceNumber    string  `db:"invoice_number" json:"invoiceNumber"`
    AmountAtRequest  float64 `db:"amount_at_request" json:"amountAtRequest"`
    AmountPaid       float64 `db:"amount_paid" json:"amountPaid"`
}

// --- Request Bodies ---

type CreatePaymentRequestBody struct {
    AccountID      int64   `json:"accountId" doc:"Target account" required:"true"`
    InvoiceIDs     []int64 `json:"invoiceIds" doc:"Invoice IDs to include" required:"true"`
    DeliverySMS    bool    `json:"deliverySms" doc:"Send via SMS"`
    DeliveryEmail  bool    `json:"deliveryEmail" doc:"Send via email"`
    RecipientPhone *string `json:"recipientPhone" doc:"Override phone number"`
    RecipientEmail *string `json:"recipientEmail" doc:"Override email address"`
    MessageSubject *string `json:"messageSubject" doc:"Custom email subject"`
    MessageBody    *string `json:"messageBody" doc:"Custom message body"`
}

type BulkPaymentRequestBody struct {
    Condition      string  `json:"condition" doc:"Filter condition" enum:"past_due,due_in_3_days,due_in_7_days,all_open" required:"true"`
    ExcludeAccounts []int64 `json:"excludeAccounts" doc:"Account IDs to skip"`
    MessageSubject *string `json:"messageSubject" doc:"Custom email subject"`
    MessageBody    *string `json:"messageBody" doc:"Custom message body"`
}

type PaymentRequestListParams struct {
    Status    *string `query:"status"`
    AccountID *int64  `query:"account_id"`
    DateFrom  *string `query:"date_from"`
    DateTo    *string `query:"date_to"`
    Search    *string `query:"search"`
    SortBy    *string `query:"sort_by"`
    SortDir   *string `query:"sort_dir"`
    Limit     int     `query:"limit"`
    Offset    int     `query:"offset"`
}

// --- AR Summary ---

type ARSummary struct {
    TotalOutstanding float64 `json:"totalOutstanding"`
    OpenRequests     int     `json:"openRequests"`
    PaidThisMonth    float64 `json:"paidThisMonth"`
    OverdueCount     int     `json:"overdueCount"`
}

// --- Automation ---

type AutomationCondition string

const (
    AutomationConditionPastDue    AutomationCondition = "past_due"
    AutomationConditionDue3Days   AutomationCondition = "due_in_3_days"
    AutomationConditionDue7Days   AutomationCondition = "due_in_7_days"
    AutomationConditionDueToday   AutomationCondition = "due_today"
)

type AutomationRule struct {
    ID                    int64               `db:"id" json:"id"`
    TenantID              string              `db:"tenant_id" json:"-"`
    Name                  string              `db:"name" json:"name"`
    Condition             AutomationCondition `db:"condition" json:"condition"`
    MessageTemplate       string              `db:"message_template" json:"messageTemplate"`
    FollowUpIntervalDays  int                 `db:"follow_up_interval_days" json:"followUpIntervalDays"`
    MaxFollowUps          int                 `db:"max_follow_ups" json:"maxFollowUps"`
    IsActive              bool                `db:"is_active" json:"isActive"`
    CreatedByUserID       int64               `db:"created_by_user_id" json:"createdByUserId"`
    // Computed fields (from JOINs / subqueries)
    ActiveInvoices        int                 `db:"-" json:"activeInvoices"`
    TotalSent             int                 `db:"-" json:"totalSent"`
    TotalCollected        float64             `db:"-" json:"totalCollected"`
    CreatedAt             time.Time           `db:"created_at" json:"createdAt"`
    UpdatedAt             time.Time           `db:"updated_at" json:"updatedAt"`
}

type AutomationEnrollment struct {
    ID                int64      `db:"id" json:"id"`
    AutomationRuleID  int64      `db:"automation_rule_id" json:"automationRuleId"`
    PaymentRequestID  int64      `db:"payment_request_id" json:"paymentRequestId"`
    InvoiceID         int64      `db:"invoice_id" json:"invoiceId"`
    FollowUpCount     int        `db:"follow_up_count" json:"followUpCount"`
    NextFollowUpAt    *time.Time `db:"next_follow_up_at" json:"nextFollowUpAt"`
    Status            string     `db:"status" json:"status"`
    CreatedAt         time.Time  `db:"created_at" json:"createdAt"`
    CompletedAt       *time.Time `db:"completed_at" json:"completedAt"`
}

type CreateAutomationBody struct {
    Name                  string `json:"name" doc:"Rule name" required:"true"`
    Condition             string `json:"condition" doc:"Trigger condition" enum:"past_due,due_in_3_days,due_in_7_days,due_today" required:"true"`
    MessageTemplate       string `json:"messageTemplate" doc:"Message body template" required:"true"`
    FollowUpIntervalDays  int    `json:"followUpIntervalDays" doc:"Days between reminders" required:"true"`
    MaxFollowUps          int    `json:"maxFollowUps" doc:"Max reminder count" required:"true"`
}
```

---

## 4. API Endpoint Specifications

### 4.1 Payment Request Endpoints (Admin-scoped)

All admin endpoints require `tenant_owner` or `tenant_staff` role. Tenant is derived from the JWT.

---

#### `POST /v1/admin/payment-requests`

Create a payment request and send notification.

**Request:**
```json
{
    "accountId": 42,
    "invoiceIds": [101, 102, 103],
    "deliverySms": true,
    "deliveryEmail": true,
    "recipientPhone": "+15551234567",
    "recipientEmail": "contractor@example.com",
    "messageSubject": "Payment Requested — Invoice(s) Due",
    "messageBody": "Hi {contactName},\n\nYour invoices {invoiceNumbers} totaling {totalAmount} are due on {earliestDueDate}.\n\nPay here: {paymentLink}\n\nThank you,\n{dealerName}"
}
```

**Response:** `201 Created` → `PaymentRequest` object

**Backend Logic:**
1. Validate account exists and belongs to tenant
2. Validate all invoice IDs exist and belong to the account
3. Look up current balance for each invoice
4. Create `payment_requests` record with `status = 'sent'`
5. Create `payment_request_invoices` junction records
6. Generate deep link URL: `https://{tenant-slug}.velocity.app/billing?pr={id}&invoices={csv}`
7. Perform template variable substitution in message body
8. If `deliverySms`: send SMS via existing messaging provider
9. If `deliveryEmail`: send email via transactional email provider
10. Return the created record

---

#### `GET /v1/admin/payment-requests`

List payment requests with filtering and pagination.

**Query params:** `status`, `account_id`, `date_from`, `date_to`, `search`, `sort_by`, `sort_dir`, `limit`, `offset`

**Response:**
```json
{
    "items": [ /* PaymentRequest[] */ ],
    "total": 147
}
```

**Notes:**
- `search` filters on account name (case-insensitive ILIKE)
- `sort_by` options: `created_at`, `total_amount`, `status`, `remaining_amount`
- Default sort: `created_at DESC`
- JOIN with `accounts` table to include `accountName`
- Include `invoices[]` sub-array for each request

---

#### `GET /v1/admin/payment-requests/summary`

Get aggregate AR metrics.

**Response:**
```json
{
    "totalOutstanding": 45250.00,
    "openRequests": 23,
    "paidThisMonth": 12800.00,
    "overdueCount": 7
}
```

**SQL sketch:**
```sql
SELECT
    COALESCE(SUM(CASE WHEN status NOT IN ('paid','cancelled') THEN remaining_amount END), 0) AS total_outstanding,
    COUNT(CASE WHEN status = 'sent' THEN 1 END) AS open_requests,
    COALESCE(SUM(CASE WHEN status = 'paid' AND paid_at >= date_trunc('month', NOW()) THEN total_amount END), 0) AS paid_this_month,
    COUNT(CASE WHEN status = 'overdue' THEN 1 END) AS overdue_count
FROM payment_requests
WHERE tenant_id = $1;
```

---

#### `POST /v1/admin/payment-requests/{id}/remind`

Re-send notification for an existing request.

**Response:** `200 OK`

**Backend Logic:**
1. Validate request exists, belongs to tenant, is not `paid` or `cancelled`
2. Increment `reminder_count`
3. Set `last_reminder_at = NOW()`
4. Re-send SMS/email with reminder template (use `remaining_amount` instead of `total_amount`)
5. Return updated record

---

#### `PUT /v1/admin/payment-requests/{id}/cancel`

Cancel a payment request.

**Response:** `200 OK` → updated `PaymentRequest`

**Backend Logic:**
1. Set `status = 'cancelled'`
2. If enrolled in automation, set enrollment `status = 'completed'`

---

#### `POST /v1/admin/payment-requests/bulk`

Bulk-create payment requests across multiple accounts.

**Request:**
```json
{
    "condition": "past_due",
    "excludeAccounts": [10, 22],
    "messageSubject": "Past Due Notice",
    "messageBody": "Hi {contactName}, your past-due invoices need attention..."
}
```

**Response:**
```json
{
    "created": 47,
    "failed": 2,
    "failures": [
        { "accountId": 15, "reason": "No contact phone or email" }
    ]
}
```

**Backend Logic:**
1. Query all accounts with invoices matching the condition
2. Exclude accounts in `excludeAccounts`
3. For each account: group matching invoices, create a `PaymentRequest`
4. Send notifications (batch SMS + email)
5. Return summary with failures

**Preview endpoint** (optional GET for frontend):
```
GET /v1/admin/payment-requests/bulk-preview?condition=past_due
```
Returns preview data without sending anything.

---

### 4.2 Contractor Portal Endpoints

These are scoped to the authenticated contractor's account.

---

#### `GET /v1/payment-requests/{id}`

Contractor fetches a payment request's details.

**Auth:** Account-scoped — validate request `account_id` matches the authenticated user's account.

**Response:** `PaymentRequest` object (with invoice list)

---

#### `POST /v1/payment-requests/{id}/viewed`

Mark a payment request as viewed.

**Backend Logic:**
1. If `status = 'sent'`, update to `viewed`
2. Set `viewed_at = NOW()` (only on first view)
3. Idempotent — no error if already viewed

---

### 4.3 Automation Endpoints (Admin-scoped)

---

#### `POST /v1/admin/automations` — Create rule
#### `GET /v1/admin/automations` — List rules (with computed metrics)
#### `PUT /v1/admin/automations/{id}` — Update rule
#### `DELETE /v1/admin/automations/{id}` — Delete rule + cascade enrollments
#### `PUT /v1/admin/automations/{id}/toggle` — Toggle `is_active`
#### `GET /v1/admin/automations/{id}/enrollments` — List enrolled invoices

Standard CRUD — follow existing patterns from other admin endpoints.

---

## 5. Event System: Payment → Request Resolution

When a payment is created via the existing `POST /v1/payments` endpoint, the system must check if any of the paid invoices are tied to a payment request.

### Implementation

After a successful payment is processed, add a post-payment hook:

```go
// In the payment service, after successful payment creation:
func (s *PaymentService) resolvePaymentRequests(ctx context.Context, payment PaymentTransaction) error {
    for _, alloc := range payment.Allocations {
        // Find payment_request_invoices rows for this invoice
        rows, err := s.arRepo.FindByInvoiceID(ctx, alloc.InvoiceID)
        if err != nil || len(rows) == 0 {
            continue
        }
        for _, pri := range rows {
            // Update amount_paid
            pri.AmountPaid += alloc.Amount
            s.arRepo.UpdateRequestInvoice(ctx, pri)

            // Check if all invoices in the request are fully paid
            request, _ := s.arRepo.GetByID(ctx, pri.PaymentRequestID)
            request.RemainingAmount -= alloc.Amount
            if request.RemainingAmount <= 0 {
                request.Status = PaymentRequestStatusPaid
                request.PaidAt = &now
            } else {
                request.Status = PaymentRequestStatusPartiallyPaid
            }
            s.arRepo.Update(ctx, request)

            // If enrolled in automation, mark completed
            s.arRepo.CompleteEnrollment(ctx, pri.InvoiceID)
        }
    }
    return nil
}
```

---

## 6. Automation Cron Job

### Daily Scheduler

A cron job (or background worker) runs daily to evaluate automation rules. Recommended: use existing Go worker pattern or a lightweight scheduler.

```go
// Pseudo-code for daily automation evaluation
func (w *AutomationWorker) Run(ctx context.Context) error {
    rules, _ := w.repo.ListActiveRules(ctx)
    
    for _, rule := range rules {
        // 1. Find new invoices matching condition
        invoices := w.findMatchingInvoices(ctx, rule)
        
        for _, inv := range invoices {
            if !w.isEnrolled(ctx, rule.ID, inv.ID) {
                // Create payment request + enroll
                pr := w.createPaymentRequest(ctx, rule, inv)
                w.enroll(ctx, rule, pr, inv)
            }
        }
        
        // 2. Process follow-ups for existing enrollments
        enrollments := w.repo.GetDueFollowUps(ctx, rule.ID, time.Now())
        
        for _, enrollment := range enrollments {
            if enrollment.FollowUpCount >= rule.MaxFollowUps {
                enrollment.Status = "exhausted"
                w.repo.UpdateEnrollment(ctx, enrollment)
                continue
            }
            w.sendReminder(ctx, enrollment.PaymentRequestID)
            enrollment.FollowUpCount++
            enrollment.NextFollowUpAt = time.Now().AddDate(0, 0, rule.FollowUpIntervalDays)
            w.repo.UpdateEnrollment(ctx, enrollment)
        }
    }
    return nil
}
```

### Condition Queries

| Condition | SQL WHERE Clause |
|-----------|-----------------|
| `past_due` | `due_date < CURRENT_DATE AND status = 'open'` |
| `due_in_3_days` | `due_date <= CURRENT_DATE + INTERVAL '3 days' AND due_date >= CURRENT_DATE AND status = 'open'` |
| `due_in_7_days` | `due_date <= CURRENT_DATE + INTERVAL '7 days' AND due_date >= CURRENT_DATE AND status = 'open'` |
| `due_today` | `due_date = CURRENT_DATE AND status = 'open'` |

---

## 7. Deep Link URL Generation

The backend must generate payment links when creating payment requests.

### URL Format

```
https://{tenant_slug}.velocity.app/billing?pr={payment_request_id}&invoices={comma_separated_invoice_ids}
```

### Builder Function

```go
func BuildPaymentLink(tenantSlug string, requestID int64, invoiceIDs []int64) string {
    ids := make([]string, len(invoiceIDs))
    for i, id := range invoiceIDs {
        ids[i] = strconv.FormatInt(id, 10)
    }
    return fmt.Sprintf("https://%s.velocity.app/billing?pr=%d&invoices=%s",
        tenantSlug, requestID, strings.Join(ids, ","))
}
```

---

## 8. Message Template Variables

The backend performs variable substitution before sending. The frontend sends the raw template; the backend resolves it.

| Variable | Source |
|----------|--------|
| `{contactName}` | `accounts.primary_contact` or first user name |
| `{invoiceNumbers}` | Comma-joined `payment_request_invoices.invoice_number` |
| `{totalAmount}` | `payment_requests.total_amount` (formatted as `$X,XXX.XX`) |
| `{remainingBalance}` | `payment_requests.remaining_amount` (for reminders) |
| `{earliestDueDate}` | `MIN(invoices.due_date)` for included invoices |
| `{paymentLink}` | Generated deep link URL |
| `{dealerName}` | `tenants.name` |

---

## 9. File Structure (Recommended)

```
internal/
├── domain/
│   └── ar.go                          # NEW — all AR domain types
├── platform/postgres/
│   └── ar.go                          # NEW — repository (queries)
├── api/server/
│   ├── ar_admin.go                    # NEW — admin payment request handlers
│   ├── ar_automation.go               # NEW — automation CRUD handlers
│   └── ar_portal.go                   # NEW — contractor-facing handlers
├── connector/worker/
│   └── automation_worker.go           # NEW — daily cron job
└── service/
    └── ar_service.go                  # NEW — business logic + notifications
```

---

## 10. Router Registration

Add to the existing router setup:

```go
// Admin AR endpoints (require tenant_owner or tenant_staff)
adminAR := adminGroup.Group("/payment-requests")
adminAR.POST("/", handlers.CreatePaymentRequest)
adminAR.GET("/", handlers.ListPaymentRequests)
adminAR.GET("/summary", handlers.GetARSummary)
adminAR.GET("/bulk-preview", handlers.BulkPreview)
adminAR.POST("/bulk", handlers.BulkCreatePaymentRequests)
adminAR.GET("/:id", handlers.GetPaymentRequest)
adminAR.POST("/:id/remind", handlers.SendReminder)
adminAR.PUT("/:id/cancel", handlers.CancelPaymentRequest)

// Admin Automation endpoints
adminAuto := adminGroup.Group("/automations")
adminAuto.POST("/", handlers.CreateAutomation)
adminAuto.GET("/", handlers.ListAutomations)
adminAuto.PUT("/:id", handlers.UpdateAutomation)
adminAuto.DELETE("/:id", handlers.DeleteAutomation)
adminAuto.PUT("/:id/toggle", handlers.ToggleAutomation)
adminAuto.GET("/:id/enrollments", handlers.ListEnrollments)

// Contractor portal endpoints (account-scoped)
portalPR := portalGroup.Group("/payment-requests")
portalPR.GET("/:id", handlers.GetPaymentRequestPortal)
portalPR.POST("/:id/viewed", handlers.MarkPaymentRequestViewed)
```

---

## 11. Priority & Phasing

### Phase 1 (Sprint A — ship with frontend Sprint A)
- [ ] Migration 1: `payment_requests` + `payment_request_invoices`
- [ ] Domain types: `PaymentRequest`, `PaymentRequestInvoice`, request bodies
- [ ] Repository: CRUD for payment requests
- [ ] Handlers: Create, Get, List, Summary, Remind, Cancel
- [ ] SMS delivery: reuse existing messaging provider
- [ ] Deep link generation
- [ ] Payment → request resolution hook
- [ ] Portal endpoints: Get + Viewed

### Phase 2 (Sprint B — ship with frontend Sprint B)
- [ ] Email delivery integration (transactional email provider)
- [ ] Status lifecycle management (overdue detection — daily check)
- [ ] Bulk preview + bulk create endpoints

### Phase 3 (Sprint C — ship with frontend Sprint C)
- [ ] Migration 2: `automation_rules` + `automation_enrollments`
- [ ] Automation CRUD endpoints
- [ ] Automation worker (daily cron job)
- [ ] Follow-up scheduling and execution
