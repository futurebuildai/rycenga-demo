# Build stage
FROM golang:1.25.5-alpine AS builder

WORKDIR /app

# Add metadata for GHCR
LABEL org.opencontainers.image.source=https://github.com/builderwire-inc/velocity-backend

# Copy go.mod and go.sum and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the application
ARG BUILD_TARGET=./cmd/api
RUN go build -o app-binary ${BUILD_TARGET}

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/app-binary .

# Expose port 80
EXPOSE 80

# Run the application
CMD ["./app-binary"]
