# Backend Handoff: Document Management

This document specifies every REST endpoint, DTO, and infrastructure requirement for the **Document Management** feature across both the Admin (Dealer) Portal and the Contractor Portal.

---

## Architecture Overview

```
┌─────────────────────┐                    ┌──────────────────────┐
│   Admin Portal       │                    │  Contractor Portal    │
│   (Dealer)           │                    │  (Customer)           │
├──────────────────────┤                    ├───────────────────────┤
│ Upload & Share ──────┼── SharePayload ──► │ View Shared Docs      │
│                      │                    │ Acknowledge Receipt    │
│ View Inbox ◄─────────┼─ UploadToDealer ──┤ Upload to Dealer      │
│ View Ack Status      │◄── Acknowledge ───┤                       │
│ Assign Inbox Docs    │                    │ Manage Folders         │
└──────────────────────┘                    └───────────────────────┘
              │                                        │
              └────────────── S3 Bucket ───────────────┘
                         (Presigned URLs)
```

---

## 1. Admin (Dealer) Endpoints

Base: `{API_BASE_URL}/admin/documents`

### 1.1 `GET /admin/documents/summary`

Returns aggregate counts for the admin dashboard summary cards.

**Response:**
```json
{
    "totalShared": 42,
    "pendingAck": 5,
    "acknowledgedThisMonth": 12,
    "inboxNeedsAttention": 3
}
```

| Field | Type | Description |
|-------|------|-------------|
| `totalShared` | `number` | Total documents shared with contractors |
| `pendingAck` | `number` | Documents requiring ack that haven't been acknowledged |
| `acknowledgedThisMonth` | `number` | Documents acknowledged in the current calendar month |
| `inboxNeedsAttention` | `number` | Inbox documents not yet assigned to a user |

---

### 1.2 `GET /admin/documents/shared`

Paginated list of documents shared by this dealer with contractor accounts.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | `string` | — | Filter by file name (case-insensitive substring) |
| `status` | `'pending' \| 'acknowledged'` | — | Filter by ack status |
| `sort` | `string` | `'newest'` | One of: `newest`, `oldest`, `name-asc`, `name-desc`, `size-desc`, `size-asc` |
| `page` | `number` | `1` | Page number (1-indexed) |
| `pageSize` | `number` | `10` | Items per page |

**Response:**
```json
{
    "items": [
        {
            "id": 1,
            "tenantId": "tenant-abc",
            "accountId": 100,
            "accountName": "ABC Builders",
            "fileName": "contract-2026.pdf",
            "s3Key": "docs/tenant-abc/shared/abc123.pdf",
            "fileSize": 245760,
            "createdAt": "2026-02-15T10:30:00Z",
            "requiresAck": true,
            "acknowledgedAt": null,
            "status": "pending"
        }
    ],
    "total": 42
}
```

**`SharedDocumentDTO` fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique document ID |
| `tenantId` | `string` | Tenant identifier |
| `accountId` | `number` | Contractor account this doc was shared with |
| `accountName` | `string` | Display name of the contractor account |
| `fileName` | `string` | Original filename |
| `s3Key` | `string` | S3 object key |
| `fileSize` | `number` | File size in bytes |
| `createdAt` | `string` (ISO 8601) | When the document was shared |
| `requiresAck` | `boolean` | Whether contractor must acknowledge receipt |
| `acknowledgedAt` | `string \| null` | ISO timestamp when acknowledged, or `null` |
| `status` | `'pending' \| 'acknowledged'` | Derived: `'acknowledged'` if `acknowledgedAt` is set |

---

### 1.3 `GET /admin/documents/inbox`

Paginated list of documents uploaded by contractors to this dealer.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | `string` | — | Filter by file name |
| `filter` | `'unassigned'` | — | Show only docs with no `assignedUserId` |
| `sort` | `string` | `'newest'` | Same sort options as shared |
| `page` | `number` | `1` | Page number |
| `pageSize` | `number` | `10` | Items per page |

**Response:**
```json
{
    "items": [
        {
            "id": 50,
            "tenantId": "tenant-abc",
            "accountId": 100,
            "accountName": "ABC Builders",
            "fileName": "permit-application.pdf",
            "s3Key": "docs/tenant-abc/inbox/def456.pdf",
            "fileSize": 102400,
            "createdAt": "2026-03-01T14:00:00Z",
            "memo": "Please review the attached permit",
            "attentionTo": "Legal",
            "assignedUserId": null
        }
    ],
    "total": 3
}
```

**`InboxDocumentDTO` extends `DocumentDTO` with:**

