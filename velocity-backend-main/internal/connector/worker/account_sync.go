package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"builderwire/velocity-backend/internal/connector/erp"
	"builderwire/velocity-backend/internal/connector/registry"
	"builderwire/velocity-backend/internal/domain"
	"builderwire/velocity-backend/internal/platform/s3"
)

type AccountSyncWorker struct {
	ERP        erp.Connector // Optional: used for testing or overriding dynamic config
	S3         *s3.Client
	Bucket     string
	Dispatcher *Dispatcher
	TaskName   string
}

type SyncRequest struct {
	TenantSlug string     `json:"tenant_slug"`
	AccountID  int        `json:"account_id"`
	ERPConfig  erp.Config `json:"erp_config"`
}

func (w *AccountSyncWorker) Process(ctx context.Context, body []byte) error {
	var req SyncRequest
	if err := json.Unmarshal(body, &req); err != nil {
		return fmt.Errorf("failed to unmarshal sync request: %w", err)
	}

	// 0. Resolve tenant from context (header) or fallback to JSON body
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
	if req.AccountID != 0 {
		log.Printf("[%s] Syncing account %d from ERP", tenant.Slug, req.AccountID)

		// 1. Fetch from ERP (Returns domain.Account)
		// Usually running in Priority slot, unless misconfigured.
		localAcc, err := connector.GetAccount(ctx, req.AccountID)
		if err != nil {
			return fmt.Errorf("failed to get account from ERP: %w", err)
		}

		// 2. Save to S3
		if err := w.uploadAccountsBatchToS3(ctx, []*domain.Account{localAcc}, 0); err != nil {
			return err
		}

		log.Printf("[%s] Successfully synced account %d in %v", tenant.Slug, req.AccountID, time.Since(start))
		return nil
	}

	// Full Sync Mode (AccountID == 0)
	log.Printf("[%s] Starting full account sync from ERP", tenant.Slug)

	var wg sync.WaitGroup
	var successCount, errorCount uint64

	// Monitor Routine
	go func() {
		wg.Wait()
		log.Printf("[%s] Full account sync completed: %d succeeded, %d failed in %v",
			tenant.Slug, atomic.LoadUint64(&successCount), atomic.LoadUint64(&errorCount), time.Since(start))
	}()

	// Async Orchestration
	go func() {
		pageSize := 100
		stride := 3 // Parallelism factor

		for i := 1; i <= stride; i++ {
			wg.Add(1)
			w.submitPageJob(ctx, tenant.Slug, i, pageSize, stride, connector, &wg, &successCount, &errorCount)
		}
	}()

	log.Printf("[%s] Full account sync initiated (strided workers)", tenant.Slug)
	return nil
}

func (w *AccountSyncWorker) submitPageJob(ctx context.Context, tenantSlug string, page, pageSize, stride int, connector erp.Connector, wg *sync.WaitGroup, success *uint64, fail *uint64) {
	job := Job{
		Name: fmt.Sprintf("AccountSyncPage:%s:%d", tenantSlug, page),
		Run: func() error {
			defer wg.Done()

			// Check context before work
			if ctx.Err() != nil {
				return ctx.Err()
			}

			log.Printf("[%s] Syncing accounts page %d", tenantSlug, page)

			// Fetch
			accounts, err := connector.SearchAccounts(ctx, "", page, pageSize)
			if err != nil {
				return fmt.Errorf("failed to search accounts page %d: %w", page, err)
			}

			// Chain next job if page is full
			if len(accounts) >= pageSize {
				wg.Add(1)
				go w.submitPageJob(ctx, tenantSlug, page+stride, pageSize, stride, connector, wg, success, fail)
			}

			// Upload
			if len(accounts) > 0 {
				if err := w.uploadAccountsBatchToS3(ctx, accounts, page); err != nil {
					return fmt.Errorf("failed to upload account batch page %d: %w", page, err)
				}
				log.Printf("[%s] Page %d uploaded %d accounts", tenantSlug, page, len(accounts))
			}

			return nil
		},
	}

	if !w.Dispatcher.Submit(ctx, tenantSlug, false, job) {
		log.Printf("[%s] Failed to submit job for page %d: queue full", tenantSlug, page)
		wg.Done()
	}
}

func (w *AccountSyncWorker) uploadAccountsBatchToS3(ctx context.Context, accounts []*domain.Account, pageNum int) error {
	if len(accounts) == 0 {
		return nil
	}

	jsonData, err := json.MarshalIndent(accounts, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal account batch: %w", err)
	}

	// Always use the batch naming convention
	key := fmt.Sprintf("accounts/accounts_batch_%d.json", pageNum)
	return w.S3.Upload(ctx, w.Bucket, key, jsonData)
}
