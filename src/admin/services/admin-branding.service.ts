/**
 * AdminBrandingService - Admin portal branding management
 * Provides methods for viewing and updating dealer branding configuration
 */

import { adminClient } from './admin-client.js';
import { API_CONFIG } from '../../connect/config.js';

export interface DealerBranding {
    companyName: string;
    logoUrl: string | null;
    contactEmail: string;
    contactPhone: string;
    templateId: number;
}

export interface BrandingUpdatePayload {
    companyName?: string;
    contactEmail?: string;
    contactPhone?: string;
    templateId?: number;
    template_id?: number;
}

// BuilderWire fallback branding
const DEFAULT_BRANDING: DealerBranding = {
    companyName: 'BuilderWire',
    logoUrl: null,
    contactEmail: 'support@builderwire.com',
    contactPhone: '(555) 000-0000',
    templateId: 1,
};

class AdminBrandingServiceImpl {
    private cachedBranding: DealerBranding | null = null;

    private normalizeBranding(input: Partial<DealerBranding> & { template_id?: number | null; templateId?: number | null }): DealerBranding {
        const parsedTemplateId = Number(input.templateId ?? input.template_id);
        const templateId = Number.isFinite(parsedTemplateId) && parsedTemplateId > 0 ? parsedTemplateId : DEFAULT_BRANDING.templateId;
        return {
            companyName: input.companyName?.trim() || DEFAULT_BRANDING.companyName,
            logoUrl: input.logoUrl ?? DEFAULT_BRANDING.logoUrl,
            contactEmail: input.contactEmail?.trim() || DEFAULT_BRANDING.contactEmail,
            contactPhone: input.contactPhone?.trim() || DEFAULT_BRANDING.contactPhone,
            templateId,
        };
    }

    /**
     * Get current dealer branding configuration
     */
    async getBranding(): Promise<DealerBranding> {
        try {
            const data = await adminClient.request<Partial<DealerBranding> & { template_id?: number | null; templateId?: number | null }>('/admin/branding');
            const normalized = this.normalizeBranding(data);
            this.cachedBranding = normalized;
            return normalized;
        } catch (error) {
            console.warn('Failed to fetch branding, using defaults:', error);
            return DEFAULT_BRANDING;
        }
    }

    /**
     * Get branding synchronously (cached or defaults)
     */
    getBrandingSync(): DealerBranding {
        return this.cachedBranding ?? DEFAULT_BRANDING;
    }

    /**
     * Update branding metadata (name, email, phone)
     */
    async updateBranding(payload: BrandingUpdatePayload): Promise<DealerBranding> {
        const bodyPayload: BrandingUpdatePayload = { ...payload };
        if (payload.templateId !== undefined && payload.template_id === undefined) {
            bodyPayload.template_id = payload.templateId;
        }

        const data = await adminClient.request<Partial<DealerBranding> & { template_id?: number | null; templateId?: number | null }>('/admin/branding', {
            method: 'PUT',
            body: JSON.stringify(bodyPayload),
        });

        const normalized = this.normalizeBranding(data);
        this.cachedBranding = normalized;
        return normalized;
    }

    /**
     * Upload logo image
     * Returns the new logo URL
     */
    async uploadLogo(file: File): Promise<string> {
        // Validate file (SVG not supported due to XSS risk)
        const validTypes = ['image/png', 'image/jpeg'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload PNG or JPG.');
        }

        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            throw new Error('File too large. Maximum size is 2MB.');
        }

        // Build multipart form data
        const formData = new FormData();
        formData.append('logo', file);

        // Use fetch directly for multipart upload
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Development override for tenant testing
        if (import.meta.env.DEV) {
            const devTenantId = import.meta.env.VITE_DEV_TENANT_ID as string | undefined;
            if (devTenantId) {
                headers['X-Tenant-ID'] = devTenantId;
            }
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/branding/logo`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to upload logo');
        }

        const result = await response.json();

        // Update cached branding with new logo URL
        if (this.cachedBranding) {
            this.cachedBranding.logoUrl = result.logoUrl;
        }

        return result.logoUrl;
    }

    /**
     * Delete the current logo
     */
    async deleteLogo(): Promise<void> {
        await adminClient.request('/admin/branding/logo', {
            method: 'DELETE',
        });

        // Update cached branding
        if (this.cachedBranding) {
            this.cachedBranding.logoUrl = null;
        }
    }

    /**
     * Clear cached branding
     */
    clearCache(): void {
        this.cachedBranding = null;
    }
}

// Singleton export
export const AdminBrandingService = new AdminBrandingServiceImpl();

// Re-export for convenience
export { DEFAULT_BRANDING };
