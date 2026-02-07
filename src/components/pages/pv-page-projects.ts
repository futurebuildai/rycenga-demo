/**
 * PvPageProjects - Projects page component
 * Displays project cards with stats and navigation
 * Fetches real project data from DataService
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { RouterService } from '../../services/router.service.js';
import { DataService } from '../../services/data.service.js';
import type { Project, Address } from '../../types/index.js';

interface ProjectCard {
  id: string;
  name: string;
  address: string;
  color: string;
  status: string;
  orderCount: number;
  totalSpent: string;
  openInvoices: number;
}

// Color palette for project badges
const PROJECT_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6'];

/**
 * Formats an Address object into a single-line string.
 */
function formatAddress(address?: Address): string {
  if (!address) return 'No address';
  const parts = [address.street, address.city, address.state, address.zip].filter(Boolean);
  return parts.join(', ') || 'No address';
}

/**
 * Maps a Project from the API to a ProjectCard for display.
 */
function mapProjectToCard(
  project: Project,
  index: number,
  summary: { orderCount: number; totalOrdered: number; openInvoicesCount: number },
  formatCurrency: (value: number) => string
): ProjectCard {
  return {
    id: project.id,
    name: project.name,
    address: formatAddress(project.address),
    color: project.color ?? PROJECT_COLORS[index % PROJECT_COLORS.length],
    status: project.status === 'active' ? 'Active' : project.status === 'completed' ? 'Completed' : 'Archived',
    orderCount: summary.orderCount,
    totalSpent: formatCurrency(summary.totalOrdered),
    openInvoices: summary.openInvoicesCount,
  };
}

@customElement('pv-page-projects')
export class PvPageProjects extends PvBase {
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
        background: white;
      }

      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--space-lg);
      }

      .project-card {
        background: var(--color-bg-alt);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
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
        color: var(--color-danger, #dc2626);
      }
    `,
  ];

  @state() private searchQuery = '';
  @state() private projects: ProjectCard[] = [];
  @state() private loading = false;
  @state() private error: string | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.fetchProjects();
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  }

  private async fetchProjects(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const [apiProjects, summaries] = await Promise.all([
        DataService.getProjects(),
        DataService.getJobSummaries(),
      ]);
      const summaryByJobId = new Map<string, { orderCount: number; totalOrdered: number; openInvoicesCount: number }>();
      for (const summary of summaries) {
        summaryByJobId.set(String(summary.jobId), {
          orderCount: summary.orderCount,
          totalOrdered: summary.totalOrdered,
          openInvoicesCount: summary.openInvoicesCount,
        });
      }
      this.projects = apiProjects.map((project, index) => {
        const summary = summaryByJobId.get(project.id) ?? { orderCount: 0, totalOrdered: 0, openInvoicesCount: 0 };
        return mapProjectToCard(project, index, summary, this.formatCurrency.bind(this));
      });
    } catch (err) {
      console.error('[PvPageProjects] Failed to fetch projects:', err);
      this.error = err instanceof Error ? err.message : 'Failed to load projects.';
    } finally {
      this.loading = false;
    }
  }

  private get filteredProjects() {
    if (!this.searchQuery) return this.projects;
    const query = this.searchQuery.toLowerCase();
    return this.projects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query)
    );
  }

  render() {
    return html`
      <div class="section-header">
        <div>
          <h1 class="section-title">Projects</h1>
          <p class="section-subtitle">Organize orders and invoices by job site</p>
        </div>
      </div>

      <div class="filters-bar">
        <input 
          type="text" 
          class="filter-search" 
          placeholder="Search projects by name or address..."
          .value=${this.searchQuery}
          @input=${(e: Event) => this.searchQuery = (e.target as HTMLInputElement).value}
        >
        <select class="filter-select">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      ${this.loading ? html`
        <div class="loading-state">Loading projects...</div>
      ` : this.error ? html`
        <div class="error-state">Error: ${this.error}</div>
      ` : this.filteredProjects.length === 0 ? html`
        <div class="empty-state">No projects found.</div>
      ` : html`
        <div class="projects-grid">
          ${this.filteredProjects.map(project => html`
            <div class="project-card">
              <div class="project-card-header">
                <span class="project-badge" style="background: ${project.color};"></span>
                <div class="project-card-info">
                  <h3>${project.name}</h3>
                  <p>${project.address}</p>
                </div>
                <span class="status-badge status-active">${project.status}</span>
              </div>
              <div class="project-card-stats">
                <div class="project-stat">
                  <span class="stat-number">${project.orderCount}</span>
                  <span class="stat-label">Orders</span>
                </div>
                <div class="project-stat">
                  <span class="stat-number">${project.totalSpent}</span>
                  <span class="stat-label">Total Ordered</span>
                </div>
                <div class="project-stat">
                  <span class="stat-number">${project.openInvoices}</span>
                  <span class="stat-label">Open Invoices</span>
                </div>
              </div>
              <div class="project-card-actions">
                <button class="btn btn-outline btn-sm" @click=${() => RouterService.navigate('orders')}>Orders</button>
                <button class="btn btn-outline btn-sm" @click=${() => RouterService.navigate('estimates')}>Estimates</button>
                <button class="btn btn-outline btn-sm" @click=${() => RouterService.navigate('billing')}>Invoices</button>
              </div>
            </div>
          `)}
        </div>
      `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-projects': PvPageProjects;
  }
}
