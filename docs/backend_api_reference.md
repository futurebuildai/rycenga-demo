# Velocity Backend API Reference

This document serves as a spec reference for the Velocity backend API, based on the `router.go` implementation.

## Authentication
- **Bearer Token**: All private routes require `Authorization: Bearer <JWT>` header.
- **Multi-Tenancy**: `X-Tenant-ID` header required for most requests.

## Base Configuration
- **Title**: Velocity API
- **Version**: 1.0.0
- **Base Path**: `/v1`

---

## Endpoints

### Auth
| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/v1/auth/login` | User login | Authenticate a user with email and password. |
| `GET` | `/v1/auth/me` | Get current user | Returns the authenticated user's profile. |
| `POST` | `/v1/auth/change-password` | Change password | Update the authenticated user's password. |

### Accounts
| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/accounts` | List accounts | List all accounts for the authenticated user/tenant. |
| `GET` | `/v1/accounts/{id}` | Get account by ID | Get details for a specific account. |
| `GET` | `/v1/accounts/{id}/addresses` | List account addresses | |
| `GET` | `/v1/accounts/{id}/financials` | Get account financials | Financial summary and credit details. |

### Dashboard
| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/dashboard/summary` | Get dashboard summary | Aggregated financials and active counts. Requires `account_id` query param. |

#### Response Schema: `DashboardSummary`
```json
{
  "accountId": 123,
  "accountName": "ABC Builders",
  "creditLimit": 50000.00,
  "currentBalance": 12500.00,
  "pastDueInvoicesCount": 2,
  "activeOrdersCount": 5,
  "pendingQuotesCount": 3,
  "recentInvoices": [...],
  "recentOrders": [...],
  "recentQuotes": [...]
}
```

### Invoices
| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/invoices` | List invoices | Requires `account_id` query param. |
| `GET` | `/v1/invoices/{id}` | Get invoice by ID | |
| `GET` | `/v1/invoices/{id}/lines` | List invoice lines | |

### Orders
| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/orders` | List orders | Requires `account_id` query param. |
| `GET` | `/v1/orders/{id}` | Get order by ID | |
| `GET` | `/v1/orders/{id}/lines` | List order lines | |

### Quotes (Estimates)
| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/quotes` | List quotes | |
| `GET` | `/v1/quotes/{id}` | Get quote by ID | |
| `GET` | `/v1/quotes/{id}/lines` | List quote lines | |

### Finance
| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/statements` | List statements | |
| `GET` | `/v1/payments` | List payments | |

### Fulfillment
| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/shipments` | List shipments | |
| `GET` | `/v1/shipments/{id}` | Get shipment by ID | |
| `GET` | `/v1/jobs` | List jobs | Sub-accounts. Requires `account_id` query param. |
| `GET` | `/v1/jobs/{id}` | Get job by ID | |

### Products
| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/products` | List products | |
| `GET` | `/v1/products/{id}` | Get product by ID | |

### System
| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/health` | Health check | Returns API and DB health status. |
