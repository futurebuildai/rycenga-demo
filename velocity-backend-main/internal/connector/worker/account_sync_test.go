package worker_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"builderwire/velocity-backend/internal/connector/bistrack"
	"builderwire/velocity-backend/internal/connector/worker"
	"builderwire/velocity-backend/internal/domain"
	"builderwire/velocity-backend/internal/platform/s3"
)

func TestAccountSyncWorker_Process(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/authenticate" {
			json.NewEncoder(w).Encode(bistrack.AuthenticatedClient{
				AccessToken: stringPtr("mock-token"),
			})
			return
		}
		if r.URL.Path == "/customer" {
			customers := []bistrack.Customer{
				{
					CustomerId:   123,
					CustomerCode: stringPtr("C123"),
					Name:         stringPtr("Test Customer"),
				},
			}
			json.NewEncoder(w).Encode(customers)
			return
		}
	}))
	defer ts.Close()

	btClient, err := bistrack.NewClient(ts.URL, "mock-secret", "user", "pass")
	if err != nil {
		t.Fatalf("Expected no error from NewClient, got %v", err)
	}
	s3Client := s3.NewClient(s3.Config{Endpoint: "http://localhost:9000"})

	// Initialize dependencies
	pool := worker.NewPoolManager(3)
	disp := worker.NewDispatcher(pool, 10, 10)
	disp.Start()
	defer disp.Stop()

	accWorker := &worker.AccountSyncWorker{
		ERP:        btClient,
		S3:         s3Client,
		Bucket:     "test-bucket",
		Dispatcher: disp,
		TaskName:   "accounts",
	}

	req := worker.SyncRequest{AccountID: 123}
	body, _ := json.Marshal(req)

	// Inject tenant context
	ctx := domain.WithTenant(context.Background(), &domain.Tenant{Slug: "test-tenant"})

	err = accWorker.Process(ctx, body)
	if err == nil {
		t.Error("Expected error during S3 upload in unit test")
	}
}

func stringPtr(s string) *string {
	return &s
}
