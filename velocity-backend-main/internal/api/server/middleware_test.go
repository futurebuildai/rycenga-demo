package server

import (
	"builderwire/velocity-backend/internal/domain"
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5"
)

// MockRepository for testing
type MockRepository struct {
	// Embed the interface to avoid implementing all methods if not needed,
	// but Go interfaces don't work like that for struct embedding unless we implementation everything or panic.
	// Better to implement a struct with dummy methods or just the ones we need and panic on others if called.
	// Or we can define just the minimal interface needed by the middleware?
	// No, middleware accepts DBRepository which is large.
	// Let's implement stub methods.
}

// Implement only necessary methods for Middleware tests
func (m *MockRepository) GetTenantBySlug(ctx context.Context, slug string) (*domain.Tenant, error) {
	if slug == "valid-tenant" {
		return &domain.Tenant{
			ID:     "uuid-123",
			Name:   "Valid Tenant",
			Slug:   "valid-tenant",
			DBName: "tenant_db",
		}, nil
	}
	return nil, pgx.ErrNoRows // We need pgx import or just return error
}

// Stub other methods required by DBRepository interface...
// This is tedious because DBRepository has many methods.
// Alternatively, we can make Middleware accept a smaller interface?
// TenantMiddleware(repo TenantResolver, ...)
// But let's stick to the current design and maybe just use a struct that satisfies the interface?

// Easier: define a partial mock and verify signatures.
// Since the file is small, I will just add the necessary implementations and placeholders.

func (m *MockRepository) VerifyAPIKey(ctx context.Context, key string) (bool, error) {
	return key == "velocity-secret", nil
}

