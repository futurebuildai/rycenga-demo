# Velocity Backend

Backend services for Project Velocity, written in Go.

## Overview

This repository contains the backend server and related components for Project Velocity:

- **API Server** (`cmd/api`): The main HTTP API service.
- **Connector Service** (`cmd/connector`): Service for external integrations.
- **Importer Service** (`cmd/importer`): Service for data ingestion.

## Prerequisites

- **Go**: Version 1.25.5 or higher
- **PostgreSQL**: Required for persistent storage

## Getting Started

### Configuration

The application authenticates and configures itself via environment variables.

1. Create a `.env` file in the root directory (this file is git-ignored):
    ```bash
    touch .env
    ```
2. Add the required configuration to `.env`:
    ```env
    DATABASE_URL=postgres://user:password@localhost:5432/velocity_db
    ```

### Running Locally

You can run the services directly using `go run`.

**API Server**
```bash
go run cmd/api/main.go
```
The server listens on port `80`.

**Connector**
```bash
go run cmd/connector/main.go
```

**Importer**
```bash
go run cmd/importer/main.go
```

## Docker

You can build the components using Docker. The `Dockerfile` supports building different targets via the `BUILD_TARGET` build argument.

**Build the API:**
```bash
docker build --build-arg BUILD_TARGET=./cmd/api/main.go -t velocity-api .
```

**Build the Connector:**
```bash
docker build --build-arg BUILD_TARGET=./cmd/connector/main.go -t velocity-connector .
```

**Build the Importer:**
```bash
docker build --build-arg BUILD_TARGET=./cmd/importer/main.go -t velocity-importer .
```

## Development

- **Scripts**: Helper scripts are located in `scripts/`.
- **Seeding**: `scripts/seed_dev.sql` contains initial data for development.