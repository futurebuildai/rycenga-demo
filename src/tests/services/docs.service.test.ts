import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocsService } from '../../connect/services/docs.service';
import { client } from '../../connect/client';

vi.mock('../../connect/client', () => ({
    client: {
        request: vi.fn(),
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

        expect(client.request).toHaveBeenCalledWith('/documents/my');
        expect(result).toEqual(mockResponse);
    });

    it('should build query params for getMyDocs', async () => {
        const mockResponse = { items: [], total: 5 };
        vi.mocked(client.request).mockResolvedValue(mockResponse);

        await DocsService.getMyDocs({
            search: 'invoice',
            tab: 'shared',
            folderId: 3,
            sort: 'newest',
            page: 2,
            pageSize: 10,
        });

        const calledUrl = vi.mocked(client.request).mock.calls[0][0];
        expect(calledUrl).toContain('/documents/my?');
        expect(calledUrl).toContain('search=invoice');
        expect(calledUrl).toContain('tab=shared');
        expect(calledUrl).toContain('folderId=3');
        expect(calledUrl).toContain('sort=newest');
        expect(calledUrl).toContain('page=2');
        expect(calledUrl).toContain('pageSize=10');
    });

    it('should not include tab=all in query params', async () => {
        vi.mocked(client.request).mockResolvedValue({ items: [], total: 0 });

        await DocsService.getMyDocs({ tab: 'all' });

        expect(client.request).toHaveBeenCalledWith('/documents/my');
    });

    it('should fetch summary', async () => {
        const mockSummary = { totalFiles: 10, sharedByDealer: 6, myUploads: 4, pendingAck: 2 };
        vi.mocked(client.request).mockResolvedValue(mockSummary);

        const result = await DocsService.getSummary();

        expect(client.request).toHaveBeenCalledWith('/documents/my/summary');
        expect(result).toEqual(mockSummary);
    });

    it('should get view URL for a document', async () => {
        const mockResponse = { viewUrl: 'https://s3.example.com/doc.pdf', contentType: 'application/pdf' };
        vi.mocked(client.request).mockResolvedValue(mockResponse);

        const result = await DocsService.getViewUrl(42);

        expect(client.request).toHaveBeenCalledWith('/documents/42/view-url');
        expect(result).toEqual(mockResponse);
    });

    it('should get presigned upload URL', async () => {
        const mockResponse = { uploadUrl: 'https://s3.example.com/upload', s3Key: 'docs/abc123.pdf' };
        vi.mocked(client.request).mockResolvedValue(mockResponse);

        const result = await DocsService.getPresignedUploadUrl('report.pdf', 'application/pdf');

        expect(client.request).toHaveBeenCalledWith('/documents/presigned-url', {
            method: 'POST',
            body: JSON.stringify({ fileName: 'report.pdf', fileType: 'application/pdf' }),
        });
        expect(result).toEqual(mockResponse);
    });

    it('should confirm upload to dealer', async () => {
        const mockResponse = { id: 99 };
        vi.mocked(client.request).mockResolvedValue(mockResponse);

        const payload = {
            fileName: 'report.pdf',
            s3Key: 'docs/abc123.pdf',
            fileSize: 1024,
            fileType: 'application/pdf',
            memo: 'Please review',
            attentionTo: 'Billing',
        };

        const result = await DocsService.confirmUploadToDealer(payload);

        expect(client.request).toHaveBeenCalledWith('/documents/upload-to-dealer', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        expect(result).toEqual(mockResponse);
    });

    it('should acknowledge a document', async () => {
        const mockResponse = { acknowledgedAt: '2026-03-05T12:00:00Z' };
        vi.mocked(client.request).mockResolvedValue(mockResponse);

        const result = await DocsService.acknowledgeDocument(7);

        expect(client.request).toHaveBeenCalledWith('/documents/7/acknowledge', {
            method: 'PUT',
        });
        expect(result).toEqual(mockResponse);
    });

    it('should list folders', async () => {
        const mockFolders = [
            { id: 1, name: 'Permits', createdAt: '2026-01-15T00:00:00Z' },
            { id: 2, name: 'Contracts', createdAt: '2026-02-01T00:00:00Z' },
        ];
        vi.mocked(client.request).mockResolvedValue(mockFolders);

        const result = await DocsService.getFolders();

        expect(client.request).toHaveBeenCalledWith('/documents/folders');
        expect(result).toEqual(mockFolders);
    });

    it('should create a folder', async () => {
        const mockFolder = { id: 3, name: 'Invoices', createdAt: '2026-03-05T00:00:00Z' };
        vi.mocked(client.request).mockResolvedValue(mockFolder);

        const result = await DocsService.createFolder('Invoices');

        expect(client.request).toHaveBeenCalledWith('/documents/folders', {
            method: 'POST',
            body: JSON.stringify({ name: 'Invoices' }),
        });
        expect(result).toEqual(mockFolder);
    });

    it('should move a document to a folder', async () => {
        vi.mocked(client.request).mockResolvedValue({ success: true });

        const result = await DocsService.moveToFolder(5, 2);

        expect(client.request).toHaveBeenCalledWith('/documents/5/move', {
            method: 'PUT',
            body: JSON.stringify({ folderId: 2 }),
        });
        expect(result).toEqual({ success: true });
    });
});
