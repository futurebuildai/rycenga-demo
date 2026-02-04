# Task 8 Spec: Phase 2 Verification & Build

**Objective**: Verify that the full Phase 2 deliverable builds, compiles, and does not regress the customer portal.

## Step-by-Step Instructions

1. **TypeScript Check**: Run `tsc --noEmit`. Must pass with zero errors.
2. **Build**: Run `npm run build`. Both `dist/index.html` and `dist/admin.html` must be generated.
3. **Test Suite**: Run `npm run test:run`. All existing tests must pass.
4. **Isolation Check**: Grep `src/admin/` for any imports from `src/components/` or `src/services/` (customer-only modules). Must find zero matches.

## Definition of Done
- Build exits cleanly.
- Both HTML entry points in dist.
- Existing tests pass.
- No cross-boundary imports.
