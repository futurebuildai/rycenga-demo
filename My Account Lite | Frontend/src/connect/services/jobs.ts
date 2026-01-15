import { client } from '../client';
import type { Job } from '../types/domain';

export const JobsService = {
    getJobs: (accountId: number) =>
        client.request<Job[]>(`/jobs?account_id=${accountId}`),

    getJobDetails: (jobId: number) =>
        client.request<Job>(`/jobs/${jobId}`),
};