// ... (ListAccounts, etc.) - return empty/nil
func (m *MockRepository) ListAccounts(ctx context.Context) ([]domain.Account, error) { return nil, nil }
func (m *MockRepository) GetAccountByID(ctx context.Context, id int64) (*domain.Account, error) {
	return nil, nil
}
func (m *MockRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	return nil, nil
}
func (m *MockRepository) ListAccountAddresses(ctx context.Context, accountID int64) ([]domain.AccountAddress, error) {
	return nil, nil
}
func (m *MockRepository) ListAccountAssignments(ctx context.Context, accountID int64) ([]domain.AccountAssignment, error) {
	return nil, nil
}
func (m *MockRepository) GetAccountFinancials(ctx context.Context, accountID int64) (*domain.AccountFinancials, error) {
	return nil, nil
}
func (m *MockRepository) ListOrdersByAccount(ctx context.Context, accountID int64) ([]domain.Order, error) {
	return nil, nil
}
func (m *MockRepository) GetOrderByID(ctx context.Context, id int64) (*domain.Order, error) {
	return nil, nil
}
func (m *MockRepository) ListOrderLines(ctx context.Context, orderID int64) ([]domain.OrderLine, error) {
	return nil, nil
}
func (m *MockRepository) ListInvoicesByAccount(ctx context.Context, accountID int64) ([]domain.Invoice, error) {
	return nil, nil
}
func (m *MockRepository) GetInvoiceByID(ctx context.Context, id int64) (*domain.Invoice, error) {
	return nil, nil
}
func (m *MockRepository) ListInvoiceLines(ctx context.Context, invoiceID int64) ([]domain.InvoiceLine, error) {
	return nil, nil
}
func (m *MockRepository) ListQuotesByAccount(ctx context.Context, accountID int64) ([]domain.Quote, error) {
	return nil, nil
}
func (m *MockRepository) GetQuoteByID(ctx context.Context, id int64) (*domain.Quote, error) {
	return nil, nil
}
func (m *MockRepository) ListQuoteLines(ctx context.Context, quoteID int64) ([]domain.QuoteLine, error) {
	return nil, nil
}
func (m *MockRepository) ListStatementsByAccount(ctx context.Context, accountID int64) ([]domain.Statement, error) {
	return nil, nil
}
func (m *MockRepository) GetStatementByID(ctx context.Context, id int64) (*domain.Statement, error) {
	return nil, nil
}
func (m *MockRepository) ListPaymentsByAccount(ctx context.Context, accountID int64) ([]domain.PaymentTransaction, error) {
	return nil, nil
}
func (m *MockRepository) GetPaymentByID(ctx context.Context, id int64) (*domain.PaymentTransaction, error) {
	return nil, nil
}
func (m *MockRepository) ListPaymentAllocations(ctx context.Context, paymentID int64) ([]domain.PaymentAllocation, error) {
	return nil, nil
}
func (m *MockRepository) ListPaymentMethodsByAccount(ctx context.Context, accountID int64) ([]domain.PaymentMethod, error) {
	return nil, nil
}
func (m *MockRepository) ListShipmentsByAccount(ctx context.Context, accountID int64) ([]domain.Shipment, error) {
	return nil, nil
}
func (m *MockRepository) GetShipmentByID(ctx context.Context, id int64) (*domain.Shipment, error) {
	return nil, nil
}
func (m *MockRepository) ListJobsByAccount(ctx context.Context, accountID int64) ([]domain.Job, error) {
	return nil, nil
}
func (m *MockRepository) GetJobByID(ctx context.Context, id int64) (*domain.Job, error) {
	return nil, nil
}
func (m *MockRepository) ListLocations(ctx context.Context) ([]domain.Location, error) {
	return nil, nil
}
func (m *MockRepository) ListProducts(ctx context.Context) ([]domain.Product, error) { return nil, nil }
func (m *MockRepository) GetProductByID(ctx context.Context, id int64) (*domain.Product, error) {
	return nil, nil
}
func (m *MockRepository) GetProductBySKU(ctx context.Context, sku string) (*domain.Product, error) {
	return nil, nil
}
func (m *MockRepository) GetInventoryByProductAndLocation(ctx context.Context, productID, locationID int64) (*domain.Inventory, error) {
	return nil, nil
}
func (m *MockRepository) ListPriceLevels(ctx context.Context) ([]domain.PriceLevel, error) {
	return nil, nil
}
func (m *MockRepository) GetProductPrice(ctx context.Context, productID, priceLevelID int64, uom string) (*domain.ProductPrice, error) {
	return nil, nil
}
func (m *MockRepository) ListContractPricesByAccount(ctx context.Context, accountID int64) ([]domain.ContractPrice, error) {
	return nil, nil
}
func (m *MockRepository) ListUOMConversions(ctx context.Context, productID *int64) ([]domain.UOMConversion, error) {
	return nil, nil
}
func (m *MockRepository) ListDocumentsByAccount(ctx context.Context, accountID int64) ([]domain.Document, error) {
	return nil, nil
}
func (m *MockRepository) GetDocumentByID(ctx context.Context, id int64) (*domain.Document, error) {
	return nil, nil
}
func (m *MockRepository) BulkUpsertAccounts(ctx context.Context, accounts []*domain.Account) (map[string]int64, error) {
	return nil, nil
}
func (m *MockRepository) BulkUpsertAccountAddresses(ctx context.Context, addresses []*domain.AccountAddress) error {
	return nil
}
func (m *MockRepository) BulkUpsertProducts(ctx context.Context, products []*domain.Product) error {
	return nil
}
func (m *MockRepository) BulkUpsertProductCategories(ctx context.Context, categories []*domain.ProductCategory) (map[string]int64, error) {
	return nil, nil
}
func (m *MockRepository) BulkUpsertInvoices(ctx context.Context, invoices []*domain.Invoice) error {
	return nil
}
func (m *MockRepository) BulkUpsertStatements(ctx context.Context, statements []*domain.Statement) error {
	return nil
}
func (m *MockRepository) BulkUpsertPayments(ctx context.Context, payments []*domain.PaymentTransaction) error {
	return nil
}
func (m *MockRepository) BulkUpsertAccountSummaries(ctx context.Context, summaries []*domain.AccountSummary) error {
	return nil
}
func (m *MockRepository) BulkUpsertLocations(ctx context.Context, locations []*domain.Location) error {
	return nil
}
func (m *MockRepository) GetCategoryByExternalID(ctx context.Context, extID string) (*domain.ProductCategory, error) {
	return nil, nil
}
func (m *MockRepository) GetLocationByCode(ctx context.Context, code string) (*domain.Location, error) {
	return nil, nil
}
func (m *MockRepository) ListTenants(ctx context.Context) ([]domain.Tenant, error) { return nil, nil }

