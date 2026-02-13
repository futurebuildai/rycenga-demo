# Backend Messaging API Integration

This document describes how the Velocity Admin Portal frontend integrates with the backend Bird communication API.

## Current Backend API

The backend exposes these endpoints for Bird integration:

### POST /v1/communications/messages

Send an SMS or email message via Bird.

**Request Body:**

```json
{
    "channel": "sms",
    "to": "+15551234567",
    "message": "Hello, how can I help you today?",
    "subject": "Optional email subject",
    "reference": "optional-tracking-id",
    "replyTo": "optional-reply-to@email.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `channel` | string | Yes | `"sms"` or `"email"` |
| `to` | string | Yes | Phone (E.164) or email address |
| `message` | string | Yes | Message body |
| `subject` | string | Email only | Required for email |
| `reference` | string | No | External tracking ID |
| `replyTo` | string | No | Reply-to email address |

**Response:**

```json
{
    "id": 123,
    "accountId": null,
    "direction": "outbound",
    "channel": "sms",
    "provider": "bird",
    "providerMessageId": "bird-msg-id",
    "providerChannelId": "bird-channel-id",
    "providerWorkspaceId": "bird-workspace-id",
    "status": "sent",
    "originator": "+15550001234",
    "recipient": "+15551234567",
    "body": "Hello, how can I help you today?",
    "createdAt": "2026-02-12T12:00:00Z"
}
```

---

### GET /v1/communications/messages

List communication messages with optional filters.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `direction` | string | Filter: `"inbound"` or `"outbound"` |
| `channel` | string | Filter: `"sms"` or `"email"` |
| `from` | string | Filter by originator |
| `to` | string | Filter by recipient |
| `limit` | number | Max items (default 25) |
| `offset` | number | Pagination offset |

**Response:**

```json
{
    "items": [
        {
            "id": 123,
            "direction": "inbound",
            "channel": "sms",
            "provider": "bird",
            "originator": "+15551234567",
            "recipient": "+15550001234",
            "body": "Hi, I have a question",
            "status": "received",
            "createdAt": "2026-02-12T11:55:00Z"
        }
    ],
    "total": 45
}
```

---

### POST /webhooks/bird (Internal)

Handles inbound SMS messages from Bird. This is called by Bird when a message is received.

**Supported Events:**
- `sms.inbound` - Inbound SMS message

---

## Frontend Integration Approach

### Virtual Threads

The backend stores **flat messages** without a thread/conversation concept. The frontend creates **virtual threads** by grouping messages by phone number:

1. Fetch all messages from `/v1/communications/messages`
2. Group by contact phone number (originator for inbound, recipient for outbound)
3. Display as conversation threads in the UI

### Thread ID = Phone Number

The frontend uses the phone number as the thread ID:
- `+15551234567` becomes thread ID `+15551234567`
- All messages to/from that number are grouped together

### Features Not Yet Supported by Backend

| Feature | Status | Notes |
|---------|--------|-------|
| Agent Assignment | ❌ Not Implemented | Would need new endpoint |
| Thread Status | ❌ Not Implemented | open/assigned/resolved |
| Read Status | ❌ Not Implemented | Unread count tracking |
| My Threads Filter | ❌ Not Implemented | Requires agent assignment |
| Contact Name | ❌ Not Implemented | Frontend uses phone as name |
| Account Linking | Partial | `accountId` field exists but not populated |

---

## Data Type Mapping

### Backend → Frontend

| Backend Field | Frontend Field | Notes |
|---------------|----------------|-------|
| `id` (number) | `id` (string) | Converted to string |
| `direction` | `direction` | Same: `inbound` / `outbound` |
| `channel` | `channel` | Same: `sms` / `email` |
| `body` | `content.text` | Wrapped in TextContent object |
| `status` | `status` | Mapped to MessageStatus enum |
| `originator` | `senderName` (inbound) | Only for inbound messages |
| `recipient` | Thread ID (outbound) | Used to group messages |
| `createdAt` | `createdAt` | ISO 8601 timestamp |

### Status Mapping

| Backend Status | Frontend Status |
|----------------|-----------------|
| `sent` | `sent` |
| `delivered` | `delivered` |
| `read` | `read` |
| `failed`, `error` | `failed` |
| `pending`, `queued` | `sending` |

---

## Authentication

All endpoints require admin authentication via Bearer JWT token:

```
Authorization: Bearer <jwt_token>
```

The frontend uses `adminClient` which automatically includes the token.

---

## Error Handling

**HTTP Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized |
| 403 | Site admin access required |
| 422 | Bird integration not configured |
| 500 | Server error |

---

## Future Backend Enhancements

To fully support the Messaging Center UI, the backend could add:

### 1. Thread Management

```
POST   /v1/communications/threads          - Create thread
GET    /v1/communications/threads          - List threads
GET    /v1/communications/threads/{id}     - Get thread
PUT    /v1/communications/threads/{id}     - Update thread status
DELETE /v1/communications/threads/{id}     - Archive thread
```

### 2. Agent Assignment

```
GET  /v1/communications/agents                    - List available agents
PUT  /v1/communications/threads/{id}/assign       - Assign agents
PUT  /v1/communications/threads/{id}/read         - Mark as read
```

### 3. Contact Linking

```
PUT /v1/communications/threads/{id}/link-account  - Link to Velocity account
```

---

## Testing the Integration

1. **Verify Bird is configured:** Check integration registry has Bird enabled
2. **Send test SMS:** Use the UI to send a message to a test phone
3. **Check message list:** Verify sent message appears in list
4. **Test inbound:** Send SMS to the Bird number and verify webhook stores it
5. **Verify threading:** Multiple messages to same phone should group together

---

## Phone Number Format

All phone numbers should be in **E.164 format**:
- Format: `+[country code][number]`
- Example: `+15551234567`

The frontend normalizes user input to this format before sending to the backend.