| Field | Type | Description |
|-------|------|-------------|
| `memo` | `string \| null` | Note from the contractor |
| `attentionTo` | `string \| null` | Routing label: `"General"`, `"Billing"`, `"Legal"`, or `"Accounting"` |
| `assignedUserId` | `number \| null` | Admin user assigned to handle this doc |

---

### 1.4 `POST /admin/documents/presigned-url`

Generate a presigned S3 URL for the admin to upload a file.

**Request:**
```json
{
    "fileName": "contract-2026.pdf",
    "fileType": "application/pdf"
}
```

**Response:**
```json
{
    "uploadUrl": "https://s3.amazonaws.com/bucket/docs/...?X-Amz-Signature=...",
    "s3Key": "docs/tenant-abc/shared/uuid-contract-2026.pdf"
}
```

---

### 1.5 `POST /admin/documents/share`

Confirm the S3 upload and create the shared document record. This is Step 3 of the 3-step upload flow.

**Request (`SharePayload`):**
```json
{
    "fileName": "contract-2026.pdf",
    "s3Key": "docs/tenant-abc/shared/uuid-contract-2026.pdf",
    "fileSize": 245760,
    "fileType": "application/pdf",
    "accountId": 100,
    "requiresAck": true,
    "memo": "Please review and acknowledge"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fileName` | `string` | Yes | Original filename |
| `s3Key` | `string` | Yes | S3 key returned from presigned URL step |
| `fileSize` | `number` | Yes | File size in bytes |
| `fileType` | `string` | Yes | MIME type (e.g. `application/pdf`) |
| `accountId` | `number` | Yes | Target contractor account ID |
| `requiresAck` | `boolean` | Yes | Whether contractor must acknowledge receipt |
| `memo` | `string` | No | Optional note to the contractor |

**Response:**
```json
{
    "id": 1
}
```

---

### 1.6 `PUT /admin/documents/inbox/{docId}/assign`

Assign an inbox document to an admin user for handling.

**Request:**
```json
{
    "userId": 5
}
```

**Response:**
```json
{
    "success": true
}
```

---

### 1.7 `GET /admin/documents/{docId}/view-url`

Get a presigned view/download URL for any document (shared or inbox).

**Response:**
```json
{
    "viewUrl": "https://s3.amazonaws.com/bucket/docs/...?X-Amz-Signature=...",
    "contentType": "application/pdf"
}
```

---

## 2. Contractor Endpoints

Base: `{API_BASE_URL}/documents`

All contractor endpoints are scoped to the authenticated contractor's account via the JWT token.

### 2.1 `GET /documents/my`

Paginated list of all documents visible to this contractor.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | `string` | — | Filter by file name |
| `tab` | `'shared' \| 'uploads'` | — | Filter by source. Omit for all documents |
| `folderId` | `number` | — | Filter by folder. Omit for all folders |
| `sort` | `string` | `'newest'` | Same sort options as admin |
| `page` | `number` | `1` | Page number |
| `pageSize` | `number` | `20` | Items per page |

**Response:**
```json
{
    "items": [
        {
            "id": 1,
            "fileName": "contract-2026.pdf",
            "fileSize": 245760,
            "createdAt": "2026-02-15T10:30:00Z",
            "folderId": null,
            "source": "dealer",
            "requiresAck": true,
            "acknowledgedAt": null,
            "status": "pending",
            "memo": null,
            "attentionTo": null
        },
        {
            "id": 50,
            "fileName": "permit-application.pdf",
            "fileSize": 102400,
            "createdAt": "2026-03-01T14:00:00Z",
            "folderId": 2,
            "source": "contractor",
            "requiresAck": false,
            "acknowledgedAt": null,
            "status": null,
            "memo": "Please review the attached permit",
            "attentionTo": "Legal"
        }
    ],
    "total": 15
}
```

**`ContractorDocumentDTO` fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique document ID |
| `fileName` | `string` | Original filename |
| `fileSize` | `number` | File size in bytes |
| `createdAt` | `string` (ISO 8601) | Upload/share timestamp |
| `folderId` | `number \| null` | Folder ID, or `null` for root |
| `source` | `'dealer' \| 'contractor'` | Who uploaded this document |
| `requiresAck` | `boolean` | Only relevant for `source='dealer'` |
| `acknowledgedAt` | `string \| null` | When contractor acknowledged, or `null` |
| `status` | `'pending' \| 'acknowledged' \| null` | Ack status for dealer-shared docs |
| `memo` | `string \| null` | Note (from contractor uploads or dealer shares) |
| `attentionTo` | `string \| null` | Routing label (from contractor uploads) |

---

### 2.2 `GET /documents/my/summary`

