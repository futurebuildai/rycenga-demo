/**
 * pv-page-tour-modal.ts
 * Reusable modal component for per-page feature tours.
 */

import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { PvBase } from '../pv-base.js';

export interface TourFeature {
  title: string;
  description: string;
}

@customElement('pv-page-tour-modal')
export class PvPageTourModal extends PvBase {
  static styles = [
    ...PvBase.styles,
    css`
      :host {
        display: block;
      }

      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-xl);
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .modal-card {
        background: #ffffff;
        border-radius: 12px;
        width: 100%;
        max-width: 600px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        padding: 32px;
        position: relative;
        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        max-height: 90vh;
        overflow-y: auto;
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: var(--space-lg);
      }

      .tour-badge {
        background: var(--color-primary-light, #ea580c);
        color: white;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      h2 {
        font-family: var(--font-heading);
        font-size: 24px;
        font-weight: 700;
        color: var(--color-text);
        margin: 0;
      }

      .intro-text {
        font-size: 15px;
        color: var(--color-text-muted);
        line-height: 1.6;
        margin-bottom: var(--space-xl);
      }
      
      .features-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
        margin-bottom: var(--space-2xl);
      }
      
      .feature-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .feature-title {
        font-weight: 600;
        color: var(--color-text);
        font-size: 15px;
      }

      .feature-desc {
        color: var(--color-text-muted);
        font-size: 14px;
        line-height: 1.5;
        margin: 0;
      }

      .dismiss-btn {
        width: 100%;
        background: var(--color-primary, #ea580c);
        color: var(--color-on-primary, white);
        border: none;
        padding: 14px 24px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .dismiss-btn:hover {
        background: var(--color-primary-hover, #c2410c);
      }
    `
  ];

  @property({ type: String }) pageId = '';
  @property({ type: String }) heading = 'Page Tour';
  @property({ type: Array }) features: TourFeature[] = [];

  @state() private isVisible = false;

  connectedCallback() {
    super.connectedCallback();
    if (this.pageId) {
      this.checkVisibility();
    }
  }

  private checkVisibility() {
    // We use sessionStorage so the tour only shows once per page per session
    const storageKey = `tour_dismissed_${this.pageId}`;
    const hasDismissed = sessionStorage.getItem(storageKey);

    // Also check if they just dismissed the main welcome modal to avoid stacking modals immediately
    // Wait a slight fraction so the main page can render first, or just show it cleanly.
    if (!hasDismissed) {
      // slightly delay to ensure rendering happens smoothly if there are other priority modals
      setTimeout(() => {
        this.isVisible = true;
        document.body.style.overflow = 'hidden';
      }, 100);
    }
  }

  private dismiss() {
    if (!this.pageId) return;

    const storageKey = `tour_dismissed_${this.pageId}`;
    sessionStorage.setItem(storageKey, 'true');
    this.isVisible = false;
    document.body.style.overflow = '';
  }

  render() {
    if (!this.isVisible || !this.features || this.features.length === 0) return html``;

    return html`
      <div class="backdrop" @click=${this.dismiss}>
        <div class="modal-card" @click=${(e: Event) => e.stopPropagation()}>
          <div class="header">
            <span class="tour-badge">Page Tour</span>
            <h2>${this.heading}</h2>
          </div>
          
          <p class="intro-text">
            Here are the key features available on this page for the demo:
          </p>
          
          <div class="features-list">
            ${this.features.map(f => html`
              <div class="feature-item">
                <span class="feature-title">${f.title}</span>
                <p class="feature-desc">${f.description}</p>
              </div>
            `)}
          </div>
          
          <button class="dismiss-btn" @click=${this.dismiss}>
            Got it
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-page-tour-modal': PvPageTourModal;
  }
}
