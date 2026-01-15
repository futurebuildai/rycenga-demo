---

# Product Requirements Document (PRD): My Account Lite (Foundation)

**Status:** Work-in-Progress 

**Project:** My Account Lite 

**Last Updated:** January 12, 2026 

---

## 1. Executive Summary

**My Account Lite** is a lightweight, standalone customer account portal designed for quick deployment and easy embedding. It provides essential account management features in a simple, implementation-friendly package aimed at supporting high mobile usage (60%+ target).

### 1.1 Key Objectives

* Provide core account functionality in a minimal footprint.


* Enable white-label deployments for dealer partners via subdomains.


* Deliver a mobile-first, responsive experience that loads instantly even on low-bandwidth connections.



---

## 2. User Personas & Permissions (RBAC)

The portal utilizes a three-role Role-Based Access Control (RBAC) model:

| Role | Permissions | Primary Goals |
| --- | --- | --- |
| **Admin** | Full access; User management; Role assignment.

 | High-level monitoring; managing staff; large balance payments.

 |
| **Manager** | Full functional access (Orders, Estimates, Payments). No user management.

 | Quick balance checks; making site-specific payments.

 |
| **PM** | Read-only access to orders, estimates, and billing. No payment capabilities.

 | Tracking order status; job site coordination.

 |

---

## 3. Functional Requirements (V1)

### 3.1 Dashboard (Overview)

* 
**Account Summary:** Display Balance Due and Credit Available (including limits).


* 
**Core Action:** A prominent "Pay Now" button for the total balance due.


* 
**Activity Cards:** Clickable summaries for Active Orders and Pending Estimates.



### 3.2 Orders & Estimates (Read-Only ERP Data)

* 
**ERP Integration:** Orders and estimates are pulled directly from the dealer ERP.


* 
**Orders Retention:** Visible for 30 days post-fulfillment before moving to invoice-only visibility.


* 
**Status Mapping:** Orders must support statuses including Submitted, Confirmed, Ready for Pickup, Out for Delivery, Delivered, and Fulfilled.


* 
**Actions:** Users (Admin/Manager) can review open estimates and "Accept/Convert to Order".



### 3.3 Billing & Projects

* 
**Three-View Page:** Unified view for Statements, Invoices, and Payment History.


* 
**Payment Tracking:** Track statuses: "Processing", "Settled", and "Rejected".


* 
**Project Tracking:** Dedicated page listing all jobs associated with the account. Database records (Invoices/Orders) must be strictly attached to specific `job_id` or `project_id` fields.



### 3.4 My Team Management

* 
**Visible to:** Admin role only.


* 
**Invite Flow:** Admins invite members via email; portal generates a unique invite link for access via Magic Link/First login.


* 
**Management:** Admins can change roles or revoke access immediately.



---

## 4. Payment & Wallet Framework (Handoff Foundation)

The following requirements establish the UI/UX framework for payments. Technical processor-specific logic (e.g., Run Payments) will be injected into these hooks.

### 4.1 My Wallet Management

* 
**Management:** UI to Add/Remove payment methods (Card and ACH).


* 
**Security Intent:** Design for tokenized storage where raw PII never hits the Portal backend.


* 
**Data Entry:** Implementation must support a **Drawer UI** for adding methods, intended to host secure fields from a 3rd party processor.


* 
**Masking:** Only display Card Brand + Last 4 or Bank Name + Account Type.



### 4.2 Checkout Protocol

* 
**Entry Points:** "Pay Now" on Dashboard, individual "Pay" buttons in Billing List, and "Make Payment" in Detail views.


* 
**Selection:** Users select items to pay (defaults to full statement/invoice).


* 
**UI Choice:** **Drawer-based checkout** for a faster, app-style feel on mobile.


* 
**Lifecycle Status:** 1.  **Portal side:** Immediately update status to "Payment Processing".
2.  **Backend side:** Trigger ERP push; update to "Settled" upon reconciliation or "Rejected" upon failure.



---

## 5. Technical & Engineering Specifications

### 5.1 Tech Stack

* 
**Framework:** Lit (Custom Web Components + Shadow DOM).


* 
**Language:** TypeScript.


* 
**Tooling:** Vite.


* 
**Architecture:** Vanilla-style state management with a Custom Go-based API (Headless).



### 5.2 Theming & Customization (White-Labeling)

* 
**Subdomain Support:** App must run as a standalone widget on dealer subdomains (e.g., `account.dealerwebsite.com`).


* 
**CSS Custom Properties:** Use for deep white-label support including logos, branding, colors, and typography.



### 5.3 Performance Targets

* 
**Initial Load:** < 1s on 3G connections.


* 
**Total Blocking Time:** < 100ms.


* 
**Compatibility:** Chrome, Firefox, Safari (last 2 versions); iOS Safari and Android Chrome.



---

## 6. Build Timeline (Revised Foundation)

* 
**Kickoff:** January 13th, 2026.


* 
**Weeks 1-2:** Customer Facing Portal (Full-stack prototype).


* 
**Weeks 3-4:** Dealer Admin Portal (Separate UI).


* 
**Final Handover:** February 12th, 2026.



**Note for Dev Team:** The specific 3rd party processor integration for the "My Wallet" and "Checkout Drawer" is TBD and will be provided as a secondary module. Core UI state management for "Processing" and "Settled" statuses should be built to receive async updates from the backend.

---


