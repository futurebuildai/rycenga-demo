package importer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"builderwire/velocity-backend/internal/domain"
)

func (a *App) ImportLocation(ctx context.Context, key string) error {
	tenant := domain.TenantFromContext(ctx)

	// Key is tenantSlug/locations/ExternalID.json
	// S3.Download prepends tenant.Slug, so we need to remove it from the key we pass
	relativeKey := strings.TrimPrefix(key, tenant.Slug+"/")

	data, err := a.S3.Download(ctx, a.Bucket, relativeKey)
	if err != nil {
		return fmt.Errorf("failed to download location from S3: %w", err)
	}

	var locations []*domain.Location
	if strings.HasPrefix(strings.TrimSpace(string(data)), "[") {
		if err := json.Unmarshal(data, &locations); err != nil {
			return fmt.Errorf("failed to unmarshal location batch: %w", err)
		}
	} else {
		var loc domain.Location
		if err := json.Unmarshal(data, &loc); err != nil {
			return fmt.Errorf("failed to unmarshal location data: %w", err)
		}
		locations = append(locations, &loc)
	}

	if err := a.Repo.BulkUpsertLocations(ctx, locations); err != nil {
		return fmt.Errorf("failed to bulk upsert locations: %w", err)
	}

	log.Printf("[%s] Successfully imported %d locations from %s", tenant.Slug, len(locations), key)

	if err := a.S3.Delete(ctx, a.Bucket, relativeKey); err != nil {
		log.Printf("[%s] Warning: failed to delete imported location file %s: %v", tenant.Slug, relativeKey, err)
	}

	return nil
}
