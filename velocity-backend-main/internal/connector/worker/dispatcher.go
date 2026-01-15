package worker

import (
	"context"
	"log"
	"sync"
	"sync/atomic"
)

// Job represents a unit of work that can be processed by a worker.
type Job struct {
	Name string
	Run  func() error
}

// Dispatcher manages a global pool of workers and limits concurrency via PoolManager.
type Dispatcher struct {
	pool       *PoolManager
	jobQueue   chan Job
	maxWorkers int
	wg         sync.WaitGroup
	quit       chan struct{}
	stopped    int32
}

func NewDispatcher(pool *PoolManager, globalWorkerCount, globalQueueSize int) *Dispatcher {
	return &Dispatcher{
		pool:       pool,
		jobQueue:   make(chan Job, globalQueueSize),
		maxWorkers: globalWorkerCount,
		quit:       make(chan struct{}),
	}
}

// Start starts the global worker pool.
func (d *Dispatcher) Start() {
	for i := 0; i < d.maxWorkers; i++ {
		d.wg.Add(1)
		go d.worker(i)
	}
	log.Printf("Dispatcher started with %d global workers", d.maxWorkers)
}

func (d *Dispatcher) Submit(ctx context.Context, tenantSlug string, priority bool, job Job) bool {
	if atomic.LoadInt32(&d.stopped) == 1 {
		log.Printf("Dispatcher: stopped, dropping job %s", job.Name)
		return false
	}

	// 1. Acquire slot from PoolManager
	// We use the passed context for acquisition timeout.
	release, err := d.pool.Acquire(ctx, tenantSlug, priority)
	if err != nil {
		log.Printf("Dispatcher: failed to acquire slot for %s (priority=%v): %v", tenantSlug, priority, err)
		return false
	}

	// 2. Wrap the job to ensure release is called upon completion
	wrappedJob := Job{
		Name: job.Name,
		Run: func() error {
			defer release()
			return job.Run()
		},
	}

	// 3. Submit to global queue (BLOCKING)
	// We acquired a slot, so we must ensure we eventually queue the job or release if context dies.
	select {
	case d.jobQueue <- wrappedJob:
		return true
	case <-ctx.Done():
		// Context cancelled while waiting to queue
		log.Printf("Dispatcher: failed to queue job %s: %v", job.Name, ctx.Err())
		release()
		return false
	case <-d.quit:
		// Dispatcher stopped
		log.Printf("Dispatcher: stopped while queuing job %s", job.Name)
		release()
		return false
	}
}

// Stop gracefully stops the dispatcher and waits for workers to finish.
func (d *Dispatcher) Stop() {
	if !atomic.CompareAndSwapInt32(&d.stopped, 0, 1) {
		return // Already stopped
	}
	close(d.jobQueue)
	d.wg.Wait()
	log.Println("Dispatcher stopped")
}

func (d *Dispatcher) worker(id int) {
	defer d.wg.Done()
	log.Printf("Global Worker %d started", id)

	for job := range d.jobQueue {
		log.Printf("Worker %d: processing job %s", id, job.Name)
		if err := job.Run(); err != nil {
			log.Printf("Worker %d: error processing job %s: %v", id, job.Name, err)
		}
		log.Printf("Worker %d: finished job %s", id, job.Name)
	}
}