func TestTenantMiddleware(t *testing.T) {
	repo := &MockRepository{}
	// handler definition moved to test loop

	tests := []struct {
		name           string
		headerValue    string
		host           string
		path           string
		expectedStatus int
	}{
		{
			name:           "valid tenant header",
			headerValue:    "valid-tenant",
			path:           "/accounts",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "missing tenant header (and no fallback)",
			headerValue:    "",
			host:           "", // Will be forced to empty in loop
			path:           "/accounts",
			expectedStatus: http.StatusBadRequest, // Bad Request
		},
		{
			name:           "invalid tenant",
			headerValue:    "invalid-tenant",
			path:           "/accounts",
			expectedStatus: http.StatusNotFound,
		},
		{
			name:           "subdomain resolution",
			host:           "valid-tenant.example.com",
			path:           "/accounts",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "skip health check",
			path:           "/health",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "skip docs exact",
			path:           "/docs",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "skip docs with trailing slash",
			path:           "/docs/",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "skip docs asset",
			path:           "/docs/some-script.js",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "skip openapi",
			path:           "/openapi.json",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "skip openapi dir",
			path:           "/openapi/something",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "skip schemas",
			path:           "/schemas/foo",
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := "/"
			if tt.path != "" {
				path = tt.path
			}
			req := httptest.NewRequest("GET", path, nil)
			if tt.host != "" {
				req.Host = tt.host
			} else if tt.name == "missing tenant header (and no fallback)" {
				req.Host = ""
			}
			if tt.headerValue != "" {
				req.Header.Set("X-Tenant-ID", tt.headerValue)
			}

			// Define handler inside the test to use the correct t
			baseHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// If we expect the request to pass through to the handler, check the tenant
				// BUT only for non-skipped paths that resolve a tenant
				isSkipPath := path == "/health" || strings.HasPrefix(path, "/docs") || strings.HasPrefix(path, "/openapi") || strings.HasPrefix(path, "/schemas")

				if !isSkipPath {
					tenant := domain.TenantFromContext(r.Context())
					if tenant == nil {
						t.Error("expected tenant in context, got nil")
						return
					}
					if tenant.Slug != "valid-tenant" {
						t.Errorf("expected tenant slug 'valid-tenant', got '%s'", tenant.Slug)
					}
				}
				w.WriteHeader(http.StatusOK)
			})

			handler := TenantMiddleware(repo, baseHandler)
			rr := httptest.NewRecorder()
			handler.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rr.Code)
			}
		})
	}
}

func TestAuthMiddleware(t *testing.T) {
	// ... (Existing test can stay or be updated to use Mock)
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	repo := &MockRepository{}
	authHandler := authMiddleware(repo, handler)

	tests := []struct {
		name           string
		apiKey         string
		expectedStatus int
	}{
		{
			name:           "valid api key",
			apiKey:         "velocity-secret",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "invalid api key",
			apiKey:         "wrong-secret",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "missing api key",
			apiKey:         "",
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/", nil)
			if tt.apiKey != "" {
				req.Header.Set("X-API-Key", tt.apiKey)
			}
			rr := httptest.NewRecorder()

			authHandler.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rr.Code)
			}
		})
	}
}
