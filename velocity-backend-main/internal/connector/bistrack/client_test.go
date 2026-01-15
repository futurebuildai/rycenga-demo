package bistrack_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"builderwire/velocity-backend/internal/connector/bistrack"
)

func TestClient_GetCustomer(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/authenticate/customer" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(bistrack.AuthenticatedClient{
				AccessToken: stringPtr("mock-token"),
			})
			return
		}
		if r.URL.Path == "/customer" {
			if r.Header.Get("Authorization") != "Bearer mock-token" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			customers := []bistrack.Customer{
				{CustomerId: 1, Name: stringPtr("John Doe")},
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(customers)
			return
		}
	}))
	defer ts.Close()

	client, err := bistrack.NewClient(ts.URL, "secret", "user", "pass")
	if err != nil {
		t.Fatalf("Expected no error from NewClient, got %v", err)
	}
	cust, err := client.GetCustomerRaw(context.Background(), 1)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	if *cust.Name != "John Doe" {
		t.Errorf("Expected John Doe, got %s", *cust.Name)
	}
}

func TestClient_GetProductGroups(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify URL uses BisTrack or WebTrack
		if r.URL.Path == "/productgroup/BisTrack" || r.URL.Path == "/productgroup/WebTrack" {
			w.Header().Set("Content-Type", "application/json")
			groups := []bistrack.ProductGroup{
				{ProductGroupID: 1, Name: stringPtr("Group 1")},
			}
			json.NewEncoder(w).Encode(groups)
			return
		}

		// Auth
		if r.URL.Path == "/authenticate/customer" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(bistrack.AuthenticatedClient{
				AccessToken: stringPtr("mock-token"),
			})
			return
		}

		w.WriteHeader(http.StatusNotFound)
	}))
	defer ts.Close()

	client, err := bistrack.NewClient(ts.URL, "secret", "user", "pass")
	if err != nil {
		t.Fatalf("Expected no error from NewClient, got %v", err)
	}
	groups, err := client.GetProductGroupsRaw(context.Background(), "BisTrack")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	if len(groups) != 1 || *groups[0].Name != "Group 1" {
		t.Errorf("Unexpected result: %v", groups)
	}

	// Test default (WebTrack)
	groups, err = client.GetProductGroupsRaw(context.Background(), "")
	if err != nil {
		t.Fatalf("Expected no error for default, got %v", err)
	}
	if len(groups) != 1 || *groups[0].Name != "Group 1" {
		t.Errorf("Unexpected result for default: %v", groups)
	}
}

func stringPtr(s string) *string {
	return &s
}
