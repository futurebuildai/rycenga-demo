# Velocity Architecture & Handoff Specification

## Overview

> [!IMPORTANT]
> This repository is a **Modern Frontend** built with Lit and TypeScript. This document defines the architectural patterns used to integrate with a headless backend API, specifically tailored for LBM (Lumber & Building Materials) ERPs like Epicor BisTrack or Spruce.

The system uses a **Service-Oriented Architecture** on the frontend, decoupling UI components from specific API implementations through a consistent service layer and domain model.

---

## Core Data Models

The frontend models defined in `src/connect/types/domain.ts` are the source of truth for communication with the backend.

### 1. Users & Authentication

```typescript
type UserRole = 'tenant_owner' | 'tenant_staff' | 'account_admin' | 'account_user';

interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  isActive: boolean;
  role: UserRole;
  accountId?: number;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
}
```

### 2. Team & Roles

```typescript
type TeamMemberRole = 'owner' | 'admin' | 'purchaser' | 'viewer';

interface TeamMember {
  id: number;
  email: string;
  name: string;
  role: TeamMemberRole;
  initials?: string;
}
```

### 3. Billing & Payments

```typescript
type InvoiceStatus = 'open' | 'paid' | 'overdue' | 'cancelled' | 'void';

interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  total: number;
  balanceDue: number;
  status: InvoiceStatus;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'ach';
  label: string;
  last4: string;
  expiry?: string;
  isDefault: boolean;
}
```

---

## Frontend Architecture

### 1. Service Layer (`src/connect/services/`)

The application is transitioning to a centralized service layer that uses a shared `ApiClient`.

| Service | Responsibility |
|---------|----------------|
| `AuthService` | Login, Logout, Profile updates, Password changes, Notifications |
| `MembersService` | Team member management (Invite, Update, Remove) |
| `BillingService` | Wallet management and Invoice payments |
| `SalesService` | Fetching Orders, Invoices, and Quotes |

### 2. API Client (`src/connect/client.ts`)

A lightweight wrapper around `fetch` that handles:
- Base URL configuration via `VITE_API_URL`
- Automatic injection of `Authorization: Bearer <token>`
- Multi-tenancy support via `X-Tenant-ID` header

### 3. Data Flow Patterns

- **Read Operations**: Components call `DataService` (wrapper) or specific services to fetch data.
- **Write Operations (Pushes)**: Components call service methods directly, implementing:
    - **Loading States**: Visual feedback during the request.
    - **Optimistic UI**: Immediate UI updates for high-latency actions (e.g., toggling notifications).
    - **Error Handling**: Standardized toast notifications via `PvToast`.

### 4. Styling System (`src/styles/`)

The customer portal uses centralized style templates instead of per-page CSS blocks.

| File | Responsibility |
|------|----------------|
| `src/styles/theme.css` | Global design tokens and template-specific variable overrides |
| `src/styles/shared.ts` | Reusable primitives/utilities (layout, badges, forms, pagination, detail/list states) |
| `src/styles/pages.ts` | Page-level style templates consumed by `src/components/pages/*` |

Rules:
- `src/components/pages/*` should compose `PvBase.styles` + shared/page style exports.
- Page components should not define local `css\`` blocks.
- Inline `style=` attributes should be avoided in pages; prefer class-based styling backed by shared tokens.

---

## API Endpoints (Required)

For a full list of required endpoints and JSON schemas, see [BACKEND_HANDOFF.md](./BACKEND_HANDOFF.md).

### Summary of State-Changing Endpoints

| Endpoint | Method | Action |
|----------|--------|--------|
| `/users/{id}` | PUT | Update profile (phone) |
| `/auth/change-password` | POST | Update password |
| `/users/{id}/notifications` | PUT | Update notification prefs |
| `/account/{id}/members/invite` | POST | Invite new member |
| `/account/{id}/members/{id}` | PUT | Update member role |
| `/account/{id}/members/{id}` | DELETE | Remove member |
| `/payment-methods` | POST | Add payment method |
| `/payment-methods/{id}` | DELETE | Remove payment method |
| `/payment-methods/{id}/default` | PUT | Set default payment method |
| `/invoices/{id}/pay` | POST | Pay an invoice |

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| UI Framework | [Lit](https://lit.dev/) (Web Components) |
| Language | TypeScript 5.x |
| Build Tool | Vite |
| Styling | CSS Variables + centralized Lit style templates (`theme.css`, `shared.ts`, `pages.ts`) |
| Iconography | Lucide (as SVG) |

---

## Next Steps for Integration

1. **ERP Mapping**: Map Spruce/BisTrack fields to the `domain.ts` interfaces.
2. **Endpoint Implementation**: Build the API layer documented in [BACKEND_HANDOFF.md](./BACKEND_HANDOFF.md).
3. **Tenant Setup**: Configure environment variables for specific dealer tenants.
