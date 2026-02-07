import { client } from '../client';
import type { Job, JobSummary } from '../types/domain';

export const JobsService = {
    getJobs: () =>
        client.request<Job[]>('/jobs'),

    getJobDetails: (jobId: number) =>
        client.request<Job>(`/jobs/${jobId}`),

    getJobSummaries: () =>
        client.request<JobSummary[]>('/jobs/summary'),
};
