import { client } from '../client';
import type { Job } from '../types/domain';

export const JobsService = {
    getJobs: () =>
        client.request<Job[]>('/jobs'),

    getJobDetails: (jobId: number) =>
        client.request<Job>(`/jobs/${jobId}`),
};
