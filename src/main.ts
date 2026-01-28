/**
 * My Account Lite - Entry Point
 * Initializes the Lit application
 */

// Import global theme CSS
import './styles/theme.css';

// Import root component
import './components/lb-app.js';

// Global toast helper for backward compatibility with account.js
import { LbToast } from './components/atoms/lb-toast.js';
import type { ToastType } from './types/index.js';

// Expose global showToast for compatibility
declare global {
    interface Window {
        showToast: (message: string, type?: ToastType, duration?: number) => LbToast | null;
    }
}

window.showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    return LbToast.show(message, type, duration);
};

console.log('🪵 Lumber Boss - My Account Lite initialized');
