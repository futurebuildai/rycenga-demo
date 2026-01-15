# Backend Architecture & Handoff Specification

## Overview

> [!IMPORTANT]
> This repository is **Frontend Only**. This document serves as a technical specification and architectural mapping for the future backend implementation. It defines the "Data Spine" and API contracts required to power the My Account Lite portal.

This document outlines the backend architecture to power the My Account Lite portal. The system is designed to integrate with various ERPs (e.g., Epicor BisTrack) while providing a modern, real-time frontend experience.

---

## Core Data Models

### 1. Users & Authentication

```yaml
User:
  id: UUID
  email: string (unique)
  phone: string
  first_name: string
  last_name: string
  role: enum [RETAIL, PRO, ADMIN]
  created_at: timestamp
  last_login_at: timestamp
  
ProAccount:
  id: UUID
  user_id: FK -> User
  company_name: string
  credit_limit: decimal
  credit_available: decimal  # Calculated: limit - outstanding
  payment_terms: enum [NET30, NET60, COD]
  erp_customer_id: string  # Link to ERP
  tax_exempt: boolean
  tax_id: string
  auto_pay_enabled: boolean
  default_location_id: FK -> Location
```


### 4. Orders & Estimates (Quotes)

```yaml
Order:
  id: UUID
  order_number: string  # Human-readable: "ORD-2024-001234"
  user_id: FK -> User
  project_id: FK -> Project (nullable)
  location_id: FK -> Location
  status: enum [DRAFT, SUBMITTED, CONFIRMED, PICKING, SHIPPED, DELIVERED, CANCELLED]
  delivery_type: enum [PICKUP, DELIVERY]
  delivery_address: json
  requested_date: date
  estimated_delivery: date
  po_number: string (nullable)  # Customer PO
  erp_order_id: string  # Pushed to ERP
  subtotal: decimal
  tax: decimal
  total: decimal
  created_at: timestamp
  updated_at: timestamp
  
OrderLine:
  id: UUID
  order_id: FK -> Order
  product_id: FK -> Product
  quantity: decimal
  unit_price: decimal
  line_total: decimal
  
Estimate:  # Renamed from Quote
  id: UUID
  estimate_number: string  # "EST-2024-001234"
  user_id: FK -> User
  project_id: FK -> Project (nullable)
  status: enum [DRAFT, SENT, ACCEPTED, EXPIRED, CONVERTED]
  valid_until: date
  subtotal: decimal
  tax: decimal
  total: decimal
  markup_percentage: decimal (nullable)  # For contractor markup
  converted_order_id: FK -> Order (nullable)
  erp_quote_id: string
  created_at: timestamp
  
EstimateLine:
  id: UUID
  estimate_id: FK -> Estimate
  product_id: FK -> Product
  quantity: decimal
  unit_price: decimal
  line_total: decimal
```

### 5. Projects (Combined Job Tags + Addresses)

```yaml
Project:
  id: UUID
  user_id: FK -> User
  name: string  # "123 Oak Street Renovation"
  address: json  # {street, city, state, zip}
  status: enum [ACTIVE, COMPLETED, ARCHIVED]
  color: string  # For UI badge color
  notes: text
  created_at: timestamp
  updated_at: timestamp
  
# Orders and Estimates link to Projects via project_id FK
```

### 6. Billing (Invoices, Statements, Payments)

```yaml
Invoice:
  id: UUID
  invoice_number: string  # "INV-336318"
  user_id: FK -> User
  order_id: FK -> Order
  project_id: FK -> Project (nullable)
  status: enum [OPEN, PARTIAL, PAID, OVERDUE, CREDITED]
  due_date: date
  subtotal: decimal
  tax: decimal
  total: decimal
  amount_paid: decimal
  amount_due: decimal  # Calculated
  erp_invoice_id: string
  created_at: timestamp
  
Statement:
  id: UUID
  user_id: FK -> User
  statement_date: date
  period_start: date
  period_end: date
  opening_balance: decimal
  charges: decimal
  payments: decimal
  closing_balance: decimal
  pdf_url: string
  
Payment:
  id: UUID
  user_id: FK -> User
  payment_method_id: FK -> PaymentMethod
  amount: decimal
  status: enum [PENDING, SETTLED, FAILED, REFUNDED, PARTIAL_REFUND]
  reference_number: string
  invoices: json  # [{invoice_id, amount_applied}]
  initiated_by: FK -> User  # For team payments
  created_at: timestamp
  
PaymentMethod:  # "Wallet"
  id: UUID
  user_id: FK -> User
  type: enum [CARD, ACH]
  nickname: string  # "Visa ending in 4567"
  last_four: string
  is_default: boolean
  billing_address: json
  created_at: timestamp
```



