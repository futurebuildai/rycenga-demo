# Lumber Boss - Architecture Standards

> **Source of Truth** for all frontend development. AI agents and developers MUST follow these standards.

---

## Core Philosophy: "Vanilla-Plus"

We use a **zero-build, zero-framework** architecture that maximizes simplicity while enabling scalable component patterns.

| Principle | Rule |
|-----------|------|
| **Zero Build Step** | No Webpack, Vite, or bundlers. Files run directly in browser. |
| **Zero Runtime Dependencies** | No React, Vue, jQuery, or external JS libraries. |
| **ES Modules** | Use native `import/export` with `type="module"` scripts. |
| **Web Components** | Custom elements for reusable UI (future migration). |
| **Tailwind CSS** | Utility-first styling via CDN (future migration). |
| **Design Tokens** | CSS custom properties for all colors, spacing, typography. |

---

## Current State vs. Target State

### Current (v1 - Prototype)
```
├── style.css          # Global styles + design tokens
├── account.css        # Page-specific styles
├── account.js         # IIFE, event handlers
```

### Target (v2 - Vanilla-Plus)
```
├── src/
│   ├── styles/
│   │   ├── tokens.css         # Design tokens only
│   │   ├── base.css           # Reset, typography, layout
│   │   └── utilities.css      # Utility classes (Tailwind-like)
│   ├── components/
│   │   ├── lb-header.js       # Web Component
│   │   ├── lb-account-nav.js  # Web Component
│   │   ├── lb-invoice-row.js
│   │   └── ...
│   ├── services/
│   │   ├── api.js             # Fetch wrapper
│   │   ├── auth.js            # Auth state management
│   │   └── billing.js         # Invoice/payment logic
│   ├── pages/
│   │   └── account.js         # Page controller
│   └── app.js                 # Entry point, component registration
└── account.html
```

---

## Naming Conventions

### Files
| Type | Pattern | Example |
|------|---------|---------|
| Web Component | `lb-{name}.js` | `lb-product-card.js` |
| Service Module | `{name}.js` | `cart.js`, `api.js` |
| Page Controller | `{page}.js` | `products.js` |
| CSS Module | `{purpose}.css` | `tokens.css`, `base.css` |

### Custom Elements
All custom elements use the `lb-` prefix (Lumber Boss):
```html
<lb-header></lb-header>
<lb-invoice-row invoice-id="INV-001"></lb-invoice-row>
```

### CSS Custom Properties
```css
/* Colors */
--lb-color-primary: #1e293b;
--lb-color-accent: #f97316;

/* Spacing */
--lb-space-xs: 0.25rem;
--lb-space-sm: 0.5rem;

/* Typography */
--lb-font-heading: 'Space Grotesk', sans-serif;
--lb-font-body: 'Inter', sans-serif;
```

---

## ES Module Standards

### Imports
```javascript
// ✅ Correct: Use relative paths with .js extension
import { BillingService } from './services/billing.js';
import { LbInvoiceRow } from './components/lb-invoice-row.js';

// ❌ Wrong: Bare specifiers (requires bundler)
import { BillingService } from 'billing';
```

### Exports
```javascript
// ✅ Named exports for services
export class BillingService { ... }

// ✅ Default export for Web Components
export default class LbInvoiceRow extends HTMLElement { ... }
```

### HTML Script Tags
```html
<!-- ✅ Correct: type="module" for ES modules -->
<script type="module" src="./src/app.js"></script>

<!-- ❌ Wrong: Classic script -->
<script src="./src/app.js"></script>
```

---

## Web Component Pattern

### Template
```javascript
// src/components/lb-toast.js
export default class LbToast extends HTMLElement {
  static get observedAttributes() {
    return ['message', 'type'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define('lb-toast', LbToast);
```

### Registration
```javascript
// src/app.js
import LbInventoryBadge from './components/lb-inventory-badge.js';
import LbProductCard from './components/lb-product-card.js';
import LbHeader from './components/lb-header.js';

// Components auto-register via customElements.define()
console.log('Lumber Boss components loaded');
```

---

## Service Module Pattern

### State Management
```javascript
// src/services/billing.js
class BillingService {
  #invoices = [];
  #listeners = new Set();
  
  // Logic for fetching invoices, calculating totals, etc.
}

export const billing = new BillingService();
```

### API Service
```javascript
// src/services/api.js
const BASE_URL = './data'; // Mock data, will become API URL

export async function fetchInvoices() {
  const response = await fetch(`${BASE_URL}/invoices.json`);
  if (!response.ok) throw new Error('Failed to fetch invoices');
  return response.json();
}
```

---

## CSS Standards

### Design Tokens (Required)
All visual properties MUST use CSS custom properties:

```css
/* ✅ Correct */
.button {
  background: var(--lb-color-accent);
  padding: var(--lb-space-md) var(--lb-space-lg);
  border-radius: var(--lb-radius-md);
}

/* ❌ Wrong: Hardcoded values */
.button {
  background: #f97316;
  padding: 16px 24px;
  border-radius: 6px;
}
```

### Scoped Styles
Web Components use Shadow DOM for style encapsulation. Page-level CSS uses BEM-like naming:

```css
/* Component: .component-name */
.product-card { }
.product-card__image { }
.product-card__title { }
.product-card--featured { }
```

---

## Migration Path (Current → Target)

### Phase 1: Extract Services (Non-Breaking)
1. Create `src/services/billing.js` from hardcoded logic
2. Create `src/services/api.js` from fetch logic
3. Import services into account portal controller

### Phase 2: Create Web Components (Incremental)
1. Add `<lb-header>` (shared across portal)
2. Add `<lb-account-nav>`
3. Add `<lb-invoice-row>`

### Phase 3: Adopt Tailwind CSS
1. Add Tailwind CDN to `<head>`
2. Migrate utility classes from `style.css`
3. Keep design tokens as CSS custom properties

---

## Forbidden Patterns

| ❌ DON'T | ✅ DO INSTEAD |
|---------|--------------|
| `document.write()` | DOM manipulation with `innerHTML` or `createElement` |
| `eval()` | Use proper data binding |
| jQuery or Lodash | Native ES6+ methods |
| Global variables | ES Modules with explicit exports |
| Inline `onclick=""` | `addEventListener()` |
| `var` | `const` or `let` |
| `==` | `===` |
| Sync XHR | `fetch()` with async/await |

---

## Versioning

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-22 | Initial architecture standards document |
