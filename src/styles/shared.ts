/**
 * Shared Styles - Lit CSS for Shadow DOM Components
 * Provides reusable styles that penetrate Shadow DOM
 */

import { css } from 'lit';

/**
 * CSS Reset and Base Styles
 */
export const resetStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :host {
    display: block;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  input, select, textarea {
    font-family: inherit;
    font-size: inherit;
  }
`;

/**
 * Typography Utilities
 */
export const typographyStyles = css`
  .text-xs { font-size: var(--text-xs); }
  .text-sm { font-size: var(--text-sm); }
  .text-base { font-size: var(--text-base); }
  .text-lg { font-size: var(--text-lg); }
  .text-xl { font-size: var(--text-xl); }
  .text-2xl { font-size: var(--text-2xl); }
  .text-3xl { font-size: var(--text-3xl); }

  .font-heading { font-family: var(--font-heading); }
  .font-body { font-family: var(--font-body); }

  .font-normal { font-weight: 400; }
  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 600; }
  .font-bold { font-weight: 700; }

  .text-muted { color: var(--color-text-muted); }
  .text-light { color: var(--color-text-light); }
  .text-primary { color: var(--color-primary); }
  .text-accent { color: var(--color-accent); }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
`;

/**
 * Button Styles
 */
export const buttonStyles = css`
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-xl);
    font-family: var(--font-heading);
    font-size: var(--text-base);
    font-weight: 600;
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
    cursor: pointer;
    letter-spacing: 0.01em;
    border: none;
    background: none;
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: white;
  }

  .btn-primary:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .btn-cta {
    background-color: var(--color-accent);
    color: white;
    font-weight: 700;
  }

  .btn-cta:hover {
    background-color: var(--color-cta-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .btn-outline {
    background-color: var(--app-btn-outline-bg, transparent);
    color: var(--app-btn-outline-color, var(--color-primary));
    border: 2px solid var(--app-btn-outline-border, var(--color-primary));
  }

  .btn-outline:hover {
    background-color: var(--app-btn-outline-hover-bg, var(--color-primary));
    border-color: var(--app-btn-outline-hover-border, var(--color-primary));
    color: var(--app-btn-outline-hover-color, white);
  }

  .btn-sm {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-sm);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Status Badge Styles
 */
export const badgeStyles = css`
  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: var(--app-badge-padding, 4px 12px);
    font-size: var(--text-xs);
    font-weight: 600;
    border-radius: var(--radius-full);
    white-space: nowrap;
    line-height: 1;
  }

  /* Semantic Status Mappings */
  .status-success,
  .status-delivered,
  .status-paid,
  .status-accepted {
    background: var(--status-success-bg);
    color: var(--status-success-text);
  }

  .status-info,
  .status-confirmed,
  .status-active,
  .status-ready-for-pickup {
    background: var(--status-info-bg);
    color: var(--status-info-text);
  }

  .status-warning,
  .status-pending,
  .status-sent {
    background: var(--status-warning-bg);
    color: var(--status-warning-text);
  }

  .status-accent,
  .status-open {
    background: var(--status-accent-bg);
    color: var(--status-accent-text);
  }

  .status-purple,
  .status-shipped,
  .status-out-for-delivery {
    background: var(--status-purple-bg);
    color: var(--status-purple-text);
  }

  .status-neutral,
  .status-fulfilled,
  .status-draft {
    background: var(--status-neutral-bg);
    color: var(--status-neutral-text);
  }

  .status-error,
  .status-expired,
  .status-cancelled,
  .status-overdue {
    background: var(--status-error-bg);
    color: var(--status-error-text);
  }
`;

/**
 * Layout Utilities
 */
export const layoutStyles = css`
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .items-start { align-items: flex-start; }
  .items-end { align-items: flex-end; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }
  .gap-xs { gap: var(--space-xs); }
  .gap-sm { gap: var(--space-sm); }
  .gap-md { gap: var(--space-md); }
  .gap-lg { gap: var(--space-lg); }
  .gap-xl { gap: var(--space-xl); }
  .flex-1 { flex: 1; }
  .flex-wrap { flex-wrap: wrap; }

  .grid { display: grid; }
  
  .w-full { width: 100%; }
  .h-full { height: 100%; }

  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
`;

/**
 * Form Styles
 */
export const formStyles = css`
  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    margin-bottom: var(--space-md);
  }

  .form-group label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text);
  }

  .form-input {
    width: 100%;
    padding: var(--space-md);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    transition: border-color var(--transition-fast);
  }

  .form-input:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .input-with-icon {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-with-icon svg {
    position: absolute;
    left: var(--space-md);
    color: var(--color-text-muted);
  }

  .input-with-icon input {
    padding-left: calc(var(--space-md) * 2 + 18px);
  }
`;

/**
 * Card Styles
 */
export const cardStyles = css`
  .card {
    background: var(--color-bg-alt);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
  }

  .card-title {
    font-family: var(--font-heading);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text);
  }
`;

/**
 * Modal Styles
 */
export const modalStyles = css`
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal-overlay, 2000);
    padding: var(--space-lg);
  }

  .modal-content {
    width: 100%;
    background: var(--color-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-xl);
    border-bottom: 1px solid var(--color-border);
  }

  .modal-title {
    margin: 0;
    font-family: var(--font-heading);
    font-size: var(--text-xl);
    font-weight: 600;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    transition: all var(--transition-fast);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .close-btn:hover {
    background: var(--color-border);
    color: var(--color-text);
  }

  .modal-body {
    padding: var(--space-xl);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-md);
    padding: var(--space-xl);
    border-top: 1px solid var(--color-border);
  }
`;

/**
 * Page Primitive: Common section shell.
 */
export const pageShellStyles = css`
  .section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--space-xl);
    gap: var(--space-lg);
  }

  .section-title {
    font-family: var(--font-heading);
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: var(--space-xs);
  }

  .section-subtitle {
    color: var(--color-text-muted);
  }
`;

/**
 * Page Primitive: Detail header/card affordances.
 */
export const detailViewStyles = css`
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-xl);
  }

  .btn-back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: var(--app-btn-back-bg, transparent);
    color: var(--app-btn-back-color, var(--color-primary));
    border: 2px solid var(--app-btn-back-border, var(--color-primary));
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-back:hover {
    background: var(--app-btn-back-hover-bg, var(--color-primary));
    border-color: var(--app-btn-back-hover-border, var(--color-primary));
    color: var(--app-btn-back-hover-color, white);
  }

  .detail-card {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    padding: var(--app-surface-padding, var(--space-xl));
  }
`;

/**
 * Page Primitive: Active filter pill bar.
 */
export const activeFilterStyles = css`
  .active-filter-bar {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
    padding: var(--space-sm) var(--space-md);
    background: var(--app-surface-bg, var(--color-bg-alt));
    border: 1px solid var(--color-border);
    border-radius: var(--app-surface-radius, var(--radius-lg));
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .active-filter-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: 600;
    transition: all var(--transition-fast);
  }

  .active-filter-chip button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--app-chip-close-bg, rgba(255, 255, 255, 0.2));
    border: none;
    color: white;
    cursor: pointer;
    padding: 2px 4px;
    margin-left: var(--space-xs);
    border-radius: var(--radius-sm);
    font-size: var(--text-base);
    line-height: 1;
    transition: all var(--transition-fast);
  }

  .active-filter-chip button:hover {
    background: var(--app-chip-close-bg-hover, rgba(255, 255, 255, 0.3));
  }
`;

/**
 * Page Primitive: Pagination row and active page token states.
 */
export const paginationStyles = css`
  .pagination-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-lg);
  }

  .pagination-summary {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .pagination-nav {
    display: flex;
    gap: var(--space-sm);
  }

  .list-refresh-note {
    margin-bottom: var(--space-md);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .pagination-ellipsis {
    align-self: center;
    color: var(--color-text-muted);
  }

  .page-number-btn.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
`;

/**
 * Page Primitive: Shared loading/error row states.
 */
export const listStateStyles = css`
  .line-items-message {
    padding: var(--space-xl);
  }

  .line-items-message.error {
    color: var(--color-error);
  }

  .line-items-retry {
    margin-top: var(--space-md);
  }
`;

export const coreStyles = [
  resetStyles,
  typographyStyles,
  buttonStyles,
  badgeStyles,
  layoutStyles,
  formStyles,
  cardStyles,
  modalStyles,
];

/**
 * Combined shared styles for PvBase
 */
export const sharedStyles = coreStyles;
