---
description: Final review and handoff protocol - triggers senior-level code review, documentation sync, and handoff generation
---

# /CTO - Chief Technology Officer Review Protocol

This workflow performs a comprehensive review before session handoff.

## Step 1: Code Quality Audit

Review all work completed this session:

1. **Check for errors** — Scan console output and code for runtime errors
2. **Verify functionality** — Test that features work as intended
3. **Review patterns** — Ensure code follows `.system-docs/architecture-standards.md`
4. **Check for debt** — Identify any shortcuts that need future cleanup
5. **Validate alignment** — Confirm work matches ROADMAP priorities

**If issues found:** Fix them before proceeding.

## Step 2: Documentation Sync

Auto-update all project documentation:

1. **`.agent/ROADMAP.md`** — Mark completed items with `[x]`, add new phases if needed
2. **`.agent/DECISIONS.md`** — Add new `DEC-XXX` entries for significant choices
3. **`.agent/CONTEXT.md`** — Update "Current State" section
4. **`.system-docs/component-registry.json`** — Update if new components created

## Step 3: Generate Handoff Report

Update `.agent/HANDOFF.md` with:

1. **Date and session description**
2. **Complete file structure** (including new files)
3. **This session's work** summary table
4. **Verification status** with proof (screenshots/console logs)
5. **Suggested next steps** prioritized
6. **Known issues/TODOs**

## Step 4: Update System Prompt

If architecture patterns changed, update `.agent/SYSTEM_PROMPT.md`:

1. **Technical Stack** section
2. **Current Project State** section
3. **Your Task** section with new priorities

## Step 5: Self-Audit Checklist

Confirm before closing:

- [ ] All created files are syntactically valid
- [ ] No hardcoded values that should be tokens
- [ ] All new functions have JSDoc comments
- [ ] Console shows no errors
- [ ] localStorage data persists correctly
- [ ] All pages render without console errors
- [ ] Documentation matches actual file structure

## Exit Criteria

Only proceed to handoff when:
- All 98% confidence checks pass
- Documentation 100% reflects current state
- No outstanding bugs or broken functionality

// turbo-all
