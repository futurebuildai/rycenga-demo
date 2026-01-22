# Sprint Tasks: Velocity Frontend-Backend Integration

This document outlines the sprint tasks required to resolve the identified frontend gaps by integrating with the `Velocity/velocity-backend-main` API.

## 1. Integrate Account & Profile Data
**Gap:** Mock account info.  
**Goal:** Replace hardcoded/mocked user and account data with real data from the backend.

**Action Items:**
- [ ] Update the user profile service/store to fetch account details.
- [ ] Replace mock address data with `list-account-addresses`.
- [ ] Replace mock financial data (credit limit, balance) with `get-account-financials`.

**Backend Integration:**
- `GET /accounts` - List accounts (if user manages multiple).
- `GET /accounts/{id}` - Get specific account details.
- `GET /accounts/{id}/addresses` - Get account addresses.
- `GET /accounts/{id}/financials` - Get financial summary (credit info).

---

## 2. Implement Dashboard Summary
**Gap:** Missing dashboard summary API call.  
**Goal:** Populate the dashboard with aggregated metrics from the backend.

**Action Items:**
- [ ] Create a new service method `fetchDashboardSummary()`.
- [ ] Connect the dashboard UI components (Balance Due, Active Orders count) to this real data.
- [ ] Remove any mocked summary counters.

**Backend Integration:**
- `GET /dashboard/summary` - Returns aggregated financial summary and active orders count.

---

## 3. Real "Project" (Job) Data
**Gap:** Projects mocked.  
**Goal:** Fetch "Projects" (referred to as "Jobs" in the backend) from the API.

**Action Items:**
- [ ] Rename/Map frontend "Project" models to backend "Job" schemas if necessary.
- [ ] Implement fetching of the jobs list for the active account.
- [ ] Implement fetching single job details for the project view.

**Backend Integration:**
- `GET /jobs` - List jobs (sub-accounts) for a specific account.
- `GET /jobs/{id}` - Get specific job details.

---

## 4. Real "Estimate" (Quote) Data
**Gap:** Estimate info mocked.  
**Goal:** Fetch "Estimates" (referred to as "Quotes" in the backend) from the API.

**Action Items:**
- [ ] Map frontend "Estimate" concept to backend "Quote" endpoints.
- [ ] Implement listing quotes for the account.
- [ ] Implement fetching single quote details.

**Backend Integration:**
- `GET /quotes` - List quotes.
- `GET /quotes/{id}` - Get quote details.

---

## 5. Fetch Line Items for Estimates & Orders
**Gap:** Line items for estimates and orders stubbed.  
**Goal:** Display actual product line items when viewing an Order or Estimate detail.

**Action Items:**
- [ ] Update Order Detail view to fetch lines from `/orders/{id}/lines`.
- [ ] Update Estimate Detail view to fetch lines from `/quotes/{id}/lines`.
- [ ] Ensure product details (SKU, Description, Quantity, UOM) are correctly mapped.

**Backend Integration:**
- `GET /orders/{id}/lines` - List line items for an order.
- `GET /quotes/{id}/lines` - List line items for a quote.

---

## 6. Fetch Invoice Line Items
**Gap:** Invoice line items missing.  
**Goal:** Display detailed line items when viewing an Invoice.

**Action Items:**
- [ ] Create a service method to fetch invoice lines.
- [ ] Update Invoice Detail component to render the list of items.

**Backend Integration:**
- `GET /invoices/{id}/lines` - List line items for an invoice.

---

## 7. Wallet & Payments Integration
**Gap:** Wallet mocked.  
**Goal:** Show real payment history and enable invoice payment functionality.

**Action Items:**
- [ ] Implement `fetchPayments` to show history in the Wallet/Finance section.
- [ ] Implement `payInvoice` action to allow users to pay specific invoices.
- [ ] (Optional) Display credit details from `get-account-financials` in the Wallet view.

**Backend Integration:**
- `GET /payments` - List past payments.
- `POST /invoices/{id}/pay` - Submit a payment for an invoice.
- `GET /accounts/{id}/financials` - Get credit/wallet details.
