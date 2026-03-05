import { css } from 'lit';

export const overviewPageStyles = css`
  :host {
    display: block;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-lg);
  }

  .stat-card {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    padding: var(--app-surface-padding, var(--space-xl));
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .stat-card-balance {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
  }

  .stat-card-balance .stat-label,
  .stat-card-balance .stat-meta {
    color: rgba(255, 255, 255, 0.8);
  }

  .stat-card-balance .stat-value {
    color: white;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .stat-value {
    font-family: var(--font-heading);
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text);
  }

  .stat-meta {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .stat-action {
    margin-top: auto;
  }

  .credit-progress {
    width: 100%;
    height: 6px;
    appearance: none;
    border: 0;
    border-radius: var(--radius-full);
    overflow: hidden;
    display: block;
  }

  .credit-progress::-webkit-progress-bar {
    background: var(--color-border);
    border-radius: var(--radius-full);
  }

  .credit-progress::-webkit-progress-value {
    background: var(--color-accent);
    border-radius: var(--radius-full);
  }

  .credit-progress::-moz-progress-bar {
    background: var(--color-accent);
    border-radius: var(--radius-full);
  }

  .stat-link {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-accent);
    margin-top: auto;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    text-decoration: none;
  }

  .stat-link:hover {
    color: var(--color-primary);
  }

  .btn-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-md) var(--space-xl);
    background: var(--color-accent);
    color: white;
    font-family: var(--font-heading);
    font-weight: 700;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-base);
  }

  .btn-cta:hover {
    background: var(--color-cta-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .btn-cta:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const adminEntityDetailPageStyles = css`
  :host {
    display: block;
    padding: 2rem;
  }

  .loading-state,
  .empty-state {
    padding: 2rem;
  }

  .empty-state .message {
    margin-top: 2rem;
    color: var(--color-text-muted);
  }

  .back-btn {
    font-size: 1rem;
    color: var(--color-text-muted);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .back-btn:hover {
    color: var(--color-primary);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    margin: 0;
    font-size: 1.875rem;
    font-weight: 600;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .status-badge {
    display: inline-flex;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-Open,
  .status-Sent,
  .status-Processing {
    background: var(--status-info-bg);
    color: var(--status-info-text);
  }

  .status-Paid,
  .status-Shipped {
    background: var(--status-success-bg);
    color: var(--status-success-text);
  }

  .status-Overdue,
  .status-Past,
  .status-Expired {
    background: var(--status-error-bg);
    color: var(--status-error-text);
  }

  .status-Pending {
    background: var(--status-warning-bg);
    color: var(--status-warning-text);
  }

  .status-Draft {
    background: var(--status-neutral-bg);
    color: var(--status-neutral-text);
  }

  .meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    background: var(--admin-card-bg, #ffffff);
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    margin-bottom: 2rem;
  }

  .meta-item label {
    display: block;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 0.25rem;
  }

  .meta-item .value {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .line-items-title {
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--admin-card-bg, #ffffff);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--color-border);
  }

  .data-table th,
  .data-table td {
    text-align: left;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .data-table td {
    color: var(--color-text);
  }

  .data-table th {
    background: var(--color-bg-alt);
    font-weight: 500;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .text-right { text-align: right !important; }
  .text-center { text-align: center; }
  .font-mono {
    font-family: ui-monospace, monospace;
    color: var(--color-text);
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .font-medium { font-weight: 500; }

  .btn-primary {
    text-decoration: none;
    padding: 0.5rem 1rem;
    background: var(--color-primary);
    color: white;
    border-radius: 6px;
  }
`;

export const adminAccountDetailsPageStyles = css`
  :host {
    display: block;
  }

  .back-link {
    display: inline-block;
    text-decoration: none;
    color: var(--color-text-muted, #6b7280);
    font-size: 0.875rem;
    margin-bottom: 1rem;
    transition: color 150ms ease;
  }

  .back-link:hover {
    color: var(--color-text, #0f172a);
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }

  .page-header h2 {
    margin: 0 0 0.5rem;
    color: var(--color-text, #0f172a);
    font-family: var(--font-heading, 'Space Grotesk', sans-serif);
  }

  .account-id {
    color: var(--color-text-muted);
    margin-bottom: 0.75rem;
    font-family: 'Space Mono', monospace;
    font-size: 0.875rem;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-Active { background: var(--status-success-bg); color: var(--status-success-text); }
  .status-Hold { background: var(--status-warning-bg); color: var(--status-warning-text); }
  .status-Overdue { background: var(--status-error-bg); color: var(--status-error-text); }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .card {
    background: var(--admin-card-bg, #ffffff);
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
  }

  .card-elevated {
    position: relative;
    overflow: hidden;
  }

  .card h3 {
    margin: 0 0 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    font-family: var(--font-heading, 'Space Grotesk', sans-serif);
    font-size: 1rem;
  }

  .field {
    margin-bottom: 1rem;
  }

  .field:last-child {
    margin-bottom: 0;
  }

  .label {
    display: block;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    margin-bottom: 0.125rem;
  }

  .value {
    color: var(--color-text);
    font-weight: 500;
  }

  .value-lg {
    font-size: 1.5rem;
    font-weight: 700;
    font-family: var(--font-heading, 'Space Grotesk', sans-serif);
  }

  .value-positive {
    color: var(--app-success-color, #22c55e);
  }

  .financials-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }

  .email-link {
    color: var(--color-primary);
    text-decoration: none;
  }

  .email-link:hover {
    text-decoration: underline;
  }

  .tab-bar {
    display: flex;
    gap: 0;
    border-bottom: 2px solid var(--color-border);
    margin-bottom: 1.5rem;
  }

  .tab-btn {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: var(--font-body, 'Inter', sans-serif);
    color: var(--color-text-muted);
    transition: all 150ms ease;
    position: relative;
    z-index: 10;
  }

  .tab-btn:hover {
    color: var(--color-text);
  }

  .tab-btn.active {
    color: var(--app-billing-tab-active-color, var(--color-accent));
    border-bottom-color: var(--app-billing-tab-active-border, var(--color-accent));
  }

  .tab-content {
    background: var(--admin-card-bg, #ffffff);
    padding: 2rem;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    color: var(--color-text-muted);
    position: relative;
    z-index: 5;
  }

  .error-msg {
    color: var(--color-error);
  }

  .status-stamp {
    position: absolute;
    top: 2rem;
    right: 2rem;
    font-size: 1.5rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.5rem 1rem;
    border: 4px solid;
    border-radius: 8px;
    transform: rotate(-12deg);
    opacity: 0.8;
    pointer-events: none;
    letter-spacing: 2px;
    font-family: 'Space Mono', monospace;
  }

  .stamp-good {
    color: var(--status-success-text);
    border-color: var(--status-success-text);
    background: var(--status-success-bg);
  }

  .stamp-bad {
    color: var(--status-error-text);
    border-color: var(--status-error-text);
    background: var(--status-error-bg);
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .pagination-info {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .pagination-info span {
    font-weight: 600;
    color: var(--color-text);
  }

  .pagination-actions {
    display: flex;
    gap: 0.5rem;
  }

  .pagination-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    transition: all 0.2s;
  }

  .pagination-btn:hover:not(:disabled) {
    border-color: var(--color-primary-light);
    background: var(--color-bg-alt);
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-btn.active {
    background: var(--admin-sidebar-bg);
    color: white;
    border-color: var(--admin-sidebar-bg);
  }

  .btn-primary {
    background: var(--color-cta);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
  }

  .btn-primary:hover { background: var(--color-cta-hover); }

  .btn-message {
    background-color: var(--admin-sidebar-bg) !important;
  }

  .btn-message:hover {
    background-color: var(--color-primary) !important;
  }

  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid var(--color-border); }
  .data-table th { font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-light); font-weight: 600; background: var(--color-bg-alt); }
  .data-table tr:last-child td { border-bottom: none; }

  .row-selected { background: var(--status-accent-bg); }
  .row-selected:hover { background: var(--status-accent-bg) !important; }

  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .font-mono { font-family: 'Space Mono', monospace; letter-spacing: -0.5px; }
  .font-medium { font-weight: 500; }
  .text-muted { color: var(--color-text-light); }
  .text-danger { color: var(--color-error); font-weight: 600; }

  .tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    min-height: 42px;
  }

  .tab-title {
    margin: 0;
    color: var(--color-text-light);
    font-weight: 500;
  }

  .refresh-note {
    margin-bottom: 0.75rem;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .link-primary {
    color: var(--admin-action-link-color, var(--color-primary));
    text-decoration: none;
    font-weight: 500;
  }

  .link-primary-light {
    color: var(--admin-action-link-color, var(--color-primary));
    text-decoration: none;
  }

  .col-checkbox {
    width: 40px;
  }

  .pagination-ellipsis-inline {
    align-self: center;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: var(--admin-card-bg, #ffffff);
    padding: 2rem;
    border-radius: 8px;
    width: 400px;
    box-shadow: var(--shadow-lg);
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    font-family: var(--font-heading);
  }

  .modal-subtitle {
    color: var(--color-text-light);
    font-size: 0.875rem;
  }

  .payment-summary {
    background: var(--color-bg-alt);
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .payment-summary-title {
    color: var(--color-text-light);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .payment-summary-list {
    margin: 0;
    padding-left: 1.25rem;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .payment-summary-note {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .modal-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .btn-secondary {
    background: var(--app-control-bg, #ffffff);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }

  .form-select,
  select.form-select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    margin-top: 0.5rem;
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
    font-family: inherit;
    font-size: 0.875rem;
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
  }

  .modal-lg {
    width: 520px;
    max-height: 85vh;
    overflow-y: auto;
  }

  .form-section {
    margin-bottom: 1rem;
  }

  .form-section-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .checkbox-row {
    display: flex;
    gap: 1.5rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text);
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--color-accent);
  }

  .form-group-inline {
    margin-bottom: 1rem;
  }

  .form-group-inline label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text-muted);
    margin-bottom: 0.25rem;
  }

  .form-hint {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-light);
    margin-top: 0.25rem;
  }

  .btn-preview {
    font-size: 0.8125rem;
    color: var(--color-primary);
    cursor: pointer;
    background: none;
    border: none;
    font-weight: 500;
    padding: 0;
    margin-bottom: 0.75rem;
  }

  .btn-preview:hover {
    text-decoration: underline;
  }

  .preview-box {
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .preview-subject {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--color-text);
  }

  .preview-body {
    color: var(--color-text-muted);
    white-space: pre-wrap;
    line-height: 1.5;
  }

  .payment-summary-total {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border);
    font-size: 0.875rem;
    color: var(--color-text);
  }

  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2000;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: toast-in 200ms ease-out;
  }

  .toast-success { background: var(--color-success); color: white; }
  .toast-error { background: var(--color-error); color: white; }
  .toast-info { background: var(--color-info); color: white; }

  @keyframes toast-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const adminAccountsPageStyles = css`
  :host {
    display: block;
    color: var(--color-text);
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  h2 {
    margin: 0;
    color: var(--color-text);
    font-family: var(--font-heading, 'Space Grotesk', sans-serif);
  }

  .page-subtitle {
    margin-top: 4px;
    color: var(--color-text-muted);
  }

  .search-input {
    padding: 0.5rem 1rem;
    border: 2px solid var(--color-border);
    border-radius: 6px;
    font-size: 0.875rem;
    font-family: var(--font-body, 'Inter', sans-serif);
    min-width: 260px;
    transition: border-color 150ms ease;
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .controls-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .controls-row .spacer {
    margin-left: auto;
  }

  .filter-label {
    font-size: 0.875rem;
    font-weight: 500;
    margin-right: 8px;
    color: var(--color-text);
  }

  .filter-btn {
    padding: 8px 16px;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    transition: all 0.2s;
  }

  .filter-btn:hover {
    border-color: var(--color-primary-light);
    background: var(--color-bg-alt);
  }

  .filter-btn.active {
    background: var(--admin-sidebar-bg);
    color: white;
    border-color: var(--admin-sidebar-bg);
  }

  .sort-select {
    padding: 8px 16px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    background: var(--app-control-bg, #ffffff);
    cursor: pointer;
    outline: none;
    height: 35px;
  }

  .sort-select:focus {
    border-color: var(--color-accent);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: var(--admin-card-bg, #ffffff);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  th, td {
    text-align: left;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  th {
    background: var(--color-bg-alt);
    font-weight: 600;
    font-size: 0.8125rem;
    color: var(--color-text-light);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  tr {
    cursor: pointer;
    transition: background 0.15s;
  }

  tr:hover {
    background: var(--color-bg-alt);
  }

  tr:last-child td {
    border-bottom: none;
  }

  .company-name {
    font-weight: 500;
  }

  .company-id {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .contact-name {
    font-weight: 500;
  }

  .contact-phone {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-Active { background: #dcfce7; color: #166534; }
  .status-Hold { background: #fef3c7; color: #92400e; }
  .status-Overdue { background: #fee2e2; color: #991b1b; }

  .btn-view {
    color: var(--admin-action-link-color, var(--color-primary));
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.875rem;
    font-family: var(--font-body, 'Inter', sans-serif);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .btn-view:hover {
    background: var(--admin-action-link-hover-bg, var(--color-bg-alt));
  }

  .empty-row td {
    text-align: center;
    color: var(--color-text-muted);
    padding: 2rem;
  }

  .metric-value {
    font-family: 'Space Mono', monospace;
    letter-spacing: -0.5px;
  }

  .text-danger {
    color: var(--color-error);
    font-weight: 600;
  }

  .zero-value {
    color: var(--color-text-muted);
  }

  .credit-limit {
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .badge-age {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .age-current { background: #dcfce7; color: #166534; }
  .age-30 { background: #fef9c3; color: #854d0e; }
  .age-60 { background: #ffedd5; color: #9a3412; }
  .age-90 { background: #fee2e2; color: #991b1b; }
  .age-plus { background: #7f1d1d; color: white; }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    padding: 1rem;
    background: var(--admin-card-bg, #ffffff);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
  }

  .pagination-info {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .pagination-info span {
    font-weight: 600;
    color: var(--color-text);
  }

  .pagination-divider {
    margin-left: 1rem;
    color: var(--color-text-muted);
  }

  .per-page-label {
    margin-left: 1rem;
    font-size: 0.875rem;
    color: var(--color-text);
  }

  .per-page-select {
    margin-left: 0.5rem;
    padding: 0.25rem;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
  }

  .pagination-actions {
    display: flex;
    gap: 0.5rem;
  }

  .pagination-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    transition: all 0.2s;
  }

  .pagination-btn:hover:not(:disabled) {
    border-color: var(--color-primary-light);
    background: var(--color-bg-alt);
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-btn.active {
    background: var(--admin-sidebar-bg);
    color: white;
    border-color: var(--admin-sidebar-bg);
  }

  .pagination-ellipsis-inline {
    align-self: center;
    color: var(--color-text-muted);
  }

  .error-msg {
    color: var(--color-error);
  }
`;

export const projectsPageStyles = css`
  :host {
    display: block;
  }

  .filters-bar {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }

  .filter-search {
    flex: 1;
    max-width: 400px;
    padding: var(--space-md);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
  }

  .filter-search:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .filter-select {
    padding: var(--space-md);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--app-control-bg, #ffffff);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--space-lg);
  }

  .project-card {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    padding: var(--app-surface-padding, var(--space-xl));
  }

  .project-card-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .project-badge {
    width: 16px;
    height: 16px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
    margin-top: 4px;
  }

  .project-badge.project-color-1 { background: var(--app-project-color-1); }
  .project-badge.project-color-2 { background: var(--app-project-color-2); }
  .project-badge.project-color-3 { background: var(--app-project-color-3); }
  .project-badge.project-color-4 { background: var(--app-project-color-4); }
  .project-badge.project-color-5 { background: var(--app-project-color-5); }
  .project-badge.project-color-6 { background: var(--app-project-color-6); }

  .project-card-info {
    flex: 1;
  }

  .project-card-info h3 {
    font-family: var(--font-heading);
    font-size: var(--text-lg);
    font-weight: 600;
    margin-bottom: var(--space-xs);
  }

  .project-card-info p {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .project-card-stats {
    display: flex;
    gap: var(--space-xl);
    padding: var(--space-lg) 0;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: var(--space-lg);
  }

  .project-stat {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .stat-number {
    font-family: var(--font-heading);
    font-size: var(--text-xl);
    font-weight: 700;
  }

  .stat-label {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .project-card-actions {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .project-card-actions .btn {
    flex: 1;
    min-width: 80px;
  }

  .loading-state,
  .error-state,
  .empty-state {
    text-align: center;
    padding: var(--space-3xl);
    color: var(--color-text-muted);
  }

  .error-state {
    color: var(--app-danger-color, var(--color-error));
  }
`;

export const ordersPageStyles = css`
  :host {
    display: block;
  }

  .filters-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
    flex-wrap: wrap;
  }

  .filter-chips {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .filter-chip {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .filter-chip:hover {
    border-color: var(--color-accent);
  }

  .filter-chip.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .orders-table {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .order-row {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    padding: var(--space-lg);
    transition: box-shadow var(--transition-fast);
  }

  .order-row:hover {
    box-shadow: var(--shadow-md);
  }

  .order-row-main {
    display: grid;
    grid-template-columns: 140px 160px 1fr 100px 140px 120px;
    align-items: center;
    gap: var(--space-md);
  }

  @media (max-width: 1024px) {
    .order-row-main {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-sm);
    }
  }

  .order-row-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .order-number {
    font-weight: 600;
    color: var(--color-text);
  }

  .order-date {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .order-row-project {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-sm);
  }

  .project-badge {
    width: 10px;
    height: 10px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .project-badge.project-color-1 { background: var(--app-project-color-1); }
  .project-badge.project-color-2 { background: var(--app-project-color-2); }
  .project-badge.project-color-3 { background: var(--app-project-color-3); }
  .project-badge.project-color-4 { background: var(--app-project-color-4); }

  .order-row-summary {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-sm);
    color: var(--color-text-light);
  }

  .order-row-total {
    font-weight: 600;
  }

  .no-job-label {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .detail-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--space-xl);
  }

  .detail-id {
    font-family: var(--font-heading);
    font-size: var(--text-2xl);
    font-weight: 700;
    margin-bottom: var(--space-xs);
  }

  .detail-project-info {
    color: var(--color-text-muted);
  }

  .line-items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--space-lg);
  }

  .line-items-table th,
  .line-items-table td {
    padding: var(--space-md);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }

  .line-items-table th {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .line-item-name {
    font-weight: 500;
  }

  .line-item-sku {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .grand-total-row td {
    font-weight: 700;
    border-bottom: none;
    padding-top: var(--space-md);
  }

  .detail-actions-footer {
    padding-top: var(--space-lg);
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
`;

export const estimatesPageStyles = css`
  :host {
    display: block;
  }

  .filters-bar {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-xl);
    flex-wrap: wrap;
  }

  .filter-chip {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .filter-chip:hover {
    border-color: var(--color-accent);
  }

  .filter-chip.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .estimates-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .estimate-card {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    padding: var(--app-surface-padding, var(--space-xl));
  }

  .estimate-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
  }

  .estimate-info {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .estimate-number {
    font-weight: 600;
    font-size: var(--text-lg);
  }

  .estimate-expiry, .estimate-date {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .estimate-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg) 0;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: var(--space-lg);
  }

  .estimate-products {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .estimate-thumb-placeholder {
    width: 48px;
    height: 48px;
    background: var(--color-border);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
  }

  .estimate-details-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .estimate-project-name {
    font-weight: 500;
  }

  .estimate-summary {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .estimate-total {
    text-align: right;
  }

  .total-label {
    display: block;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .total-value {
    font-family: var(--font-heading);
    font-size: var(--text-2xl);
    font-weight: 700;
  }

  .estimate-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .detail-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--space-xl);
  }

  .detail-id {
    font-family: var(--font-heading);
    font-size: var(--text-2xl);
    font-weight: 700;
    margin-bottom: var(--space-xs);
  }

  .detail-project-info {
    color: var(--color-text-muted);
  }

  .line-items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: var(--space-xl);
  }

  .line-items-table th {
    text-align: left;
    padding: var(--space-md);
    border-bottom: 2px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .line-items-table td {
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }

  .line-item-name {
    font-weight: 500;
  }

  .line-item-sku {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .detail-actions-footer {
    margin-top: var(--space-xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .page-loading {
    display: flex;
    justify-content: center;
    padding: var(--space-2xl);
  }

  .page-error {
    text-align: center;
    padding: var(--space-2xl);
    background: var(--app-danger-strong-bg, #fee2e2);
    border-radius: var(--app-surface-radius, var(--radius-lg));
    color: var(--app-danger-strong-text, #991b1b);
  }

  .page-error-retry {
    margin-top: var(--space-md);
  }
`;

export const billingPageStyles = css`
  :host {
    display: block;
    color: var(--color-text);
  }

  .billing-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  .summary-card {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    padding: var(--space-lg);
  }

  .summary-card.balance {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
  }

  .summary-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-bottom: var(--space-xs);
  }

  .summary-card.balance .summary-label {
    color: rgba(255, 255, 255, 0.8);
  }

  .summary-value {
    font-family: var(--font-heading);
    font-size: var(--text-2xl);
    font-weight: 700;
  }

  .billing-tabs {
    display: flex;
    gap: var(--space-sm);
    border-bottom: 2px solid var(--color-border);
    margin-bottom: var(--space-xl);
  }

  .billing-tab {
    padding: var(--space-md) var(--space-lg);
    background: none;
    border: none;
    font-weight: 500;
    color: var(--color-text-light);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all var(--transition-fast);
  }

  .billing-tab:hover {
    color: var(--color-text);
  }

  .billing-tab.active {
    color: var(--app-billing-tab-active-color, var(--color-primary));
    border-bottom-color: var(--app-billing-tab-active-border, var(--color-primary));
  }

  .invoice-row {
    display: grid;
    grid-template-columns: 40px 1fr 150px 100px 120px 120px;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    margin-bottom: var(--space-md);
    transition: background var(--transition-fast), box-shadow var(--transition-fast);
  }

  .invoice-row.selected {
    background: rgba(var(--color-primary-rgb, 59, 130, 246), 0.06);
    box-shadow: inset 0 0 0 1px var(--color-primary);
  }

  .invoice-row-header {
    display: grid;
    grid-template-columns: 40px 1fr 150px 100px 120px 120px;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-lg);
    margin-bottom: var(--space-xs);
  }

  .invoice-row-header span {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .invoice-row,
    .invoice-row-header {
      grid-template-columns: 32px 1fr 1fr;
    }

    .invoice-row-header {
      display: none;
    }
  }

  .invoice-checkbox {
    width: 18px;
    height: 18px;
    accent-color: var(--color-primary);
    cursor: pointer;
  }

  .bulk-pay-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-bg);
    border-top: 2px solid var(--color-primary);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-xl);
    z-index: 100;
    animation: slideUp 0.25s ease-out;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .bulk-pay-info {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .bulk-pay-count {
    font-weight: 600;
    color: var(--color-text);
  }

  .bulk-pay-total {
    font-family: monospace;
    font-weight: 700;
    font-size: var(--text-lg);
    color: var(--color-primary);
  }

  .bulk-pay-actions {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .btn-clear-selection {
    background: transparent;
    border: 1px solid var(--color-border);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    font-weight: 500;
    transition: all var(--transition-fast);
  }

  .btn-clear-selection:hover {
    border-color: var(--color-text-muted);
    color: var(--color-text);
  }

  .payment-request-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-lg);
    background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.04));
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-lg);
  }

  .payment-request-banner .banner-text {
    font-size: var(--text-sm);
    color: var(--color-text);
    font-weight: 500;
  }

  .payment-request-banner .banner-dismiss {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: var(--text-lg);
    line-height: 1;
    padding: var(--space-xs);
  }

  .invoice-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .invoice-number {
    font-weight: 600;
    color: var(--color-text);
  }

  .invoice-project {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .invoice-amount {
    font-weight: 600;
    color: var(--color-text);
  }

  .detail-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--space-xl);
  }

  .detail-id {
    font-family: var(--font-heading);
    font-size: var(--text-2xl);
    font-weight: 700;
    margin-bottom: var(--space-xs);
  }

  .detail-project-info {
    color: var(--color-text-muted);
  }

  .detail-totals {
    margin-top: var(--space-xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--color-border);
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: var(--space-sm) 0;
  }

  .total-row.grand {
    font-weight: 700;
    font-size: var(--text-lg);
    padding-top: var(--space-md);
    border-top: 2px solid var(--color-border);
  }

  .detail-actions {
    margin-top: var(--space-xl);
    display: flex;
    gap: var(--space-md);
  }

  .line-items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: var(--space-xl);
  }

  .line-items-table th {
    text-align: left;
    padding: var(--space-md);
    border-bottom: 2px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .line-items-table td {
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }

  .line-sku {
    font-family: monospace;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .line-qty {
    text-align: center;
  }

  .line-price,
  .line-total {
    text-align: right;
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-lg);
    padding: var(--space-md) 0;
  }

  .pagination-info {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .pagination-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .pagination-btn {
    padding: var(--space-sm) var(--space-md);
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 500;
    transition: all var(--transition-fast);
  }

  .pagination-btn:hover:not(:disabled) {
    background: var(--app-surface-contrast-bg, #ffffff);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .pagination-btn.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .line-item-name {
    font-weight: 500;
  }

  .line-total-strong {
    font-weight: 600;
  }
`;

export const settingsPageStyles = css`
  :host {
    display: block;
  }

  .settings-section {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    padding: var(--app-surface-padding, var(--space-xl));
    margin-bottom: var(--space-xl);
  }

  .settings-section-title {
    font-family: var(--font-heading);
    font-size: var(--text-lg);
    font-weight: 600;
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }

  .settings-form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-lg);
  }

  @media (max-width: 768px) {
    .settings-form {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .form-group.full-width {
    grid-column: span 2;
  }

  @media (max-width: 768px) {
    .form-group.full-width {
      grid-column: span 1;
    }
  }

  .form-group label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text);
  }

  .form-group input,
  .form-group select {
    padding: var(--space-md);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--app-control-bg, #ffffff);
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .form-group input:read-only {
    background: var(--color-bg);
    color: var(--color-text-muted);
  }

  .form-hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .settings-actions {
    display: flex;
    gap: var(--space-md);
    margin-top: var(--space-lg);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--color-border);
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .toggle-row:last-child {
    border-bottom: none;
  }

  .toggle-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .toggle-label {
    font-weight: 500;
  }

  .toggle-desc {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .sms-consent {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }

  .sms-consent-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text-muted);
    font-size: 11px;
    font-weight: 700;
    cursor: help;
  }

  .sms-consent-label {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .sms-consent-tooltip {
    position: absolute;
    z-index: 10;
    top: calc(100% + 8px);
    left: 0;
    width: min(460px, 85vw);
    padding: 10px 12px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
    font-size: var(--text-xs);
    line-height: 1.45;
    box-shadow: var(--shadow-lg);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-4px);
    transition:
      opacity var(--transition-fast),
      transform var(--transition-fast),
      visibility var(--transition-fast);
  }

  .sms-consent:hover .sms-consent-tooltip,
  .sms-consent:focus-within .sms-consent-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .sms-consent-tooltip a {
    color: var(--color-accent);
  }

  .toggle-switch {
    position: relative;
    width: 48px;
    height: 26px;
    background: var(--color-border);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .toggle-switch.active {
    background: var(--color-accent);
  }

  .toggle-switch.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background: var(--app-control-bg, #ffffff);
    border-radius: var(--radius-full);
    transition: transform var(--transition-fast);
  }

  .toggle-switch.active::after {
    transform: translateX(22px);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const teamPageStyles = css`
  :host {
    display: block;
  }

  .team-actions {
    margin-bottom: var(--space-xl);
  }

  .invite-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal-overlay, 2000);
    background: rgba(15, 23, 42, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
  }

  .invite-modal {
    width: 100%;
    max-width: 520px;
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--color-border);
  }

  .invite-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg) var(--space-xl);
    border-bottom: 1px solid var(--color-border);
  }

  .invite-modal-title {
    margin: 0;
    font-family: var(--font-heading);
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text);
  }

  .invite-modal-close {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    background: transparent;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .invite-modal-close:hover {
    background: var(--color-border);
    color: var(--color-text);
  }

  .invite-modal-body {
    padding: var(--space-xl);
  }

  .invite-modal-body .form-group {
    margin-bottom: var(--space-lg);
  }

  .invite-modal-body .form-group:last-child {
    margin-bottom: 0;
  }

  .invite-role-select {
    width: 100%;
    padding: var(--space-md);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    color: var(--color-text);
    background: var(--app-control-bg, #ffffff);
    transition: border-color var(--transition-fast);
  }

  .invite-role-select:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .invite-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--space-xl);
    border-top: 1px solid var(--color-border);
  }

  @media (max-width: 640px) {
    .invite-modal-header,
    .invite-modal-body,
    .invite-modal-footer {
      padding: var(--space-lg);
    }
  }

  .team-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .team-card {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    padding: var(--app-surface-padding, var(--space-xl));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
  }

  .team-info {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .team-avatar {
    width: 56px;
    height: 56px;
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: var(--text-xl);
  }

  .team-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .team-name {
    font-weight: 600;
    font-size: var(--text-lg);
  }

  .team-email {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .team-role {
    padding: var(--app-badge-padding, 4px 12px);
    background: var(--color-bg);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-light);
  }

  .team-role.owner {
    background: rgba(249, 115, 22, 0.1);
    color: var(--color-accent);
  }

  .team-actions-cell {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .permissions-note {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    padding: var(--space-lg);
    margin-top: var(--space-xl);
  }

  .permissions-note h4 {
    font-family: var(--font-heading);
    margin-bottom: var(--space-sm);
  }

  .permissions-note ul {
    padding-left: var(--space-lg);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .permissions-note li {
    list-style: disc;
    margin-bottom: var(--space-xs);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const walletPageStyles = css`
  :host {
    display: block;
  }

  .wallet-actions {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }

  .payment-methods {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .payment-card {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, var(--radius-lg));
    padding: var(--app-surface-padding, var(--space-xl));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
  }

  .payment-card.default {
    border: 2px solid var(--color-accent);
  }

  .payment-info {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .payment-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
  }

  .payment-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .payment-label {
    font-weight: 600;
  }

  .payment-meta {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .payment-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .default-badge {
    background: var(--color-accent);
    color: white;
    padding: var(--app-badge-padding, 4px 12px);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: 600;
    margin-left: var(--space-md);
  }

  .empty-state {
    text-align: center;
    padding: var(--space-3xl);
    color: var(--color-text-muted);
  }

  .empty-state svg {
    margin-bottom: var(--space-lg);
    color: var(--color-border);
  }

  .empty-state h3 {
    font-family: var(--font-heading);
    color: var(--color-text);
    margin-bottom: var(--space-sm);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading-text {
    color: var(--color-text-muted);
    padding: var(--space-xl);
    text-align: center;
  }

  .error-text {
    color: var(--app-danger-color, var(--color-error));
    padding: var(--space-xl);
    text-align: center;
  }
`;

export const arCenterPageStyles = css`
  :host {
    display: block;
    color: var(--color-text);
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* Summary card color accents */
  .stat-card-outstanding {
    border-top: 3px solid var(--color-info);
  }
  .stat-card-open {
    border-top: 3px solid var(--color-accent);
  }
  .stat-card-collected {
    border-top: 3px solid var(--color-success);
  }
  .stat-card-overdue {
    border-top: 3px solid var(--color-error);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon-outstanding { background: color-mix(in srgb, var(--color-info) 10%, transparent); color: var(--color-info); }
  .stat-icon-open { background: color-mix(in srgb, var(--color-accent) 10%, transparent); color: var(--color-accent); }
  .stat-icon-collected { background: color-mix(in srgb, var(--color-success) 10%, transparent); color: var(--color-success); }
  .stat-icon-overdue { background: color-mix(in srgb, var(--color-error) 10%, transparent); color: var(--color-error); }

  /* Tab bar - reuse from account details pattern */
  .tab-bar {
    display: flex;
    gap: 0;
    border-bottom: 2px solid var(--color-border);
    margin-bottom: 1.5rem;
  }

  .tab-btn {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: var(--font-body, 'Inter', sans-serif);
    color: var(--color-text-muted);
    transition: all 150ms ease;
    position: relative;
  }

  .tab-btn:hover { color: var(--color-text); }

  .tab-btn.active {
    color: var(--color-accent);
    border-bottom-color: var(--color-accent);
  }

  /* Controls row */
  .controls-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .controls-row .spacer { margin-left: auto; }

  .filter-pills {
    display: flex;
    gap: 0.5rem;
  }

  .filter-pill {
    padding: 6px 14px;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text-muted);
    transition: all 0.2s;
  }

  .filter-pill:hover {
    border-color: var(--color-primary-light);
    color: var(--color-text);
  }

  .filter-pill.active {
    background: var(--admin-sidebar-bg);
    color: white;
    border-color: var(--admin-sidebar-bg);
  }

  .search-input {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 0.8125rem;
    font-family: var(--font-body, 'Inter', sans-serif);
    min-width: 220px;
    transition: border-color 150ms ease;
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .sort-select {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text);
    background: var(--app-control-bg, #ffffff);
    cursor: pointer;
    outline: none;
  }

  .sort-select:focus {
    border-color: var(--color-accent);
  }

  /* Data table */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; }
  .data-table th { font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-light); font-weight: 600; background: var(--color-bg-alt); letter-spacing: 0.03em; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tbody tr { cursor: pointer; transition: background 0.15s; }
  .data-table tbody tr:hover { background: var(--color-bg-alt); }

  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .font-mono { font-family: 'Space Mono', monospace; letter-spacing: -0.5px; }
  .text-muted { color: var(--color-text-light); }

  .link-primary {
    color: var(--admin-action-link-color, var(--color-primary));
    text-decoration: none;
    font-weight: 500;
  }
  .link-primary:hover { text-decoration: underline; }

  /* Status badges */
  .status-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .status-sent { background: var(--status-warning-bg); color: var(--status-warning-text); }
  .status-viewed { background: var(--status-info-bg); color: var(--status-info-text); }
  .status-paid { background: var(--status-success-bg); color: var(--status-success-text); }
  .status-partially_paid { background: var(--status-accent-bg); color: var(--status-accent-text); }
  .status-overdue { background: var(--status-error-bg); color: var(--status-error-text); }
  .status-cancelled { background: var(--status-neutral-bg); color: var(--status-neutral-text); }

  .invoice-badge {
    display: inline-block;
    padding: 2px 8px;
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: 'Space Mono', monospace;
    margin-right: 4px;
    margin-bottom: 2px;
  }

  /* Card wrapper for table */
  .table-card {
    background: var(--admin-card-bg, #ffffff);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .table-card-body {
    padding: 0;
  }

  /* Pagination */
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .pagination-info {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .pagination-info span { font-weight: 600; color: var(--color-text); }

  .pagination-actions {
    display: flex;
    gap: 0.5rem;
  }

  .pagination-btn {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text);
    transition: all 0.2s;
  }

  .pagination-btn:hover:not(:disabled) {
    border-color: var(--color-primary-light);
    background: var(--color-bg-alt);
  }

  .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .pagination-btn.active {
    background: var(--admin-sidebar-bg);
    color: white;
    border-color: var(--admin-sidebar-bg);
  }

  .pagination-ellipsis {
    align-self: center;
    color: var(--color-text-muted);
    font-size: 0.8125rem;
  }

  /* Action buttons */
  .btn-action {
    padding: 4px 10px;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-muted);
    transition: all 0.15s;
    margin-right: 4px;
  }

  .btn-action:hover {
    border-color: var(--color-primary-light);
    color: var(--color-text);
    background: var(--color-bg-alt);
  }

  .btn-action-danger:hover {
    border-color: var(--color-error);
    color: var(--color-error);
    background: color-mix(in srgb, var(--color-error) 5%, transparent);
  }

  /* Header row */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .page-header h2 {
    margin: 0;
    font-family: var(--font-heading, 'Space Grotesk', sans-serif);
  }

  .page-subtitle {
    color: var(--color-text-muted);
    margin-top: 4px;
    font-size: 0.875rem;
  }

  .btn-primary {
    background: var(--color-cta);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.875rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s;
  }

  .btn-primary:hover { background: var(--color-cta-hover); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-secondary {
    background: var(--app-control-bg, #ffffff);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s;
  }

  .btn-secondary:hover { background: var(--color-bg-alt); }

  /* Header action buttons */
  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2000;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: toast-in 200ms ease-out;
  }

  .toast-success { background: var(--color-success); color: white; }
  .toast-error { background: var(--color-error); color: white; }
  .toast-info { background: var(--color-info); color: white; }

  @keyframes toast-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .toast-out {
    animation: toast-out 300ms ease forwards;
  }

  @keyframes toast-out {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(12px); }
  }

  /* Drawer */
  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1000;
    animation: fade-in 200ms ease;
  }

  .drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 480px;
    max-width: 90vw;
    background: var(--admin-card-bg, #ffffff);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
    z-index: 1001;
    display: flex;
    flex-direction: column;
    animation: slide-in 250ms ease;
  }

  @keyframes slide-in {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .drawer-overlay.closing {
    animation: fade-out 200ms ease forwards;
  }

  .drawer.closing {
    animation: slide-out 200ms ease forwards;
  }

  @keyframes slide-out {
    from { transform: translateX(0); }
    to { transform: translateX(100%); }
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .drawer-title {
    font-family: var(--font-heading);
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  .drawer-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: none;
    border: none;
    transition: all 0.15s;
  }

  .drawer-close:hover {
    background: var(--color-bg-alt);
    color: var(--color-text);
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .drawer-section {
    margin-bottom: 1.5rem;
  }

  .drawer-section-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-light);
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .drawer-field {
    margin-bottom: 0.75rem;
  }

  .drawer-field-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-bottom: 0.125rem;
  }

  .drawer-field-value {
    font-size: 0.875rem;
    color: var(--color-text);
  }

  .drawer-amount {
    font-family: var(--font-heading);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .drawer-amount-remaining {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  .drawer-invoices {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .drawer-invoice {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: var(--color-bg-alt);
    border-radius: 6px;
    font-size: 0.8125rem;
  }

  .drawer-invoice-paid {
    color: var(--status-success-text);
    font-weight: 500;
    font-size: 0.75rem;
  }

  .drawer-message {
    background: var(--color-bg-alt);
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    line-height: 1.5;
    white-space: pre-wrap;
    color: var(--color-text-muted);
  }

  .drawer-footer {
    display: flex;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  /* Timeline */
  .timeline {
    position: relative;
    padding-left: 24px;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 4px;
    bottom: 4px;
    width: 2px;
    background: var(--color-border);
  }

  .timeline-event {
    position: relative;
    margin-bottom: 1rem;
    font-size: 0.8125rem;
  }

  .timeline-event:last-child {
    margin-bottom: 0;
  }

  .timeline-dot {
    position: absolute;
    left: -20px;
    top: 3px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    background: var(--admin-card-bg, #ffffff);
  }

  .timeline-dot-success { border-color: var(--color-success); background: color-mix(in srgb, var(--color-success) 15%, var(--admin-card-bg, #ffffff)); }
  .timeline-dot-info { border-color: var(--color-info); background: color-mix(in srgb, var(--color-info) 15%, var(--admin-card-bg, #ffffff)); }
  .timeline-dot-warning { border-color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 15%, var(--admin-card-bg, #ffffff)); }
  .timeline-dot-error { border-color: var(--color-error); background: color-mix(in srgb, var(--color-error) 15%, var(--admin-card-bg, #ffffff)); }

  .timeline-label {
    color: var(--color-text);
    font-weight: 500;
  }

  .timeline-date {
    color: var(--color-text-muted);
    font-size: 0.75rem;
    margin-top: 2px;
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .modal {
    background: var(--admin-card-bg, #ffffff);
    padding: 2rem;
    border-radius: 8px;
    width: 480px;
    max-width: 90vw;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    font-family: var(--font-heading);
  }

  .modal-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .form-group-inline {
    margin-bottom: 1rem;
  }

  .form-group-inline label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text-muted);
    margin-bottom: 0.25rem;
  }

  .form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
    font-family: inherit;
    font-size: 0.875rem;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
  }

  .form-hint {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-light);
    margin-top: 0.25rem;
  }

  .throttle-warning {
    background: var(--status-warning-bg, #fef3c7);
    border: 1px solid var(--status-warning-text, #fbbf24);
    color: var(--status-warning-text, #92400e);
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    margin-bottom: 1rem;
  }

  .reminder-count {
    color: var(--color-text-muted);
    font-size: 0.8125rem;
    margin-bottom: 1rem;
  }

  /* Bulk send wizard */
  .wizard-steps {
    display: flex;
    gap: 0;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 1rem;
  }

  .wizard-step {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .wizard-step.active {
    color: var(--color-accent);
    font-weight: 600;
  }

  .wizard-step.completed {
    color: var(--color-success);
  }

  .wizard-step-number {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--color-bg-alt);
    border: 2px solid var(--color-border);
  }

  .wizard-step.active .wizard-step-number {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: white;
  }

  .wizard-step.completed .wizard-step-number {
    background: var(--color-success);
    border-color: var(--color-success);
    color: white;
  }

  .condition-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .condition-card {
    padding: 1rem;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    background: var(--app-control-bg, #ffffff);
  }

  .condition-card:hover {
    border-color: var(--color-primary-light);
  }

  .condition-card.selected {
    border-color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 5%, transparent);
  }

  .condition-card-title {
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .condition-card-desc {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .preview-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .preview-account {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.8125rem;
  }

  .preview-account:last-child { border-bottom: none; }

  .progress-bar-container {
    background: var(--color-bg-alt);
    border-radius: 6px;
    height: 8px;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .progress-bar {
    height: 100%;
    background: var(--color-accent);
    border-radius: 6px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    text-align: center;
    margin-bottom: 1rem;
  }

  /* Automation table styles */
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 22px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: var(--color-border);
    border-radius: 22px;
    transition: background 0.2s;
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .toggle-switch input:checked + .toggle-slider {
    background: var(--color-success);
  }

  .toggle-switch input:checked + .toggle-slider::before {
    transform: translateX(18px);
  }

  .condition-badge {
    display: inline-block;
    padding: 3px 10px;
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* Expandable row metrics */
  .expand-row {
    background: var(--color-bg-alt);
  }

  .expand-content {
    padding: 1rem 1.5rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .metric-card {
    text-align: center;
  }

  .metric-value {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .metric-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  /* CSS bar chart */
  .bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 60px;
    padding: 0;
  }

  .bar {
    flex: 1;
    background: var(--color-accent);
    border-radius: 2px 2px 0 0;
    min-height: 4px;
    transition: height 0.3s ease;
    opacity: 0.7;
  }

  .bar:hover {
    opacity: 1;
  }

  .bar-chart-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.625rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  /* Loading skeleton */
  .skeleton {
    background: linear-gradient(90deg, var(--color-bg-alt) 25%, var(--color-border) 50%, var(--color-bg-alt) 75%);
    background-size: 200% 100%;
    animation: skeleton-pulse 1.5s ease infinite;
    border-radius: 4px;
  }

  .skeleton-card {
    height: 100px;
    border-radius: 8px;
  }

  .skeleton-row {
    height: 48px;
    margin-bottom: 4px;
  }

  @keyframes skeleton-pulse {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-muted);
  }

  .empty-state h3 {
    font-family: var(--font-heading);
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  /* Error state */
  .error-state {
    text-align: center;
    padding: 2rem;
    color: var(--color-error);
  }

  .error-state button {
    margin-top: 0.75rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .controls-row { flex-direction: column; align-items: stretch; }
    .filter-pills { overflow-x: auto; }
    .search-input { min-width: unset; width: 100%; }
    .data-table { font-size: 0.8125rem; }
    .data-table th, .data-table td { padding: 8px; }
    .drawer { width: 100%; }
    .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    .header-actions { flex-direction: column; }
    .condition-cards { grid-template-columns: 1fr; }
  }

  @media (max-width: 480px) {
    .page-header { flex-direction: column; gap: 1rem; }
    .pagination { flex-direction: column; gap: 0.75rem; }
    .modal { width: 95vw; padding: 1.25rem; }
  }
`;

export const docsPageStyles = css`
  /* File icon indicators */
  .file-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  .file-icon-pdf { background: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
  .file-icon-doc { background: color-mix(in srgb, #3b82f6 12%, transparent); color: #3b82f6; }
  .file-icon-xls { background: color-mix(in srgb, #22c55e 12%, transparent); color: #22c55e; }
  .file-icon-img { background: color-mix(in srgb, #a855f7 12%, transparent); color: #a855f7; }
  .file-icon-default { background: var(--color-bg-alt); color: var(--color-text-muted); }

  /* Document name cell */
  .doc-name-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .doc-name-link {
    color: var(--admin-action-link-color, var(--color-primary));
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .doc-name-link:hover { text-decoration: underline; }

  .doc-name-meta {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  /* Attention badges for inbox */
  .attention-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .attention-badge-billing { background: color-mix(in srgb, #3b82f6 12%, transparent); color: #3b82f6; }
  .attention-badge-legal { background: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
  .attention-badge-general { background: color-mix(in srgb, #22c55e 12%, transparent); color: #22c55e; }
  .attention-badge-accounting { background: color-mix(in srgb, #f97316 12%, transparent); color: #f97316; }

  /* Summary stat card variants */
  .stat-card-total-shared { border-top: 3px solid #3b82f6; }
  .stat-card-pending-ack { border-top: 3px solid #f97316; }
  .stat-card-acknowledged { border-top: 3px solid #22c55e; }

  /* Status badges for shared docs */
  .status-acknowledged { background: var(--status-success-bg); color: var(--status-success-text); }
  .status-pending { background: var(--status-warning-bg); color: var(--status-warning-text); }

  /* Tab count badge */
  .tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    font-size: 0.6875rem;
    font-weight: 600;
    background: var(--color-cta);
    color: white;
    margin-left: 6px;
  }

  /* Upload modal */
  .upload-modal {
    width: 540px;
  }

  .upload-modal-subtitle {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .upload-modal-close {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1.25rem;
    transition: all 0.15s;
  }

  .upload-modal-close:hover {
    background: var(--color-bg-alt);
    color: var(--color-text);
  }

  .upload-dropzone {
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 1.5rem;
    background: var(--app-control-bg, #ffffff);
  }

  .upload-dropzone:hover,
  .upload-dropzone.dragover {
    border-color: var(--color-cta);
    background: color-mix(in srgb, var(--color-cta) 4%, transparent);
  }

  .upload-dropzone-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 0.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--color-cta) 10%, transparent);
    color: var(--color-cta);
  }

  .upload-dropzone-text {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.25rem;
  }

  .upload-dropzone-hint {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    margin-bottom: 0.75rem;
  }

  .upload-browse-btn {
    display: inline-block;
    padding: 6px 16px;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text);
    transition: all 0.15s;
  }

  .upload-browse-btn:hover {
    background: var(--color-bg-alt);
    border-color: var(--color-primary-light);
  }

  /* File preview in upload modal */
  .upload-file-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--color-bg-alt);
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .upload-file-info {
    flex: 1;
    min-width: 0;
  }

  .upload-file-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .upload-file-size {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .upload-file-remove {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: none;
    border: none;
    transition: all 0.15s;
  }

  .upload-file-remove:hover {
    background: color-mix(in srgb, var(--color-error) 10%, transparent);
    color: var(--color-error);
  }

  /* Upload progress bar */
  .upload-progress {
    margin-bottom: 1.5rem;
  }

  .upload-progress-bar {
    height: 6px;
    background: var(--color-bg-alt);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  .upload-progress-fill {
    height: 100%;
    background: var(--color-cta);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .upload-progress-text {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  /* Ack toggle in upload modal */
  .ack-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--color-bg-alt);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .ack-toggle-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
  }

  .ack-toggle-desc {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .toggle-switch-cta input:checked + .toggle-slider {
    background: var(--color-cta);
  }

  /* Memo textarea group */
  .memo-group {
    margin-bottom: 1rem;
  }

  .memo-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 0.375rem;
  }

  /* Document preview drawer */
  .preview-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    animation: fade-in 200ms ease;
  }

  .preview-overlay.closing {
    animation: fade-out 200ms ease forwards;
  }

  .preview-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 640px;
    max-width: 90vw;
    background: var(--admin-card-bg, #ffffff);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
    z-index: 1001;
    display: flex;
    flex-direction: column;
    animation: slide-in 250ms ease;
  }

  .preview-drawer.closing {
    animation: slide-out 200ms ease forwards;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    gap: 1rem;
  }

  .preview-header-info {
    flex: 1;
    min-width: 0;
  }

  .preview-title {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .preview-meta {
    display: flex;
    gap: 1rem;
    margin-top: 0.375rem;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    flex-wrap: wrap;
  }

  .preview-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-shrink: 0;
  }

  .preview-btn-download {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text);
    transition: all 0.15s;
    text-decoration: none;
  }

  .preview-btn-download:hover {
    background: var(--color-bg-alt);
    border-color: var(--color-primary-light);
  }

  .preview-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1.25rem;
    transition: all 0.15s;
  }

  .preview-close:hover {
    background: var(--color-bg-alt);
    color: var(--color-text);
  }

  .preview-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .preview-frame {
    flex: 1;
    width: 100%;
    border: none;
    background: var(--color-bg-alt);
  }

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    margin: auto;
    display: block;
  }

  .preview-image-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    padding: 1rem;
    background: var(--color-bg-alt);
  }

  .preview-unsupported {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: var(--color-text-muted);
    text-align: center;
  }

  .preview-unsupported-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .preview-unsupported h3 {
    font-family: var(--font-heading);
    color: var(--color-text);
    margin: 0;
  }

  .preview-unsupported p {
    font-size: 0.875rem;
    margin: 0;
    max-width: 300px;
  }

  .preview-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .preview-error {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--color-error);
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .preview-drawer { width: 100%; }
  }
`;

export const myDocsPageStyles = css`
  /* Page shell */
  .docs-page-shell {
    max-width: 1200px;
  }

  /* Header row */
  .docs-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .docs-header-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .docs-header-actions .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
  }

  .docs-header-actions .btn:hover {
    background: var(--color-bg-alt);
  }

  .docs-header-actions .btn-primary {
    background: var(--color-cta, var(--color-primary));
    color: white;
    border-color: transparent;
  }

  .docs-header-actions .btn-primary:hover {
    opacity: 0.9;
  }

  /* Summary bar */
  .docs-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .docs-summary-card {
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, 10px);
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .docs-summary-card .summary-value {
    font-size: 1.5rem;
    font-weight: 700;
    font-family: var(--font-heading);
    color: var(--color-text);
  }

  .docs-summary-card .summary-label {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .docs-summary-card.card-pending { border-top: 3px solid #f97316; }
  .docs-summary-card.card-shared { border-top: 3px solid #3b82f6; }
  .docs-summary-card.card-uploads { border-top: 3px solid #22c55e; }

  /* Tabs */
  .docs-tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid var(--color-border);
    margin-bottom: 1.25rem;
  }

  .docs-tab {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    position: relative;
    transition: color 0.15s;
  }

  .docs-tab:hover { color: var(--color-text); }

  .docs-tab.active {
    color: var(--color-cta, var(--color-primary));
    font-weight: 600;
  }

  .docs-tab.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    height: 2px;
    background: var(--color-cta, var(--color-primary));
    border-radius: 1px;
  }

  /* Toolbar */
  .docs-toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .docs-search {
    flex: 1;
    max-width: 320px;
    padding: 0.5rem 0.75rem 0.5rem 2.25rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 0.875rem;
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
    transition: border-color 0.15s;
  }

  .docs-search:focus {
    outline: none;
    border-color: var(--color-cta, var(--color-primary));
  }

  .docs-search-wrap {
    position: relative;
    flex: 1;
    max-width: 320px;
  }

  .docs-search-wrap svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    pointer-events: none;
  }

  .docs-sort {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 0.875rem;
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
    cursor: pointer;
  }

  /* Folder chips */
  .docs-folder-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .folder-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.8125rem;
    font-weight: 500;
    background: var(--app-surface-bg, var(--color-bg-alt));
    color: var(--color-text);
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: all 0.15s;
  }

  .folder-chip:hover { border-color: var(--color-cta, var(--color-primary)); }

  .folder-chip.active {
    background: var(--color-cta, var(--color-primary));
    color: white;
    border-color: transparent;
  }

  .folder-chip svg { flex-shrink: 0; }

  /* File list */
  .docs-file-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .docs-file-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.875rem 1rem;
    background: var(--app-surface-bg, var(--color-bg-alt));
    border-radius: var(--app-surface-radius, 10px);
    transition: box-shadow 0.15s;
  }

  .docs-file-item:hover {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  .docs-file-name {
    flex: 1;
    min-width: 0;
  }

  .docs-file-name-link {
    display: block;
    color: var(--color-cta, var(--color-primary));
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .docs-file-name-link:hover { text-decoration: underline; }

  .docs-file-meta {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 0.125rem;
  }

  .docs-file-badges {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .docs-file-actions {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .docs-file-actions .btn-icon {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: none;
    background: none;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.15s;
  }

  .docs-file-actions .btn-icon:hover {
    background: var(--color-bg-alt);
    color: var(--color-text);
  }

  .docs-file-actions .btn-ack {
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    background: color-mix(in srgb, #f97316 12%, transparent);
    color: #f97316;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
  }

  .docs-file-actions .btn-ack:hover {
    background: color-mix(in srgb, #f97316 20%, transparent);
  }

  /* Ack badge */
  .ack-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 0.6875rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .ack-badge.pending {
    background: color-mix(in srgb, #f97316 12%, transparent);
    color: #f97316;
  }

  .ack-badge.acknowledged {
    background: color-mix(in srgb, #22c55e 12%, transparent);
    color: #22c55e;
  }

  .source-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 0.6875rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .source-badge.dealer {
    background: color-mix(in srgb, #3b82f6 12%, transparent);
    color: #3b82f6;
  }

  .source-badge.contractor {
    background: color-mix(in srgb, #8b5cf6 12%, transparent);
    color: #8b5cf6;
  }

  /* Empty state */
  .docs-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--color-text-muted);
  }

  .docs-empty-state svg {
    margin-bottom: 1rem;
    opacity: 0.4;
  }

  .docs-empty-state h3 {
    font-family: var(--font-heading);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 0.25rem;
  }

  .docs-empty-state p {
    font-size: 0.875rem;
    margin: 0;
  }

  /* Pagination */
  .docs-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 1px solid var(--color-border);
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .docs-pagination-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .docs-pagination-controls button {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .docs-pagination-controls button:hover:not(:disabled) {
    background: var(--color-bg-alt);
  }

  .docs-pagination-controls button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Modals - reuse admin patterns */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .modal-panel {
    background: var(--app-surface-bg, #ffffff);
    border-radius: 12px;
    padding: 1.75rem;
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  .modal-panel.wide { max-width: 540px; }

  .modal-title {
    font-family: var(--font-heading);
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 0.25rem;
  }

  .modal-subtitle {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 1.5rem;
  }

  .modal-close {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1.25rem;
    transition: all 0.15s;
  }

  .modal-close:hover {
    background: var(--color-bg-alt);
    color: var(--color-text);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .modal-actions .btn {
    padding: 0.5rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .modal-actions .btn-cancel {
    border: 1px solid var(--color-border);
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
  }

  .modal-actions .btn-cancel:hover { background: var(--color-bg-alt); }

  .modal-actions .btn-primary {
    background: var(--color-cta, var(--color-primary));
    color: white;
    border: 1px solid transparent;
  }

  .modal-actions .btn-primary:hover { opacity: 0.9; }

  .modal-actions .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-actions .btn-warning {
    background: #f97316;
    color: white;
    border: 1px solid transparent;
  }

  .modal-actions .btn-warning:hover { opacity: 0.9; }

  /* Form fields in modals */
  .modal-field {
    margin-bottom: 1rem;
  }

  .modal-field label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.375rem;
  }

  .modal-field input,
  .modal-field select,
  .modal-field textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 0.875rem;
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
    box-sizing: border-box;
  }

  .modal-field textarea {
    min-height: 80px;
    resize: vertical;
  }

  .modal-field input:focus,
  .modal-field select:focus,
  .modal-field textarea:focus {
    outline: none;
    border-color: var(--color-cta, var(--color-primary));
  }

  /* Upload dropzone (contractor upload to dealer) */
  .my-upload-dropzone {
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 1.25rem;
    background: var(--app-control-bg, #ffffff);
  }

  .my-upload-dropzone:hover,
  .my-upload-dropzone.dragover {
    border-color: var(--color-cta);
    background: color-mix(in srgb, var(--color-cta) 4%, transparent);
  }

  .my-upload-dropzone-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 0.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--color-cta) 10%, transparent);
    color: var(--color-cta);
  }

  .my-upload-dropzone-text {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.25rem;
  }

  .my-upload-dropzone-hint {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .my-upload-file-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--color-bg-alt);
    border-radius: 8px;
    margin-bottom: 1.25rem;
  }

  .my-upload-file-preview .file-name {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .my-upload-file-preview .file-size {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .my-upload-file-preview .file-remove {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: none;
    background: none;
    color: var(--color-text-muted);
    cursor: pointer;
    flex-shrink: 0;
  }

  .my-upload-file-preview .file-remove:hover {
    background: var(--color-bg-alt);
    color: var(--color-error);
  }

  .upload-progress-bar {
    height: 4px;
    border-radius: 2px;
    background: var(--color-border);
    margin-top: 0.75rem;
    overflow: hidden;
  }

  .upload-progress-bar .fill {
    height: 100%;
    background: var(--color-cta, var(--color-primary));
    transition: width 0.3s;
    border-radius: 2px;
  }

  /* Preview drawer */
  .my-preview-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 520px;
    height: 100vh;
    background: var(--app-surface-bg, #ffffff);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
    z-index: 1001;
    display: flex;
    flex-direction: column;
  }

  .my-preview-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
  }

  .my-preview-drawer-header h3 {
    font-size: 0.9375rem;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
  }

  .my-preview-drawer-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .my-preview-drawer-body iframe,
  .my-preview-drawer-body img {
    flex: 1;
    width: 100%;
    border: none;
    object-fit: contain;
  }

  .my-preview-unsupported {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--color-text-muted);
    text-align: center;
    padding: 2rem;
  }

  .my-preview-unsupported .file-type-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    background: var(--color-bg-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .my-preview-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .my-preview-error {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--color-error);
    font-size: 0.875rem;
  }

  /* Loading & error text */
  .loading-text {
    padding: 2rem;
    text-align: center;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .error-text {
    padding: 2rem;
    text-align: center;
    color: var(--color-error);
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .btn-retry {
    display: inline-block;
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--app-control-bg, #ffffff);
    color: var(--color-text);
    font-size: 0.875rem;
    cursor: pointer;
  }

  /* Ack confirmation content */
  .ack-confirm-content {
    font-size: 0.875rem;
    color: var(--color-text);
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }

  .ack-confirm-content strong {
    display: block;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 768px) {
    .docs-header { flex-direction: column; }
    .docs-toolbar { flex-direction: column; align-items: stretch; }
    .docs-search-wrap { max-width: 100%; }
    .my-preview-drawer { width: 100%; }
    .docs-summary { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 480px) {
    .docs-summary { grid-template-columns: 1fr; }
  }
`;
