package worker

import (
	"context"
	"sync"
)

// Standard: 3 slots for bulk/background jobs.
// Priority: 1 slot for high-priority/single-item jobs.
type TenantSemaphore struct {
	Standard chan struct{}
	Priority chan struct{}
}

type PoolManager struct {
	mu         sync.RWMutex
	semaphores map[string]*TenantSemaphore
}

func NewPoolManager(limit int) *PoolManager {
	return &PoolManager{
		semaphores: make(map[string]*TenantSemaphore),
	}
}

func (pm *PoolManager) Acquire(ctx context.Context, tenantSlug string, priority bool) (func(), error) {
	pm.mu.Lock()
	sem, ok := pm.semaphores[tenantSlug]
	if !ok {
		sem = &TenantSemaphore{
			Standard: make(chan struct{}, 3),
			Priority: make(chan struct{}, 1),
		}
		pm.semaphores[tenantSlug] = sem
	}
	pm.mu.Unlock()

	var ch chan struct{}
	if priority {
		ch = sem.Priority
	} else {
		ch = sem.Standard
	}

	select {
	case ch <- struct{}{}:
		return func() { <-ch }, nil
	case <-ctx.Done():
		return nil, ctx.Err()
	}
}
