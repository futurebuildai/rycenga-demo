import { client } from '../client';
import type { TenantInfo } from '../types/domain';

export const TenantService = {
    getTenant(): Promise<TenantInfo> {
        return client.request<TenantInfo>('/tenant', { requiresAuth: false });
    },
};
