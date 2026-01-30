# My Account Lite | Frontend

A dedicated, **Frontend-Only** Pro customer portal for LBM (Lumber & Building Materials) dealers, designed to be deployed as a subdomain widget.

## Features

- **My Account Portal** — Full Pro customer dashboard with:
  - Overview dashboard with balance, credit, and activity
  - Projects (combined job sites + addresses)
  - Orders with status tracking and reorder
  - Estimates (quotes) with markup & share
  - Billing (invoices, statements, payment history)
  - Saved product lists
  - Payment methods (Wallet)
  - Team management
  - Settings

## Tech Stack

- **Frontend:** TypeScript, Lit, Vite
- **Styling:** CSS Variables, Shadow DOM
- **State Management:** Reactive Properties (Lit)
- **Fonts:** Space Grotesk + Inter (Google Fonts)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Folder Structure

```
src/
├── components/         # Shared UI components (atoms, molecules)
├── features/           # Feature-based modules (billing, etc.)
├── connect/            # API services and type definitions
├── services/           # Application services (auth, router)
└── main.ts             # Application entry point
```

## Documentation

- [Backend Architecture](docs/ARCHITECTURE.md) — Data models, API endpoints, user stories
- [Agent Docs](.agent/README.md) — Collaboration notes for AI agents
