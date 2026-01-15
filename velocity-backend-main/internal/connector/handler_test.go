package connector

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"builderwire/velocity-backend/internal/connector/erp"
	"builderwire/velocity-backend/internal/connector/worker"
	"builderwire/velocity-backend/internal/domain"
	"builderwire/velocity-backend/internal/platform/s3"
)

// mockConnector implements erp.Connector for testing.
type mockConnector struct {
	erp.Connector
	blockChan chan struct{}
}

func (m *mockConnector) GetProductGroups(ctx context.Context, groupType string) ([]*domain.ProductCategory, error) {
	if m.blockChan != nil {
		<-m.blockChan
	}
	// Return some empty data so it proceeds
	return []*domain.ProductCategory{}, nil
}

func (m *mockConnector) GetBranches(ctx context.Context, pageSize int) ([]*domain.Location, error) {
	return []*domain.Location{}, nil
}

func (m *mockConnector) SearchProducts(ctx context.Context, query string, page, pageSize int) ([]*domain.Product, error) {
	return []*domain.Product{}, nil
}

func (m *mockConnector) GetProducts(ctx context.Context, branchID string, skip, pageSize int) ([]*domain.Product, error) {
	return []*domain.Product{}, nil
}

func TestHandler_GracefulShutdown(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	blockChan := make(chan struct{})
	mock := &mockConnector{blockChan: blockChan}

	pool := worker.NewPoolManager(1)
	disp := worker.NewDispatcher(pool, 1, 10)
	disp.Start()

	prodWorker := &worker.ProductSyncWorker{
		ERP:        mock,
		S3:         &s3.Client{Config: s3.Config{Endpoint: "http://localhost"}},
		Dispatcher: disp,
		TaskName:   "products",
		Bucket:     "test",
	}

	h := NewHandler(ctx, nil, nil, prodWorker, nil, disp)

	body := worker.ProductSyncRequest{
		TenantSlug: "test-tenant",
		ERPConfig:  erp.Config{Type: "mock"},
	}
	jsonBody, _ := json.Marshal(body)

	req := httptest.NewRequest(http.MethodPost, "/sync/products", bytes.NewBuffer(jsonBody))
	req.Header.Set("X-Tenant-ID", "test-tenant")

	w := httptest.NewRecorder()
	h.HandleProductSync(w, req)

	if w.Code != http.StatusAccepted {
		t.Errorf("expected status accepted, got %v", w.Code)
	}

	// Signal shutdown
	cancel()

	// Wait for handler to close in a goroutine
	done := make(chan struct{})
	go func() {
		h.Close()
		close(done)
	}()

	// Close() should be blocked because worker is blocked in GetProductGroups
	select {
	case <-done:
		t.Fatal("Close() returned before worker finished")
	case <-time.After(100 * time.Millisecond):
		// Expected
	}

	// Unblock worker
	close(blockChan)

	// Close() should now return
	select {
	case <-done:
		// Success
	case <-time.After(500 * time.Millisecond):
		t.Fatal("Close() timed out after worker unblocked")
	}
}
