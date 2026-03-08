import { adminClient } from './admin-client.js';
import type {
    DocsSummary,
    SharedDocumentDTO,
    InboxDocumentDTO,
    DocsFilterParams,
} from '../../connect/types/domain.js';

class AdminDocsServiceImpl {
    async getSummary(): Promise<DocsSummary> {
        return adminClient.request<DocsSummary>('/admin/files?view=summary');
    }

    async getSharedDocs(filters: DocsFilterParams = {}): Promise<{ items: SharedDocumentDTO[]; total: number }> {
        const query = new URLSearchParams();
        query.set('view', 'shared');
        if (filters.search) query.set('search', filters.search);
        if (filters.status) query.set('status', filters.status);
        if (filters.sort) query.set('sort', filters.sort);
        if (filters.page) query.set('page', String(filters.page));
        if (filters.pageSize) query.set('page_size', String(filters.pageSize));
        return adminClient.request<{ items: SharedDocumentDTO[]; total: number }>(`/admin/files?${query.toString()}`);
    }

    async getInboxDocs(filters: DocsFilterParams = {}): Promise<{ items: InboxDocumentDTO[]; total: number }> {
        const query = new URLSearchParams();
        query.set('view', 'inbox');
        if (filters.search) query.set('search', filters.search);
        if (filters.filter) query.set('filter', filters.filter);
        if (filters.sort) query.set('sort', filters.sort);
        if (filters.page) query.set('page', String(filters.page));
        if (filters.pageSize) query.set('page_size', String(filters.pageSize));
        return adminClient.request<{ items: InboxDocumentDTO[]; total: number }>(`/admin/files?${query.toString()}`);
    }

    async uploadAndShare(file: File, payload: { accountId: number; requiresAck: boolean; memo?: string }): Promise<SharedDocumentDTO> {
        const form = new FormData();
        form.append('file', file);
        form.append('accountId', String(payload.accountId));
        form.append('requiresAck', String(payload.requiresAck));
        if (payload.memo) form.append('memo', payload.memo);
        return adminClient.request<SharedDocumentDTO>('/admin/files', {
            method: 'POST',
            body: form,
        });
    }

    async assignInboxDocument(docId: number, userId: number): Promise<{ ok: boolean; id: number; assignedUserId: number }> {
        return adminClient.request<{ ok: boolean; id: number; assignedUserId: number }>(`/admin/files/${docId}`, {
            method: 'PATCH',
            body: JSON.stringify({ assignedUserId: userId }),
        });
    }

    async getDocumentContent(docId: number) {
        return adminClient.requestBlob(`/admin/files/${docId}/content`);
    }
}

export const AdminDocsService = new AdminDocsServiceImpl();
