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
    background-color: transparent;
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
  }

  .btn-outline:hover {
    background-color: var(--color-primary);
    color: white;
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
    padding: 4px 12px;
    font-size: var(--text-xs);
    font-weight: 600;
    border-radius: var(--radius-full);
    white-space: nowrap;
  }

  .status-delivered,
  .status-paid,
  .status-success,
  .status-accepted {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }

  .status-confirmed,
  .status-active,
  .status-ready-for-pickup {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }

  .status-pending,
  .status-sent {
    background: rgba(234, 179, 8, 0.1);
    color: #eab308;
  }

  .status-open {
    background: rgba(249, 115, 22, 0.1);
    color: #f97316;
  }

  .status-shipped,
  .status-out-for-delivery {
    background: rgba(168, 85, 247, 0.1);
    color: #a855f7;
  }

  .status-fulfilled,
  .status-draft {
    background: rgba(71, 85, 105, 0.1);
    color: #475569;
  }

  .status-expired,
  .status-cancelled,
  .status-overdue {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
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
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
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
 * Combined shared styles for PvBase
 */
export const sharedStyles = [
  resetStyles,
  typographyStyles,
  buttonStyles,
  badgeStyles,
  layoutStyles,
  formStyles,
  cardStyles,
];
