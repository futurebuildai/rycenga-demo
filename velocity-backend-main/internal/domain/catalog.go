package domain

import (
	"time"
)

type ProductCategory struct {
	ID               int64     `json:"id"`
	Name             string    `json:"name"`
	ParentID         *int64    `json:"parent_id"`
	ParentExternalID *string   `json:"parent_external_id"`
	ExternalID       *string   `json:"external_id"`
	Slug             *string   `json:"slug"`
	IsActive         bool      `json:"is_active"`
	TreeLevel        int       `json:"tree_level"`
	CreatedAt        time.Time `json:"created_at"`
}

type ContractPrice struct {
	ID         int64      `json:"id"`
	AccountID  *int64     `json:"account_id"`
	JobID      *int64     `json:"job_id"`
	ProductID  int64      `json:"product_id"`
	UOM        string     `json:"uom"`
	FixedPrice float64    `json:"fixed_price"`
	StartDate  *time.Time `json:"start_date"`
	EndDate    *time.Time `json:"end_date"`
	CreatedAt  time.Time  `json:"created_at"`
}

type PriceLevel struct {
	ID    int64   `json:"id"`
	Name  string  `json:"name"`
	ERPId *string `json:"erp_id"`
	Rank  *int32  `json:"rank"`
}

type ProductPrice struct {
	ID           int64   `json:"id"`
	ProductID    int64   `json:"product_id"`
	PriceLevelID int64   `json:"price_level_id"`
	UOM          string  `json:"uom"`
	Price        float64 `json:"price"`
	MinQuantity  float64 `json:"min_quantity"`
	CurrencyCode string  `json:"currency_code"`
}

type Product struct {
	ID           int64      `json:"id"`
	SKU          string     `json:"sku"`
	Name         string     `json:"name"`
	Description  *string    `json:"description"`
	CategoryID   *int64     `json:"category_id"`
	ImageURL     *string    `json:"image_url"`
	BaseUOM      string     `json:"base_uom"`
	IsActive     bool       `json:"is_active"`
	ExternalID   *string    `json:"external_id"`
	LastSyncedAt *time.Time `json:"last_synced_at"`
}

type Inventory struct {
	ID           int64      `json:"id"`
	ProductID    int64      `json:"product_id"`
	LocationID   int64      `json:"location_id"`
	QtyOnHand    float64    `json:"qty_on_hand"`
	QtyCommitted float64    `json:"qty_committed"`
	QtyAvailable *float64   `json:"qty_available"`
	LastSyncedAt *time.Time `json:"last_synced_at"`
}

type UOMConversion struct {
	ID        int64     `json:"id"`
	FromUOM   string    `json:"from_uom"`
	ToUOM     string    `json:"to_uom"`
	Factor    float64   `json:"factor"`
	ProductID *int64    `json:"product_id"`
	CreatedAt time.Time `json:"created_at"`
}
