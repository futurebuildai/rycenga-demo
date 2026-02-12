import { TenantService } from '../connect/services/tenant';

export interface BrandingInfo {
    tenantId?: string;
    tenantName: string;
    tenantSlug: string;
    logoBase64: string | null;
    logoType: string | null;
    contactEmail: string;
    contactPhone: string;
}

const DEFAULT_BRANDING = {
    companyName: 'BuilderWire',
    logoBase64: null,
    logoType: null,
    contactEmail: 'support@builderwire.com',
    contactPhone: '(555) 000-0000',
};

class BrandingServiceImpl {
    private branding: BrandingInfo | null = null;
    private pending?: Promise<BrandingInfo>;
    private listeners = new Set<(branding: BrandingInfo) => void>();
    private cacheKey = 'branding_cache_v1';

    async getBranding(): Promise<BrandingInfo> {
        if (this.branding) return this.branding;
        if (!this.pending) {
            this.pending = this.loadBranding();
        }
        return this.pending;
    }

    getBrandingSync(): BrandingInfo {
        if (!this.branding) {
            this.branding = this.readCachedBranding();
        }
        if (this.branding) return this.branding;
        return {
            tenantId: undefined,
            tenantName: DEFAULT_BRANDING.companyName,
            tenantSlug: '',
            logoBase64: DEFAULT_BRANDING.logoBase64,
            logoType: DEFAULT_BRANDING.logoType,
            contactEmail: DEFAULT_BRANDING.contactEmail,
            contactPhone: DEFAULT_BRANDING.contactPhone,
        };
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
        const name = this.branding?.tenantName || DEFAULT_BRANDING.companyName;
        return `My Account | ${name}`;
    }

    getAdminTitle(): string {
        const name = this.branding?.tenantName || DEFAULT_BRANDING.companyName;
        return `Dealer Portal | ${name}`;
    }

    private async loadBranding(): Promise<BrandingInfo> {
        let tenantName = '';
        let tenantSlug = '';
        let tenantId: string | undefined;
        let logoBase64: string | null = null;
        let logoType: string | null = null;
        let contactEmail: string | null = null;
        let contactPhone: string | null = null;

        try {
            const tenant = await TenantService.getTenant();
            tenantName = tenant.name ?? '';
            tenantSlug = tenant.slug ?? '';
            tenantId = tenant.id;
            logoBase64 = tenant.logoBase64 ?? null;
            logoType = tenant.logoType ?? null;
            contactEmail = tenant.contactEmail ?? null;
            contactPhone = tenant.contactPhone ?? null;
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
            tenantName: tenantName.trim() || DEFAULT_BRANDING.companyName,
            tenantSlug: tenantSlug.trim(),
            logoBase64: logoBase64 ?? DEFAULT_BRANDING.logoBase64,
            logoType: logoType ?? DEFAULT_BRANDING.logoType,
            contactEmail: contactEmail ?? DEFAULT_BRANDING.contactEmail,
            contactPhone: contactPhone ?? DEFAULT_BRANDING.contactPhone,
        };

        this.branding = branding;
        this.writeCachedBranding(branding);
        this.pending = undefined;
        this.listeners.forEach((listener) => listener(branding));
        return branding;
    }

    private readCachedBranding(): BrandingInfo | null {
        try {
            const raw = localStorage.getItem(this.cacheKey);
            if (!raw) return null;
            return JSON.parse(raw) as BrandingInfo;
        } catch {
            return null;
        }
    }

    private writeCachedBranding(branding: BrandingInfo): void {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(branding));
        } catch {
            // Ignore storage errors (quota/private mode).
        }
    }

    private resolveFallback(): { name: string; slug: string } {
        const slug = this.getTenantSlugFromToken() || this.getTenantSlugFromHost();
        const name = slug ? this.formatTenantName(slug) : '';
        return { name, slug };
    }

    private getTenantSlugFromToken(): string {
        const token = localStorage.getItem('auth_token');
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
export { DEFAULT_BRANDING };
