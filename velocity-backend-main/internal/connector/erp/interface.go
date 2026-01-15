package erp

import (
	"context"
	"time"

	"builderwire/velocity-backend/internal/domain"
)

// Connector defines the interface for ERP-specific implementations.
type Connector interface {
	GetAccount(ctx context.Context, id int) (*domain.Account, error)
	SearchAccounts(ctx context.Context, query string, page, pageSize int) ([]*domain.Account, error)
	GetFinancialSummary(ctx context.Context, id int) (*domain.FinancialSummary, error)
	GetTransactions(ctx context.Context, id int, start, end *time.Time) ([]*domain.Transaction, error)
	SearchProducts(ctx context.Context, query string, page, pageSize int) ([]*domain.Product, error)
	GetBranches(ctx context.Context, pageSize int) ([]*domain.Location, error)
	GetProducts(ctx context.Context, branchID string, skip int, pageSize int) ([]*domain.Product, error)
	GetProductGroups(ctx context.Context, groupType string) ([]*domain.ProductCategory, error)
}

// Config defines the credentials for an ERP.
type Config struct {
	Type    string `json:"type"` // "bistrack" or "spruce"
	BaseURL string `json:"base_url"`
	// Bistrack
	ClientSecret string `json:"client_secret,omitempty"`
	Username     string `json:"username,omitempty"`
	Password     string `json:"password,omitempty"`
	// Spruce
	ApiKey string `json:"api_key,omitempty"`
}
