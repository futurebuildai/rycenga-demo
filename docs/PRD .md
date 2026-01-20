---

# Product Requirements Document (PRD): My Account Lite (Velocity)

**Status:** V1 Implementation Complete

**Project:** Velocity (My Account Lite)

**Last Updated:** January 20, 2026

---

## 1. Executive Summary

**Velocity (My Account Lite)** is a high-performance customer account portal for the LBM industry. It provides essential account management, project tracking, and billing features in a mobile-first package designed to integrate with ERPs like Epicor BisTrack and Spruce.

### 1.1 Key Objectives

* **Native-Speed Web Experience**: Built with Lit for instant loads on mobile.
* **Write-Capability**: Move beyond read-only data, allowing users to manage their profile, team, and payments.
* **ERP-Agnostic Core**: Designed to be served by any headless backend following the state-change contract.

---

## 2. User Roles & Permissions

The portal supports four functional roles for Pro accounts:

| Role | Permissions |
| :--- | :--- |
| **Owner** | Full access to all features, including team management and high-limit billing. |
| **Admin** | Full functional access (Orders, Estimates, Payments). Can view but not manage team roles. |
| **Purchaser** | Can place orders and view account data. No access to billing or team management. |
| **Viewer** | Read-only access to orders and project status. |

---

## 3. Functional Requirements (V1)

### 3.1 Dashboard (Overview)
* **Real-Time Stats**: Display Balance Due, Credit Available, Active Orders, and Pending Estimates.
* **Quick Pay**: A prominent "Pay Now" action that routes to the integrated billing flow.

### 3.2 Account Settings & Security
* **Profile Management**: Users can update their phone number and contact details.
* **Security**: Support for authenticated password changes.
* **Notifications**: Granular toggles for Email, SMS, and Order Update alerts.

### 3.3 Team Management (Admin Only)
* **Invitation Flow**: Send email-based invitations to new crew members.
* **Role Management**: Promote or demote existing team members.
* **Deactivation**: Remove access for former employees immediately.

### 3.4 Orders, Estimates & Projects
* **Search & Filter**: Find records by Project, Status, or Date.
* **Project Tracking**: Jobs are organized by site address, aggregating all related financial data.
* **Digital Assets**: Download formal PDF copies of Estimates and Invoices.

### 3.5 Payments & Wallet
* **Integrated Wallet**: Manage multiple saved payment methods (Cards and ACH Bank Accounts).
* **Invoice Payments**: Pay single or multiple outstanding invoices directly from the portal.
* **Transaction History**: View historical payments and their status (Processing/Settled).

---

## 4. Technical Specifications

### 4.1 Tech Stack
* **Framework**: Lit (Custom Web Components).
* **Language**: TypeScript 5.0 (Strict mode).
* **API Pattern**: Service-oriented architecture with asynchronous "pushes" for all state changes.
* **Styling**: Atomic CSS variables for deep skinning and white-labeling.

### 4.2 Performance
* **Load Time**: < 1s on standard 4G connections.
* **State Management**: Reactive state-driven UI with optimistic updates for low-latency feel.

---

## 5. Security & Multi-Tenancy
* **Zero-Trust Validation**: All user inputs (phone, email, role) are validated on the frontend before API submission.
* **Tenant Isolation**: Every request is tagged with an `X-Tenant-ID` to ensure data remains logically separated between dealer accounts.

---


