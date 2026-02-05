# Task 2 Spec: Admin Source Structure Initialization

**Objective**: Initialize the directory structure and core application scaffolding for the Admin Portal.

**Context**:
- **Target Dir**: `/src/admin`
- **Framework**: Lit (TypeScript)
- **Styles**: Shared theme from `/src/styles/theme.css`

## Backend Integration Contract (Strict Guardrails)
While this task is primarily scaffolding, any future API service initialization coupled with this source structure must point to:
| Context | Endpoint | Method |
| :--- | :--- | :--- |
| **Auth** | `/v1/auth/me` | `GET` |

## Step-by-Step Instructions

1.  **Create Directory Structure**:
    - Create the following folders inside `src/`:
        - `admin/`
        - `admin/components/` (For generic admin UI components)
        - `admin/pages/` (For page-level views)
        - `admin/layouts/` (For the main shell layout)

2.  **Create `src/admin/main.ts`**:
    - **Import**: `../../styles/theme.css` to ensure the brand colors are available.
    - **Import**: The root component (`./pv-admin-app.js`) you are about to create.
    - **Action**: Add a console log `console.log('🪵 Project Velocity Admin initialized');` to verify load.

3.  **Create Root Component `src/admin/pv-admin-app.ts`**:
    - Define a Lit component named `PvAdminApp`.
    - **Tag Name**: `pv-admin-app`.
    - **Content**: For now, just render a simple `<h1>Velocity Admin Portal</h1>` to prove the component mounts.
    - **Styles**: Use standard Lit `css` tag. Apply `display: block; height: 100vh;` to the host.

## Guardrails
- **Naming Convention**: All new files must use kebab-case (e.g., `pv-admin-app.ts`).
- **Dependencies**: Do NOT introduce new npm packages. Use existing Lit and Vite dependencies.
- **Isolation**: Do NOT import components from `src/components/` yet unless they are purely presentational atoms. We want to avoid pulling in existing app business logic.

## Definition of Done
- `src/admin/main.ts` exists.
- `src/admin/pv-admin-app.ts` exists and compiles.
