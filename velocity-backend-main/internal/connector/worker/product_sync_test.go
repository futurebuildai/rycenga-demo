package worker

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"builderwire/velocity-backend/internal/connector/erp"
	"builderwire/velocity-backend/internal/domain"
	"builderwire/velocity-backend/internal/platform/s3"
)

// MockERP implementing erp.Connector
type MockERP struct {
	GetProductGroupsFunc func(ctx context.Context, groupType string) ([]*domain.ProductCategory, error)
	GetBranchesFunc      func(ctx context.Context, pageSize int) ([]*domain.Location, error)
	GetProductsFunc      func(ctx context.Context, branchID string, skip, pageSize int) ([]*domain.Product, error)
}

func (m *MockERP) GetAccount(ctx context.Context, id int) (*domain.Account, error) { return nil, nil }
func (m *MockERP) SearchAccounts(ctx context.Context, query string, page, pageSize int) ([]*domain.Account, error) {
	return nil, nil
}
func (m *MockERP) GetFinancialSummary(ctx context.Context, id int) (*domain.FinancialSummary, error) {
	return nil, nil
}
func (m *MockERP) GetTransactions(ctx context.Context, id int, start, end *time.Time) ([]*domain.Transaction, error) {
	return nil, nil
}
func (m *MockERP) SearchProducts(ctx context.Context, query string, page, pageSize int) ([]*domain.Product, error) {
	return nil, nil
}
func (m *MockERP) GetBranches(ctx context.Context, pageSize int) ([]*domain.Location, error) {
	if m.GetBranchesFunc != nil {
		return m.GetBranchesFunc(ctx, pageSize)
	}
	return []*domain.Location{}, nil
}
func (m *MockERP) GetProducts(ctx context.Context, branchID string, skip, pageSize int) ([]*domain.Product, error) {
	if m.GetProductsFunc != nil {
		return m.GetProductsFunc(ctx, branchID, skip, pageSize)
	}
	return []*domain.Product{}, nil
}
func (m *MockERP) GetProductGroups(ctx context.Context, groupType string) ([]*domain.ProductCategory, error) {
	if m.GetProductGroupsFunc != nil {
		return m.GetProductGroupsFunc(ctx, groupType)
	}
	return []*domain.ProductCategory{}, nil
}

func TestProductSyncWorker_Process_Groups(t *testing.T) {
	// 1. Mock S3 Server
	s3Server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify fetch or upload
		if r.Method == "PUT" && r.URL.Path == "/test-bucket/test-tenant/products/category.json" {
			w.WriteHeader(http.StatusOK)
			return
		}
		// List branches or other uploads
		w.WriteHeader(http.StatusOK)
	}))
	defer s3Server.Close()

	s3Config := s3.Config{
		Endpoint:        s3Server.URL,
		Region:          "us-test-1",
		AccessKeyID:     "test",
		SecretAccessKey: "test",
	}
	s3Client := s3.NewClient(s3Config)

	// 2. Mock ERP
	mockERP := &MockERP{
		GetProductGroupsFunc: func(ctx context.Context, groupType string) ([]*domain.ProductCategory, error) {
			id := "1"
			return []*domain.ProductCategory{
				{ExternalID: &id, Name: "Tools", IsActive: true},
			}, nil
		},
		GetBranchesFunc: func(ctx context.Context, pageSize int) ([]*domain.Location, error) {
			id := "100"
			return []*domain.Location{
				{ExternalID: &id, Code: "B1", Name: "Branch 1"},
			}, nil
		},
	}

	// 3. Worker
	pool := NewPoolManager(1)
	disp := NewDispatcher(pool, 1, 10)
	disp.Start() // Important to start dispatcher

	worker := &ProductSyncWorker{
		ERP:        mockERP,
		S3:         s3Client,
		Bucket:     "test-bucket",
		Dispatcher: disp,
		TaskName:   "product-sync",
	}

	ctx := domain.WithTenant(context.Background(), &domain.Tenant{Slug: "test-tenant"})
	req := ProductSyncRequest{
		PageSize: 10,
		ERPConfig: erp.Config{
			Type: "mock",
		},
	}
	body, _ := json.Marshal(req)

	err := worker.Process(ctx, body)
	if err != nil {
		t.Fatalf("Process failed: %v", err)
	}
}
