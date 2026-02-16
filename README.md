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
- **Admin Configuration** — `/admin/settings` supports branding metadata and customer portal template selection (Template 1 / Template 2).

## Tech Stack

- **Frontend:** TypeScript, Lit, Vite
- **Styling:** CSS Variables, Shadow DOM
- **State Management:** Reactive Properties (Lit)
- **Fonts:** Space Grotesk + Inter (Google Fonts)

## Styling Architecture

- Global design tokens live in `src/styles/theme.css`.
- Cross-cutting primitives/utilities live in `src/styles/shared.ts`.
- Page style templates live in `src/styles/pages.ts`.
- Page components in `src/components/pages/*` must consume shared/page templates and must not define local `css\`` blocks.
- Inline `style=` attributes are not allowed in page components. Use classes mapped to shared tokens/templates instead.

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
├── styles/             # Theme tokens + shared and page style templates
└── main.ts             # Application entry point
```

## Documentation

- [Backend Architecture](docs/ARCHITECTURE.md) — Data models, API endpoints, user stories
- [Agent Docs](.agent/README.md) — Collaboration notes for AI agents
