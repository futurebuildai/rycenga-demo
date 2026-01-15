package connector

import (
	"bufio"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"builderwire/velocity-backend/internal/connector/worker"
	"builderwire/velocity-backend/internal/platform/s3"
)

func loadEnv(filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
		return // Ignore if file doesn't exist
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		val := strings.Trim(strings.TrimSpace(parts[1]), `"'`)
		os.Setenv(key, val)
	}
}

func Run() {
	loadEnv(".env")

	// Setup Signal Handling and Context
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	s3Bucket := os.Getenv("S3_BUCKET")
	if s3Bucket == "" {
		s3Bucket = "velocity"
	}

	s3Cfg := s3.Config{
		Endpoint:        os.Getenv("S3_ENDPOINT"),
		Region:          os.Getenv("S3_REGION"),
		AccessKeyID:     os.Getenv("S3_ACCESS_KEY"),
		SecretAccessKey: os.Getenv("S3_SECRET_KEY"),
	}

	// Initialize Clients
	s3Client := s3.NewClient(s3Cfg)

	// Initialize Pool Manager (Shared across all workers)
	pool := worker.NewPoolManager(3)

	// Initialize Dispatcher (Global worker pool)
	// 20 workers total, 100 global queue size
	disp := worker.NewDispatcher(pool, 20, 100)
	disp.Start()

	// Initialize Workers
	accWorker := &worker.AccountSyncWorker{
		S3:         s3Client,
		Bucket:     s3Bucket,
		Dispatcher: disp,
		TaskName:   "accounts",
	}

	finWorker := &worker.FinancialSyncWorker{
		S3:         s3Client,
		Bucket:     s3Bucket,
		Dispatcher: disp,
		TaskName:   "financials",
	}

	prodWorker := &worker.ProductSyncWorker{
		S3:         s3Client,
		Bucket:     s3Bucket,
		Dispatcher: disp,
		TaskName:   "products",
	}

	locWorker := &worker.LocationSyncWorker{
		S3:         s3Client,
		Bucket:     s3Bucket,
		Dispatcher: disp,
		TaskName:   "locations",
	}

	// Initialize Handler
	h := NewHandler(ctx, accWorker, finWorker, prodWorker, locWorker, disp)

	// Setup HTTP Server
	mux := http.NewServeMux()
	mux.HandleFunc("/sync/accounts", h.HandleAccountSync)
	mux.HandleFunc("/sync/financials", h.HandleFinancialSync)
	mux.HandleFunc("/sync/products", h.HandleProductSync)
	mux.HandleFunc("/sync/locations", h.HandleLocationSync)

	port := os.Getenv("CONNECTOR_PORT")
	if port == "" {
		port = "8081"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	go func() {
		log.Printf("Connector service listening on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe: %v", err)
		}
	}()

	log.Println("Connector service started. Waiting for signals...")

	<-sigChan
	log.Println("Shutting down connector service...")

	// Cancel the context to signal workers to stop
	cancel()

	// Shutdown HTTP Server
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("HTTP shutdown error: %v", err)
	}

	// Wait for handler goroutines to finish
	h.Close()
	log.Println("Connector service stopped.")
}
