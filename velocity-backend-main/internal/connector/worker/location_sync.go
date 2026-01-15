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

type LocationSyncWorker struct {
	ERP        erp.Connector // Optional: used for testing or overriding dynamic config
	S3         *s3.Client
	Bucket     string
	Dispatcher *Dispatcher
	TaskName   string
}

type LocationSyncRequest struct {
	TenantSlug string     `json:"tenant_slug"`
	ERPConfig  erp.Config `json:"erp_config"`
}

func (w *LocationSyncWorker) Process(ctx context.Context, body []byte) error {
	var req LocationSyncRequest
	if len(body) > 0 {
		if err := json.Unmarshal(body, &req); err != nil {
			return fmt.Errorf("failed to unmarshal location sync request: %w", err)
		}
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
	log.Printf("[%s] Fetching branches from ERP", tenant.Slug)
	branches, err := connector.GetBranches(ctx, 100)
	if err != nil {
		return fmt.Errorf("failed to fetch branches: %w", err)
	}

	log.Printf("[%s] Syncing %d branches", tenant.Slug, len(branches))

	go func() {
		for _, branch := range branches {
			b := branch // capture
			job := Job{
				Name: fmt.Sprintf("LocationSync:%s:%s", tenant.Slug, b.Code),
				Run: func() error {
					key := fmt.Sprintf("locations/%s.json", b.Code)
					data, _ := json.MarshalIndent(b, "", "  ")
					return w.S3.Upload(ctx, w.Bucket, key, data)
				},
			}

			if !w.Dispatcher.Submit(ctx, tenant.Slug, false, job) {
				log.Printf("[%s] Failed to submit location sync job for %s", tenant.Slug, b.Code)
			}
		}
	}()

	log.Printf("[%s] Location sync initiated for %d branches in %v",
		tenant.Slug, len(branches), time.Since(start))
	return nil
}
