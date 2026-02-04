# Task 13 Spec: Phase 3 Router Update & Verification

**Objective**: Update the admin router for account detail route and verify the full Phase 3 build.

## Step-by-Step Instructions

1. **Update `src/admin/router.ts`**: Add `/admin/accounts/:id` → `admin-page-account-details`.
2. **TypeScript Check**: `tsc --noEmit` must pass with zero errors.
3. **Build**: `npm run build`. Both `dist/index.html` and `dist/admin.html` present.
4. **Test Suite**: `npm run test:run`. All existing tests pass.
5. **Isolation Check**: Zero imports from `src/components/` or `src/services/` in admin code.
6. **`any` Audit**: Grep all committed admin files for the `any` type. Must find zero.

## Definition of Done
- Build exits cleanly.
- Tests pass.
- No `any` types in admin code.
- No cross-boundary imports.
