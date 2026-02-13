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
    private currentParams: URLSearchParams = new URLSearchParams();
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
     * Get current URL search params from the hash
     */
    getParams(): URLSearchParams {
        return this.currentParams;
    }

    /**
     * Navigate to a new route, optionally with query parameters
     */
    navigate(route: RouteId, params?: Record<string, string>): void {
        let hash = route as string;
        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(params);
            hash = `${route}?${searchParams.toString()}`;
        }
        if (window.location.hash !== `#${hash}`) {
            window.location.hash = hash;
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
        const rawHash = window.location.hash.substring(1) || DEFAULT_ROUTE;

        // Split hash on '?' to separate route from query params
        const questionIndex = rawHash.indexOf('?');
        const routePart = questionIndex >= 0 ? rawHash.substring(0, questionIndex) : rawHash;
        const paramsPart = questionIndex >= 0 ? rawHash.substring(questionIndex + 1) : '';

        const route = this.parseRoute(routePart);
        const params = new URLSearchParams(paramsPart);

        const routeChanged = route !== this.currentRoute;
        const paramsChanged = params.toString() !== this.currentParams.toString();

        this.currentRoute = route;
        this.currentParams = params;

        if (routeChanged || paramsChanged) {
            this.notifyListeners();
            this.dispatchEvent(route, params);
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
    private dispatchEvent(route: RouteId, params: URLSearchParams): void {
        window.dispatchEvent(
            new CustomEvent('route-changed', {
                detail: { route, params },
                bubbles: true,
                composed: true,
            })
        );
    }
}

// Singleton export
export const RouterService = new RouterServiceImpl();
