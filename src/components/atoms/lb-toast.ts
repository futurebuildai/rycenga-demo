/**
 * LbToast - Toast notification component
 * Provides visual feedback for user actions
 */

import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LbBase } from '../lb-base.js';
import type { ToastType } from '../../types/index.js';

@customElement('lb-toast')
export class LbToast extends LbBase {
    static styles = [
        ...LbBase.styles,
        css`
      :host {
        position: fixed;
        bottom: var(--space-xl);
        right: var(--space-xl);
        z-index: 10000;
        display: block;
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md) var(--space-lg);
        background: var(--color-primary);
        color: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        font-size: var(--text-sm);
        font-weight: 500;
        max-width: 400px;
        pointer-events: auto;
        animation: slideIn 0.3s ease-out;
      }

      .toast.hiding {
        animation: slideOut 0.3s ease-out forwards;
      }

      .toast-success {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      }

      .toast-error {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      }

      .toast-warning {
        background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
        color: var(--color-primary);
      }

      .toast-info {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      }

      .toast-icon {
        flex-shrink: 0;
      }

      .toast-message {
        flex: 1;
      }

      .toast-close {
        flex-shrink: 0;
        padding: var(--space-xs);
        color: inherit;
        opacity: 0.7;
        transition: opacity var(--transition-fast);
        cursor: pointer;
      }

      .toast-close:hover {
        opacity: 1;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }
    `,
    ];

    @property({ type: String }) message = '';
    @property({ type: String }) type: ToastType = 'info';
    @property({ type: Number }) duration = 3000;

    @state() private visible = false;
    @state() private hiding = false;

    private timeoutId: number | null = null;

    /**
     * Show the toast with current properties
     */
    show(): void {
        this.visible = true;
        this.hiding = false;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        if (this.duration > 0) {
            this.timeoutId = window.setTimeout(() => this.hide(), this.duration);
        }
    }

    /**
     * Hide the toast with animation
     */
    hide(): void {
        this.hiding = true;
        setTimeout(() => {
            this.visible = false;
            this.hiding = false;
        }, 300);
    }

    /**
     * Static method to show a toast globally
     */
    static show(message: string, type: ToastType = 'info', duration = 3000): LbToast {
        // Find or create toast container
        let toast = document.querySelector('lb-toast') as LbToast | null;

        if (!toast) {
            toast = document.createElement('lb-toast') as LbToast;
            document.body.appendChild(toast);
        }

        toast.message = message;
        toast.type = type;
        toast.duration = duration;
        toast.show();

        return toast;
    }

    private getIcon(): string {
        const icons: Record<ToastType, string> = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
        };
        return icons[this.type];
    }

    render() {
        if (!this.visible) return null;

        return html`
      <div class="toast toast-${this.type} ${this.hiding ? 'hiding' : ''}">
        <span class="toast-icon">${this.getIcon()}</span>
        <span class="toast-message">${this.message}</span>
        <button class="toast-close" @click=${this.hide}>✕</button>
      </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'lb-toast': LbToast;
    }
}