### 7. Team (Crew Management)

```yaml
TeamMember:
  id: UUID
  account_id: FK -> ProAccount
  user_id: FK -> User
  role: enum [OWNER, ADMIN, PURCHASER, VIEWER]
  permissions: json  # {can_order, can_pay, spending_limit, etc.}
  invited_by: FK -> User
  status: enum [PENDING, ACTIVE, DEACTIVATED]
  created_at: timestamp
```

### 8. Reorder History (Quick Reorder Feature)

```yaml
ReorderSuggestion:
  user_id: FK -> User
  product_id: FK -> Product
  last_ordered_at: timestamp
  avg_order_quantity: decimal
  order_frequency_days: integer  # Calculated
  suggested_reorder_date: date
```

---

## API Endpoints

### Authentication
```
POST /api/auth/login                  # Email + password login
POST /api/auth/logout                 # End session
GET  /api/auth/me                     # Current user + account info
```


### My Account Portal

#### Overview (Dashboard)
```
GET  /api/account/overview            # Dashboard summary
  Response: {
    balance_due: decimal,
    credit_available: decimal,
    active_orders_count: integer,
    pending_estimates_count: integer,
    recent_orders: [Order],
    recent_projects: [Project]
  }
```

#### Projects
```
GET  /api/projects                    # List all projects
POST /api/projects                    # Create project
GET  /api/projects/:id                # Project detail with orders/invoices
PUT  /api/projects/:id                # Update project
DELETE /api/projects/:id              # Archive project
GET  /api/projects/:id/orders         # Orders for this project
GET  /api/projects/:id/invoices       # Invoices for this project
```

#### Orders
```
GET  /api/orders                      # Order history (filterable by project, status, date)
GET  /api/orders/:id                  # Order detail with lines
POST /api/orders/:id/reorder          # Quick reorder entire order
GET  /api/orders/:id/tracking         # Delivery tracking info
```

#### Estimates (Quotes)
```
GET  /api/estimates                   # All estimates
GET  /api/estimates/:id               # Estimate detail
POST /api/estimates/:id/accept        # Accept estimate
POST /api/estimates/:id/convert       # Convert to order
POST /api/estimates/:id/markup        # Apply markup percentage
POST /api/estimates/:id/share         # Generate shareable link
```

#### Billing
```
GET  /api/billing/invoices            # All invoices (filterable)
GET  /api/billing/invoices/:id        # Invoice detail
POST /api/billing/invoices/:id/pay    # Pay single invoice
POST /api/billing/invoices/pay-multi  # Pay multiple invoices
GET  /api/billing/statements          # Monthly statements
GET  /api/billing/statements/:id/pdf  # Download statement PDF
GET  /api/billing/payments            # Payment history
```

#### Wallet (Payment Methods)
```
GET  /api/wallet                      # List payment methods
POST /api/wallet                      # Add new payment method
PUT  /api/wallet/:id                  # Update (set default, nickname)
DELETE /api/wallet/:id                # Remove payment method
```



#### Team
```
GET  /api/team                        # List team members
POST /api/team/invite                 # Invite new member
PUT  /api/team/:id                    # Update permissions
DELETE /api/team/:id                  # Remove member
```



### Quick Reorder
```
GET  /api/reorder/suggestions         # AI-suggested reorders
GET  /api/reorder/recent              # Recent order items
POST /api/reorder/quick               # One-click reorder
```

---

## User Stories & UI Interactions

### My Account Portal - User Flows

#### US-001: Dashboard Overview
```
As a Pro customer, I want to see my account summary at a glance
So that I can quickly understand my financial position and active orders.

UI Interactions:
- [VIEW] Balance due card → Click "Pay Now" → Opens payment modal
- [VIEW] Credit available widget
- [VIEW] Active orders list → Click order → Navigate to order detail
- [VIEW] Pending estimates → Click "View" → Navigate to estimate detail
- [ACTION] Quick action: "Pay Balance" button
- [ACTION] Quick action: "Request Estimate" button
```

#### US-002: Projects Management
```
As a Pro customer, I want to organize orders by job site
So that I can track spending and deliveries per project.

UI Interactions:
- [VIEW] Project list with search/filter
- [ACTION] "New Project" button → Opens modal with:
  - [INPUT] Project name (required)
  - [INPUT] Address (autocomplete)
  - [SELECT] Status (Active/Completed)
  - [INPUT] Notes (optional)
  - [SELECT] Color badge
- [VIEW] Project card → Click → Navigate to project detail
- [VIEW] Project detail shows: orders, invoices, documents
- [ACTION] "Edit" button → Opens edit modal
- [ACTION] "Archive" button → Confirmation dialog
```

