import { API_CONFIG } from './config';

interface RequestOptions extends RequestInit {
    requiresAuth?: boolean;
}

class ApiClient {
    private token: string | null = null;
    public onUnauthorized?: () => void;

    constructor() {
        const stored = localStorage.getItem('auth_token');
        if (stored) {
            this.token = stored;
        }
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const headers = new Headers(options.headers);

        // Protocol requirements from router.go
        headers.set('Content-Type', 'application/json');
        if (this.token && options.requiresAuth !== false) {
            headers.set('Authorization', `Bearer ${this.token}`);
            // If using API Key as well for M2M: headers.set('X-API-Key', API_KEY);
        }

        // Development override for testing different tenants
        if (import.meta.env.DEV) {
            const devTenantId = import.meta.env.VITE_DEV_TENANT_ID;
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

            return response.json();
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
            const devTenantId = import.meta.env.VITE_DEV_TENANT_ID;
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

export const client = new ApiClient();
