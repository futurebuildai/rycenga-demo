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
                if (this.onUnauthorized) {
                    this.onUnauthorized();
                }
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                // Handle 401 Unauthorized, etc.
                throw new Error(`API Error: ${response.statusText}`);
            }

            return response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

export const client = new ApiClient();
