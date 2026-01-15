package api

import (
	"bufio"
	"builderwire/velocity-backend/internal/api/server"
	"builderwire/velocity-backend/internal/platform/postgres"
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func LoadEnv(filepath string) {
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

type App struct {
	srv  *http.Server
	pool *pgxpool.Pool
}

func NewApp(ctx context.Context, addr string, connString string) (*App, error) {
	pool, err := postgres.NewPool(ctx, connString)
	if err != nil {
		return nil, fmt.Errorf("failed to create db pool: %w", err)
	}

	repo := postgres.NewRepository(pool)
	router := server.NewRouter(repo)

	srv := &http.Server{
		Addr:              addr,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	return &App{
		srv:  srv,
		pool: pool,
	}, nil
}

func (a *App) Close(ctx context.Context) error {
	var errs []string

	if a.srv != nil {
		if err := a.srv.Shutdown(ctx); err != nil {
			errs = append(errs, fmt.Sprintf("server shutdown: %v", err))
		}
	}

	if a.pool != nil {
		a.pool.Close()
	}

	if len(errs) > 0 {
		return fmt.Errorf("close errors: %s", strings.Join(errs, "; "))
	}

	return nil
}

func (a *App) Run(ctx context.Context) error {
	errCh := make(chan error, 1)

	go func() {
		if err := a.srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- err
		}
	}()

	select {
	case <-ctx.Done():
		// Create a shutdown context with timeout
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		return a.Close(shutdownCtx)
	case err := <-errCh:
		return err
	}
}
