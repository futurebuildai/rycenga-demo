package importer

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"builderwire/velocity-backend/internal/domain"
)

func (a *App) StartPoller(ctx context.Context) {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	log.Println("S3 Poller started (every 10s)")

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// Iterate all tenants to poll for each
			tenants, err := a.Repo.ListTenants(ctx)
			if err != nil {
				log.Printf("Error listing tenants for poller: %v", err)
				continue
			}
			for _, t := range tenants {
				// Create a tenant-scoped context
				tCtx := domain.WithTenant(ctx, &t)
				a.pollS3(tCtx)
			}
		}
	}
}

func (a *App) pollS3(ctx context.Context) {
	tenant := domain.TenantFromContext(ctx)
	if tenant == nil {
		return
	}

	// 1. Poll Locations
	a.pollFiles(ctx, "locations/", a.ImportLocation)

	// 2. Poll Products (Recursive or multi-level)
	if err := a.ImportCategories(ctx); err != nil {
		// Log but continue
		log.Printf("[%s] Note: category import skipped or failed: %v", tenant.Slug, err)
	}
	a.pollFiles(ctx, "products/", a.ImportProduct)

	// 3. Poll Accounts
	a.pollFiles(ctx, "accounts/", a.importAccountFromKey)

	// 4. Poll Financials
	a.pollFiles(ctx, "financials/", a.ImportFinancials)
}

func (a *App) pollFiles(ctx context.Context, prefix string, importFunc func(ctx context.Context, key string) error) {
	tenant := domain.TenantFromContext(ctx)
	keys, err := a.S3.ListObjects(ctx, a.Bucket, prefix)
	if err != nil {
		log.Printf("[%s] Error listing S3 objects for %s: %v", tenant.Slug, prefix, err)
		return
	}

	expectedPrefix := fmt.Sprintf("%s/%s", tenant.Slug, prefix)
	log.Printf("[%s] Found %d objects in %s", tenant.Slug, len(keys), expectedPrefix)
	for _, key := range keys {
		if !strings.HasSuffix(key, ".json") || !strings.HasPrefix(key, expectedPrefix) {
			continue
		}
		if err := importFunc(ctx, key); err != nil {
			log.Printf("[%s] Error importing %s: %v", tenant.Slug, key, err)
		}
	}
}
