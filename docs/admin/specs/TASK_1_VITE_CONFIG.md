# Task 1 Spec: Vite Configuration & Entry Point Configuration

**Objective**: Configure the project for a multi-page application architecture, strictly enabling a separate entry point for the Admin Portal without disrupting the existing Customer Portal.

**Context**: 
- **Repo**: `/velocity-frontend`
- **Config File**: `vite.config.ts`
- **Existing Entry**: `index.html` (DO NOT MODIFY)
- **New Entry**: `admin.html` (TO BE CREATED)

## Backend Integration Contract (Strict Guardrails)
The Admin App MUST communicate with the following backend endpoints. All API requests are proxied.
| Logic | Frontend Path | Backend Target |
| :--- | :--- | :--- |
| **API Proxy** | `/api/v1/*` | `http://localhost:8080/v1/*` |

**Authentication Note**: The Admin App will share the same `ApiClient` or authentication token mechanism (Bearer JWT) as the main app for Phase 1.

## Step-by-Step Instructions

1.  **Modify `vite.config.ts`**:
    - Locate the `build.rollupOptions.input` configuration.
    - Convert the input from a single string/entry to a dictionary to support multi-page mode.
    - **Key 1 (`main`)**: Should point to `resolve(__dirname, 'index.html')`. This preserves the existing app.
    - **Key 2 (`admin`)**: Should point to `resolve(__dirname, 'admin.html')`. This adds the new app.
    - **Guardrail**: Ensure `server.proxy` configuration applies to ALL routes (e.g., `^/api/v1`) so both apps can access the backend. Do not change the proxy target port (`8080`).

2.  **Create `admin.html`**:
    - Create a new file named `admin.html` in the **project root** (same level as `index.html`).
    - Copy the basic HTML structure (doctype, html, head, body) from `index.html`.
    - **Modification**: Change the `<title>` tag to `Velocity Admin | Project Velocity`.
    - **Modification**: In the `<body>`, ensure there is a root element `<div id="app"></div>` (or whatever ID the main app uses, commonly just body or a specific div).
    - **Modification**: Add a script module tag pointing to the new entry point: `<script type="module" src="/src/admin/main.ts"></script>`.
    - **Guardrail**: Do not reference `/src/main.ts` in this file. It must be completely isolated.

3.  **Validation**:
    - Run `npm run build` (it might fail on the missing `main.ts`, which is expected, or warn).
    - Check that `admin.html` exists physically in the root.

## Definition of Done
- `vite.config.ts` is updated with multiple inputs.
- `admin.html` exists in the root and links to `/src/admin/main.ts`.
