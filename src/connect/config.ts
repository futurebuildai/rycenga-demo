/// <reference types="vite/client" />

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',
    TIMEOUT: 10000,
};
