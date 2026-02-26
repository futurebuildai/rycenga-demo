# AR Center — Frontend Sprint Specifications

**Project:** Velocity  
**Created:** February 16, 2026  

---

## Sprint Overview

| Sprint | Focus | Tasks | Estimated Points |
|--------|-------|-------|-----------------|
| **Sprint A** | Foundation — Multi-invoice payment + payment request sending | Tasks 1–5 | 21 |
| **Sprint B** | AR Dashboard — Tracking, filtering, reminders | Tasks 6–9 | 18 |
| **Sprint C** | Bulk & Automations — Mass sends, rule engine UI | Tasks 10–13 | 21 |

---

# Sprint A: Foundation

> Goal: Enable dealer admins to send payment request links and contractors to pay multiple invoices at once.

---

## Task A1: AR Center Domain Types & Service Layer

**Objective**: Define all TypeScript types and create the admin AR service with API methods.

**Context**:
- **New File**: `src/admin/services/ar-center.service.ts`
- **Modify**: `src/connect/types/domain.ts` (add AR types)
- **Pattern**: Follow [admin-data.service.ts](file:///home/colton/Desktop/BuilderWire_HQ/Velocity/velocity-frontend/src/admin/services/admin-data.service.ts) conventions

### Types to Add (in `domain.ts`)

```typescript
// --- Payment Request Types ---
export type PaymentRequestStatus = 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

export interface PaymentRequest {
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
    recipientPhone: string;
    recipientEmail: string;
    reminderCount: number;
    lastReminderAt: string | null;
    viewedAt: string | null;
    paidAt: string | null;
    invoices: PaymentRequestInvoice[];
    createdAt: string;
    updatedAt: string;
}

export interface PaymentRequestInvoice {
    invoiceId: number;
    invoiceNumber: string;
    amountAtRequest: number;
    amountPaid: number;
}

export interface CreatePaymentRequestPayload {
    accountId: number;
    invoiceIds: number[];
    deliverySms: boolean;
    deliveryEmail: boolean;
    recipientPhone?: string;
    recipientEmail?: string;
    messageSubject?: string;
    messageBody?: string;
}

export interface ARSummary {
    totalOutstanding: number;
    openRequests: number;
    paidThisMonth: number;
    overdueCount: number;
}

// --- Automation Types ---
export type AutomationCondition = 'past_due' | 'due_in_3_days' | 'due_in_7_days' | 'due_today';

export interface AutomationRule {
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
    createdAt: string;
    updatedAt: string;
}
```

### Service Methods (`ar-center.service.ts`)

| Method | Endpoint | Returns |
|--------|----------|---------|
| `getSummary()` | `GET /v1/admin/payment-requests/summary` | `ARSummary` |
| `getPaymentRequests(params)` | `GET /v1/admin/payment-requests` | `PaginatedResponse<PaymentRequest>` |
| `getPaymentRequest(id)` | `GET /v1/admin/payment-requests/{id}` | `PaymentRequest` |
| `createPaymentRequest(payload)` | `POST /v1/admin/payment-requests` | `PaymentRequest` |
| `sendReminder(id)` | `POST /v1/admin/payment-requests/{id}/remind` | `void` |
| `cancelRequest(id)` | `PUT /v1/admin/payment-requests/{id}/cancel` | `void` |
| `bulkCreateRequests(payload)` | `POST /v1/admin/payment-requests/bulk` | `{ created: number }` |
| `getAutomations()` | `GET /v1/admin/automations` | `AutomationRule[]` |
| `createAutomation(payload)` | `POST /v1/admin/automations` | `AutomationRule` |
| `updateAutomation(id, payload)` | `PUT /v1/admin/automations/{id}` | `AutomationRule` |
| `deleteAutomation(id)` | `DELETE /v1/admin/automations/{id}` | `void` |
| `toggleAutomation(id)` | `PUT /v1/admin/automations/{id}/toggle` | `AutomationRule` |

### Mock Data

Provide mock fallback data (3–5 sample payment requests, 1–2 automation rules) for frontend development before backend is ready.

### Definition of Done
- All types compile with zero `any`
- Service layer with all methods implemented
- Mock data returns realistic sample data
- Unit tests for type mappings

---

## Task A2: Payment Request Modal (Account Details Page)

**Objective**: Replace the "Coming Soon" modal with a fully functional payment request form.

**Context**:
- **Modify**: [page-account-details.ts](file:///home/colton/Desktop/BuilderWire_HQ/Velocity/velocity-frontend/src/admin/pages/page-account-details.ts#L725-L748) — replace the existing placeholder modal
- **Uses**: `ARCenterService.createPaymentRequest()`
- **Depends on**: Task A1

### Step-by-Step Instructions

1. **Replace the payment modal** (lines 725–748) with a new form:
   - **Delivery checkboxes**: SMS ☑ and Email ☑ (at least one required)
   - **Recipient phone**: Pre-filled from `account.phone`, editable
   - **Recipient email**: Pre-filled from `account.email`, editable
   - **Message subject**: Text input, default: `"Payment Requested — Invoice(s) Due"`
   - **Message body**: Textarea with template, supports `{contactName}`, `{invoiceNumbers}`, `{totalAmount}`, `{earliestDueDate}`, `{paymentLink}`, `{dealerName}`
   - **Invoice summary**: Read-only card showing selected invoice count + total
   - **Preview toggle**: Expand/collapse rendered preview of the message

2. **Update `handleSendPaymentRequest()`** (line 349):
   - Call `ARCenterService.createPaymentRequest()` with form data
   - Show success toast with count
   - Clear selection
   - Handle errors with error toast

3. **Add form validation**:
   - At least one delivery method checked
   - Phone format validation (if SMS checked)
   - Email format validation (if email checked)
   - Message body not empty

### Backend Integration Contract

| Action | Endpoint | Method |
|--------|----------|--------|
| Create Payment Request | `POST /v1/admin/payment-requests` | POST |

### Definition of Done
- Modal renders with all form fields
- Template variable substitution works in preview
- Validation prevents invalid submissions
- Service call fires on submit with correct payload
- Toast feedback on success/error
- Invoice selection clears after send
- Zero `any` types

---

## Task A3: Multi-Invoice Selection (Contractor Portal Billing Page)

**Objective**: Add checkbox-based multi-invoice selection and a bulk pay action to the contractor billing page.

**Context**:
- **Identify**: The contractor billing page component (likely in `src/features/billing/` or the connect portal page structure)
- **Modify**: The invoice list rendering to add checkboxes
- **Pattern**: Follow the checkbox pattern already in [page-account-details.ts](file:///home/colton/Desktop/BuilderWire_HQ/Velocity/velocity-frontend/src/admin/pages/page-account-details.ts#L322-L339)
- **Depends on**: Task A4

### Step-by-Step Instructions

1. **Add selection state** to the billing page:
   ```typescript
   @state() private selectedInvoices: Set<number> = new Set();
   ```

2. **Add checkbox column** to the invoice table:
   - Header: Select-all checkbox
   - Rows: Per-invoice checkbox
   - Toggle logic: same pattern as admin `toggleInvoice()` / `toggleAllInvoices()`

3. **Add floating action bar** that appears when `selectedInvoices.size > 0`:
   ```html
   <div class="bulk-pay-bar">
     <span>{count} invoices selected — ${total}</span>
     <button @click=${this.openBulkPayModal}>Pay Selected</button>
   </div>
   ```
   - Sticky to bottom of viewport
   - Slide-up animation on appear
   - Shows count + summed total

4. **Handle URL query params** for deep links:
   - On `connectedCallback()`, parse `?invoices=1,2,3` from URL
   - Pre-select those invoices
   - Parse `?pr={id}` and store for payment request tracking

5. **Row highlight**: Apply `row-selected` class to checked rows (orange-50 tint)

### Definition of Done
- Checkboxes appear on each open invoice row
- Select-all toggle works
- Floating action bar shows with correct count/total
- URL params `?invoices=1,2,3` pre-selects invoices on load
- Row highlighting for selected invoices
- Zero `any` types

---

## Task A4: Multi-Invoice Payment Modal Refactor

**Objective**: Upgrade `pv-payment-modal` to handle multiple invoices and display an itemized breakdown.

**Context**:
- **Modify**: [pv-payment-modal.ts](file:///home/colton/Desktop/BuilderWire_HQ/Velocity/velocity-frontend/src/features/billing/components/pv-payment-modal.ts)
- **Uses**: `BillingService.createPayment()` with `allocations[]`
- **Depends on**: Task A3

### Step-by-Step Instructions

1. **Change props** from single invoice to array:
   ```typescript
   // Before:
   @property({ type: Number }) invoiceId: number = 0;
   @property({ type: Number }) amount: number = 0;

   // After:
   @property({ type: Array }) invoices: { id: number; invoiceNumber: string; amount: number }[] = [];
   ```

2. **Update the modal body** to show invoice breakdown:
   - Itemized list: Invoice # — Amount for each invoice
   - Separator line
   - **Total**: Sum of all invoice amounts
   - Convenience fee line (if applicable)
   - **Grand Total**: Sum + fee

3. **Update payment submission**:
   - Build `allocations[]` array from selected invoices
   - Set `PaymentPayload.type = 'invoice'`
   - Pass all allocations to `BillingService.createPayment()`

4. **Post-payment success handler**:
   - If `paymentRequestId` is present (from URL `?pr=`), call `POST /v1/payment-requests/{id}/viewed` to mark as fulfilled
   - Emit `payment-complete` event with details
   - Clear selections

5. **Backwards compatibility**: If only 1 invoice is passed, render same as current (no changes to single-invoice UX)

### Backend Integration Contract

| Action | Endpoint | Method | Payload Key |
|--------|----------|--------|------------|
| Create Payment | `POST /v1/payments` | POST | `allocations[]` — **Already exists** |
| Mark Request Viewed | `POST /v1/payment-requests/{id}/viewed` | POST | New |

### Definition of Done
- Modal renders invoice list with amounts
- Total correctly sums all invoices
- Payment processes with multi-invoice `allocations[]` payload
- Single-invoice mode unchanged
- Payment request tracking works via URL param
- Zero `any` types

---

## Task A5: Deep Link & Payment Request Resolution (Contractor Portal)

**Objective**: Handle inbound payment request links — parse params, pre-select invoices, track views.

**Context**:
- **Modify**: Contractor portal billing page (same component as Task A3)
- **New Service Method**: `GET /v1/payment-requests/{id}` (contractor-side, returns invoice list)
- **Depends on**: Tasks A3, A4

### Step-by-Step Instructions

1. **Parse URL params** on page load:
   ```typescript
   const url = new URL(window.location.href);
   const prId = url.searchParams.get('pr');
   const invoiceIds = url.searchParams.get('invoices')?.split(',').map(Number);
   ```

2. **If `pr` param present**:
   - Fetch payment request details: `GET /v1/payment-requests/{prId}`
   - Show a banner: *"Your dealer has requested payment for the following invoices"*
   - Pre-select all invoices from the request
   - Call `POST /v1/payment-requests/{prId}/viewed` to update status

3. **If only `invoices` param** (no `pr`):
   - Simply pre-select those invoices, no banner

4. **Banner component** styling:
   - Blue info banner at top of invoice list
   - Dealer name and request date
   - Dismissible (X button)

5. **After successful payment**:
   - Clear URL params
   - Remove banner
   - Show success toast

### Definition of Done
- Payment request link correctly pre-selects invoices
- Banner shows when `pr` param is present
- `viewed` status fires on page load
- URL params cleared after payment
- Graceful fallback if payment request ID is invalid
- Zero `any` types

---

# Sprint B: AR Dashboard

> Goal: Build the AR Center page with real-time tracking, filtering, and reminder capabilities.

---

## Task B1: AR Center Summary Cards

**Objective**: Replace the placeholder page with summary metric cards.

**Context**:
- **Rewrite**: [page-ar-center.ts](file:///home/colton/Desktop/BuilderWire_HQ/Velocity/velocity-frontend/src/admin/pages/page-ar-center.ts) — full page rewrite
- **Uses**: `ARCenterService.getSummary()`
- **Depends on**: Sprint A (Task A1)

### Step-by-Step Instructions

1. **Page layout** — two-section vertical layout:
   - Top: Summary cards row
   - Bottom: Payment requests table (Task B2)

2. **Summary cards** — 4 cards in a responsive grid:
   | Card | Label | Icon | Color | Data |
   |------|-------|------|-------|------|
   | 1 | Total Outstanding | `$` | Blue (`#3b82f6`) | `summary.totalOutstanding` |
   | 2 | Open Requests | `📤` | Orange (`#f97316`) | `summary.openRequests` |
   | 3 | Paid This Month | `✅` | Green (`#22c55e`) | `summary.paidThisMonth` |
   | 4 | Overdue | `⚠️` | Red (`#ef4444`) | `summary.overdueCount` |

3. **Card styling**: Match existing card pattern from [page-account-details.ts](file:///home/colton/Desktop/BuilderWire_HQ/Velocity/velocity-frontend/src/admin/pages/page-account-details.ts#L66-L80) — white background, border-radius 8px, subtle shadow, icon circle at top.

4. **Loading state**: Skeleton cards with pulse animation

### Definition of Done
- 4 summary cards render with data from `ARSummary`
- Responsive grid (2-col on tablet, 4-col on desktop)
- Loading skeleton animation
- Error fallback with "Retry" button
- Zero `any` types

---

## Task B2: Payment Requests Table

**Objective**: Implement the main data table for viewing and managing payment requests.

**Context**:
- **Within**: `page-ar-center.ts` (same file as B1)
- **Uses**: `ARCenterService.getPaymentRequests(params)`
- **Depends on**: Task B1

### Step-by-Step Instructions

1. **Table columns**:
   | Column | Type | Sortable |
   |--------|------|----------|
   | Account | Link → `/admin/accounts/{id}` | ✅ |
   | Invoice(s) | Comma-separated badge list | ❌ |
   | Amount | Currency, monospace | ✅ |
   | Sent Date | Formatted date | ✅ |
   | Due Date | Formatted date, red if past | ✅ |
   | Status | Badge (color-coded) | ✅ |
   | Reminders | Count badge | ❌ |
   | Actions | Button group | ❌ |

2. **Status badges** — color mapping:
   - `sent`: Blue
   - `viewed`: Yellow
   - `paid`: Green
   - `partially_paid`: Orange
   - `overdue`: Red
   - `cancelled`: Gray

3. **Action buttons** per row:
   - 📩 **Send Reminder** (disabled if `status === 'paid' || 'cancelled'`)
   - ❌ **Cancel** (disabled if `status === 'paid'`)
   - Confirmation modal for cancel action

4. **Filters bar** above table:
   - Status multi-select dropdown
   - Date range picker (sent date)
   - Account search input (debounced, 300ms)
   - "Clear Filters" button

5. **Pagination**: Reuse pagination pattern from [page-account-details.ts](file:///home/colton/Desktop/BuilderWire_HQ/Velocity/velocity-frontend/src/admin/pages/page-account-details.ts#L793-L810) — `buildPaginationTokens()` and `getPaginationBounds()`

6. **Empty state**: "No payment requests yet" with CTA to go to an account

### Definition of Done
- Table renders with all columns
- Status badges render with correct colors
- Send Reminder fires API call + shows toast
- Cancel shows confirmation, fires API + updates row
- Filters work (status, date, search)
- Pagination works
- Column sorting works (client-side for now)
- Zero `any` types

---

## Task B3: Payment Request Detail Drawer

**Objective**: Side drawer showing full details of a payment request with activity timeline.

**Context**:
- **New Component**: `src/admin/components/ar-request-detail-drawer.ts`
- **Opens from**: Row click in the payment requests table
- **Depends on**: Task B2

### Step-by-Step Instructions

1. **Drawer component** — slides in from right:
   - 400px width
   - Overlay backdrop (semi-transparent)
   - Close button + ESC key handling
   - Scroll internal content

2. **Content sections**:
   - **Header**: Status badge + Account name + Total amount
   - **Invoice List**: Table of invoices with individual payment status
   - **Delivery Info**: SMS/Email indicators with phone/email
   - **Message Preview**: Collapsible section showing sent message
   - **Activity Timeline**: Chronological events:
     - Created → Sent → Viewed → Reminder(s) → Paid
     - Each event shows timestamp and actor

3. **Quick Actions** in drawer header:
   - Send Reminder button
   - Cancel Request button

### Definition of Done
- Drawer opens/closes with slide animation
- All sections render with correct data
- Activity timeline shows chronological events
- Quick actions work (reminder + cancel)
- ESC key and backdrop click close drawer
- Zero `any` types

---

## Task B4: Send Reminder UX Enhancements

**Objective**: Add confirmation dialog and customizable messaging for reminder sends.

**Context**:
- **Modify**: `page-ar-center.ts` and `ar-request-detail-drawer.ts`
- **Uses**: `ARCenterService.sendReminder(id)`
- **Depends on**: Tasks B2, B3

### Step-by-Step Instructions

1. **Reminder confirmation modal**:
   - Shows reminder count: "This will be reminder #N"
   - Editable message (pre-filled with reminder template)
   - Send / Cancel buttons
   - Loading state during API call

2. **Reminder success feedback**:
   - Toast: "Reminder sent successfully"
   - Table row updates `reminderCount` immediately (optimistic)
   - Detail drawer updates timeline

3. **Reminder throttle warning**:
   - If `lastReminderAt` < 24 hours ago, show warning: "A reminder was sent less than 24 hours ago. Send anyway?"

### Definition of Done
- Confirmation modal with editable message
- Throttle warning for recent sends
- Optimistic UI update on success
- Error handling with rollback
- Zero `any` types

---

# Sprint C: Bulk Requests & Automations

> Goal: Enable mass payment request sends and automated follow-up workflows.

---

## Task C1: Bulk Send Modal

**Objective**: Build the bulk send workflow — condition picker → preview → send.

**Context**:
- **New Component**: `src/admin/components/ar-bulk-send-modal.ts`
- **Triggered from**: "Bulk Request" button on AR Center page
- **Uses**: `ARCenterService.bulkCreateRequests()`
- **Depends on**: Sprint B

### Step-by-Step Instructions

1. **Step 1 — Condition Selection**:
   - Radio group: Past Due / Due in ≤ 3 Days / Due in ≤ 7 Days / All Open
   - "Next" button → fetches preview

2. **Step 2 — Preview & Customize**:
   - Preview table: Account Name | Invoice Count | Total Amount | Contact | ☑ Include
   - Summary bar: "N accounts, M invoices, $X total"
   - Deselect toggle per account
   - Message template editor (shared with Task A2 logic)
   - "Send All" button

3. **Step 3 — Sending Progress**:
   - Progress bar: "Sending... 12 / 47 accounts"
   - Individual status indicators per account
   - Completion summary: "47 requests sent. 2 failed (no contact info)"

4. **Modal design**: Full-screen overlay, 3-step wizard with breadcrumb nav

### Backend Integration Contract

| Action | Endpoint | Method |
|--------|----------|--------|
| Get Bulk Preview | `GET /v1/admin/payment-requests/bulk-preview?condition=past_due` | GET |
| Send Bulk | `POST /v1/admin/payment-requests/bulk` | POST |

### Definition of Done
- 3-step wizard flow works end-to-end
- Condition selection fetches preview
- Account deselect works
- Message customization works
- Progress indicator during send
- Completion summary with error count
- Zero `any` types

---

## Task C2: Automation Rule CRUD

**Objective**: Build the automation rules management UI — list, create, edit, delete.

**Context**:
- **New file or sub-tab**: Within `page-ar-center.ts` as a tab (Requests | Automations)
- **Uses**: `ARCenterService` automation methods
- **Depends on**: Sprint B

### Step-by-Step Instructions

1. **Tab bar** at top of AR Center: `Requests` (default) | `Automations`

2. **Automations list table**:
   | Column | Description |
   |--------|-------------|
   | Rule Name | Editable label |
   | Condition | Badge — Past Due, Due In ≤3 Days, etc. |
   | Active Invoices | Current enrollment count |
   | Total Sent | Lifetime sends |
   | Collected | Amount collected via this rule |
   | Status | Active/Paused toggle |
   | Actions | Edit / Delete |

3. **Create/Edit modal** (shared component):
   - Rule name: text input
   - Condition: dropdown
   - Follow-up interval: number input + "days" suffix
   - Max follow-ups: number input
   - Message template: textarea with variables
   - Active: toggle switch
   - Save / Cancel buttons

4. **Delete confirmation**: "This will stop all active follow-ups. Are you sure?"

5. **Toggle**: Inline switch that calls `ARCenterService.toggleAutomation(id)`

### Definition of Done
- Tab switches between Requests and Automations
- Automations table renders with all columns
- Create modal with all form fields + validation
- Edit modal pre-fills existing values
- Delete shows confirmation + fires API
- Active toggle works with optimistic update
- Zero `any` types

---

## Task C3: Automation Performance Dashboard

**Objective**: Add performance metrics and enrollment details for each automation rule.

**Context**:
- **Extends**: Automations tab (Task C2)
- **New component**: `src/admin/components/ar-automation-detail.ts`
- **Depends on**: Task C2

### Step-by-Step Instructions

1. **Expandable row** in automations table:
   - Clicking a row expands to show performance metrics inline
   - Or: clicking opens detail drawer (similar pattern to B3)

2. **Performance metrics** (inline or drawer):
   - **Conversion rate**: Paid / Total enrolled (percentage)
   - **Total collected**: Dollar amount
   - **Average time to pay**: Days from first request to payment
   - **Active enrollments**: Count
   - Mini bar chart of weekly sends vs. collections (past 8 weeks)

3. **Enrolled invoices table** (within detail):
   | Invoice # | Account | Amount | Follow-ups Sent | Next Follow-up | Status |
   |-----------|---------|--------|-----------------|----------------|--------|

### Definition of Done
- Expandable row or detail drawer works
- Performance metrics render correctly
- Enrolled invoices table with current status
- Mini chart renders (can use CSS-only bar chart)
- Zero `any` types

---

## Task C4: AR Center Integration Polish

**Objective**: Final polish pass — loading states, error handling, empty states, and cross-feature wiring.

**Context**:
- **Modify**: All AR Center components from Sprints A–C
- **Depends on**: All previous tasks

### Step-by-Step Instructions

1. **Loading states**: Ensure every data-fetching operation shows skeleton/spinner
2. **Error states**: Every API call has error toast + retry option
3. **Empty states**:
   - No payment requests → onboarding card with "Send your first payment request"
   - No automations → "Set up automated collections" CTA
4. **Navigation wiring**:
   - Account Details → "Request Payment" → sends request → toast links to AR Center
   - AR Center → row click → Account Details (back-navigation preserved)
   - Sidebar nav highlight for AR Center page
5. **Toast improvements**: Clickable toasts that navigate (e.g., "Payment request sent. [View in AR Center →]")
6. **Responsive design**: Verify all AR components work at tablet (768px) and mobile (375px)

### Definition of Done
- All loading states implemented
- All error states implemented with retry
- All empty states implemented with CTAs
- Navigation flows are circular and smooth
- Toasts are actionable where appropriate
- Responsive at 768px and 375px breakpoints
- Final QA pass with no console errors
