/**
 * Admin API Client
 * HTTP client for the Admin Portal.
 * Uses the shared auth token with the customer app.
 */

import { API_CONFIG } from '../../connect/config.js';

const TOKEN_KEY = 'auth_token';

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
        const isFormDataBody = options.body instanceof FormData;
        if (!isFormDataBody && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

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
                if (options.requiresAuth !== false && this.onUnauthorized) {
                    this.onUnauthorized();
                }
                const detail = await this.readErrorDetail(response);
                const message = detail
                    ? `API Error: ${detail}`
                    : `API Error: ${response.status} ${response.statusText}`;
                throw new Error(message);
            }

            if (!response.ok) {
                const detail = await this.readErrorDetail(response);
                const message = detail
                    ? `API Error: ${detail}`
                    : `API Error: ${response.status} ${response.statusText}`;
                throw new Error(message);
            }

            return response.json() as Promise<T>;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async requestBlob(endpoint: string, options: RequestOptions = {}): Promise<{ blob: Blob; contentType: string; contentDisposition: string; }> {
        const headers = new Headers(options.headers);

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
                if (options.requiresAuth !== false && this.onUnauthorized) {
                    this.onUnauthorized();
                }
                const detail = await this.readErrorDetail(response);
                const message = detail
                    ? `API Error: ${detail}`
                    : `API Error: ${response.status} ${response.statusText}`;
                throw new Error(message);
            }

            if (!response.ok) {
                const detail = await this.readErrorDetail(response);
                const message = detail
                    ? `API Error: ${detail}`
                    : `API Error: ${response.status} ${response.statusText}`;
                throw new Error(message);
            }

            return {
                blob: await response.blob(),
                contentType: response.headers.get('Content-Type') || '',
                contentDisposition: response.headers.get('Content-Disposition') || '',
            };
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private async readErrorDetail(response: Response): Promise<string> {
        try {
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.includes('application/json')) {
                const payload = await response.json();
                if (typeof payload === 'string') return payload;
                if (payload && typeof payload === 'object') {
                    if ('message' in payload && typeof payload.message === 'string') return payload.message;
                    if ('error' in payload && typeof payload.error === 'string') return payload.error;
                    if ('detail' in payload && typeof payload.detail === 'string') return payload.detail;
                }
                return '';
            }

            const text = await response.text();
            const trimmed = text.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    const payload = JSON.parse(trimmed);
                    if (typeof payload === 'string') return payload;
                    if (payload && typeof payload === 'object') {
                        if ('message' in payload && typeof payload.message === 'string') return payload.message;
                        if ('error' in payload && typeof payload.error === 'string') return payload.error;
                        if ('detail' in payload && typeof payload.detail === 'string') return payload.detail;
                        if ('title' in payload && typeof payload.title === 'string') return payload.title;
                    }
                } catch {
                    // fall through to raw text
                }
            }
            return trimmed;
        } catch {
            return '';
        }
    }
}

export const adminClient = new AdminApiClient();
