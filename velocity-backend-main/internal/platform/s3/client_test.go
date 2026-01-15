package s3_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"builderwire/velocity-backend/internal/domain"
	"builderwire/velocity-backend/internal/platform/s3"
)

func TestClient_Upload(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "PUT" {
			t.Errorf("Expected PUT request, got %s", r.Method)
		}
		if !strings.HasPrefix(r.Header.Get("Authorization"), "AWS4-HMAC-SHA256") {
			t.Errorf("Expected SigV4 Authorization header, got %s", r.Header.Get("Authorization"))
		}
		if r.Header.Get("x-amz-date") == "" {
			t.Error("Expected x-amz-date header")
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer ts.Close()

	cfg := s3.Config{
		Endpoint:        ts.URL,
		Region:          "us-east-1",
		AccessKeyID:     "test-key",
		SecretAccessKey: "test-secret",
	}
	// Create context with tenant
	tenant := &domain.Tenant{
		ID:   "123",
		Slug: "test-tenant",
	}
	ctx := domain.WithTenant(context.Background(), tenant)

	client := s3.NewClient(cfg)
	err := client.Upload(ctx, "my-bucket", "my-key", []byte("hello world"))
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
}
