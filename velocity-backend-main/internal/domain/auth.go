package domain

import (
	"time"
)

type UserRole string

const (
	RoleTenantOwner  UserRole = "tenant_owner"
	RoleTenantStaff  UserRole = "tenant_staff"
	RoleAccountAdmin UserRole = "account_admin"
	RoleAccountUser  UserRole = "account_user"
)

type APIKey struct {
	ID          int32      `json:"id"`
	KeyHash     string     `json:"key_hash"`
	Description *string    `json:"description"`
	CreatedAt   *time.Time `json:"created_at"`
	Revoked     *bool      `json:"revoked"`
}

type Session struct {
	ID                 int64      `json:"id"`
	UserID             int64      `json:"user_id"`
	RefreshTokenHash   string     `json:"refresh_token_hash"`
	ExpiresAt          time.Time  `json:"expires_at"`
	RevokedAt          *time.Time `json:"revoked_at"`
	CreatedAt          time.Time  `json:"created_at"`
	ActiveAccountID    *int64     `json:"active_account_id"`
	ImpersonatorUserID *int64     `json:"impersonator_user_id"`
}

type User struct {
	ID            int64      `json:"id"`
	Email         string     `json:"email"`
	EmailVerified bool       `json:"email_verified"`
	PasswordHash  string     `json:"-"`
	Name          *string    `json:"name"`
	Phone         *string    `json:"phone"`
	IsActive      bool       `json:"is_active"`
	LastLoginAt   *time.Time `json:"last_login_at"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	AccountID     *int64     `json:"account_id"`
	Role          UserRole   `json:"role"`
}

func (u *User) IsAdmin() bool {
	return u.Role == RoleTenantOwner || u.Role == RoleAccountAdmin
}

func (u *User) IsTenantStaff() bool {
	return u.Role == RoleTenantOwner || u.Role == RoleTenantStaff
}
