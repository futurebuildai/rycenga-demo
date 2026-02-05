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
}

export interface BrandingUpdatePayload {
    companyName?: string;
    contactEmail?: string;
    contactPhone?: string;
}

// BuilderWire fallback branding
const DEFAULT_BRANDING: DealerBranding = {
    companyName: 'BuilderWire',
    logoUrl: null,
    contactEmail: 'support@builderwire.com',
    contactPhone: '(555) 000-0000',
};

class AdminBrandingServiceImpl {
    private cachedBranding: DealerBranding | null = null;

    /**
     * Get current dealer branding configuration
     */
    async getBranding(): Promise<DealerBranding> {
        try {
            const data = await adminClient.request<DealerBranding>('/admin/branding');
            this.cachedBranding = data;
            return data;
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
        const data = await adminClient.request<DealerBranding>('/admin/branding', {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        this.cachedBranding = data;
        return data;
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
        const token = localStorage.getItem('admin_auth_token');
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
