/**
 * Document Management Service
 * Handles shared documents and inbox document operations.
 */

import { adminClient } from './admin-client.js';
import type {
    DocsSummary,
    SharedDocumentDTO,
    InboxDocumentDTO,
    PresignedUrlResponse,
    DocumentViewUrlResponse,
    SharePayload,
    DocsFilterParams,
} from '../../connect/types/domain.js';

class AdminDocsServiceImpl {
    async getSummary(): Promise<DocsSummary> {
        return adminClient.request<DocsSummary>('/admin/documents/summary');
    }

    async getSharedDocs(filters: DocsFilterParams = {}): Promise<{ items: SharedDocumentDTO[]; total: number }> {
        const query = new URLSearchParams();
        if (filters.search) query.set('search', filters.search);
        if (filters.status) query.set('status', filters.status);
        if (filters.sort) query.set('sort', filters.sort);
        if (filters.page) query.set('page', String(filters.page));
        if (filters.pageSize) query.set('pageSize', String(filters.pageSize));
        const qs = query.toString();
        return adminClient.request<{ items: SharedDocumentDTO[]; total: number }>(
            `/admin/documents/shared${qs ? `?${qs}` : ''}`
        );
    }

    async getInboxDocs(filters: DocsFilterParams = {}): Promise<{ items: InboxDocumentDTO[]; total: number }> {
        const query = new URLSearchParams();
        if (filters.search) query.set('search', filters.search);
        if (filters.filter) query.set('filter', filters.filter);
        if (filters.sort) query.set('sort', filters.sort);
        if (filters.page) query.set('page', String(filters.page));
        if (filters.pageSize) query.set('pageSize', String(filters.pageSize));
        const qs = query.toString();
        return adminClient.request<{ items: InboxDocumentDTO[]; total: number }>(
            `/admin/documents/inbox${qs ? `?${qs}` : ''}`
        );
    }

    async getPresignedUploadUrl(fileName: string, fileType: string): Promise<PresignedUrlResponse> {
        return adminClient.request<PresignedUrlResponse>('/admin/documents/presigned-url', {
            method: 'POST',
            body: JSON.stringify({ fileName, fileType }),
        });
    }

    async confirmUploadAndShare(payload: SharePayload): Promise<{ id: number }> {
        return adminClient.request<{ id: number }>('/admin/documents/share', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async assignInboxDocument(docId: number, userId: number): Promise<{ success: boolean }> {
        return adminClient.request<{ success: boolean }>(`/admin/documents/inbox/${docId}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ userId }),
        });
    }

    async getDocumentViewUrl(docId: number): Promise<DocumentViewUrlResponse> {
        return adminClient.request<DocumentViewUrlResponse>(`/admin/documents/${docId}/view-url`);
    }
}

export const AdminDocsService = new AdminDocsServiceImpl();
