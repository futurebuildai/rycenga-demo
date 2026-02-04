import { client } from '../client.js';
import type { DashboardSummary } from '../types/domain.js';

export class DashboardService {
    /**
     * Get dashboard summary stats
     * GET /dashboard/summary
     * Should only be called from user context
     */
    static async getSummary(): Promise<DashboardSummary> {
        return client.request<DashboardSummary>('/dashboard/summary');
    }
}
