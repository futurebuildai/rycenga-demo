package domain

import (
	"time"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusSubmitted PaymentStatus = "submitted"
	PaymentStatusSettled   PaymentStatus = "settled"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusCancelled PaymentStatus = "cancelled"
	PaymentStatusRefunded  PaymentStatus = "refunded"
)

type PaymentMethodType string

const (
	PaymentMethodTypeCreditCard PaymentMethodType = "credit_card"
	PaymentMethodTypeACH        PaymentMethodType = "ach"
	PaymentMethodTypeCheck      PaymentMethodType = "check"
	PaymentMethodTypeCash       PaymentMethodType = "cash"
)

type PaymentAllocation struct {
	ID            int64     `json:"id"`
	PaymentID     int64     `json:"payment_id"`
	InvoiceID     *int64    `json:"invoice_id"`
	AmountApplied float64   `json:"amount_applied"`
	CreatedAt     time.Time `json:"created_at"`
}

type PaymentMethod struct {
	ID            int64             `json:"id"`
	AccountID     int64             `json:"account_id"`
	Type          PaymentMethodType `json:"type"`
	ProviderToken string            `json:"provider_token"`
	Brand         *string           `json:"brand"`
	Last4         *string           `json:"last4"`
	ExpMonth      *int32            `json:"exp_month"`
	ExpYear       *int32            `json:"exp_year"`
	IsDefault     bool              `json:"is_default"`
	CreatedAt     time.Time         `json:"created_at"`
}

type PaymentTransaction struct {
	ID                int64              `json:"id"`
	AccountID         int64              `json:"account_id"`
	UserID            *int64             `json:"user_id"`
	ExternalID        *string            `json:"external_id"`
	Provider          string             `json:"provider"`
	Status            PaymentStatus      `json:"status"`
	CurrencyCode      string             `json:"currency_code"`
	Amount            float64            `json:"amount"`
	ConvenienceFee    float64            `json:"convenience_fee"`
	TotalCharged      float64            `json:"total_charged"`
	PaymentMethodType *PaymentMethodType `json:"payment_method_type"`
	SubmittedAt       time.Time          `json:"submitted_at"`
	SettledAt         *time.Time         `json:"settled_at"`
	FailureCode       *string            `json:"failure_code"`
	FailureMessage    *string            `json:"failure_message"`
}

type Statement struct {
	ID              int64     `json:"id"`
	AccountID       int64     `json:"account_id"`
	StatementNumber *string   `json:"statement_number"`
	PeriodStart     time.Time `json:"period_start"`
	PeriodEnd       time.Time `json:"period_end"`
	StatementDate   time.Time `json:"statement_date"`
	CurrencyCode    string    `json:"currency_code"`
	OpeningBalance  float64   `json:"opening_balance"`
	ClosingBalance  float64   `json:"closing_balance"`
	DocumentID      *int64    `json:"document_id"`
	CreatedAt       time.Time `json:"created_at"`
}

type FinancialSummary struct {
	CurrentBalance  float64            `json:"current_balance"`
	AvailableCredit float64            `json:"available_credit"`
	CreditLimit     float64            `json:"credit_limit"`
	PastDue         float64            `json:"past_due"`
	AgeBuckets      map[string]float64 `json:"age_buckets"`
}

type Transaction struct {
	ID               string    `json:"id"`
	Date             time.Time `json:"date"`
	Type             string    `json:"type"`
	Reference        string    `json:"reference"`
	Amount           float64   `json:"amount"`
	RemainingBalance float64   `json:"remaining_balance"`
	Description      string    `json:"description"`
}
