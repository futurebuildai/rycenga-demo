package postgres

import (
	"builderwire/velocity-backend/internal/domain"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// Locations

func (r *Repository) ListLocations(ctx context.Context) ([]domain.Location, error) {
	query := `
		SELECT 
			id, name, code, address_line_1, city, state, zip, is_active, external_id, created_at
		FROM core.locations
		WHERE is_active = TRUE
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying locations: %w", err)
	}

	locations, err := pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.Location])
	if err != nil {
		return nil, fmt.Errorf("error collecting locations: %w", err)
	}
	return locations, nil
}

func (r *Repository) BulkUpsertLocations(ctx context.Context, locations []*domain.Location) error {
	if len(locations) == 0 {
		return nil
	}

	query := `
		INSERT INTO core.locations (
			name, code, address_line_1, city, state, zip, is_active, external_id, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		ON CONFLICT (code) DO UPDATE SET
			name = EXCLUDED.name,
			address_line_1 = EXCLUDED.address_line_1,
			city = EXCLUDED.city,
			state = EXCLUDED.state,
			zip = EXCLUDED.zip,
			is_active = EXCLUDED.is_active,
			external_id = EXCLUDED.external_id
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return err
	}

	batch := &pgx.Batch{}
	for _, loc := range locations {
		batch.Queue(query,
			loc.Name, loc.Code, loc.AddressLine1, loc.City, loc.State, loc.Zip, loc.IsActive, loc.ExternalID,
		)
	}

	br := pool.SendBatch(ctx, batch)
	defer br.Close()

	for i := 0; i < len(locations); i++ {
		_, err := br.Exec()
		if err != nil {
			return fmt.Errorf("error executing batch upsert for location %d: %w", i, err)
		}
	}

	return nil
}

func (r *Repository) GetLocationByCode(ctx context.Context, code string) (*domain.Location, error) {
	query := `
		SELECT 
			id, name, code, address_line_1, city, state, zip, is_active, external_id, created_at
		FROM core.locations
		WHERE code = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, code)
	if err != nil {
		return nil, fmt.Errorf("error querying location by code: %w", err)
	}
	l, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Location])
	if err != nil {
		return nil, fmt.Errorf("error collecting location by code: %w", err)
	}
	return &l, nil
}

// Jobs

func (r *Repository) ListJobsByAccount(ctx context.Context, accountID int64) ([]domain.Job, error) {
	query := `
		SELECT 
			id, account_id, job_number, name, po_number, address_line_1, address_line_2, 
			city, state, zip, is_active, created_at, updated_at, last_synced_at, 
			site_contact_name, site_contact_phone, site_contact_email
		FROM core.jobs
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying jobs: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.Job])
}

func (r *Repository) GetJobByID(ctx context.Context, id int64) (*domain.Job, error) {
	query := `
		SELECT 
			id, account_id, job_number, name, po_number, address_line_1, address_line_2, 
			city, state, zip, is_active, created_at, updated_at, last_synced_at, 
			site_contact_name, site_contact_phone, site_contact_email
		FROM core.jobs
		WHERE id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("error querying job by id: %w", err)
	}
	j, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Job])
	if err != nil {
		return nil, fmt.Errorf("error collecting job by id: %w", err)
	}
	return &j, nil
}

// Shipments

func (r *Repository) ListShipmentsByAccount(ctx context.Context, accountID int64) ([]domain.Shipment, error) {
	query := `
		SELECT 
			id, account_id, order_id, job_id, shipment_number, status, 
			scheduled_date, shipped_at, delivered_at, vehicle_number, 
			driver_name, tracking_url, pod_document_id, signature_name, created_at
		FROM core.shipments
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying shipments: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.Shipment])
}

func (r *Repository) GetShipmentByID(ctx context.Context, id int64) (*domain.Shipment, error) {
	query := `
		SELECT 
			id, account_id, order_id, job_id, shipment_number, status, 
			scheduled_date, shipped_at, delivered_at, vehicle_number, 
			driver_name, tracking_url, pod_document_id, signature_name, created_at
		FROM core.shipments
		WHERE id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("error querying shipment by id: %w", err)
	}
	s, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Shipment])
	if err != nil {
		return nil, fmt.Errorf("error collecting shipment by id: %w", err)
	}
	return &s, nil
}
