// ========================================
// LUMBER BOSS - APP ENTRY POINT
// ES Module initialization
// ========================================

// Import and register Web Components
import LbInventoryBadge from './components/lb-inventory-badge.js';
import LbToast from './components/lb-toast.js';
import LbProductCard from './components/lb-product-card.js';

// Import services
import { cart } from './services/cart.js';
import { fetchProducts, fetchProduct, fetchCategories } from './services/api.js';

// Export services for use by page controllers
export { cart, fetchProducts, fetchProduct, fetchCategories };

// Initialize cart count in header
function initCartCount() {
    const updateCount = (items) => {
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    };

    cart.subscribe(updateCount);
}

// Global toast helper
window.showToast = (message, type = 'info', duration = 3000) => {
    return LbToast.show(message, type, duration);
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartCount);
} else {
    initCartCount();
}

console.log('🪵 Lumber Boss components loaded');
