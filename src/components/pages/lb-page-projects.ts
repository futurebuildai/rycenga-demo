/**
 * LbPageProjects - Projects page component
 * Displays project cards with stats and navigation
 */

import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import { RouterService } from '../../services/router.service.js';

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

@customElement('lb-page-projects')
export class LbPageProjects extends LbBase {
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
    `,
    ];

    @state() private searchQuery = '';

    private projects: ProjectCard[] = [
        {
            id: 'proj-001',
            name: 'My Framing Job',
            address: '1234 Construction Ave, Oakdale, TX 75001',
            color: '#3b82f6',
            status: 'Active',
            orderCount: 5,
            totalSpent: '$12,450',
            openInvoices: 3,
        },
        {
            id: 'proj-002',
            name: '50 Main Street',
            address: '50 Main Street, Oakdale, TX 75001',
            color: '#22c55e',
            status: 'Active',
            orderCount: 3,
            totalSpent: '$8,200',
            openInvoices: 1,
        },
        {
            id: 'proj-003',
            name: "Erik's Shed",
            address: '789 Backyard Lane, Pinewood, TX 75002',
            color: '#f97316',
            status: 'Active',
            orderCount: 2,
            totalSpent: '$1,890',
            openInvoices: 0,
        },
    ];

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
                <span class="stat-label">Total Spent</span>
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
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'lb-page-projects': LbPageProjects;
    }
}
