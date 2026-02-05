import { TenantService } from '../connect/services/tenant';

export interface BrandingInfo {
    tenantId?: string;
    tenantName: string;
    tenantSlug: string;
}

const DEFAULT_TENANT_NAME = 'Velocity';

class BrandingServiceImpl {
    private branding: BrandingInfo | null = null;
    private pending?: Promise<BrandingInfo>;
    private listeners = new Set<(branding: BrandingInfo) => void>();

    async getBranding(): Promise<BrandingInfo> {
        if (this.branding) return this.branding;
        if (!this.pending) {
            this.pending = this.loadBranding();
        }
        return this.pending;
    }

    getCached(): BrandingInfo | null {
        return this.branding;
    }

    subscribe(listener: (branding: BrandingInfo) => void): () => void {
        this.listeners.add(listener);
        if (this.branding) {
            listener(this.branding);
        }
        return () => this.listeners.delete(listener);
    }

    getAccountTitle(): string {
        const name = this.branding?.tenantName || DEFAULT_TENANT_NAME;
        return `My Account | ${name}`;
    }

    getAdminTitle(): string {
        const name = this.branding?.tenantName || DEFAULT_TENANT_NAME;
        return `Dealer Portal | ${name}`;
    }

    private async loadBranding(): Promise<BrandingInfo> {
        let tenantName = '';
        let tenantSlug = '';
        let tenantId: string | undefined;

        try {
            const tenant = await TenantService.getTenant();
            tenantName = tenant.name ?? '';
            tenantSlug = tenant.slug ?? '';
            tenantId = tenant.id;
        } catch {
            // Fall back to token/hostname-derived values.
        }

        if (!tenantSlug || !tenantName) {
            const fallback = this.resolveFallback();
            tenantSlug = tenantSlug || fallback.slug;
            tenantName = tenantName || fallback.name;
        }

        const branding: BrandingInfo = {
            tenantId,
            tenantName: tenantName.trim() || DEFAULT_TENANT_NAME,
            tenantSlug: tenantSlug.trim(),
        };

        this.branding = branding;
        this.pending = undefined;
        this.listeners.forEach((listener) => listener(branding));
        return branding;
    }

    private resolveFallback(): { name: string; slug: string } {
        const slug = this.getTenantSlugFromToken() || this.getTenantSlugFromHost();
        const name = slug ? this.formatTenantName(slug) : '';
        return { name, slug };
    }

    private getTenantSlugFromToken(): string {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('admin_auth_token');
        if (!token) return '';
        const parts = token.split('.');
        if (parts.length < 2) return '';
        const payload = this.decodeBase64Url(parts[1]);
        if (!payload) return '';
        try {
            const parsed = JSON.parse(payload) as { tenant?: string };
            return (parsed.tenant || '').trim();
        } catch {
            return '';
        }
    }

    private getTenantSlugFromHost(): string {
        const host = window.location.hostname.trim().toLowerCase();
        if (!host || host === 'localhost') return '';
        const parts = host.split('.');
        if (parts.length > 2) {
            return parts[0] || '';
        }
        return host;
    }

    private decodeBase64Url(input: string): string | null {
        const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
        try {
            return atob(padded);
        } catch {
            return null;
        }
    }

    private formatTenantName(slug: string): string {
        return slug
            .split(/[-_\s]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }
}

export const BrandingService = new BrandingServiceImpl();
