import { client } from '../client.js';
import type {
    ContractorDocumentDTO,
    ContractorDocsSummary,
    ContractorDocsFilterParams,
    AcknowledgeResponse,
} from '../types/domain.js';

export const DocsService = {
    getMyDocs: (params?: ContractorDocsFilterParams): Promise<{ items: ContractorDocumentDTO[]; total: number }> => {
        const query = new URLSearchParams();
        query.set('view', 'list');
        if (params?.search) query.set('search', params.search);
        if (params?.tab && params.tab !== 'all') query.set('tab', params.tab);
        if (params?.filePath) query.set('filePath', params.filePath);
        if (params?.sort) query.set('sort', params.sort);
        if (params?.page) query.set('page', String(params.page));
        if (params?.pageSize) query.set('page_size', String(params.pageSize));
        return client.request<{ items: ContractorDocumentDTO[]; total: number }>(`/files?${query.toString()}`);
    },

    getSummary: (): Promise<ContractorDocsSummary> =>
        client.request<ContractorDocsSummary>('/files?view=summary'),

    getFolders: (): Promise<string[]> =>
        client.request<string[]>('/files?view=folders'),

    getFileContent: (docId: number) =>
        client.requestBlob(`/files/${docId}/content`),

    uploadFile: (file: File, options: { memo?: string; attentionTo?: string; filePath?: string }): Promise<ContractorDocumentDTO> => {
        const form = new FormData();
        form.append('file', file);
        if (options.memo) form.append('memo', options.memo);
        if (options.attentionTo) form.append('attentionTo', options.attentionTo);
        if (options.filePath) form.append('filePath', options.filePath);
        return client.request<ContractorDocumentDTO>('/files', {
            method: 'POST',
            body: form,
        });
    },

    acknowledgeDocument: (docId: number): Promise<AcknowledgeResponse> =>
        client.request<AcknowledgeResponse>(`/files/${docId}`, {
            method: 'PATCH',
            body: JSON.stringify({ acknowledge: true }),
        }),

    moveToFolder: (docId: number, filePath: string | null): Promise<{ ok: boolean; id: number; filePath?: string | null }> =>
        client.request<{ ok: boolean; id: number; filePath?: string | null }>(`/files/${docId}`, {
            method: 'PATCH',
            body: JSON.stringify({ filePath }),
        }),
};
