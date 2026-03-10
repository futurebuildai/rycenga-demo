import { TenantService } from '../connect/services/tenant';

export interface BrandingInfo {
    tenantId?: string;
    tenantName: string;
    tenantSlug: string;
    templateId: number;
    paletteId: number;
    logoBase64: string | null;
    logoType: string | null;
    contactEmail: string;
    contactPhone: string;
    logoUrl?: string;
}

interface BrandingCacheEnvelope {
    branding: BrandingInfo;
    cachedAt: number;
}

export const BRANDING_REFRESH_SIGNAL_KEY = 'branding_refresh_signal_v1';

const DEFAULT_BRANDING = {
    companyName: 'BuilderWire',
    templateId: 1,
    paletteId: 1,
    logoBase64: null,
    logoType: null,
    contactEmail: 'support@builderwire.com',
    contactPhone: '(555) 000-0000',
};

class BrandingServiceImpl {
    private branding: BrandingInfo | null = null;
    private brandingCachedAt = 0;
    private pending?: Promise<BrandingInfo>;
    private listeners = new Set<(branding: BrandingInfo) => void>();
    private cacheKey = 'branding_cache_v3';

    async getBranding(forceRefresh = false): Promise<BrandingInfo> {
        if (!this.branding) {
            const cached = this.readCachedBranding();
            if (cached) {
                this.branding = cached.branding;
                this.brandingCachedAt = cached.cachedAt;
            }
        }

        if (!forceRefresh && this.branding) {
            return this.branding;
        }

        if (this.pending) {
            return this.pending;
        }

        if (!this.pending) {
            this.pending = this.loadBranding();
        }
        return this.pending;
    }

    getBrandingSync(): BrandingInfo {
        if (!this.branding) {
            const cached = this.readCachedBranding();
            if (cached) {
                this.branding = cached.branding;
                this.brandingCachedAt = cached.cachedAt;
            }
        }
        if (this.branding) return this.branding;
        return {
            tenantId: undefined,
            tenantName: DEFAULT_BRANDING.companyName,
            tenantSlug: '',
            templateId: DEFAULT_BRANDING.templateId,
            paletteId: DEFAULT_BRANDING.paletteId,
            logoBase64: DEFAULT_BRANDING.logoBase64,
            logoType: DEFAULT_BRANDING.logoType,
            contactEmail: DEFAULT_BRANDING.contactEmail,
            contactPhone: DEFAULT_BRANDING.contactPhone,
        };
    }

    getCached(): BrandingInfo | null {
        return this.branding;
    }

    async refreshBranding(): Promise<BrandingInfo> {
        // Clear pending first so forced refresh can start a new request cycle
        // after the current one has completed.
        this.pending = undefined;
        return this.getBranding(true);
    }

    signalBrandingRefresh(): void {
        try {
            localStorage.setItem(BRANDING_REFRESH_SIGNAL_KEY, String(Date.now()));
        } catch {
            // Ignore storage errors.
        }
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
        let templateId = DEFAULT_BRANDING.templateId;
        let paletteId = DEFAULT_BRANDING.paletteId;
        let logoBase64: string | null = null;
        let logoType: string | null = null;
        let contactEmail: string | null = null;
        let contactPhone: string | null = null;

        try {
            const tenant = await TenantService.getTenant();
            tenantName = tenant.name ?? '';
            tenantSlug = tenant.slug ?? '';
            tenantId = tenant.id;
            const parsedTemplateId = Number(tenant.template_id ?? tenant.templateId);
            if (Number.isFinite(parsedTemplateId) && parsedTemplateId > 0) {
                templateId = parsedTemplateId;
            }
            const parsedPaletteId = Number(tenant.palette_id ?? tenant.paletteId);
            if (Number.isFinite(parsedPaletteId) && parsedPaletteId > 0) {
                paletteId = parsedPaletteId;
            }
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
            templateId,
            paletteId,
            logoBase64: logoBase64 ?? DEFAULT_BRANDING.logoBase64,
            logoType: logoType ?? DEFAULT_BRANDING.logoType,
            contactEmail: contactEmail ?? DEFAULT_BRANDING.contactEmail,
            contactPhone: contactPhone ?? DEFAULT_BRANDING.contactPhone,
            logoUrl: '/assets/lmc-logo.png',
        };

        this.branding = branding;
        this.brandingCachedAt = Date.now();
        this.writeCachedBranding(branding);
        this.pending = undefined;
        this.listeners.forEach((listener) => listener(branding));
        return branding;
    }

    private readCachedBranding(): BrandingCacheEnvelope | null {
        try {
            const raw = localStorage.getItem(this.cacheKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as BrandingCacheEnvelope | BrandingInfo;
            // Backward compatibility with prior cache shape.
            if ('branding' in parsed && typeof parsed.cachedAt === 'number') {
                return parsed as BrandingCacheEnvelope;
            }
            return {
                branding: parsed as BrandingInfo,
                cachedAt: 0,
            };
        } catch {
            return null;
        }
    }

    private writeCachedBranding(branding: BrandingInfo): void {
        try {
            const payload: BrandingCacheEnvelope = {
                branding,
                cachedAt: Date.now(),
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(payload));
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
