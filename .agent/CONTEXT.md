# Project Context

## What is My Account Lite?

My Account Lite is a dedicated Pro customer portal for **LBM (Lumber & Building Materials)** dealers. It is designed to be a standalone widget or subdomain companion to a dealer's existing website. It provides:
- A "My Account" portal for Pro customers (contractors, builders) to manage their business
- Deep integration with dealer ERP systems for orders, billing, and projects

## Target Users

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| **Pro Customer** | Contractor, builder | Account management, credit status, reordering, team access |
| **Admin** | Lumber yard staff | Manage Pro accounts, invoices, and job sites |

## Business Goals

1. **Build Pro loyalty** — Premium account portal with self-service features
2. **Reduce friction** — Project organization, invoice payment, and estimate conversion
3. **Integrate with ERP** — Real-time access to business data (orders, invoices, balances)
4. **Standalone Portability** — Easily deployable as a subdomain or linked widget

## Design Language

- **Color Palette:** Slate (#1e293b) + Orange (#f97316)
- **Typography:** Space Grotesk (headings) + Inter (body)
- **Aesthetic:** Modern industrial, clean, professional
- **Logo:** Hexagon (⬡) + "BOSS LUMBER & MILLWORK"
- **Tagline:** "Pro Customer Portal"

## Technical Context

- **Frontend:** Vanilla HTML/CSS/JS (Standalone Account Portal)
- **Scope:** **Frontend Only**. This repository contains the UI and client-side logic.
- **Backend Strategy:** Map out architecture and API schemas in documentation to ensure a seamless future handoff to a separate backend repository.
- **Architecture Docs:** [.system-docs/](../.system-docs/) (Source of Truth for mapping)
- **Handoff Target:** Go/Postgres backend (planned, but out of scope for this repo)
- **Deployment:** Subdomain widget model

## Current State (Phase 3: Backend Integration in Progress)
The project is currently in **Phase 3 (Backend Mapping & API Integration)**. Key accomplishments include:
- **Account & Profile Integration**: Switched from mock data to real API endpoints for account, financials, and company profile.
- **Service Layer**: Fully implemented `src/connect/services` providing typed access to Sales, Jobs, Billing, and Account APIs.
- **Data Spine Mapping**: Legacy `DataService` refactored to act as a bridge between the new backend API and existing UI components.
- **UI Preparedness**: All core pages (Overview, Projects, Orders, Estimates, Billing, Settings, Wallet, Team) are now connected to the API layer with proper mapping and error handling.
- **Invoice Line Items (Sprint Task #6)**: Fully implemented fetching and rendering of detailed line items in the billing detail view, including 100% backend schema alignment.

**Next Priority**: Finalize authentication plumbing (JWT/X-Tenant-ID) and ERP field sync documentation.
