package importer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"builderwire/velocity-backend/internal/domain"
)

func (a *App) ImportFinancials(ctx context.Context, key string) error {
	tenant := domain.TenantFromContext(ctx)

	// Key is tenantSlug/financials/CustomerID/summary.json OR tenantSlug/financials/CustomerID/transactions.json
	relativeKey := strings.TrimPrefix(key, tenant.Slug+"/")

	data, err := a.S3.Download(ctx, a.Bucket, relativeKey)
	if err != nil {
		return fmt.Errorf("failed to download financials %s: %w", key, err)
	}

	if strings.HasSuffix(key, "transactions.json") {
		var rawItems []interface{}
		if err := json.Unmarshal(data, &rawItems); err != nil {
			return fmt.Errorf("failed to unmarshal transaction batch for %s: %w", key, err)
		}

		log.Printf("[%s] Importing batch of %d transactions from %s", tenant.Slug, len(rawItems), key)

		var invoices []*domain.Invoice
		var statements []*domain.Statement
		var payments []*domain.PaymentTransaction

		for _, raw := range rawItems {
			jsonData, _ := json.Marshal(raw)
			var probe map[string]interface{}
			json.Unmarshal(jsonData, &probe)

			if _, ok := probe["invoice_number"]; ok {
				var inv domain.Invoice
				if err := json.Unmarshal(jsonData, &inv); err == nil {
					invoices = append(invoices, &inv)
				}
			} else if _, ok := probe["statement_number"]; ok {
				var stmt domain.Statement
				if err := json.Unmarshal(jsonData, &stmt); err == nil {
					statements = append(statements, &stmt)
				}
			} else if _, ok := probe["payment_method_type"]; ok {
				var p domain.PaymentTransaction
				if err := json.Unmarshal(jsonData, &p); err == nil {
					payments = append(payments, &p)
				}
			}
		}

		// Bulk Upsert by type
		if len(invoices) > 0 {
			if err := a.Repo.BulkUpsertInvoices(ctx, invoices); err != nil {
				log.Printf("[%s] Error bulk upserting invoices from %s: %v", tenant.Slug, key, err)
			}
		}
		if len(statements) > 0 {
			if err := a.Repo.BulkUpsertStatements(ctx, statements); err != nil {
				log.Printf("[%s] Error bulk upserting statements from %s: %v", tenant.Slug, key, err)
			}
		}
		if len(payments) > 0 {
			if err := a.Repo.BulkUpsertPayments(ctx, payments); err != nil {
				log.Printf("[%s] Error bulk upserting payments from %s: %v", tenant.Slug, key, err)
			}
		}
	}

	if err := a.S3.Delete(ctx, a.Bucket, relativeKey); err != nil {
		log.Printf("[%s] Warning: failed to delete imported financial file %s: %v", tenant.Slug, relativeKey, err)
	}

	return nil
}
