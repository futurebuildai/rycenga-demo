/**
 * Admin API Client
 * Isolated HTTP client for the Admin Portal.
 * Uses a separate localStorage key to avoid collisions with the customer app.
 */

import { API_CONFIG } from '../../connect/config.js';

const TOKEN_KEY = 'admin_auth_token';

interface RequestOptions extends RequestInit {
    requiresAuth?: boolean;
}

class AdminApiClient {
    private token: string | null = null;
    public onUnauthorized?: () => void;

    constructor() {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) {
            this.token = stored;
        }
    }

    setToken(token: string): void {
        this.token = token;
        localStorage.setItem(TOKEN_KEY, token);
    }

    clearToken(): void {
        this.token = null;
        localStorage.removeItem(TOKEN_KEY);
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const headers = new Headers(options.headers);
        headers.set('Content-Type', 'application/json');

        if (this.token && options.requiresAuth !== false) {
            headers.set('Authorization', `Bearer ${this.token}`);
        }

        if (import.meta.env.DEV) {
            const devTenantId = import.meta.env.VITE_DEV_TENANT_ID as string | undefined;
            if (devTenantId) {
                headers.set('X-Tenant-ID', devTenantId);
            }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            if (response.status === 401) {
                if (this.onUnauthorized) {
                    this.onUnauthorized();
                }
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return response.json() as Promise<T>;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

export const adminClient = new AdminApiClient();
