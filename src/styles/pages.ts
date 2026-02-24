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

  select.form-select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    margin-top: 0.5rem;
    background: var(--app-control-bg, #ffffff);
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

  .toast-success { background: #059669; color: white; }
  .toast-error { background: #dc2626; color: white; }
  .toast-info { background: var(--color-primary); color: white; }

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
