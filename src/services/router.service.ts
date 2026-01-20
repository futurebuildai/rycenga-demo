/**
 * RouterService - Singleton for hash-based routing
 * Listens to hashchange events and provides navigation API
 */

import type { RouteId } from '../types/index.js';

const VALID_ROUTES: RouteId[] = [
    'overview',
    'billing',
    'projects',
    'orders',
    'estimates',
    'wallet',
    'team',
    'settings',
    'login',
];

const DEFAULT_ROUTE: RouteId = 'overview';

class RouterServiceImpl {
    private currentRoute: RouteId = DEFAULT_ROUTE;
    private listeners: Set<(route: RouteId) => void> = new Set();
    private initialized = false;

    /**
     * Initialize router and start listening to hash changes
     */
    init(): void {
        if (this.initialized) return;

        window.addEventListener('hashchange', () => this.handleHashChange());
        this.handleHashChange(); // Process initial hash
        this.initialized = true;
    }

    /**
     * Get current active route
     */
    getCurrentRoute(): RouteId {
        return this.currentRoute;
    }

    /**
     * Navigate to a new route
     */
    navigate(route: RouteId): void {
        if (window.location.hash !== `#${route}`) {
            window.location.hash = route;
        }
    }

    /**
     * Subscribe to route changes
     */
    subscribe(listener: (route: RouteId) => void): () => void {
        this.listeners.add(listener);
        // Immediately notify of current route
        listener(this.currentRoute);
        return () => this.listeners.delete(listener);
    }

    /**
     * Parse hash and update current route
     */
    private handleHashChange(): void {
        const hash = window.location.hash.substring(1) || DEFAULT_ROUTE;
        const route = this.parseRoute(hash);

        if (route !== this.currentRoute) {
            this.currentRoute = route;
            this.notifyListeners();
            this.dispatchEvent(route);
        }
    }

    /**
     * Validate and parse route from hash
     */
    private parseRoute(hash: string): RouteId {
        const route = hash as RouteId;
        return VALID_ROUTES.includes(route) ? route : DEFAULT_ROUTE;
    }

    /**
     * Notify all subscribed listeners
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.currentRoute));
    }

    /**
     * Dispatch custom event for route changes
     */
    private dispatchEvent(route: RouteId): void {
        window.dispatchEvent(
            new CustomEvent('route-changed', {
                detail: { route },
                bubbles: true,
                composed: true,
            })
        );
    }
}

// Singleton export
export const RouterService = new RouterServiceImpl();
