package main

import (
	"builderwire/velocity-backend/internal/api"
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	api.LoadEnv(".env")
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	connString := os.Getenv("DATABASE_URL")
	if connString == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	app, err := api.NewApp(ctx, ":80", connString)
	if err != nil {
		log.Fatalf("Failed to initialize app: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := app.Close(ctx); err != nil {
			log.Printf("Error closing app: %v", err)
		}
	}()

	if err := app.Run(ctx); err != nil {
		log.Panic(err)
	}
}
