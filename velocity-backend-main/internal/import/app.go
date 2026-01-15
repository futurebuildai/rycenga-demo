package importer

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

	"builderwire/velocity-backend/internal/api/server"
	"builderwire/velocity-backend/internal/platform/postgres"
	"builderwire/velocity-backend/internal/platform/s3"
)

type App struct {
	S3     *s3.Client
	Repo   *postgres.Repository
	Bucket string
	Port   string
}

func Run() {
	// 1. Load Environment
	loadEnv(".env")

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 2. Configuration
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

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL must be set")
	}

	port := os.Getenv("IMPORTER_PORT")
	if port == "" {
		port = "8082"
	}

	// 3. Initialize Pool & Clients
	pool, err := postgres.NewPool(ctx, dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer pool.Close()

	repo := postgres.NewRepository(pool)
	s3Client := s3.NewClient(s3Cfg)

	app := &App{
		S3:     s3Client,
		Repo:   repo,
		Bucket: s3Bucket,
		Port:   port,
	}

	// Setup Signal Handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Setup HTTP Server
	mux := http.NewServeMux()
	mux.HandleFunc("/import/account", app.HandleImportAccount)
	mux.HandleFunc("/import/location", func(w http.ResponseWriter, r *http.Request) {
		// Mocked for manual trigger if needed, similar to HandleImportAccount
		w.WriteHeader(http.StatusNotImplemented)
	})

	// Wrap with TenantMiddleware for tenant context propagation
	handler := server.TenantMiddleware(app.Repo, mux)

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: handler,
	}

	go func() {
		log.Printf("Importer service listening on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe: %v", err)
		}
	}()

	go app.StartPoller(ctx)

	log.Println("Importer service started. Waiting for signals...")

	<-sigChan
	log.Println("Shutting down importer service...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("HTTP shutdown error: %v", err)
	}
}

func loadEnv(filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
		return
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
