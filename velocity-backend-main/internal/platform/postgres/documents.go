package postgres

import (
	"builderwire/velocity-backend/internal/domain"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// Documents

func (r *Repository) ListDocumentsByAccount(ctx context.Context, accountID int64) ([]domain.Document, error) {
	query := `
		SELECT 
			id, account_id, filename, mime_type, storage_key, hash, created_at, doc_type
		FROM core.documents
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying documents: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.Document])
}

func (r *Repository) GetDocumentByID(ctx context.Context, id int64) (*domain.Document, error) {
	query := `
		SELECT 
			id, account_id, filename, mime_type, storage_key, hash, created_at, doc_type
		FROM core.documents
		WHERE id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("error querying document by id: %w", err)
	}
	d, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Document])
	if err != nil {
		return nil, fmt.Errorf("error collecting document by id: %w", err)
	}
	return &d, nil
}
