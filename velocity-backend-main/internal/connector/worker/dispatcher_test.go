package worker

import (
	"context"
	"sync/atomic"
	"testing"
	"time"
)

func TestDispatcher_Submit(t *testing.T) {
	// Pool with limit 3 (default), 2 workers, 2 queue size
	pool := NewPoolManager(3)
	d := NewDispatcher(pool, 2, 2)
	d.Start()
	defer d.Stop()

	var counter int32
	job := Job{
		Name: "test",
		Run: func() error {
			atomic.AddInt32(&counter, 1)
			time.Sleep(100 * time.Millisecond)
			return nil
		},
	}

	// Submit jobs for Tenant A
	// Queue is 2. Workers are 2.
	// We can submit 4 jobs: 2 running, 2 queued.
	// But pool limit is 3.
	// So 2 running (consume 2 slots). 2 queued (consume 2 slots??)
	// No, acquire happens at Submit.
	// So if we submit 4 jobs:
	// 1. Submit -> Acquire (1/3) -> Queue (push)
	// 2. Submit -> Acquire (2/3) -> Queue (push)
	// 3. Submit -> Acquire (3/3) -> Queue (push)
	// 4. Submit -> Acquire (4/3) -> BLOCKS/FAILS?
	// Wait, Acquire blocks if semaphore full.
	// `Acquire` returns `nil` if successful.
	// But `Acquire` blocks on channel send.
	// In `Submit`, we call `Acquire` with `ctx`.
	// For test, we use `context.Background()`? No, we might timeout?
	// `Submit` in this test uses `context.Background()`.
	// If `Acquire` blocks, `Submit` blocks.
	// The test expects `Submit` to return `true` or `false`.
	// If `Submit` blocks forever, test timeout.

	// Issue: `Acquire` blocks if pool is full.
	// Tenant A has 3 slots.
	// We submit 4 jobs.
	// 1, 2, 3 succeed.
	// 4th blocks?
	// `Dispatcher.Submit` implementation calls `pool.Acquire(ctx...)`.
	// If `Acquire` blocks, `Submit` blocks.
	// We probably want `Submit` to fail immediately in test if we want to test "queue full" logic, but "queue full" is different from "pool full".
	// "Pool Full" = concurrency limit.
	// "Queue Full" = backlog limit.
	// In the new design, we acquire slot BEFORE queuing.
	// So effective capacity = Pool Limit.
	// Wait, if we acquire slot before queuing, then Queue Size is irrelevant for *Tenant* capacity, only for *Global* throughput?
	// If generic queue is full, we drop even if we acquired slot.
	// But `Acquire` limits per tenant.
	// If Tenant A has 3 slots.
	// We submit Job 1 -> Acquire OK -> Queue OK. Worker picks up.
	// We submit Job 4 -> Acquire blocks.

	// So `Submit` for Tenant A will block on 4th call.
	// Test should account for this.
	// Maybe we use `context.WithTimeout` for calls we expect to fail/block?

	ctx := context.Background()

	for i := 0; i < 3; i++ {
		// Try a few times if it fails, to account for worker startup
		success := false
		for retry := 0; retry < 5; retry++ {
			if d.Submit(ctx, "TenantA", false, job) {
				success = true
				break
			}
			time.Sleep(10 * time.Millisecond)
		}
		if !success {
			t.Errorf("Expected job %d for TenantA to be submitted", i)
		}
	}

	// Fourth job for Tenant A should fail/block (Pool Full)
	// We use a short timeout context to verify it fails
	shortCtx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	if d.Submit(shortCtx, "TenantA", false, job) {
		t.Error("Expected fourth job for TenantA to fail (pool full)")
	}

	// Job for Tenant B should still succeed (separate pool)
	if !d.Submit(ctx, "TenantB", false, job) {
		t.Error("Expected job for TenantB to succeed")
	}

	// Wait for processing
	time.Sleep(1 * time.Second)
	// Tenant A: 3 jobs. Tenant B: 1 job. Total 4.
	// But wait, workers process. When worker finishes, release slot.
	// Then subsequent submits would succeed.
	// Since jobs sleep 100ms, they should finish.
	// But we only managed to submit 3 for A (4th failed). + 1 for B.
	// Total 4.
	if atomic.LoadInt32(&counter) != 4 {
		t.Errorf("Expected 4 jobs to be processed, got %d", counter)
	}
}

func TestDispatcher_Stop(t *testing.T) {
	pool := NewPoolManager(3)
	d := NewDispatcher(pool, 2, 5)
	d.Start()

	var counter int32
	job := Job{
		Name: "test",
		Run: func() error {
			atomic.AddInt32(&counter, 1)
			return nil
		},
	}

	ctx := context.Background()
	for i := 0; i < 3; i++ {
		d.Submit(ctx, "TenantA", false, job)
	}

	d.Stop()

	if atomic.LoadInt32(&counter) != 3 {
		t.Errorf("Expected all 3 jobs to be processed before stop, got %d", counter)
	}
}
