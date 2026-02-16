/**
 * PvPageProjects - Projects page component
 * Displays project cards with stats and navigation
 * Fetches real project data from DataService
 */

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';
import { RouterService } from '../../services/router.service.js';
import { DataService } from '../../services/data.service.js';
import { pageShellStyles } from '../../styles/shared.js';
import { projectsPageStyles } from '../../styles/pages.js';
import type { Project, Address } from '../../types/index.js';

interface ProjectCard {
  id: string;
  name: string;
  address: string;
  colorClass: string;
  status: string;
  orderCount: number;
  totalSpent: string;
  openInvoices: number;
}

// Color palette for project badges
const PROJECT_COLORS = [1, 2, 3, 4, 5, 6];

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
    colorClass: `project-color-${PROJECT_COLORS[index % PROJECT_COLORS.length]}`,
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
    pageShellStyles,
    projectsPageStyles,
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
                <span class="project-badge ${project.colorClass}"></span>
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
                <button class="btn btn-outline btn-sm" @click=${() => RouterService.navigate('orders', { jobId: project.id, jobName: project.name })}>Orders</button>
                <button class="btn btn-outline btn-sm" @click=${() => RouterService.navigate('estimates', { jobId: project.id, jobName: project.name })}>Estimates</button>
                <button class="btn btn-outline btn-sm" @click=${() => RouterService.navigate('billing', { jobId: project.id, jobName: project.name })}>Invoices</button>
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
