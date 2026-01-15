package connector

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"sync"

	"builderwire/velocity-backend/internal/connector/worker"
	"builderwire/velocity-backend/internal/domain"
)

type Handler struct {
	AccountSync   *worker.AccountSyncWorker
	FinancialSync *worker.FinancialSyncWorker
	ProductSync   *worker.ProductSyncWorker
	LocationSync  *worker.LocationSyncWorker
	Dispatcher    *worker.Dispatcher

	ctx context.Context
	wg  sync.WaitGroup
}

func NewHandler(ctx context.Context, acc *worker.AccountSyncWorker, fin *worker.FinancialSyncWorker, prod *worker.ProductSyncWorker, loc *worker.LocationSyncWorker, disp *worker.Dispatcher) *Handler {
	return &Handler{
		ctx:           ctx,
		AccountSync:   acc,
		FinancialSync: fin,
		ProductSync:   prod,
		LocationSync:  loc,
		Dispatcher:    disp,
	}
}

func (h *Handler) Close() {
	log.Println("Handler stopping Dispatcher...")
	h.Dispatcher.Stop()
	log.Println("Handler waiting for active sync goroutines to finish...")
	h.wg.Wait()
	log.Println("Handler closed.")
}

func (h *Handler) HandleLocationSync(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	tenantSlug := r.Header.Get("X-Tenant-ID")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}

	// Submit job to Dispatcher
	job := worker.Job{
		Name: "LocationSync:" + tenantSlug,
		Run: func() error {
			h.wg.Add(1)
			defer h.wg.Done()
			ctx := h.ctx
			if tenantSlug != "" {
				ctx = domain.WithTenant(ctx, &domain.Tenant{Slug: tenantSlug})
			}
			return h.LocationSync.Process(ctx, body)
		},
	}

	if !h.Dispatcher.Submit(r.Context(), tenantSlug, false, job) {
		http.Error(w, "Service unavailable (queue full or timeout)", http.StatusServiceUnavailable)
		return
	}

	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte(`{"status":"accepted"}`))
}

func (h *Handler) HandleProductSync(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	tenantSlug := r.Header.Get("X-Tenant-ID")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}

	// Submit job to Dispatcher
	job := worker.Job{
		Name: "ProductSync:" + tenantSlug,
		Run: func() error {
			h.wg.Add(1)
			defer h.wg.Done()
			ctx := h.ctx
			if tenantSlug != "" {
				ctx = domain.WithTenant(ctx, &domain.Tenant{Slug: tenantSlug})
			}
			return h.ProductSync.Process(ctx, body)
		},
	}

	if !h.Dispatcher.Submit(r.Context(), tenantSlug, false, job) {
		http.Error(w, "Service unavailable (queue full or timeout)", http.StatusServiceUnavailable)
		return
	}

	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte(`{"status":"accepted"}`))
}

func (h *Handler) HandleAccountSync(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	tenantSlug := r.Header.Get("X-Tenant-ID")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}

	// Determine priority
	priority := false
	var req worker.SyncRequest
	if err := json.Unmarshal(body, &req); err == nil && req.AccountID != 0 {
		priority = true
	}

	// Submit job to Dispatcher
	job := worker.Job{
		Name: "AccountSync:" + tenantSlug,
		Run: func() error {
			h.wg.Add(1)
			defer h.wg.Done()
			ctx := h.ctx
			if tenantSlug != "" {
				ctx = domain.WithTenant(ctx, &domain.Tenant{Slug: tenantSlug})
			}
			return h.AccountSync.Process(ctx, body)
		},
	}

	if !h.Dispatcher.Submit(r.Context(), tenantSlug, priority, job) {
		http.Error(w, "Service unavailable (queue full or timeout)", http.StatusServiceUnavailable)
		return
	}

	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte(`{"status":"accepted"}`))
}

func (h *Handler) HandleFinancialSync(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	tenantSlug := r.Header.Get("X-Tenant-ID")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}

	// Submit job to Dispatcher
	job := worker.Job{
		Name: "FinancialSync:" + tenantSlug,
		Run: func() error {
			h.wg.Add(1)
			defer h.wg.Done()
			ctx := h.ctx
			if tenantSlug != "" {
				ctx = domain.WithTenant(ctx, &domain.Tenant{Slug: tenantSlug})
			}
			return h.FinancialSync.Process(ctx, body)
		},
	}

	if !h.Dispatcher.Submit(r.Context(), tenantSlug, false, job) {
		http.Error(w, "Service unavailable (queue full or timeout)", http.StatusServiceUnavailable)
		return
	}

	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte(`{"status":"accepted"}`))
}
