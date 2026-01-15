package postgres

import (
	"builderwire/velocity-backend/internal/domain"
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	controlPlanePool *pgxpool.Pool
	tenantPools      sync.Map
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{
		controlPlanePool: pool,
	}
}

func (r *Repository) GetTenantBySlug(ctx context.Context, slug string) (*domain.Tenant, error) {
	query := `
		SELECT id, name, slug, db_name, db_user
		FROM control_plane.tenants
		WHERE slug = $1 AND is_active = TRUE
	`
	var t domain.Tenant
	err := r.controlPlanePool.QueryRow(ctx, query, slug).Scan(&t.ID, &t.Name, &t.Slug, &t.DBName, &t.DBUser)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting tenant by slug: %w", err)
	}
	return &t, nil
}

func (r *Repository) ListTenants(ctx context.Context) ([]domain.Tenant, error) {
	query := `
		SELECT id, name, slug, db_name, db_user
		FROM control_plane.tenants
		WHERE is_active = TRUE
	`
	rows, err := r.controlPlanePool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error displaying tenants: %w", err)
	}
	defer rows.Close()

	var tenants []domain.Tenant
	for rows.Next() {
		var t domain.Tenant
		if err := rows.Scan(&t.ID, &t.Name, &t.Slug, &t.DBName, &t.DBUser); err != nil {
			return nil, err
		}
		tenants = append(tenants, t)
	}
	return tenants, rows.Err()
}

func (r *Repository) getPool(ctx context.Context) (*pgxpool.Pool, error) {
	tenant := domain.TenantFromContext(ctx)
	if tenant == nil {
		return r.controlPlanePool, nil
	}

	// Check cache
	if pool, ok := r.tenantPools.Load(tenant.ID); ok {
		return pool.(*pgxpool.Pool), nil
	}

	// Create new pool
	// Correct way to clone config:
	configCopy := r.controlPlanePool.Config().ConnConfig.ConnString()

	// Parse it again
	newConfig, err := pgxpool.ParseConfig(configCopy)
	if err != nil {
		return nil, fmt.Errorf("failed to parse base config: %w", err)
	}

	newConfig.ConnConfig.Database = tenant.DBName
	newConfig.MaxConns = 20 // Default or tunable
	newConfig.MinConns = 2
	newConfig.MaxConnLifetime = 30 * time.Minute

	pool, err := pgxpool.NewWithConfig(context.Background(), newConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create pool for tenant %s: %w", tenant.Name, err)
	}

	r.tenantPools.Store(tenant.ID, pool)
	return pool, nil
}