Aggregate counts for the contractor's document summary bar.

**Response:**
```json
{
    "totalFiles": 15,
    "sharedByDealer": 10,
    "myUploads": 5,
    "pendingAck": 3
}
```

| Field | Type | Description |
|-------|------|-------------|
| `totalFiles` | `number` | Total documents visible to this contractor |
| `sharedByDealer` | `number` | Documents shared by the dealer (`source='dealer'`) |
| `myUploads` | `number` | Documents uploaded by the contractor (`source='contractor'`) |
| `pendingAck` | `number` | Dealer-shared docs with `requiresAck=true` and `acknowledgedAt=null` |

---

### 2.3 `GET /documents/{docId}/view-url`

Get a presigned S3 URL to view/download a document.

**Response:**
```json
{
    "viewUrl": "https://s3.amazonaws.com/bucket/docs/...?X-Amz-Signature=...",
    "contentType": "application/pdf"
}
```

> **Note:** The backend MUST verify that the requesting contractor has access to this document (either shared with them by their dealer, or uploaded by them).

---

### 2.4 `POST /documents/presigned-url`

Generate a presigned S3 URL for the contractor to upload a file to their dealer.

**Request:**
```json
{
    "fileName": "permit-application.pdf",
    "fileType": "application/pdf"
}
```

**Response:**
```json
{
    "uploadUrl": "https://s3.amazonaws.com/bucket/docs/...?X-Amz-Signature=...",
    "s3Key": "docs/tenant-abc/inbox/uuid-permit-application.pdf"
}
```

---

### 2.5 `POST /documents/upload-to-dealer`

Confirm the S3 upload and create the document record. This is Step 3 of the 3-step upload flow.

**Request (`UploadToDealerPayload`):**
```json
{
    "fileName": "permit-application.pdf",
    "s3Key": "docs/tenant-abc/inbox/uuid-permit-application.pdf",
    "fileSize": 102400,
    "fileType": "application/pdf",
    "memo": "Please review the attached permit",
    "attentionTo": "Legal"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fileName` | `string` | Yes | Original filename |
| `s3Key` | `string` | Yes | S3 key from presigned URL step |
| `fileSize` | `number` | Yes | File size in bytes |
| `fileType` | `string` | Yes | MIME type |
| `memo` | `string` | No | Note for the dealer |
| `attentionTo` | `string` | No | One of: `"General"`, `"Billing"`, `"Legal"`, `"Accounting"` |

**Response:**
```json
{
    "id": 50
}
```

> **CRITICAL:** This document must appear in the admin's Inbox tab (`GET /admin/documents/inbox`) as an `InboxDocumentDTO` with the `memo` and `attentionTo` fields preserved.

---

### 2.6 `PUT /documents/{docId}/acknowledge`

Contractor acknowledges receipt of a dealer-shared document.

**Request:** Empty body (no JSON payload needed).

**Response:**
```json
{
    "acknowledgedAt": "2026-03-05T12:00:00Z"
}
```

> **CRITICAL:** After acknowledgment, the corresponding `SharedDocumentDTO` in the admin's shared docs list MUST update:
> - `status`: `"pending"` → `"acknowledged"`
> - `acknowledgedAt`: `null` → ISO timestamp
>
> The admin's summary `pendingAck` count must also decrement and `acknowledgedThisMonth` must increment.

---

### 2.7 `GET /documents/folders`

List all folders created by this contractor.

**Response:**
```json
[
    {
        "id": 1,
        "name": "Permits",
        "createdAt": "2026-01-15T00:00:00Z"
    },
    {
        "id": 2,
        "name": "Contracts",
        "createdAt": "2026-02-01T00:00:00Z"
    }
]
```

---

### 2.8 `POST /documents/folders`

Create a new folder.

**Request:**
```json
{
    "name": "Permits"
}
```

**Response:**
```json
{
    "id": 3,
    "name": "Permits",
    "createdAt": "2026-03-05T10:00:00Z"
}
```

---

### 2.9 `PUT /documents/{docId}/move`

Move a document into a folder (or back to root).

**Request:**
```json
{
    "folderId": 2
}
```

Set `folderId` to `null` to move back to root.

**Response:**
```json
{
    "success": true
}
```

---

## 3. S3 Configuration

### **3-Step Upload Flow (Both Portals)**

