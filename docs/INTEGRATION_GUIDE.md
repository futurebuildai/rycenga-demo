# Spruce Integration Guide: Bridging Velocity to the Dealer ERP

This guide outlines the technical requirements for integrating the Velocity frontend with a Spruce (Epicor) backend or any modern LBM (Lumber & Building Materials) API.

## Architectural Overview

Historically, the frontend used static JSON files for prototyping. The production version uses a centralized **Service Layer** and an **API Client** designed to communicate with a secure Spruce proxy or a direct headless API.

### Key Integration Points

1.  **Identity Provider (IdP)**: Auth logic matches Spruce user credentials.
2.  **API Gateway**: A middleware layer that maps Velocity frontend requests to Spruce ERP commands.
3.  **Tenant Targeting**: Supporting multiple dealer branches via headers.

---

## 1. Environment Configuration

The frontend is configured via environment variables. For a Spruce dealer deployment, update the following in your deployment environment (or `.env` file):

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://api.sprucedealer.com/v1` | The root of your Spruce API proxy. |
| `VITE_TENANT_ID` | `spruce-branch-01` | The unique ID for the specific dealer/branch. |

---

## 2. Security & Multi-Tenancy

Every request sent by the Velocity `ApiClient` (`src/connect/client.ts`) includes two critical headers:

```http
Authorization: Bearer <user_session_token>
X-Tenant-ID: <dealer_tenant_id>
```

### Authorization
The backend must validate the `Bearer` token against the Spruce session manager. If the token is invalid or expired, return a `401 Unauthorized` response to trigger a frontend logout.

### Tenant Identification
The `X-Tenant-ID` allows a single API gateway to serve multiple Spruce dealers or branch accounts. Use this header to route requests to the correct Spruce database/partition.

---

## 3. Implementing the "Pushes" (Write Actions)

Spruce integrations must support the following state-changing actions. For the full data shapes, refer to [BACKEND_HANDOFF.md](./BACKEND_HANDOFF.md).

### Profile & Security
- **Update Profile**: `PUT /users/{userId}` to update phone numbers.
- **Change Password**: `POST /auth/change-password`.
- **Notification Prefs**: `PUT /users/{userId}/notifications`.

### Team Management
- **Invite Member**: `POST /account/{accountId}/members/invite`.
- **Role Sync**: `PUT /account/{accountId}/members/{memberId}`.
- **Deactivation**: `DELETE /account/{accountId}/members/{memberId}`.

### Payments & Wallet
- **Add Payment Method**: `POST /payment-methods` (Expected to handle tokenization from your processor).
- **Invoice Payment**: `POST /invoices/{invoiceId}/pay`.

---

## 4. Mapping Spruce Data to Velocity

The frontend expects data to follow the interfaces defined in `src/connect/types/domain.ts`. 

### Common Spruce Mapping Tips:

- **Order Statuses**: Map Spruce "Open/Bid" to `pending`, "Contracted" to `confirmed`, and "Invoiced" to the corresponding frontend statuses.
- **Project IDs**: Spruce "Project" or "Job" codes should map to the `projectId` field.
- **Currency**: Ensure all monetary values are sent as numbers (floating point or decimal) rather than formatted strings.

---

## 5. Deployment Verification

After pointing the frontend to your Spruce API:
1.  Run `npm run build` to generate the production bundle.
2.  Deploy the `dist/` folder to your CDN or web server.
3.  Ensure your server implements the **SPA Fallback** (routing all 404s to `index.html`).
