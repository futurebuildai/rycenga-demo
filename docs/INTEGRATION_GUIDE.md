# Backend & Integration Guide: Decoupling Mock Data

This guide outlines the strategy for the backend and integrations team to replace the current mock JSON files with live API endpoints.

## Current Architecture

The frontend is currently "Mock-Driven". Data is fetched from static JSON files in the `/data` directory using standard `fetch()` calls in `account.js`.

### Data Flow
1. Page Loads (`DOMContentLoaded`)
2. `loadAccountData()` is called.
3. `fetch('./data/account.json')` retrieves the structured data.
4. DOM elements are updated via traditional DOM manipulation.

## Migration Path to Live API

### 1. API Endpoint Discovery
The backend team should provide the following RESTful (or equivalent) endpoints:

| Feature | Mock File | Target API Endpoint |
| :--- | :--- | :--- |
| Account Details | `/data/account.json` | `GET /api/v1/account` |
| Orders | (Defined in `account.js`) | `GET /api/v1/orders` |
| Estimates | (Defined in `account.js`) | `GET /api/v1/estimates` |

### 2. Environment Configuration
To decouple the base URL, create an `.env` file (or use a global config object in `index.html`) to define the API root.

```javascript
// Example Config
window.APP_CONFIG = {
  API_BASE_URL: 'https://api.lumberboss.com/v1',
  IS_MOCK: false
};
```

### 3. Update Fetch Logic
Refactor `loadAccountData` to use the base URL.

```javascript
// From:
const response = await fetch('./data/account.json');

// To:
const apiBase = window.APP_CONFIG?.API_BASE_URL || './data';
const response = await fetch(`${apiBase}/account.json`);
```

## JSON Schema Requirements

The frontend expects the following structure for `account.json`:

```json
{
  "user": {
    "firstName": "string",
    "fullName": "string",
    "initials": "string",
    "email": "string",
    "phone": "string"
  },
  "company": {
    "name": "string",
    "limit": "number",
    "available": "number",
    "balance": "number"
  },
  "support": {
    "phone": "string",
    "email": "string"
  },
  "team": [
    {
      "name": "string",
      "email": "string",
      "role": "string",
      "initials": "string"
    }
  ],
  "location": "string"
}
```

## Authentication Handling
When moving to live APIs, ensure the `fetch` calls include the necessary `Authorization` headers.

```javascript
const response = await fetch(`${apiBase}/account`, {
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});
```