```
Frontend                          Backend                         S3
   │                                 │                             │
   ├─ POST /presigned-url ──────────►│                             │
   │  { fileName, fileType }         │─── Generate presigned ─────►│
   │                                 │◄── Return URL + s3Key ──────│
   │◄─ { uploadUrl, s3Key } ─────────│                             │
   │                                 │                             │
   ├─ PUT uploadUrl ─────────────────┼─────────────────────────────►│
   │  (raw file bytes)               │                             │
   │◄─ 200 OK ──────────────────────┼─────────────────────────────│
   │                                 │                             │
   ├─ POST /confirm-upload ─────────►│                             │
   │  { fileName, s3Key, ... }       │─── Create DB record ────────│
   │◄─ { id } ──────────────────────│                             │
```

### **S3 Bucket CORS Configuration (REQUIRED)**

> **The S3 bucket MUST have CORS configured to accept direct `PUT` uploads from the frontend.** Without this, Step 2 (direct browser-to-S3 upload) will fail with CORS errors.

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "GET"],
        "AllowedOrigins": [
            "https://your-production-domain.com",
            "https://admin.your-production-domain.com",
            "http://localhost:5173",
            "http://localhost:5174"
        ],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3600
    }
]
```

> **Action Required:** Replace the `AllowedOrigins` with actual production domains before deployment.

### Presigned URL Requirements

- **Upload URLs** (`uploadUrl`): Must be `PUT`-method presigned URLs with at least 15-minute expiry.
- **View URLs** (`viewUrl`): Must be `GET`-method presigned URLs with at least 15-minute expiry.
- The `Content-Type` header sent in the `PUT` request MUST match the `Content-Type` specified when generating the presigned URL. The frontend sends the file's MIME type (e.g., `application/pdf`).

---

## 4. Cross-Portal Data Synchronization Rules

### Admin Shares Document → Contractor Sees It
When the admin calls `POST /admin/documents/share`:
- A new `SharedDocumentDTO` record is created in the admin's shared docs
- A corresponding `ContractorDocumentDTO` MUST appear in the contractor's `GET /documents/my` response with `source: "dealer"`
- If `requiresAck: true`, the contractor's `pendingAck` summary count must include it

### Contractor Uploads to Dealer → Admin Sees It in Inbox
When the contractor calls `POST /documents/upload-to-dealer`:
- A new `ContractorDocumentDTO` record is created with `source: "contractor"`
- A corresponding `InboxDocumentDTO` MUST appear in the admin's `GET /admin/documents/inbox` response
- The `memo` and `attentionTo` fields MUST be preserved across both views
- The admin's `inboxNeedsAttention` summary count must include it (if `assignedUserId` is null)

### Contractor Acknowledges → Admin Status Updates
When the contractor calls `PUT /documents/{id}/acknowledge`:
- The contractor's doc gets `acknowledgedAt` set and `status: "acknowledged"`
- The admin's `SharedDocumentDTO` for the same document MUST update: `status: "pending" → "acknowledged"`, `acknowledgedAt: null → timestamp`
- Admin summary: `pendingAck` decrements, `acknowledgedThisMonth` increments

---

## 5. Database Schema Guidance

Suggested single `documents` table (or equivalent):

| Column | Type | Description |
|--------|------|-------------|
| `id` | `SERIAL PK` | |
| `tenant_id` | `VARCHAR` | Multi-tenant isolation |
| `account_id` | `INT FK` | The contractor account |
| `direction` | `ENUM('shared', 'inbox')` | `shared` = dealer→contractor, `inbox` = contractor→dealer |
| `file_name` | `VARCHAR` | Original filename |
| `s3_key` | `VARCHAR` | S3 object key |
| `file_size` | `BIGINT` | Bytes |
| `file_type` | `VARCHAR` | MIME type |
| `requires_ack` | `BOOLEAN` | Only for `direction='shared'` |
| `acknowledged_at` | `TIMESTAMPTZ NULL` | When contractor acknowledged |
| `memo` | `TEXT NULL` | Note from uploader |
| `attention_to` | `VARCHAR NULL` | Routing label |
| `assigned_user_id` | `INT FK NULL` | Admin user assigned to inbox doc |
| `folder_id` | `INT FK NULL` | Contractor's folder |
| `created_by_user_id` | `INT FK` | Who uploaded |
| `created_at` | `TIMESTAMPTZ` | |

The `status` field (`'pending' | 'acknowledged'`) should be **derived** from `acknowledged_at IS NULL` rather than stored redundantly.

---

## 6. Error Response Format

All endpoints should return errors as:

```json
{
    "error": "Human-readable error message"
}
```

With appropriate HTTP status codes:
- `400` — Validation errors (missing required fields, invalid values)
- `401` — Unauthorized (expired/invalid token)
- `403` — Forbidden (contractor trying to access another account's docs)
- `404` — Document not found
- `413` — File too large (if enforcing server-side size limits)
- `500` — Internal server error
