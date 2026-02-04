export type PaginationToken = number | 'ellipsis';

export function buildPaginationTokens(currentPage: number, totalPages: number): PaginationToken[] {
    if (totalPages <= 1) {
        return [];
    }

    const pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages]
        .filter((page, idx, arr) => page >= 1 && page <= totalPages && arr.indexOf(page) === idx)
        .sort((a, b) => a - b);

    const tokens: PaginationToken[] = [];
    let previous = 0;
    for (const page of pages) {
        if (page - previous > 1) {
            tokens.push('ellipsis');
        }
        tokens.push(page);
        previous = page;
    }

    return tokens;
}

export function getPaginationBounds(page: number, pageSize: number, total: number): { start: number; end: number } {
    if (total === 0) {
        return { start: 0, end: 0 };
    }

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return { start, end };
}
