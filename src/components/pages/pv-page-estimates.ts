/**
 * PvPageEstimates - Estimates page component
 * Displays estimate list with drill-down to detail view
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { RouterService } from '../../services/router.service.js';
import { DocumentsService } from '../../connect/services/documents.js';
import { PvToast } from '../atoms/pv-toast.js';
import type { Estimate } from '../../types/index.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';

@customElement('pv-page-estimates')
export class PvPageEstimates extends PvBase {
  static styles = [
    ...PvBase.styles,
    css`
      :host {
        display: block;
      }

      .section-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: var(--space-xl);
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
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
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

      /* Detail View */
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
        background: transparent;
        color: var(--color-primary);
        border: 2px solid var(--color-primary);
        border-radius: var(--radius-md);
        font-weight: 600;
        cursor: pointer;
      }

      .btn-back:hover {
        background: var(--color-primary);
        color: white;
      }

      .detail-card {
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
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

      .active-filter-bar {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: var(--space-lg);
        padding: var(--space-sm) var(--space-md);
        background: var(--color-bg-alt);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
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
        background: rgba(255, 255, 255, 0.2);
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
        background: rgba(255, 255, 255, 0.3);
      }
    `,
  ];

  @state() private estimates: Estimate[] = [];
  @state() private loading = true;
  @state() private error: string | null = null;
  @state() private currentView: 'list' | 'detail' = 'list';
  @state() private selectedEstimate: Estimate | null = null;
  @state() private activeFilter = 'All';
  @state() private loadingLines = false;
  @state() private lineError: string | null = null;
  @state() private estimatesLoading = false;
  @state() private page = 1;
  @state() private pageSize = 10;
  @state() private totalCount = 0;
  @state() private filterJobId: number | null = null;
  @state() private filterJobName: string | null = null;

  private filters = ['All', 'Pending', 'Accepted', 'Expired'];
  private unsubscribeRouter?: () => void;

  async connectedCallback() {
    super.connectedCallback();
    this.readFilterParams();
    this.unsubscribeRouter = RouterService.subscribe(() => {
      const params = RouterService.getParams();
      const jobIdStr = params.get('jobId');
      const newJobId = jobIdStr ? parseInt(jobIdStr, 10) : null;
      const newJobName = params.get('jobName');
      if ((isNaN(newJobId as number) ? null : newJobId) !== this.filterJobId) {
        this.filterJobId = (newJobId && !isNaN(newJobId)) ? newJobId : null;
        this.filterJobName = newJobName;
        this.page = 1;
        this.loadEstimates();
      }
    });
    await this.loadEstimates(true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeRouter?.();
  }

  private readFilterParams() {
    const params = RouterService.getParams();
    const jobIdStr = params.get('jobId');
    if (jobIdStr) {
      const parsed = parseInt(jobIdStr, 10);
      if (!isNaN(parsed)) {
        this.filterJobId = parsed;
        this.filterJobName = params.get('jobName');
      }
    }
  }

  private clearFilter() {
    RouterService.navigate('estimates');
  }

  private async loadEstimates(initialLoad = false) {
    if (initialLoad) {
      this.loading = true;
      this.error = null;
    } else {
      this.estimatesLoading = true;
    }
    try {
      const fetchSize = this.pageSize;
      const fetchOffset = (this.page - 1) * this.pageSize;

      const { items, total } = await DataService.getEstimates(
        fetchSize,
        fetchOffset,
        this.filterJobId ?? undefined,
      );

      this.estimates = items;
      this.totalCount = total;
    } catch (e) {
      console.error('Failed to load estimates', e);
      if (initialLoad) {
        this.error = 'Failed to load estimates. Please try again later.';
      }
      PvToast.show('Failed to load estimates. Please try again later.', 'error');
    } finally {
      this.loading = false;
      this.estimatesLoading = false;
    }
  }

  private async handlePageChange(page: number) {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (page < 1 || page > totalPages || page === this.page) return;
    this.page = page;
    await this.loadEstimates();
  }

  private async viewEstimateDetail(estimate: Estimate) {
    this.selectedEstimate = estimate;
    this.currentView = 'detail';

    // Fetch line items if not already present
    if (!estimate.lines || estimate.lines.length === 0) {
      this.loadingLines = true;
      this.lineError = null;
      try {
        const lines = await DataService.getQuoteLines(estimate.id);
        this.selectedEstimate = { ...estimate, lines };

        // Update in list as well for caching
        const index = this.estimates.findIndex(e => e.id === estimate.id);
        if (index !== -1) {
          this.estimates[index] = this.selectedEstimate;
        }
      } catch (e) {
        console.error('Failed to load estimate lines', e);
        this.lineError = 'Failed to load item details. Please try again.';
      } finally {
        this.loadingLines = false;
      }
    }
  }

  private backToList() {
    this.currentView = 'list';
    this.selectedEstimate = null;
  }

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'status-pending',
      'accepted': 'status-accepted',
      'expired': 'status-expired',
      'converted': 'status-success',
    };
    return statusMap[status] || 'status-pending';
  }

  private getDisplayStatus(status: string): string {
    const displayMap: Record<string, string> = {
      'pending': 'Pending Approval',
      'accepted': 'Accepted',
      'expired': 'Expired',
      'converted': 'Converted',
    };
    return displayMap[status] || status;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  private async downloadEstimatePdf(estimate: Estimate) {
    try {
      PvToast.show('Preparing PDF...', 'info');
      const response = await DocumentsService.getDocumentPdf({
        type: 'quote',
        id: estimate.id,
        idType: 'internal',
      });

      const url = URL.createObjectURL(response.blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error('[PvPageEstimates] Failed to download estimate PDF', err);
      PvToast.show('Failed to download PDF. Please try again.', 'error');
    }
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private getProjectName(estimate: Estimate): string {
    // Backend may not provide project name directly in Quote object yet
    return estimate.projectId ? `Project #${estimate.projectId}` : 'No Project Assigned';
  }

  private renderPageNumbers() {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (totalPages <= 1) return null;

    return buildPaginationTokens(this.page, totalPages).map(token =>
      token === 'ellipsis'
        ? html`<span style="align-self: center; color: var(--color-text-muted);">...</span>`
        : html`
            <button
              class="btn btn-outline btn-sm ${this.page === token ? 'active' : ''}"
              ?disabled=${this.estimatesLoading}
              @click=${() => this.handlePageChange(token)}
              style="${this.page === token ? 'background: var(--color-primary); color: white; border-color: var(--color-primary);' : ''}"
            >
              ${token}
            </button>
          `,
    );
  }

  private renderListView() {
    const { start, end } = getPaginationBounds(this.page, this.pageSize, this.totalCount);
    return html`
      ${this.estimatesLoading ? html`
        <div style="margin-bottom: var(--space-md); color: var(--color-text-muted); font-size: var(--text-sm);">
          Updating estimates...
        </div>
      ` : ''}
      <div class="filters-bar">
        ${this.filters.map(filter => html`
          <button 
            class="filter-chip ${this.activeFilter === filter ? 'active' : ''}"
            @click=${() => this.activeFilter = filter}
          >${filter}</button>
        `)}
      </div>

      <div class="estimates-list">
        ${this.estimates.map(estimate => html`
          <div class="estimate-card">
            <div class="estimate-header">
              <div class="estimate-info">
                <span class="estimate-number">${estimate.estimateNumber}</span>
                <span class="status-badge ${this.getStatusClass(estimate.status)}">${this.getDisplayStatus(estimate.status)}</span>
              </div>
              <span class="estimate-${estimate.status === 'expired' ? 'date' : 'expiry'}">
                ${estimate.status === 'expired' ? 'Expired' : estimate.status === 'accepted' ? 'Accepted' : 'Expires'}: ${estimate.validUntil ? this.formatDate(estimate.validUntil) : 'N/A'}
              </span>
            </div>
            <div class="estimate-body">
              <div class="estimate-products">
                <div class="estimate-thumb-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <div class="estimate-details-text">
                  <span class="estimate-project-name">${this.getProjectName(estimate)}</span>
                  <span class="estimate-summary">${estimate.lines?.length || 0} products</span>
                </div>
              </div>
              <div class="estimate-total">
                <span class="total-label">Estimate Total</span>
                <span class="total-value">${this.formatCurrency(estimate.total)}</span>
              </div>
            </div>
            <div class="estimate-actions">
              <button class="btn btn-outline" @click=${() => this.viewEstimateDetail(estimate)}>View Details</button>
            </div>
          </div>
        `)}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-lg);">
        <div style="color: var(--color-text-muted); font-size: var(--text-sm);">
          Showing ${start}-${end} of ${this.totalCount}
        </div>
        <div style="display: flex; gap: var(--space-sm);">
          <button class="btn btn-outline btn-sm" ?disabled=${this.page === 1 || this.estimatesLoading} @click=${() => this.handlePageChange(this.page - 1)}>Previous</button>
          ${this.renderPageNumbers()}
          <button class="btn btn-outline btn-sm" ?disabled=${this.page >= Math.ceil(this.totalCount / this.pageSize) || this.estimatesLoading} @click=${() => this.handlePageChange(this.page + 1)}>Next</button>
        </div>
      </div>
    `;
  }

  private renderDetailView() {
    if (!this.selectedEstimate) return html``;

    const estimate = this.selectedEstimate;

    return html`
      <div class="detail-header">
        <button class="btn-back" @click=${this.backToList}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to List
        </button>
        <div class="estimate-actions-group">
          <button class="btn btn-outline btn-sm" @click=${() => this.downloadEstimatePdf(estimate)}>Download PDF</button>
          <button class="btn btn-outline btn-sm" @click=${() => PvToast.show('Data export coming soon', 'info')}>Export Data</button>
        </div>
      </div>

      <div class="detail-card">
        <div class="detail-title-row">
          <div>
            <h2 class="detail-id">${estimate.estimateNumber}</h2>
            <p class="detail-project-info">${this.getProjectName(estimate)} • Valid until ${estimate.validUntil ? this.formatDate(estimate.validUntil) : 'N/A'}</p>
          </div>
          <span class="status-badge ${this.getStatusClass(estimate.status)}">${this.getDisplayStatus(estimate.status)}</span>
        </div>

        <p>Estimate total: <strong>${this.formatCurrency(estimate.total)}</strong></p>
        
        <table class="line-items-table" style="margin-top: var(--space-xl);">
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${this.loadingLines ? html`
              <tr>
                <td colspan="4" class="text-center" style="padding: var(--space-xl);">
                  <div class="loading-spinner"></div>
                  <p>Loading items...</p>
                </td>
              </tr>
            ` : this.lineError ? html`
              <tr>
                <td colspan="4" class="text-center" style="padding: var(--space-xl); color: var(--color-error);">
                  <p>${this.lineError}</p>
                  <button class="btn btn-outline btn-sm" style="margin-top: var(--space-md);" @click=${() => this.viewEstimateDetail(estimate)}>Retry</button>
                </td>
              </tr>
            ` : estimate.lines && estimate.lines.length > 0 ? estimate.lines.map(line => html`
              <tr>
                <td>
                  <div class="line-item-name">${line.name}</div>
                  <div class="line-item-sku">SKU: ${line.sku}</div>
                </td>
                <td class="text-right">${line.quantity}</td>
                <td class="text-right">${this.formatCurrency(line.unitPrice)}</td>
                <td class="text-right">${this.formatCurrency(line.lineTotal)}</td>
              </tr>
            `) : html`
              <tr>
                <td colspan="4" class="text-center" style="padding: var(--space-xl);">
                  <p>No line items found for this estimate.</p>
                </td>
              </tr>
            `}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-right"><strong>Total</strong></td>
              <td class="text-right"><strong>${this.formatCurrency(estimate.total)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div class="detail-actions-footer" style="margin-top: var(--space-xl); padding-top: var(--space-lg); border-top: 1px solid var(--color-border); color: var(--color-text-muted); font-size: var(--text-sm);">
          <p>This estimate is valid for 30 days. Contact your sales representative to convert this estimate to an order.</p>
        </div>
      </div>
    `;
  }

  render() {
    if (this.loading) {
      return html`
        <div style="display: flex; justify-content: center; padding: var(--space-2xl);">
          <div class="loading-spinner">Loading estimates...</div>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div style="text-align: center; padding: var(--space-2xl); background: #fee2e2; border-radius: var(--radius-lg); color: #991b1b;">
          <p>${this.error}</p>
          <button class="btn btn-outline" style="margin-top: var(--space-md);" @click=${() => this.loadEstimates(true)}>Retry</button>
        </div>
      `;
    }

    return html`
      <div class="section-header">
        <div>
          <h1 class="section-title">Estimates</h1>
          <p class="section-subtitle">${this.filterJobName ? `Filtered by project: ${this.filterJobName}` : 'View your project estimates'}</p>
        </div>
      </div>

      ${this.filterJobId ? html`
        <div class="active-filter-bar">
          <span>Filtered by project:</span>
          <span class="active-filter-chip">
            ${this.filterJobName || `Job #${this.filterJobId}`}
            <button @click=${this.clearFilter} title="Clear filter">&times;</button>
          </span>
        </div>
      ` : ''}

      ${this.currentView === 'list' ? this.renderListView() : this.renderDetailView()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-estimates': PvPageEstimates;
  }
}
