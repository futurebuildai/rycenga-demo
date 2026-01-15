package domain

import (
	"time"
)

type ShipmentStatus string

const (
	ShipmentStatusPending   ShipmentStatus = "pending"
	ShipmentStatusScheduled ShipmentStatus = "scheduled"
	ShipmentStatusInTransit ShipmentStatus = "in_transit"
	ShipmentStatusDelivered ShipmentStatus = "delivered"
	ShipmentStatusCancelled ShipmentStatus = "cancelled"
)

type Shipment struct {
	ID             int64          `json:"id"`
	AccountID      int64          `json:"account_id"`
	OrderID        *int64         `json:"order_id"`
	JobID          *int64         `json:"job_id"`
	ShipmentNumber string         `json:"shipment_number"`
	Status         ShipmentStatus `json:"status"`
	ScheduledDate  *time.Time     `json:"scheduled_date"`
	ShippedAt      *time.Time     `json:"shipped_at"`
	DeliveredAt    *time.Time     `json:"delivered_at"`
	VehicleNumber  *string        `json:"vehicle_number"`
	DriverName     *string        `json:"driver_name"`
	TrackingURL    *string        `json:"tracking_url"`
	PODDocumentID  *int64         `json:"pod_document_id"`
	SignatureName  *string        `json:"signature_name"`
	CreatedAt      time.Time      `json:"created_at"`
}

type Job struct {
	ID               int64      `json:"id"`
	AccountID        int64      `json:"account_id"`
	JobNumber        string     `json:"job_number"`
	Name             string     `json:"name"`
	PONumber         *string    `json:"po_number"`
	AddressLine1     *string    `json:"address_line_1"`
	AddressLine2     *string    `json:"address_line_2"`
	City             *string    `json:"city"`
	State            *string    `json:"state"`
	Zip              *string    `json:"zip"`
	IsActive         bool       `json:"is_active"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	LastSyncedAt     *time.Time `json:"last_synced_at"`
	SiteContactName  *string    `json:"site_contact_name"`
	SiteContactPhone *string    `json:"site_contact_phone"`
	SiteContactEmail *string    `json:"site_contact_email"`
}

type Location struct {
	ID           int64     `json:"id"`
	ExternalID   *string   `json:"external_id"`
	Name         string    `json:"name"`
	Code         string    `json:"code"`
	AddressLine1 *string   `json:"address_line_1"`
	City         *string   `json:"city"`
	State        *string   `json:"state"`
	Zip          *string   `json:"zip"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
}
