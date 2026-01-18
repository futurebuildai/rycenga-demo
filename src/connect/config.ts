/// <reference types="vite/client" />

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',
    TENANT_ID: import.meta.env.VITE_TENANT_ID || 'demo-tenant',
    TIMEOUT: 10000,
};
