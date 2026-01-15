# API Usage Guide

This document explains how to interact with the Velocity REST API.

## Base URL
All requests should be made to:
`https://api.velocity.builderwire.com/v1` (Production)
`http://localhost:80` (Local Development)

## Authentication

Velocity uses API Keys for authentication. You must include your API key in the `X-API-Key` header for every private request.

```http
GET /accounts HTTP/1.1
Host: api.velocity.builderwire.com
X-API-Key: your_api_key_here
```

## Tenancy

Velocity is a multi-tenant system. Most requests require a tenant context. This can be provided in two ways:

### 1. Header (Recommended)
Include the `X-Tenant-ID` header.
```http
X-Tenant-ID: 12345
```

### 2. Subdomain
Use a tenant-specific hostname.
```http
GET /products HTTP/1.1
Host: tenant-name.api.velocity.builderwire.com
```

## Common Query Parameters

- `limit`: (integer) Number of items to return (default: 50, max: 250).
- `offset`: (integer) Number of items to skip for pagination.
- `search`: (string) Filter results by a search term.
- `account_id`: (integer) Required for resource-specific lists (e.g., `/invoices`, `/orders`).

## Resource Groups

### Accounts
Manage customer profiles and job sites.
- `GET /accounts`: List all accessible accounts.
- `GET /accounts/{id}`: Detailed account profile.
- `GET /accounts/{id}/addresses`: Linked shipping and billing locations.

### Sales
Real-time tracking of sales documents.
- `GET /invoices`: View historical and open invoices.
- `GET /orders`: Track active orders and their statuses.
- `GET /quotes`: Review and accept quotes.

### Finance
Financial summaries and payment history.
- `GET /statements`: Monthly financial statements.
- `GET /payments`: History of applied payments.

### Catalog
Browse products and check pricing.
- `GET /products`: Search the product catalog.
- `GET /products/{id}`: Detailed product info with industry-specific UOMs.

## Error Handling

The API returns standard HTTP status codes:
- `200 OK`: Request succeeded.
- `400 Bad Request`: Validation error or missing parameters.
- `401 Unauthorized`: Missing or invalid API Key.
- `403 Forbidden`: Valid API Key but insufficient permissions for the tenant.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: An unexpected error occurred on our end.

Errors come with a JSON body:
```json
{
  "title": "Bad Request",
  "status": 400,
  "detail": "The 'account_id' query parameter is required."
}
```
