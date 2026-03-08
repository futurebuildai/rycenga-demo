import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocsService } from '../../connect/services/docs.service';
import { client } from '../../connect/client';

vi.mock('../../connect/client', () => ({
    client: {
        request: vi.fn(),
        requestBlob: vi.fn(),
    },
}));

describe('DocsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch docs with no params', async () => {
        const mockResponse = { items: [], total: 0 };
        vi.mocked(client.request).mockResolvedValue(mockResponse);

        const result = await DocsService.getMyDocs();

        expect(client.request).toHaveBeenCalledWith('/files?view=list');
        expect(result).toEqual(mockResponse);
    });

    it('should build query params for getMyDocs', async () => {
        const mockResponse = { items: [], total: 5 };
        vi.mocked(client.request).mockResolvedValue(mockResponse);

        await DocsService.getMyDocs({
            search: 'invoice',
            tab: 'shared',
            filePath: 'Permits',
            sort: 'newest',
            page: 2,
            pageSize: 10,
        });

        const calledUrl = vi.mocked(client.request).mock.calls[0][0];
        expect(calledUrl).toContain('/files?');
        expect(calledUrl).toContain('view=list');
        expect(calledUrl).toContain('search=invoice');
        expect(calledUrl).toContain('tab=shared');
        expect(calledUrl).toContain('filePath=Permits');
        expect(calledUrl).toContain('sort=newest');
        expect(calledUrl).toContain('page=2');
        expect(calledUrl).toContain('page_size=10');
    });

    it('should not include tab=all in query params', async () => {
        vi.mocked(client.request).mockResolvedValue({ items: [], total: 0 });

        await DocsService.getMyDocs({ tab: 'all' });

        expect(client.request).toHaveBeenCalledWith('/files?view=list');
    });

    it('should fetch summary', async () => {
        const mockSummary = { totalFiles: 10, sharedByDealer: 6, myUploads: 4, pendingAck: 2 };
        vi.mocked(client.request).mockResolvedValue(mockSummary);

        const result = await DocsService.getSummary();

        expect(client.request).toHaveBeenCalledWith('/files?view=summary');
        expect(result).toEqual(mockSummary);
    });

    it('should fetch folders', async () => {
        const mockFolders = ['Permits', 'Contracts'];
        vi.mocked(client.request).mockResolvedValue(mockFolders);

        const result = await DocsService.getFolders();

        expect(client.request).toHaveBeenCalledWith('/files?view=folders');
        expect(result).toEqual(mockFolders);
    });

    it('should fetch file content', async () => {
        const blobResponse = { blob: new Blob(['test']), contentType: 'application/pdf', contentDisposition: '' };
        vi.mocked(client.requestBlob).mockResolvedValue(blobResponse);

        const result = await DocsService.getFileContent(42);

        expect(client.requestBlob).toHaveBeenCalledWith('/files/42/content');
        expect(result).toEqual(blobResponse);
    });

    it('should upload a file with optional metadata', async () => {
        const mockResponse = { assignmentId: 5 };
        vi.mocked(client.request).mockResolvedValue(mockResponse);
        const file = new File(['hello'], 'report.pdf', { type: 'application/pdf' });

        const result = await DocsService.uploadFile(file, {
            memo: 'Please review',
            attentionTo: 'Billing',
            filePath: 'Permits',
        });

        expect(client.request).toHaveBeenCalledWith('/files', expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
        }));
        expect(result).toEqual(mockResponse);
    });

    it('should acknowledge a document', async () => {
        const mockResponse = { acknowledgedAt: '2026-03-05T12:00:00Z' };
        vi.mocked(client.request).mockResolvedValue(mockResponse);

        const result = await DocsService.acknowledgeDocument(7);

        expect(client.request).toHaveBeenCalledWith('/files/7', {
            method: 'PATCH',
            body: JSON.stringify({ acknowledge: true }),
        });
        expect(result).toEqual(mockResponse);
    });

    it('should move a document to a folder by name', async () => {
        vi.mocked(client.request).mockResolvedValue({ ok: true, id: 5, filePath: 'Contracts' });

        const result = await DocsService.moveToFolder(5, 'Contracts');

        expect(client.request).toHaveBeenCalledWith('/files/5', {
            method: 'PATCH',
            body: JSON.stringify({ filePath: 'Contracts' }),
        });
        expect(result).toEqual({ ok: true, id: 5, filePath: 'Contracts' });
    });

    it('should move a document to root by passing null', async () => {
        vi.mocked(client.request).mockResolvedValue({ ok: true, id: 5, filePath: null });

        await DocsService.moveToFolder(5, null);

        expect(client.request).toHaveBeenCalledWith('/files/5', {
            method: 'PATCH',
            body: JSON.stringify({ filePath: null }),
        });
    });
});
