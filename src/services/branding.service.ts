/**
 * BrandingService - Singleton for dealer branding configuration
 * Fetches and caches dealer-specific branding (logo, name, contact info)
 * Falls back to BuilderWire defaults when not configured
 */

import { API_CONFIG } from '../connect/config.js';

export interface DealerBranding {
    companyName: string;
    logoUrl: string | null;
    contactEmail: string;
    contactPhone: string;
}

// BuilderWire fallback branding when dealer hasn't configured
const DEFAULT_BRANDING: DealerBranding = {
    companyName: 'BuilderWire',
    logoUrl: null,
    contactEmail: 'support@builderwire.com',
    contactPhone: '(555) 000-0000',
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

class BrandingServiceImpl {
    private branding: DealerBranding | null = null;
    private lastFetch: number = 0;
    private fetchPromise: Promise<DealerBranding> | null = null;
    private listeners: Set<(branding: DealerBranding) => void> = new Set();

    /**
     * Get current branding data
     * Fetches from API if not cached or cache expired
     */
    async getBranding(): Promise<DealerBranding> {
        const now = Date.now();

        // Return cached if still valid
        if (this.branding && (now - this.lastFetch) < CACHE_TTL_MS) {
            return this.branding;
        }

        // Avoid duplicate fetches
        if (this.fetchPromise) {
            return this.fetchPromise;
        }

        this.fetchPromise = this.fetchBranding();

        try {
            this.branding = await this.fetchPromise;
            this.lastFetch = Date.now();
            return this.branding;
        } finally {
            this.fetchPromise = null;
        }
    }

    /**
     * Get branding synchronously (returns cached or defaults)
     * Useful for initial render before async fetch completes
     */
    getBrandingSync(): DealerBranding {
        return this.branding ?? DEFAULT_BRANDING;
    }

    /**
     * Subscribe to branding changes
     */
    subscribe(listener: (branding: DealerBranding) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Force refresh branding from API
     */
    async refresh(): Promise<DealerBranding> {
        this.branding = null;
        this.lastFetch = 0;
        const branding = await this.getBranding();
        this.notifyListeners(branding);
        return branding;
    }

    /**
     * Clear cached branding
     */
    clearCache(): void {
        this.branding = null;
        this.lastFetch = 0;
    }

    private async fetchBranding(): Promise<DealerBranding> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            // Development override for tenant testing
            if (import.meta.env.DEV) {
                const devTenantId = import.meta.env.VITE_DEV_TENANT_ID as string | undefined;
                if (devTenantId) {
                    headers['X-Tenant-ID'] = devTenantId;
                }
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}/branding/public`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                // Backend not available or branding not configured
                console.warn('Branding endpoint not available, using defaults');
                return DEFAULT_BRANDING;
            }

            const data = await response.json();

            // Map backend response to DealerBranding interface
            return {
                companyName: data.companyName || DEFAULT_BRANDING.companyName,
                logoUrl: data.logoUrl || null,
                contactEmail: data.contactEmail || DEFAULT_BRANDING.contactEmail,
                contactPhone: data.contactPhone || DEFAULT_BRANDING.contactPhone,
            };
        } catch (error) {
            console.warn('Failed to fetch branding, using defaults:', error);
            return DEFAULT_BRANDING;
        }
    }

    private notifyListeners(branding: DealerBranding): void {
        this.listeners.forEach(listener => listener(branding));
    }
}

// Singleton export
export const BrandingService = new BrandingServiceImpl();

// Re-export types and defaults for use elsewhere
export { DEFAULT_BRANDING };
