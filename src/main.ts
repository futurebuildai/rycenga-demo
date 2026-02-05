/**
 * My Account Lite - Entry Point
 * Initializes the Lit application
 */

// Import global theme CSS
import './styles/theme.css';

// Import root component
import './components/pv-app.js';

// Global toast helper for backward compatibility with account.js
import { PvToast } from './components/atoms/pv-toast.js';
import type { ToastType } from './types/index.js';

// Expose global showToast for compatibility
declare global {
    interface Window {
        showToast: (message: string, type?: ToastType, duration?: number) => PvToast | null;
    }
}

window.showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    return PvToast.show(message, type, duration);
};

console.log('Velocity - My Account Lite initialized');