#### US-003: Order History
```
As a Pro customer, I want to view my order history with filters
So that I can find past orders and reorder products.

UI Interactions:
- [FILTER] Project dropdown
- [FILTER] Status pills (All, Submitted, Confirmed, Shipped, Delivered)
- [FILTER] Date range picker
- [SEARCH] Order number or product search
- [VIEW] Order list with status badges
- [ACTION] Click order → Expand detail or navigate
- [ACTION] "Reorder" button → Adds all items to cart → Toast confirmation
- [ACTION] "Track" button → Shows delivery status
```

#### US-004: Estimates (Quotes)
```
As a Pro customer, I want to manage quotes from my supplier
So that I can review pricing and convert to orders.

UI Interactions:
- [FILTER] Status pills (All, Pending, Accepted, Expired)
- [FILTER] Date range
- [VIEW] Estimate list with amounts and expiry
- [ACTION] "Convert to Order" → Confirmation → Navigate to checkout
- [ACTION] "Markup & Share" → Opens modal:
  - [INPUT] Markup percentage
  - [PREVIEW] New total with markup
  - [ACTION] "Copy Link" or "Email"
- [VIEW] Estimate detail with line items
```

#### US-005: Billing - Invoices
```
As a Pro customer, I want to view and pay invoices
So that I can maintain my account in good standing.

UI Interactions:
- [FILTER] Status (All, Open, Paid, Overdue)
- [FILTER] Project dropdown
- [FILTER] Date range
- [SEARCH] Invoice number
- [SELECT] Checkbox to select multiple invoices
- [VIEW] Invoice row: number, date, project, amount, status
- [ACTION] "Pay" button per invoice → Payment modal
- [ACTION] "Pay Selected" → Multi-invoice payment modal
- [ACTION] "Download" → PDF download
```

#### US-006: Billing - Payments
```
As a Pro customer, I want to see my payment history
So that I can track what I've paid.

UI Interactions:
- [VIEW] Payment history table: date, reference, method, amount, status
- [FILTER] Date range
- [FILTER] Status
- [ACTION] Click payment → View payment detail (which invoices applied)
```

#### US-007: Wallet (Payment Methods)
```
As a Pro customer, I want to manage my saved payment methods
So that I can pay invoices quickly.

UI Interactions:
- [VIEW] List of saved cards/ACH accounts
- [ACTION] "Add Payment Method" → Payment form modal
- [ACTION] "Set as Default" toggle
- [ACTION] "Edit" → Change nickname
- [ACTION] "Remove" → Confirmation dialog
```

#### US-008: Team Management
```
As a Pro account owner, I want to manage who can access my account
So that my crew can place orders within limits.

UI Interactions:
- [VIEW] Team member list with roles
- [ACTION] "Invite Member" → Modal:
  - [INPUT] Email
  - [SELECT] Role (Admin, Purchaser, Viewer)
  - [INPUT] Spending limit (optional)
- [ACTION] Edit member → Update permissions
- [ACTION] Deactivate member → Confirmation
```

---

## ERP Integration Layer

### Sync Strategy

| Data | Direction | Frequency |
|------|-----------|-----------|
| Products/SKUs | ERP → App | Daily batch |
| Inventory | ERP → App | Every 15 min |
| Pricing | ERP → App | Daily batch |
| Customers | ERP ↔ App | Real-time |
| Orders | App → ERP | Real-time |
| Invoices | ERP → App | Hourly |
| Payments | App → ERP | Real-time |

### Integration Pattern

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Frontend   │ ───▶ │  Account Lite │ ───▶ │    ERP /     │
│  (Vanilla)  │      │  API Layer   │      │  ERP API    │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  PostgreSQL  │
                     │  + Redis     │
                     └──────────────┘
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JS (current), future: React/Next.js |
| API | Node.js + Express or Python + FastAPI |
| Database | PostgreSQL |
| Cache | Redis (inventory, sessions) |
| Queue | BullMQ or Celery (ERP sync jobs) |
| Auth | Auth0 or Firebase Auth |
| Payments | Stripe (cards) + Plaid (ACH) |
| Hosting | Vercel (frontend) + Cloud Run (API) |

---

## Next Steps

1. [x] Define My Account Portal data models
2. [x] Document user stories with UI interactions
3. [x] Build Account Portal frontend
4. [ ] Set up PostgreSQL schema with migrations
5. [ ] Build API endpoints (mock data first)
6. [ ] Connect frontend to API
7. [ ] Implement ERP integration

---

