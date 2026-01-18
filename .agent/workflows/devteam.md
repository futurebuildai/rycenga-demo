---
description: Activates the Lumber Boss dev agent system prompt for a new session
---

# /devteam - Activate Dev Team Agent

This workflow initializes a new agent session with the Lumber Boss system prompt.

## Activation Steps

When `/devteam` is triggered:

1. **Read the system prompt**
   ```
   Read: .agent/SYSTEM_PROMPT.md
   ```

2. **Follow the mandatory reading order**
   - `.agent/HANDOFF.md` — Previous session's work (READ FIRST)
   - `.agent/CONTEXT.md` — Project goals and design language
   - `.agent/ROADMAP.md` — Current phase and priorities
   - `.agent/DECISIONS.md` — Past decisions
   - `.system-docs/architecture-standards.md` — Vanilla-Plus rules

3. **Report current state**
   After reading docs, provide a brief status:
   - What phase the project is in
   - What was completed last session
   - What the next priority is

4. **Ask for direction**
   ```
   "I've reviewed the project docs. What would you like to work on today?"
   ```

## Example Opening

```
🪵 Lumber Boss Dev Agent initialized.

**Current State:**
- Phase 2.5 (Vanilla-Plus) complete
- Last session: Web Component migration
- Next priority: Cart & Checkout (Phase 3)

What would you like to work on today?
```

## Notes

- This workflow replaces copy-pasting the system prompt
- Agent should behave according to SYSTEM_PROMPT.md rules
- Always ask clarifying questions before implementation
