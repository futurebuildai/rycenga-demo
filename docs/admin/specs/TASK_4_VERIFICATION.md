# Task 4 Spec: Verification & Build

**Objective**: Verify that the multi-page application builds correctly and that the production assets are generated for both entry points.

**Context**:
- **Build Command**: `npm run build`
- **Output Dir**: `dist/`

## Step-by-Step Instructions

1.  **Run Build**:
    - Execute `npm run build` in the terminal.
    - Watch for errors related to missing modules or path resolution.

2.  **Inspect Output**:
    - Verify `dist/index.html` exists (Customer App).
    - Verify `dist/admin.html` exists (Admin App).
    - Check `dist/assets/`: It should contain JS/CSS chunks.
    - **Guardrail**: Ensure `admin.html` in `dist` has the correct `<script>` tag referencing the bundled admin JS file.

3.  **Preview (Optional but Recommended)**:
    - Run `npm run preview`.
    - Open the browser at the "Network" IP or localhost.
    - Visit `/admin/` -> Should load the Admin App.
    - Visit `/` -> Should load the Customer App.

## Definition of Done
- Build process completes with exit code 0.
- Both HTML entry points are present in the build output.
