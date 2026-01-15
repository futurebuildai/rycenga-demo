package importer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"builderwire/velocity-backend/internal/domain"
)

type ImportAccountRequest struct {
	AccountID int `json:"accountId"`
}

func (a *App) HandleImportAccount(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	accIDStr := r.URL.Query().Get("accountId")
	if accIDStr == "" {
		http.Error(w, "accountId query parameter required", http.StatusBadRequest)
		return
	}

	accID, err := strconv.Atoi(accIDStr)
	if err != nil {
		http.Error(w, "invalid accountId", http.StatusBadRequest)
		return
	}

	// Capture tenant from request context
	tenant := domain.TenantFromContext(r.Context())
	if tenant == nil {
		http.Error(w, "Tenant context missing", http.StatusInternalServerError)
		return
	}

	// Create background context with tenant
	bgCtx := domain.WithTenant(context.Background(), tenant)

	// Process in background
	go func() {
		if err := a.ImportAccount(bgCtx, accID); err != nil {
			log.Printf("[%s] Error importing account %d: %v", tenant.Slug, accID, err)
		} else {
			log.Printf("[%s] Successfully imported account %d", tenant.Slug, accID)
		}
	}()

	w.WriteHeader(http.StatusAccepted)
	fmt.Fprintf(w, "Import started for account %d", accID)
}

func (a *App) ImportAccount(ctx context.Context, accountID int) error {
	// For manual trigger, we still search for a batch file or a specific file
	// but here we just point to the default batch 0 for now as a placeholder
	key := "accounts/accounts_batch_0.json"
	return a.importAccountFromFullKey(ctx, key)
}

func (a *App) importAccountFromFullKey(ctx context.Context, relativeKey string) error {
	tenant := domain.TenantFromContext(ctx)
	if tenant == nil {
		return fmt.Errorf("missing tenant context")
	}

	data, err := a.S3.Download(ctx, a.Bucket, relativeKey)
	if err != nil {
		return fmt.Errorf("failed to download from S3: %w", err)
	}

	// Exclusively handle batches (JSON arrays)
	var accounts []*domain.Account
	if err := json.Unmarshal(data, &accounts); err != nil {
		return fmt.Errorf("failed to unmarshal account batch for %s: %w", relativeKey, err)
	}

	log.Printf("[%s] Importing batch of %d accounts from %s", tenant.Slug, len(accounts), relativeKey)

	// 1. Bulk Upsert Accounts and get ID mapping
	idMap, err := a.Repo.BulkUpsertAccounts(ctx, accounts)
	if err != nil {
		return fmt.Errorf("failed to bulk upsert accounts: %w", err)
	}

	// 3. Prepare addresses and summaries for bulk upsert
	var allAddresses []*domain.AccountAddress
	var allSummaries []*domain.AccountSummary
	for _, acc := range accounts {
		if acc.ExternalID == nil {
			continue
		}
		internalID, ok := idMap[*acc.ExternalID]
		if !ok {
			log.Printf("[%s] Warning: could not find internal ID for account %s after upsert", tenant.Slug, *acc.ExternalID)
			continue
		}

		// Update address IDs
		for i := range acc.Addresses {
			addr := &acc.Addresses[i]
			addr.AccountID = internalID
			allAddresses = append(allAddresses, addr)
		}

		// Update summary ID
		if acc.Summary != nil {
			acc.Summary.AccountID = internalID
			allSummaries = append(allSummaries, acc.Summary)
		}
	}

	// 4. Bulk Upsert Addresses
	if len(allAddresses) > 0 {
		if err := a.Repo.BulkUpsertAccountAddresses(ctx, allAddresses); err != nil {
			log.Printf("[%s] Warning: failed to bulk upsert %d addresses: %v", tenant.Slug, len(allAddresses), err)
		}
	}

	// 5. Bulk Upsert Summaries
	if len(allSummaries) > 0 {
		if err := a.Repo.BulkUpsertAccountSummaries(ctx, allSummaries); err != nil {
			log.Printf("[%s] Warning: failed to bulk upsert %d summaries: %v", tenant.Slug, len(allSummaries), err)
		}
	}

	// Delete from S3 after successful import
	if err := a.S3.Delete(ctx, a.Bucket, relativeKey); err != nil {
		log.Printf("[%s] Warning: failed to delete imported file %s from S3: %v", tenant.Slug, relativeKey, err)
	}

	return nil
}

func (a *App) importAccountFromKey(ctx context.Context, key string) error {
	tenant := domain.TenantFromContext(ctx)
	expectedPrefix := fmt.Sprintf("%s/", tenant.Slug)
	relativeKey := strings.TrimPrefix(key, expectedPrefix)
	return a.importAccountFromFullKey(ctx, relativeKey)
}
