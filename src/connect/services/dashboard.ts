import { client } from '../client.js';
import type { DashboardSummary } from '../types/domain.js';

export class DashboardService {
    /**
     * Get dashboard summary stats
     * GET /dashboard/summary?account_id={accountId}
     */
    static async getSummary(accountId: number): Promise<DashboardSummary> {
        return client.request<DashboardSummary>(`/dashboard/summary?account_id=${accountId}`);
    }
}
