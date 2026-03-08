import { client } from '../client';

export type DocumentType = 'invoice' | 'order' | 'quote' | 'statement';
export type DocumentIdType = 'internal' | 'external';

interface DocumentPdfOptions {
    type: DocumentType;
    id: string | number;
    idType?: DocumentIdType;
    providerKey?: string;
}

export interface DocumentPdfResponse {
    blob: Blob;
    filename: string;
    contentType: string;
}

const isPdfHeader = (buffer: ArrayBuffer): boolean => {
    if (buffer.byteLength < 4) return false;
    const view = new Uint8Array(buffer, 0, 4);
    return view[0] === 0x25 && view[1] === 0x50 && view[2] === 0x44 && view[3] === 0x46; // %PDF
};

const decodeBase64Pdf = (base64: string): Uint8Array => {
    const cleaned = base64.trim().replace(/^data:application\/pdf;base64,/, '');
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

const filenameFromDisposition = (value: string): string | null => {
    if (!value) return null;
    const match = value.match(/filename=\"?([^\";]+)\"?/i);
    return match?.[1] ? match[1].trim() : null;
};

const defaultFilename = (type: DocumentType, id: string | number): string => {
    return `${type}-${id}.pdf`;
};

export const DocumentsService = {
    async getDocumentPdf(options: DocumentPdfOptions): Promise<DocumentPdfResponse> {
        const idType = options.idType || 'internal';
        const query = new URLSearchParams();
        if (options.providerKey) {
            query.set('providerKey', options.providerKey);
        }
        if (idType) {
            query.set('idType', idType);
        }
        const queryString = query.toString() ? `?${query.toString()}` : '';
        const endpoint = `/files/${options.type}/${encodeURIComponent(String(options.id))}/pdf${queryString}`;

        const response = await client.requestBlob(endpoint, {
            headers: {
                Accept: 'application/pdf',
            },
        });

        let pdfBlob = response.blob;
        try {
            const buffer = await response.blob.arrayBuffer();
            if (!isPdfHeader(buffer)) {
                const text = new TextDecoder().decode(buffer).trim();
                if (text.startsWith('JVBERi0') || text.startsWith('data:application/pdf;base64,')) {
                    const bytes = decodeBase64Pdf(text);
                    pdfBlob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
                }
            }
        } catch {
            // Fall back to raw blob on decode errors
        }

        return {
            blob: pdfBlob,
            contentType: response.contentType,
            filename: filenameFromDisposition(response.contentDisposition) || defaultFilename(options.type, options.id),
        };
    },
};
