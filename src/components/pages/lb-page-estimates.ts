/**
 * LbPageEstimates - Estimates page component
 * Displays estimate list with drill-down to detail view
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import { DataService } from '../../services/data.service.js';
import { LbToast } from '../atoms/lb-toast.js';
import type { Estimate } from '../../types/index.js';

@customElement('lb-page-estimates')
export class LbPageEstimates extends LbBase {
  static styles = [
    ...LbBase.styles,
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
    `,
  ];

  @state() private estimates: Estimate[] = [];
  @state() private loading = true;
  @state() private currentView: 'list' | 'detail' = 'list';
  @state() private selectedEstimate: Estimate | null = null;
  @state() private activeFilter = 'All';

  private filters = ['All', 'Pending', 'Accepted', 'Expired'];

  async connectedCallback() {
    super.connectedCallback();
    await this.loadEstimates();
  }

  private async loadEstimates() {
    try {
      this.estimates = await DataService.getEstimates();
    } catch (e) {
      console.error('Failed to load estimates', e);
    } finally {
      this.loading = false;
    }
  }

  private viewEstimateDetail(estimate: Estimate) {
    this.selectedEstimate = estimate;
    this.currentView = 'detail';
  }

  private backToList() {
    this.currentView = 'list';
    this.selectedEstimate = null;
  }

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'sent': 'status-pending',
      'accepted': 'status-accepted',
      'expired': 'status-expired',
      'draft': 'status-draft',
      'converted': 'status-success',
    };
    return statusMap[status] || 'status-pending';
  }

  private getDisplayStatus(status: string): string {
    const displayMap: Record<string, string> = {
      'sent': 'Pending Approval',
      'accepted': 'Accepted',
      'expired': 'Expired',
      'draft': 'Draft',
      'converted': 'Converted',
    };
    return displayMap[status] || status;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private getProjectName(estimate: Estimate): string {
    const names = ['My Framing Job', '50 Main Street', "Erik's Shed"];
    const index = this.estimates.indexOf(estimate) % names.length;
    return names[index];
  }

  private renderListView() {
    return html`
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
                ${estimate.status === 'expired' ? 'Expired' : estimate.status === 'accepted' ? 'Accepted' : 'Expires'}: ${this.formatDate(estimate.validUntil)}
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
                  <span class="estimate-summary">${estimate.lines?.length || 3} products</span>
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
        <button class="btn btn-outline btn-sm" @click=${() => LbToast.show('PDF download coming soon', 'info')}>Download PDF</button>
      </div>

      <div class="detail-card">
        <div class="detail-title-row">
          <div>
            <h2 class="detail-id">${estimate.estimateNumber}</h2>
            <p class="detail-project-info">${this.getProjectName(estimate)} • Valid until ${this.formatDate(estimate.validUntil)}</p>
          </div>
          <span class="status-badge ${this.getStatusClass(estimate.status)}">${this.getDisplayStatus(estimate.status)}</span>
        </div>

        <p>Estimate total: <strong>${this.formatCurrency(estimate.total)}</strong></p>
        <p class="text-muted" style="margin-top: var(--space-md);">Full line items would be displayed here with the same table format as orders.</p>
      </div>
    `;
  }

  render() {
    if (this.loading) {
      return html`<p>Loading estimates...</p>`;
    }

    return html`
      <div class="section-header">
        <div>
          <h1 class="section-title">Estimates</h1>
          <p class="section-subtitle">View your project estimates</p>
        </div>
      </div>

      ${this.currentView === 'list' ? this.renderListView() : this.renderDetailView()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-page-estimates': LbPageEstimates;
  }
}
