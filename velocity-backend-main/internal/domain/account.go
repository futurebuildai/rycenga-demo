package domain

import (
	"time"
)

type AccountType string

const (
	AccountTypeBusiness   AccountType = "business"
	AccountTypeIndividual AccountType = "individual"
)

type AddressType string

const (
	AddressTypeBilling  AddressType = "billing"
	AddressTypeShipping AddressType = "shipping"
	AddressTypeJobSite  AddressType = "job_site"
	AddressTypeRemitTo  AddressType = "remit_to"
)

type AccountAddress struct {
	AddressID   int64       `json:"address_id"`
	AccountID   int64       `json:"account_id"`
	ExternalID  *string     `json:"external_id"`
	Line1       string      `json:"line_1"`
	Line2       *string     `json:"line_2"`
	Line3       *string     `json:"line_3"`
	City        string      `json:"city"`
	State       string      `json:"state"`
	Zip         string      `json:"zip"`
	Country     *string     `json:"country"`
	IsDefault   bool        `json:"is_default"`
	PostalCode  *string     `json:"postal_code"`
	AddressType AddressType `json:"address_type"`
}

type AccountAssignment struct {
	ID             int64     `json:"id"`
	AccountID      int64     `json:"account_id"`
	UserID         int64     `json:"user_id"`
	AssignmentType string    `json:"assignment_type"`
	CreatedAt      time.Time `json:"created_at"`
}

type Account struct {
	ID                  int64            `json:"id"`
	Number              *string          `json:"number"`
	ExternalID          *string          `json:"external_id"`
	Name                *string          `json:"name"`
	Email               *string          `json:"email"`
	Phone               *string          `json:"phone"`
	Active              bool             `json:"active"`
	Addresses           []AccountAddress `json:"addresses,omitempty"`
	CreatedAt           time.Time        `json:"created_at"`
	UpdatedAt           time.Time        `json:"updated_at"`
	CurrencyCode        string           `json:"currency_code"`
	PaymentTermsCode    *string          `json:"payment_terms_code"`
	TaxID               *string          `json:"tax_id"`
	Timezone            string           `json:"timezone"`
	LastSyncedAt        *time.Time       `json:"last_synced_at"`
	Type                AccountType      `json:"type"`
	ParentAccountID     *int64           `json:"parent_account_id"`
	DefaultPriceLevelID *int64           `json:"default_price_level_id"`
	HomeLocationID      *int64           `json:"home_location_id"`
	Summary             *AccountSummary  `json:"summary,omitempty"`
}

type AccountSummary struct {
	AccountID      int64     `json:"account_id"`
	AgingCurrent   float64   `json:"aging_current"`
	Aging30        float64   `json:"aging_30"`
	Aging60        float64   `json:"aging_60"`
	Aging90        float64   `json:"aging_90"`
	Aging90Plus    float64   `json:"aging_90_plus"`
	TotalBalance   float64   `json:"total_balance"`
	CreditLimit    float64   `json:"credit_limit"`
	PastDueBalance float64   `json:"past_due_balance"`
	LastSyncAt     time.Time `json:"last_sync_at"`
}

type AccountFinancials struct {
	AccountID       int64      `json:"account_id"`
	AccountNumber   *string    `json:"account_number"`
	AccountName     *string    `json:"account_name"`
	CurrencyCode    string     `json:"currency_code"`
	CreditLimit     *float64   `json:"credit_limit"`
	TotalBalance    float64    `json:"total_balance"`
	Aging30         float64    `json:"aging_30"`
	Aging60         float64    `json:"aging_60"`
	Aging90         float64    `json:"aging_90"`
	Aging90Plus     float64    `json:"aging_90_plus"`
	AvailableCredit *float64   `json:"available_credit"`
	LastSyncAt      *time.Time `json:"last_sync_at"`
}
