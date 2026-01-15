package postgres

import (
	"builderwire/velocity-backend/internal/domain"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// Products

func (r *Repository) ListProducts(ctx context.Context) ([]domain.Product, error) {
	query := `
		SELECT 
			id, sku, name, description, category_path, image_url, 
			base_uom, is_active, external_id, last_synced_at
		FROM core.products
		WHERE is_active = TRUE
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying products: %w", err)
	}

	products, err := pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.Product])
	if err != nil {
		return nil, fmt.Errorf("error collecting products: %w", err)
	}
	return products, nil
}

func (r *Repository) GetProductByID(ctx context.Context, id int64) (*domain.Product, error) {
	query := `
		SELECT 
			id, sku, name, description, category_path, image_url, 
			base_uom, is_active, external_id, last_synced_at
		FROM core.products
		WHERE id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("error querying product by id: %w", err)
	}
	p, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Product])
	if err != nil {
		return nil, fmt.Errorf("error collecting product by id: %w", err)
	}
	return &p, nil
}

func (r *Repository) GetProductBySKU(ctx context.Context, sku string) (*domain.Product, error) {
	query := `
		SELECT 
			id, sku, name, description, category_path, image_url, 
			base_uom, is_active, external_id, last_synced_at
		FROM core.products
		WHERE lower(sku) = lower($1)
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, sku)
	if err != nil {
		return nil, fmt.Errorf("error querying product by sku: %w", err)
	}
	p, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Product])
	if err != nil {
		return nil, fmt.Errorf("error collecting product by sku: %w", err)
	}
	return &p, nil
}

// Price Levels

func (r *Repository) ListPriceLevels(ctx context.Context) ([]domain.PriceLevel, error) {
	query := `
		SELECT id, name, erp_id, rank
		FROM core.price_levels
		ORDER BY rank ASC
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying price levels: %w", err)
	}
	levels, err := pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.PriceLevel])
	if err != nil {
		return nil, fmt.Errorf("error collecting price levels: %w", err)
	}
	return levels, nil
}

// Product Prices

func (r *Repository) GetProductPrice(ctx context.Context, productID, priceLevelID int64, uom string) (*domain.ProductPrice, error) {
	query := `
		SELECT id, product_id, price_level_id, uom, price, min_quantity, currency_code
		FROM core.product_prices
		WHERE product_id = $1 AND price_level_id = $2 AND uom = $3
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, productID, priceLevelID, uom)
	if err != nil {
		return nil, fmt.Errorf("error querying product price: %w", err)
	}
	pp, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.ProductPrice])
	if err != nil {
		return nil, fmt.Errorf("error collecting product price: %w", err)
	}
	return &pp, nil
}

func (r *Repository) ListContractPricesByAccount(ctx context.Context, accountID int64) ([]domain.ContractPrice, error) {
	query := `
		SELECT 
			id, account_id, job_id, product_id, uom, fixed_price, 
			start_date, end_date, created_at
		FROM core.contract_prices
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying contract prices: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.ContractPrice])
}

func (r *Repository) ListUOMConversions(ctx context.Context, productID *int64) ([]domain.UOMConversion, error) {
	var query string
	var rows pgx.Rows
	var err error

	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}

	if productID == nil {
		query = `
			SELECT id, from_uom, to_uom, factor, product_id, created_at
			FROM core.uom_conversions
			WHERE product_id IS NULL
		`
		rows, err = pool.Query(ctx, query)
	} else {
		query = `
			SELECT id, from_uom, to_uom, factor, product_id, created_at
			FROM core.uom_conversions
			WHERE product_id IS NULL OR product_id = $1
		`
		rows, err = pool.Query(ctx, query, *productID)
	}

	if err != nil {
		return nil, fmt.Errorf("error querying uom conversions: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.UOMConversion])
}

func (r *Repository) BulkUpsertProducts(ctx context.Context, products []*domain.Product) error {
	if len(products) == 0 {
		return nil
	}

	pool, err := r.getPool(ctx)
	if err != nil {
		return err
	}

	batch := &pgx.Batch{}
	query := `
		INSERT INTO core.products (
			sku, name, description, category_id, image_url, base_uom, is_active, external_id, last_synced_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		ON CONFLICT (sku) DO UPDATE SET
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			category_id = EXCLUDED.category_id,
			image_url = EXCLUDED.image_url,
			base_uom = EXCLUDED.base_uom,
			is_active = EXCLUDED.is_active,
			external_id = EXCLUDED.external_id,
			last_synced_at = NOW()
	`

	for _, p := range products {
		batch.Queue(query, p.SKU, p.Name, p.Description, p.CategoryID, p.ImageURL, p.BaseUOM, p.IsActive, p.ExternalID)
	}

	br := pool.SendBatch(ctx, batch)
	defer br.Close()

	for i := 0; i < len(products); i++ {
		_, err := br.Exec()
		if err != nil {
			return fmt.Errorf("error executing batch upsert for product index %d: %w", i, err)
		}
	}

	return nil
}

func (r *Repository) GetProductByExternalID(ctx context.Context, extID string) (*domain.Product, error) {
	query := `
		SELECT 
			id, sku, name, description, category_id, image_url, 
			base_uom, is_active, external_id, last_synced_at
		FROM core.products
		WHERE external_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, extID)
	if err != nil {
		return nil, fmt.Errorf("error querying product by external id: %w", err)
	}
	p, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Product])
	if err != nil {
		return nil, fmt.Errorf("error collecting product by external id: %w", err)
	}
	return &p, nil
}

func (r *Repository) ListCategories(ctx context.Context) ([]domain.ProductCategory, error) {
	query := `
		SELECT 
			id, name, parent_id, external_id, slug, is_active, created_at
		FROM core.product_categories
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying categories: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.ProductCategory])
}

func (r *Repository) GetCategoryByExternalID(ctx context.Context, extID string) (*domain.ProductCategory, error) {
	query := `
		SELECT 
			id, name, parent_id, external_id, slug, is_active, created_at
		FROM core.product_categories
		WHERE external_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, extID)
	if err != nil {
		return nil, fmt.Errorf("error querying category by external id: %w", err)
	}
	c, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.ProductCategory])
	if err != nil {
		return nil, fmt.Errorf("error collecting category by external id: %w", err)
	}
	return &c, nil
}

func (r *Repository) BulkUpsertProductCategories(ctx context.Context, categories []*domain.ProductCategory) (map[string]int64, error) {
	if len(categories) == 0 {
		return nil, nil
	}

	batch := &pgx.Batch{}
	query := `
		INSERT INTO core.product_categories (
			name, parent_id, external_id, slug, is_active, created_at
		) VALUES ($1, $2, $3, $4, $5, NOW())
		ON CONFLICT (external_id) DO UPDATE SET
			name = EXCLUDED.name,
			parent_id = EXCLUDED.parent_id,
			slug = EXCLUDED.slug,
			is_active = EXCLUDED.is_active
		RETURNING id, external_id
	`

	for _, cat := range categories {
		batch.Queue(query, cat.Name, cat.ParentID, cat.ExternalID, cat.Slug, cat.IsActive)
	}

	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}

	br := pool.SendBatch(ctx, batch)
	defer br.Close()

	idMap := make(map[string]int64)
	for i := 0; i < len(categories); i++ {
		var id int64
		var extID *string
		if err := br.QueryRow().Scan(&id, &extID); err != nil {
			return nil, fmt.Errorf("error executing batch upsert for category index %d: %w", i, err)
		}
		if extID != nil {
			idMap[*extID] = id
		}
	}

	return idMap, nil
}
