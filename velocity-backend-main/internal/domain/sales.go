package domain

import (
	"time"
)

type InvoiceStatus string

const (
	InvoiceStatusDraft     InvoiceStatus = "draft"
	InvoiceStatusOpen      InvoiceStatus = "open"
	InvoiceStatusPaid      InvoiceStatus = "paid"
	InvoiceStatusOverdue   InvoiceStatus = "overdue"
	InvoiceStatusCancelled InvoiceStatus = "cancelled"
	InvoiceStatusVoid      InvoiceStatus = "void"
)

type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusConfirmed OrderStatus = "confirmed"
	OrderStatusShipped   OrderStatus = "shipped"
	OrderStatusDelivered OrderStatus = "delivered"
	OrderStatusCancelled OrderStatus = "cancelled"
	OrderStatusClosed    OrderStatus = "closed"
)

type QuoteStatus string

const (
	QuoteStatusDraft    QuoteStatus = "draft"
	QuoteStatusPending  QuoteStatus = "pending"
	QuoteStatusAccepted QuoteStatus = "accepted"
	QuoteStatusRejected QuoteStatus = "rejected"
	QuoteStatusExpired  QuoteStatus = "expired"
)

type InvoiceLine struct {
	ID               int64     `json:"id"`
	InvoiceID        int64     `json:"invoice_id"`
	LineNumber       int32     `json:"line_number"`
	ItemCode         string    `json:"item_code"`
	Description      *string   `json:"description"`
	QuantityBilled   float64   `json:"quantity_billed"`
	UOM              string    `json:"uom"`
	UnitPrice        float64   `json:"unit_price"`
	ExtendedPrice    float64   `json:"extended_price"`
	CreatedAt        time.Time `json:"created_at"`
	ConversionFactor *float64  `json:"conversion_factor"`
}

type Invoice struct {
	ID            int64         `json:"id"`
	AccountID     int64         `json:"account_id"`
	InvoiceNumber string        `json:"invoice_number"`
	ExternalID    *string       `json:"external_id"`
	InvoiceDate   time.Time     `json:"invoice_date"`
	DueDate       *time.Time    `json:"due_date"`
	CurrencyCode  string        `json:"currency_code"`
	Subtotal      float64       `json:"subtotal"`
	TaxTotal      float64       `json:"tax_total"`
	Total         float64       `json:"total"`
	AmountPaid    float64       `json:"amount_paid"`
	BalanceDue    float64       `json:"balance_due"`
	CreatedAt     time.Time     `json:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at"`
	Status        InvoiceStatus `json:"status"`
	Type          string        `json:"type"`
	LastSyncedAt  *time.Time    `json:"last_synced_at"`
	JobID         *int64        `json:"job_id"`
	LocationID    *int64        `json:"location_id"`
}

func (i *Invoice) IsPaid() bool {
	return i.Status == InvoiceStatusPaid || i.BalanceDue <= 0
}

func (i *Invoice) IsOverdue() bool {
	if i.DueDate == nil || i.IsPaid() {
		return false
	}
	return time.Now().After(*i.DueDate)
}

type OrderLine struct {
	ID                  int64     `json:"id"`
	OrderID             int64     `json:"order_id"`
	LineNumber          int32     `json:"line_number"`
	ItemCode            string    `json:"item_code"`
	Description         *string   `json:"description"`
	QuantityOrdered     float64   `json:"quantity_ordered"`
	QuantityShipped     float64   `json:"quantity_shipped"`
	QuantityBackordered float64   `json:"quantity_backordered"`
	UOM                 string    `json:"uom"`
	UnitPrice           float64   `json:"unit_price"`
	ExtendedPrice       float64   `json:"extended_price"`
	CreatedAt           time.Time `json:"created_at"`
	ConversionFactor    *float64  `json:"conversion_factor"`
}

type Order struct {
	ID            int64       `json:"id"`
	AccountID     int64       `json:"account_id"`
	OrderNumber   string      `json:"order_number"`
	ExternalID    *string     `json:"external_id"`
	OrderDate     time.Time   `json:"order_date"`
	CurrencyCode  string      `json:"currency_code"`
	Subtotal      float64     `json:"subtotal"`
	TaxTotal      float64     `json:"tax_total"`
	ShippingTotal float64     `json:"shipping_total"`
	Total         float64     `json:"total"`
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
	Status        OrderStatus `json:"status"`
	LastSyncedAt  *time.Time  `json:"last_synced_at"`
	JobID         *int64      `json:"job_id"`
	LocationID    *int64      `json:"location_id"`
}

type QuoteLine struct {
	ID            int64     `json:"id"`
	QuoteID       int64     `json:"quote_id"`
	LineNumber    int32     `json:"line_number"`
	ItemCode      string    `json:"item_code"`
	Description   *string   `json:"description"`
	Quantity      float64   `json:"quantity"`
	UOM           string    `json:"uom"`
	UnitPrice     float64   `json:"unit_price"`
	ExtendedPrice float64   `json:"extended_price"`
	SectionName   *string   `json:"section_name"`
	CreatedAt     time.Time `json:"created_at"`
}

type Quote struct {
	ID           int64       `json:"id"`
	AccountID    int64       `json:"account_id"`
	QuoteNumber  string      `json:"quote_number"`
	ExternalID   *string     `json:"external_id"`
	QuoteDate    time.Time   `json:"quote_date"`
	ExpiresOn    *time.Time  `json:"expires_on"`
	CurrencyCode string      `json:"currency_code"`
	Subtotal     float64     `json:"subtotal"`
	TaxTotal     float64     `json:"tax_total"`
	Total        float64     `json:"total"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
	Status       QuoteStatus `json:"status"`
	LastSyncedAt *time.Time  `json:"last_synced_at"`
	JobID        *int64      `json:"job_id"`
	LocationID   *int64      `json:"location_id"`
}
