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

- **Frontend:** Vanilla HTML, CSS, JavaScript (Account Portal focused)
- **Fonts:** Space Grotesk + Inter (Google Fonts)
- **Design:** Slate/Orange industrial aesthetic

## Getting Started

```bash
# Start local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080/index.html
```

## Folder Structure

```
/
├── index.html          # My Account Portal
├── style.css           # Global styles
├── account.css         # Portal styles
├── account.js          # Portal JS
├── docs/               # Technical documentation
│   └── ARCHITECTURE.md # Backend/DB architecture
└── .agent/             # Agent collaboration docs
    └── README.md       # Instructions for agents
```

## Documentation

- [Backend Architecture](docs/ARCHITECTURE.md) — Data models, API endpoints, user stories
- [Agent Docs](.agent/README.md) — Collaboration notes for AI agents
