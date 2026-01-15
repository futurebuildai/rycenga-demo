package importer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sort"
	"strings"

	"builderwire/velocity-backend/internal/domain"
	"builderwire/velocity-backend/internal/platform/s3"
)

func (a *App) ImportCategories(ctx context.Context) error {
	tenant := domain.TenantFromContext(ctx)
	key := "products/category.json"

	data, err := a.S3.Download(ctx, a.Bucket, key)
	if err != nil {
		if errors.Is(err, s3.ErrNotFound) {
			return nil // Nothing to import
		}
		return err
	}

	var groups []*domain.ProductCategory
	if err := json.Unmarshal(data, &groups); err != nil {
		return fmt.Errorf("failed to unmarshal categories: %w", err)
	}

	// Group by TreeLevel
	levelMap := make(map[int][]*domain.ProductCategory)
	var levels []int
	for _, g := range groups {
		if _, exists := levelMap[g.TreeLevel]; !exists {
			levels = append(levels, g.TreeLevel)
		}
		levelMap[g.TreeLevel] = append(levelMap[g.TreeLevel], g)
	}
	sort.Ints(levels)

	log.Printf("[%s] Importing %d categories across %d levels", tenant.Slug, len(groups), len(levels))

	// Map to store resolved IDs: ExternalID -> InternalID
	resolvedIDs := make(map[string]int64)

	// Pre-load existing categories
	existingCats, err := a.Repo.ListCategories(ctx)
	if err == nil {
		for _, cat := range existingCats {
			if cat.ExternalID != nil {
				resolvedIDs[*cat.ExternalID] = cat.ID
			}
		}
	}

	totalImported := 0
	for _, level := range levels {
		levelGroups := levelMap[level]
		log.Printf("[%s] Level %d: Processing %d categories to upsert", tenant.Slug, level, len(levelGroups))

		for _, cat := range levelGroups {
			// Resolve ParentID from ParentExternalID if available
			if cat.ParentExternalID != nil {
				if pid, ok := resolvedIDs[*cat.ParentExternalID]; ok {
					cat.ParentID = &pid
				}
			}
		}

		// Bulk Upsert Level
		ids, err := a.Repo.BulkUpsertProductCategories(ctx, levelGroups)
		if err != nil {
			return fmt.Errorf("failed to bulk upsert categories for level %d: %w", level, err)
		}

		// Update resolved IDs for next levels
		for extID, id := range ids {
			resolvedIDs[extID] = id
		}
		totalImported += len(ids)
		log.Printf("[%s] Level %d: Imported %d categories", tenant.Slug, level, len(ids))
	}

	log.Printf("[%s] Successfully imported %d product categories", tenant.Slug, totalImported)

	if err := a.S3.Delete(ctx, a.Bucket, key); err != nil {
		log.Printf("[%s] Warning: failed to delete categories from S3: %v", tenant.Slug, err)
	}
	return nil
}

func (a *App) ImportProduct(ctx context.Context, key string) error {
	tenant := domain.TenantFromContext(ctx)

	// Skip category.json if it gets picked up
	if strings.Contains(key, "category.json") {
		return nil
	}

	// Key is tenantSlug/products/BranchCode/ProductID.json OR tenantSlug/products/BranchCode/products.json
	relativeKey := strings.TrimPrefix(key, tenant.Slug+"/")
	parts := strings.Split(relativeKey, "/")
	if len(parts) < 3 {
		log.Printf("[%s] Warning: product key %s is not in products/BranchCode/... format", tenant.Slug, relativeKey)
	} else {
		branchCode := parts[1]
		loc, err := a.Repo.GetLocationByCode(ctx, branchCode)
		if err != nil {
			return fmt.Errorf("failed to resolve location %s for product %s: %w", branchCode, key, err)
		}
		_ = loc // Use in future for inventory
	}

	data, err := a.S3.Download(ctx, a.Bucket, relativeKey)
	if err != nil {
		return fmt.Errorf("failed to download product %s: %w", key, err)
	}

	// Determine if batch or single
	if strings.HasSuffix(key, "products.json") {
		var products []*domain.Product
		if err := json.Unmarshal(data, &products); err != nil {
			return fmt.Errorf("failed to unmarshal product batch for %s: %w", key, err)
		}

		log.Printf("[%s] Importing batch of %d products from %s", tenant.Slug, len(products), key)
		if err := a.Repo.BulkUpsertProducts(ctx, products); err != nil {
			return fmt.Errorf("failed to bulk upsert products from %s: %w", key, err)
		}
	} else {
		log.Printf("[%s] Skipping non-batch product file: %s", tenant.Slug, key)
		return nil
	}

	if err := a.S3.Delete(ctx, a.Bucket, relativeKey); err != nil {
		log.Printf("[%s] Warning: failed to delete imported product file %s: %v", tenant.Slug, relativeKey, err)
	}

	return nil
}
