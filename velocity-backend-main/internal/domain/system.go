package domain

import (
	"time"
)

type AuditLog struct {
	ID                 int64     `json:"id"`
	UserID             *int64    `json:"user_id"`
	EventType          string    `json:"event_type"`
	ResourceID         *string   `json:"resource_id"`
	OldValue           *string   `json:"old_value"`
	NewValue           *string   `json:"new_value"`
	IsImpersonation    *bool     `json:"is_impersonation"`
	ImpersonatorUserID *int64    `json:"impersonator_user_id"`
	CreatedAt          time.Time `json:"created_at"`
	AccountID          *int64    `json:"account_id"`
}

type Configuration struct {
	Key         string     `json:"key"`
	Value       string     `json:"value"`
	Scope       string     `json:"scope"`
	Description *string    `json:"description"`
	UpdatedAt   *time.Time `json:"updated_at"`
	UpdatedBy   *int64     `json:"updated_by"`
}

type Document struct {
	ID         int64     `json:"id"`
	AccountID  *int64    `json:"account_id"`
	Filename   *string   `json:"filename"`
	MimeType   *string   `json:"mime_type"`
	StorageKey string    `json:"storage_key"`
	Hash       *string   `json:"hash"`
	CreatedAt  time.Time `json:"created_at"`
	DocType    string    `json:"doc_type"`
}
