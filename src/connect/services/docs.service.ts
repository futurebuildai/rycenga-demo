import { client } from '../client.js';
import type {
    ContractorDocumentDTO,
    ContractorDocsSummary,
    ContractorDocsFilterParams,
    ContractorFolder,
    PresignedUrlResponse,
    DocumentViewUrlResponse,
    UploadToDealerPayload,
    AcknowledgeResponse,
} from '../types/domain.js';

/**
 * DocsService - Contractor-facing document operations
 * MAPS TO: /documents/* endpoints (contractor scope)
 */
export const DocsService = {
    /**
     * List contractor documents with filters
     * MAPS TO: GET /documents/my
     */
    getMyDocs: (params?: ContractorDocsFilterParams): Promise<{ items: ContractorDocumentDTO[]; total: number }> => {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.tab && params.tab !== 'all') query.set('tab', params.tab);
        if (params?.folderId) query.set('folderId', String(params.folderId));
        if (params?.sort) query.set('sort', params.sort);
        if (params?.page) query.set('page', String(params.page));
        if (params?.pageSize) query.set('pageSize', String(params.pageSize));
        const qs = query.toString();
        return client.request<{ items: ContractorDocumentDTO[]; total: number }>(
            `/documents/my${qs ? `?${qs}` : ''}`
        );
    },

    /**
     * Get document summary counts
     * MAPS TO: GET /documents/my/summary
     */
    getSummary: (): Promise<ContractorDocsSummary> =>
        client.request<ContractorDocsSummary>('/documents/my/summary'),

    /**
     * Get presigned view URL for a document
     * MAPS TO: GET /documents/{id}/view-url
     */
    getViewUrl: (docId: number): Promise<DocumentViewUrlResponse> =>
        client.request<DocumentViewUrlResponse>(`/documents/${docId}/view-url`),

    /**
     * Get presigned upload URL for uploading to dealer
     * MAPS TO: POST /documents/presigned-url
     */
    getPresignedUploadUrl: (fileName: string, fileType: string): Promise<PresignedUrlResponse> =>
        client.request<PresignedUrlResponse>('/documents/presigned-url', {
            method: 'POST',
            body: JSON.stringify({ fileName, fileType }),
        }),

    /**
     * Confirm upload to dealer with metadata
     * MAPS TO: POST /documents/upload-to-dealer
     */
    confirmUploadToDealer: (payload: UploadToDealerPayload): Promise<{ id: number }> =>
        client.request<{ id: number }>('/documents/upload-to-dealer', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    /**
     * Acknowledge a dealer-shared document
     * MAPS TO: PUT /documents/{id}/acknowledge
     */
    acknowledgeDocument: (docId: number): Promise<AcknowledgeResponse> =>
        client.request<AcknowledgeResponse>(`/documents/${docId}/acknowledge`, {
            method: 'PUT',
        }),

    /**
     * List contractor folders
     * MAPS TO: GET /documents/folders
     */
    getFolders: (): Promise<ContractorFolder[]> =>
        client.request<ContractorFolder[]>('/documents/folders'),

    /**
     * Create a new folder
     * MAPS TO: POST /documents/folders
     */
    createFolder: (name: string): Promise<ContractorFolder> =>
        client.request<ContractorFolder>('/documents/folders', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),

    /**
     * Move a document to a folder
     * MAPS TO: PUT /documents/{id}/move
     */
    moveToFolder: (docId: number, folderId: number | null): Promise<{ success: boolean }> =>
        client.request<{ success: boolean }>(`/documents/${docId}/move`, {
            method: 'PUT',
            body: JSON.stringify({ folderId }),
        }),
};
