package server

import (
	"builderwire/velocity-backend/internal/domain"
	"context"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

type cacheEntry struct {
	exists    bool
	expiresAt time.Time
}

var apiKeyCache sync.Map

const apiKeyTTL = 120 * time.Second

// Tenant Cache
type tenantCacheEntry struct {
	tenant    *domain.Tenant
	expiresAt time.Time
}

var tenantCache sync.Map

const tenantCacheTTL = 5 * time.Minute

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("\033[34m%s\033[0m %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
		next.ServeHTTP(w, r)
	})
}

func TenantMiddleware(repo DBRepository, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip for health checks and documentation (multi-tenant safe)
		path := r.URL.Path
		if path == "/" || path == "/health" ||
			strings.HasPrefix(path, "/docs") ||
			strings.HasPrefix(path, "/openapi") ||
			strings.HasPrefix(path, "/schemas") {
			next.ServeHTTP(w, r)
			return
		}

		// 1. Extract Tenant ID/Slug
		slug := r.Header.Get("X-Tenant-ID")
		if slug == "" {
			// Fallback to Host header (extract subdomain)
			host := r.Host
			if strings.Contains(host, ":") {
				host, _, _ = net.SplitHostPort(host)
			}

			// extract subdomain from host (e.g. acme.velocity.com -> acme)
			parts := strings.Split(host, ".")
			if len(parts) > 2 {
				// We assume the first part is the tenant slug
				slug = parts[0]
			} else {
				// Fallback to full host if no subdomain (e.g. localhost, velocity.com)
				slug = host
			}
		}

		if slug == "" {
			http.Error(w, "Bad Request: Missing tenant identifier", http.StatusBadRequest)
			return
		}

		// 2. Check Cache
		var tenant *domain.Tenant
		if cached, ok := tenantCache.Load(slug); ok {
			entry := cached.(tenantCacheEntry)
			if time.Now().Before(entry.expiresAt) {
				tenant = entry.tenant
			}
		}

		// 3. Lookup if not cached
		if tenant == nil {
			var err error
			tenant, err = repo.GetTenantBySlug(r.Context(), slug)
			if err != nil {
				log.Printf("Error resolving tenant '%s': %v", slug, err)
				http.Error(w, "Not Found: Tenant not found", http.StatusNotFound)
				return
			}
			// Cache it
			tenantCache.Store(slug, tenantCacheEntry{
				tenant:    tenant,
				expiresAt: time.Now().Add(tenantCacheTTL),
			})
		}

		// 4. Inject into Context
		ctx := domain.WithTenant(r.Context(), tenant)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func authMiddleware(repo DBRepository, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip for health, login, documentation, and schemas
		path := r.URL.Path
		if path == "/health" || path == "/login" || strings.HasPrefix(path, "/docs") || strings.HasPrefix(path, "/openapi") || strings.HasPrefix(path, "/schemas") {
			next.ServeHTTP(w, r)
			return
		}

		apiKey := r.Header.Get("X-API-Key")
		if apiKey == "" {
			http.Error(w, "Unauthorized: missing API key", http.StatusUnauthorized)
			return
		}

		var exists bool
		var err error
		if cached, ok := apiKeyCache.Load(apiKey); ok {
			entry := cached.(cacheEntry)
			if time.Now().Before(entry.expiresAt) {
				exists = entry.exists
			} else {
				// Expired, need to re-verify
				exists, err = verifyAndStore(r.Context(), repo, apiKey)
				if err != nil {
					log.Printf("DB error verifying API key: %v", err)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}
			}
		} else {
			exists, err = verifyAndStore(r.Context(), repo, apiKey)
			if err != nil {
				log.Printf("DB error verifying API key: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
		}

		if !exists {
			http.Error(w, "Unauthorized: invalid API key", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func verifyAndStore(ctx context.Context, repo DBRepository, apiKey string) (bool, error) {
	var exists bool
	if repo == nil {
		exists = (apiKey == "velocity-secret")
	} else {
		var err error
		exists, err = repo.VerifyAPIKey(ctx, apiKey)
		if err != nil {
			return false, err
		}
	}
	apiKeyCache.Store(apiKey, cacheEntry{
		exists:    exists,
		expiresAt: time.Now().Add(apiKeyTTL),
	})
	return exists, nil
}
