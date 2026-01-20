---
description: Git commit and push workflow - always prompts for /CTO review first
---

# /commit - Git Commit & Push Workflow

This workflow commits and pushes changes to GitHub.

## Step 0: Pre-Flight Check (REQUIRED)

**STOP and ask the user:**

> "Before committing, would you like me to run `/CTO` first to verify code quality and sync documentation?"
>
> - **Yes** → Run `/CTO` protocol, then return here
> - **No** → Proceed to Step 1

**Do NOT skip this step.**

---

## Step 1: Stage Changes

Review what will be committed:

```bash
git status
```

Stage all changes (or specific files if requested):

```bash
git add .
```

## Step 2: Create Commit Message

Follow conventional commit format:

```
<type>: <short description>

<optional body with details>
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `refactor` — Code restructuring
- `style` — Formatting, whitespace
- `chore` — Build, config changes

**Example:**
```
feat: add Web Component architecture (Phase 2.5)

- Created src/services/api.js and cart.js
- Created lb-inventory-badge, lb-toast, lb-product-card components
- Updated products.html and product.html with ES Module scripts
```

## Step 3: Commit

```bash
git commit -m "<message>"
```

## Step 4: Push

```bash
git push origin main
```

If remote is not set:
```bash
git push -u origin main
```

## Step 5: Confirm

Verify the push succeeded:

```bash
git log -1 --oneline
```

Report the commit hash to the user.
