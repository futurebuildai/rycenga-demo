import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentsService } from '../../connect/services/documents';
import { client } from '../../connect/client';

vi.mock('../../connect/client', () => ({
    client: {
        requestBlob: vi.fn(),
    },
}));

describe('DocumentsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch PDF and return blob directly if it has PDF header', async () => {
        const mockPdfBuffer = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x31, 0x2E, 0x34]); // %PDF1.4
        const mockBlob = new Blob([mockPdfBuffer], { type: 'application/pdf' });

        vi.mocked(client.requestBlob).mockResolvedValue({
            blob: mockBlob,
            contentType: 'application/pdf',
            contentDisposition: 'attachment; filename="test.pdf"',
        });

        const result = await DocumentsService.getDocumentPdf({ type: 'invoice', id: 123 });

        expect(result.filename).toBe('test.pdf');
        expect(result.contentType).toBe('application/pdf');
    });

    it('should decode base64 if PDF header is missing and content is base64', async () => {
        const pdfContent = '%PDF-1.4...';
        const base64Content = btoa(pdfContent);
        const mockBlob = new Blob([base64Content], { type: 'text/plain' });

        vi.mocked(client.requestBlob).mockResolvedValue({
            blob: mockBlob,
            contentType: 'text/plain',
            contentDisposition: '',
        });

        const result = await DocumentsService.getDocumentPdf({ type: 'invoice', id: 123 });

        expect(result.filename).toBe('invoice-123.pdf');
        expect(result.blob.type).toBe('application/pdf');

        const buffer = await result.blob.arrayBuffer();
        const text = new TextDecoder().decode(buffer);
        expect(text).toBe(pdfContent);
    });

    it('should support fetching statement PDFs', async () => {
        const mockPdfBuffer = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x31, 0x2E, 0x35]);
        const mockBlob = new Blob([mockPdfBuffer], { type: 'application/pdf' });

        vi.mocked(client.requestBlob).mockResolvedValue({
            blob: mockBlob,
            contentType: 'application/pdf',
            contentDisposition: 'attachment; filename="statement-456.pdf"',
        });

        const result = await DocumentsService.getDocumentPdf({ type: 'statement', id: 456 });

        expect(result.filename).toBe('statement-456.pdf');
        expect(result.blob.type).toBe('application/pdf');
    });
});
