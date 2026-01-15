package domain

import (
	"time"
)

type IntegrationBatch struct {
	ID                int64      `json:"id"`
	IntegrationID     int64      `json:"integration_id"`
	EntityType        string     `json:"entity_type"`
	Direction         string     `json:"direction"`
	TriggerSource     string     `json:"trigger_source"`
	TriggeredByUserID *int64     `json:"triggered_by_user_id"`
	Status            string     `json:"status"`
	StartedAt         time.Time  `json:"started_at"`
	CompletedAt       *time.Time `json:"completed_at"`
	DurationMS        *int32     `json:"duration_ms"`
	RecordsProcessed  *int32     `json:"records_processed"`
	RecordsAdded      *int32     `json:"records_added"`
	RecordsUpdated    *int32     `json:"records_updated"`
	RecordsFailed     *int32     `json:"records_failed"`
	CorrelationID     *string    `json:"correlation_id"`
	BatchFileURL      *string    `json:"batch_file_url"`
}

type IntegrationLog struct {
	ID              int64       `json:"id"`
	BatchID         int64       `json:"batch_id"`
	Level           string      `json:"level"`
	ExternalID      *string     `json:"external_id"`
	ErrorCode       *string     `json:"error_code"`
	Message         *string     `json:"message"`
	PayloadSnapshot interface{} `json:"payload_snapshot"`
	CreatedAt       time.Time   `json:"created_at"`
}

type IntegrationRegistry struct {
	ID            int64       `json:"id"`
	Name          string      `json:"name"`
	ProviderKey   string      `json:"provider_key"`
	Type          string      `json:"type"`
	IsEnabled     bool        `json:"is_enabled"`
	Config        interface{} `json:"config"`
	LastBatchID   *int64      `json:"last_batch_id"`
	LastRunStatus *string     `json:"last_run_status"`
	LastSuccessAt *time.Time  `json:"last_success_at"`
	LastFailureAt *time.Time  `json:"last_failure_at"`
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
}
