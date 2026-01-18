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

## Current State (Phase 2 & Authentication Complete)
The project has completed **Phase 2 (UI Page Review & Customization)** and implemented the **Authentication UI & Logic**. The following pages/components have been audited, polished, and functionally verified:
- **Overview, Projects, Orders, Estimates, Billing, Header UI, Settings, Wallet, Team**.
- **Login screen** with "Boss Lumber & Millwork" branding.
- **Session management** via `localStorage`.

**Next Priority**: Transition to Phase 3 (Backend Mapping & Handoff Spec).
