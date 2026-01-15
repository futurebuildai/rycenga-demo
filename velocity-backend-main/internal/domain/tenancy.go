package domain

import "context"

type Tenant struct {
	ID         string `json:"id"` // IDs in control_plane are uuids, but string is fine for transport
	Name       string `json:"name"`
	Slug       string `json:"slug"`
	DBName     string `json:"db_name"`
	DBUser     string `json:"db_user"`
	DBPassword string `json:"-"`
}

type contextKey string

const (
	TenantContextKey contextKey = "tenant"
)

func WithTenant(ctx context.Context, tenant *Tenant) context.Context {
	return context.WithValue(ctx, TenantContextKey, tenant)
}

func TenantFromContext(ctx context.Context) *Tenant {
	val := ctx.Value(TenantContextKey)
	if val == nil {
		return nil
	}
	return val.(*Tenant)
}
