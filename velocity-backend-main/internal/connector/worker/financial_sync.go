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

type FinancialSyncWorker struct {
	ERP        erp.Connector // Optional: used for testing or overriding dynamic config
	S3         *s3.Client
	Bucket     string
	Dispatcher *Dispatcher
	TaskName   string
}

type FinancialSyncRequest struct {
	TenantSlug string     `json:"tenant_slug"`
	AccountID  int        `json:"account_id"`
	StartDate  *time.Time `json:"start_date,omitempty"`
	EndDate    *time.Time `json:"end_date,omitempty"`
	ERPConfig  erp.Config `json:"erp_config"`
}

func (w *FinancialSyncWorker) Process(ctx context.Context, body []byte) error {
	var req FinancialSyncRequest
	if err := json.Unmarshal(body, &req); err != nil {
		return fmt.Errorf("failed to unmarshal financial sync request: %w", err)
	}

	// 0. Resolve tenant from context
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
		return w.syncAccountFinancials(ctx, connector, tenant.Slug, req.AccountID, req.StartDate, req.EndDate)
	}

	// Full Sync Mode
	log.Printf("[%s] Starting full financial sync from ERP", tenant.Slug)

	var wg sync.WaitGroup
	var successCount, errorCount uint64

	// Monitor
	go func() {
		wg.Wait()
		log.Printf("[%s] Full financial sync completed: %d succeeded, %d failed in %v",
			tenant.Slug, atomic.LoadUint64(&successCount), atomic.LoadUint64(&errorCount), time.Since(start))
	}()

	go func() {
		pageSize := 100
		stride := 3

		for i := 1; i <= stride; i++ {
			wg.Add(1)
			w.submitPageJob(ctx, tenant.Slug, i, pageSize, stride, connector, req.StartDate, req.EndDate, &wg, &successCount, &errorCount)
		}
	}()

	log.Printf("[%s] Full financial sync initiated in %v", tenant.Slug, time.Since(start))
	return nil
}

func (w *FinancialSyncWorker) submitPageJob(ctx context.Context, tenantSlug string, page, pageSize, stride int, connector erp.Connector, start, end *time.Time, wg *sync.WaitGroup, success *uint64, fail *uint64) {
	job := Job{
		Name: fmt.Sprintf("FinancialSyncPage:%s:%d", tenantSlug, page),
		Run: func() error {
			defer wg.Done()

			if ctx.Err() != nil {
				return ctx.Err()
			}

			log.Printf("[%s] Fetching accounts for financials page %d", tenantSlug, page)
			items, err := connector.SearchAccounts(ctx, "", page, pageSize)
			if err != nil {
				return fmt.Errorf("failed to search accounts page %d: %w", page, err)
			}

			// Chain next page
			if len(items) >= pageSize {
				wg.Add(1)
				go w.submitPageJob(ctx, tenantSlug, page+stride, pageSize, stride, connector, start, end, wg, success, fail)
			}

			// Submit account jobs
			go func() {
				for _, item := range items {
					wg.Add(1)
					w.submitAccountJob(ctx, tenantSlug, int(item.ID), connector, start, end, wg, success, fail)
				}
			}()

			return nil
		},
	}

	if !w.Dispatcher.Submit(ctx, tenantSlug, false, job) {
		log.Printf("[%s] Failed to submit financial page job %d", tenantSlug, page)
		wg.Done()
	}
}

func (w *FinancialSyncWorker) submitAccountJob(ctx context.Context, tenantSlug string, accountID int, connector erp.Connector, start, end *time.Time, wg *sync.WaitGroup, success *uint64, fail *uint64) {
	job := Job{
		Name: fmt.Sprintf("FinancialSyncAccount:%s:%d", tenantSlug, accountID),
		Run: func() error {
			defer wg.Done()
			err := w.syncAccountFinancials(ctx, connector, tenantSlug, accountID, start, end)
			if err != nil {
				atomic.AddUint64(fail, 1)
				return err
			}
			atomic.AddUint64(success, 1)
			return nil
		},
	}

	if !w.Dispatcher.Submit(ctx, tenantSlug, false, job) {
		log.Printf("[%s] Failed to submit financial account job %d", tenantSlug, accountID)
		wg.Done()
	}
}

func (w *FinancialSyncWorker) syncAccountFinancials(ctx context.Context, connector erp.Connector, tenantSlug string, accountID int, start, end *time.Time) error {
	log.Printf("[%s] Syncing financials for account %d from ERP", tenantSlug, accountID)

	// Direct execution (already acquired slot)
	transactions, err := connector.GetTransactions(ctx, accountID, start, end)
	if err != nil {
		return fmt.Errorf("failed to get transactions from ERP: %w", err)
	}

	if err := w.uploadTransactionsBatchToS3(ctx, transactions, accountID); err != nil {
		return fmt.Errorf("failed to upload transactions batch: %w", err)
	}

	log.Printf("[%s] Financial sync for account %d completed: %d transactions uploaded",
		tenantSlug, accountID, len(transactions))
	return nil
}

func (w *FinancialSyncWorker) uploadTransactionsBatchToS3(ctx context.Context, items []*domain.Transaction, accountID int) error {
	if len(items) == 0 {
		return nil
	}

	jsonData, err := json.MarshalIndent(items, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal transaction batch: %w", err)
	}

	key := fmt.Sprintf("financials/%d/transactions.json", accountID)
	return w.S3.Upload(ctx, w.Bucket, key, jsonData)
}
