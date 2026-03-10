/**
 * PvPageEstimates - Estimates page component
 * Displays estimate list with drill-down to detail view
 */

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { DataService } from '../../services/data.service.js';
import { RouterService } from '../../services/router.service.js';
import { DocumentsService } from '../../services/documents.service.js';
import { PvToast } from '../atoms/pv-toast.js';
import '../atoms/pv-page-tour-modal.js';
import { activeFilterStyles, detailViewStyles, listStateStyles, pageShellStyles, paginationStyles } from '../../styles/shared.js';
import { estimatesPageStyles } from '../../styles/pages.js';
import type { Estimate } from '../../types/index.js';
import { buildPaginationTokens, getPaginationBounds } from '../../utils/pagination.js';
import '../../features/billing/components/pv-convert-estimate-modal.js';

@customElement('pv-page-estimates')
export class PvPageEstimates extends PvBase {
  static styles = [
    ...PvBase.styles,
    pageShellStyles,
    detailViewStyles,
    activeFilterStyles,
    paginationStyles,
    listStateStyles,
    estimatesPageStyles,
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

  // Conversion Modal State
  @state() private convertModalOpen = false;
  @state() private convertingEstimate: Estimate | null = null;

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

  private openConvertModal(estimate: Estimate) {
    this.convertingEstimate = estimate;
    this.convertModalOpen = true;
  }

  private handleConvertSuccess() {
    PvToast.show('Refreshing estimates...', 'info');
    this.loadEstimates();
    if (this.selectedEstimate && this.convertingEstimate?.id === this.selectedEstimate.id) {
      this.selectedEstimate = { ...this.selectedEstimate, status: 'converted' };
    }
  }

  private getProjectName(estimate: Estimate): string {
    if (estimate.jobName) return estimate.jobName;
    return estimate.projectId ? `Project #${estimate.projectId}` : 'No Project Assigned';
  }

  private renderPageNumbers() {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (totalPages <= 1) return null;

    return buildPaginationTokens(this.page, totalPages).map(token =>
      token === 'ellipsis'
        ? html`<span class="pagination-ellipsis">...</span>`
        : html`
            <button
              class="btn btn-outline btn-sm page-number-btn ${this.page === token ? 'active' : ''}"
              ?disabled=${this.estimatesLoading}
              @click=${() => this.handlePageChange(token)}
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
        <div class="list-refresh-note">
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
            </div>
            <div class="estimate-actions">
              <button class="btn btn-outline" @click=${() => this.viewEstimateDetail(estimate)}>View Details</button>
            </div>
          </div>
        `)}
      </div>

      <div class="pagination-row">
        <div class="pagination-summary">
          Showing ${start}-${end} of ${this.totalCount}
        </div>
        <div class="pagination-nav">
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
          ${estimate.status === 'pending' || estimate.status === 'sent' ? html`
            <button class="btn btn-cta btn-sm" @click=${() => this.openConvertModal(estimate)}>Accept & Convert</button>
          ` : ''}
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
        
        <table class="line-items-table">
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
                <td colspan="4" class="text-center line-items-message">
                  <div class="loading-spinner"></div>
                  <p>Loading items...</p>
                </td>
              </tr>
            ` : this.lineError ? html`
              <tr>
                <td colspan="4" class="text-center line-items-message error">
                  <p>${this.lineError}</p>
                  <button class="btn btn-outline btn-sm line-items-retry" @click=${() => this.viewEstimateDetail(estimate)}>Retry</button>
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
                <td colspan="4" class="text-center line-items-message">
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

        <div class="detail-actions-footer">
          <p>This estimate is valid for 30 days. Contact your sales representative to convert this estimate to an order.</p>
        </div>
      </div>
    `;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="page-loading">
          <div class="loading-spinner">Loading estimates...</div>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="page-error">
          <p>${this.error}</p>
          <button class="btn btn-outline page-error-retry" @click=${() => this.loadEstimates(true)}>Retry</button>
        </div>
      `;
    }

    return html`
      <pv-page-tour-modal 
          pageId="customer-estimates"
          heading="Estimates & Quick Quoting"
          .features=${[
        { title: 'AI Quick Quoting', description: 'Turn any rough list of materials into a structured, priced quote instantly using our AI tool.' },
        { title: 'Quote Conversion', description: 'Review detailed estimates and click "Accept & Convert" to easily turn quotes into live orders.' },
        { title: 'Download & Share', description: 'Download polished, professional PDF versions of estimates to share with your clients.' }
      ]}
      ></pv-page-tour-modal>
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

      <pv-convert-estimate-modal
        .open=${this.convertModalOpen}
        .estimate=${this.convertingEstimate}
        .accountId=${1 /* Demo account ID */}
        @close=${() => this.convertModalOpen = false}
        @converted=${this.handleConvertSuccess}
      ></pv-convert-estimate-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-estimates': PvPageEstimates;
  }
}
