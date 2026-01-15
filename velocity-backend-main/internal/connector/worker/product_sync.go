package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"builderwire/velocity-backend/internal/connector/erp"
	"builderwire/velocity-backend/internal/connector/registry"
	"builderwire/velocity-backend/internal/domain"
	"builderwire/velocity-backend/internal/platform/s3"
)

type ProductSyncWorker struct {
	ERP        erp.Connector // Optional: used for testing or overriding dynamic config
	S3         *s3.Client
	Bucket     string
	Dispatcher *Dispatcher
	TaskName   string
}

type ProductSyncRequest struct {
	TenantSlug       string     `json:"tenant_slug"`
	SearchString     string     `json:"search_string"`
	PageNumber       int        `json:"page_number,omitempty"`
	PageSize         int        `json:"page_size,omitempty"`
	ProductGroupType string     `json:"product_group_type,omitempty"`
	ERPConfig        erp.Config `json:"erp_config"`
}

func (w *ProductSyncWorker) Process(ctx context.Context, body []byte) error {
	var req ProductSyncRequest
	if err := json.Unmarshal(body, &req); err != nil {
		return fmt.Errorf("failed to unmarshal product sync request: %w", err)
	}

	tenant := domain.TenantFromContext(ctx)
	if tenant == nil {
		if req.TenantSlug == "" {
			return fmt.Errorf("tenant context or tenant_slug is required")
		}
		tenant = &domain.Tenant{Slug: req.TenantSlug}
		ctx = domain.WithTenant(ctx, tenant)
	}

	// 1. Initialize ERP Client
	connector := w.ERP
	if connector == nil {
		c, err := registry.GetConnector(req.ERPConfig)
		if err != nil {
			return fmt.Errorf("failed to get connector: %w", err)
		}
		connector = c
	}

	start := time.Now()
	pageSize := req.PageSize
	if pageSize == 0 {
		pageSize = 100
	}

	// 0. Fetch Product Groups
	// Already running in a slot, so we can execute directly.
	log.Printf("[%s] Fetching product groups from ERP", tenant.Slug)
	groups, err := connector.GetProductGroups(ctx, req.ProductGroupType)
	if err != nil {
		return fmt.Errorf("failed to fetch product groups: %w", err)
	}

	data, _ := json.MarshalIndent(groups, "", "  ")
	if err := w.S3.Upload(ctx, w.Bucket, "products/category.json", data); err != nil {
		return fmt.Errorf("failed to upload product groups: %w", err)
	}

	// 1. Fetch Branches
	log.Printf("[%s] Fetching branches from ERP", tenant.Slug)
	branches, err := connector.GetBranches(ctx, pageSize)
	if err != nil {
		return fmt.Errorf("failed to fetch branches: %w", err)
	}

	// full sync or search?
	if req.SearchString != "" {
		log.Printf("[%s] Searching products with string '%s' from ERP", tenant.Slug, req.SearchString)
		items, err := connector.SearchProducts(ctx, req.SearchString, req.PageNumber, pageSize)
		if err != nil {
			return fmt.Errorf("failed to search products: %w", err)
		}
		return w.processSyncItems(ctx, tenant.Slug, items, start)
	}

	// Full Sync Mode: Iterate over branches and submit jobs
	log.Printf("[%s] Starting parallel product sync for %d branches", tenant.Slug, len(branches))

	go func() {
		for _, b := range branches {
			if b.ExternalID == nil {
				log.Printf("[%s] Warning: Branch %s has no ExternalID, skipping", tenant.Slug, b.Code)
				continue
			}

			// Create a job for this branch
			branch := b // capture loop var
			job := Job{
				Name: fmt.Sprintf("ProductSyncBranch:%s:%s", tenant.Slug, branch.Code),
				Run: func() error {
					log.Printf("[%s] Syncing branch %s (%s)", tenant.Slug, branch.Name, branch.Code)

					items, err := connector.GetProducts(ctx, *branch.ExternalID, 0, pageSize)
					if err != nil {
						return fmt.Errorf("failed to get products for branch %s: %w", branch.Code, err)
					}

					log.Printf("[%s] Branch %s: ERP returned %d products", tenant.Slug, branch.Code, len(items))
					return w.uploadProductsBatchToS3(ctx, items, branch.Code)
				},
			}

			if !w.Dispatcher.Submit(ctx, tenant.Slug, false, job) {
				log.Printf("[%s] Failed to submit job for branch %s: queue full", tenant.Slug, branch.Code)
			}
		}
	}()

	log.Printf("[%s] Full product sync initiated: %d branches submitted in %v",
		tenant.Slug, len(branches), time.Since(start))
	return nil
}

func (w *ProductSyncWorker) processSyncItems(ctx context.Context, tenantSlug string, products []*domain.Product, start time.Time) error {
	log.Printf("[%s] Found %d products, batching and uploading to S3", tenantSlug, len(products))

	// Direct upload (already in slot)
	err := w.uploadProductsBatchToS3(ctx, products, "default")
	if err != nil {
		log.Printf("[%s] Product sync completed with error: %v in %v", tenantSlug, err, time.Since(start))
		return err
	}

	log.Printf("[%s] Product sync completed: %d products uploaded in %v",
		tenantSlug, len(products), time.Since(start))
	return nil
}

func (w *ProductSyncWorker) uploadProductsBatchToS3(ctx context.Context, products []*domain.Product, branchCode string) error {
	if len(products) == 0 {
		return nil
	}

	jsonData, err := json.MarshalIndent(products, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal product batch: %w", err)
	}

	key := fmt.Sprintf("products/%s/products.json", branchCode)
	return w.S3.Upload(ctx, w.Bucket, key, jsonData)
}
