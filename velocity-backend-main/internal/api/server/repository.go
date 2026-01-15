package server

import (
	"builderwire/velocity-backend/internal/domain"
	"context"
)

type AccountQueryInput struct {
	AccountID int64 `query:"account_id" required:"true" doc:"Filter by account ID"`
}

type IDParamInput struct {
	ID int64 `path:"id" doc:"Resource ID"`
}

type TenantHeaderInput struct {
	TenantID string `header:"X-Tenant-ID" doc:"Tenant ID or Slug"`
}

type TenantIDInput struct {
	IDParamInput
	TenantHeaderInput
}

type TenantAccountInput struct {
	AccountQueryInput
	TenantHeaderInput
}

type DBRepository interface {
	// Tenancy
	GetTenantBySlug(ctx context.Context, slug string) (*domain.Tenant, error)

	// Accounts
	ListAccounts(ctx context.Context) ([]domain.Account, error)
	GetAccountByID(ctx context.Context, id int64) (*domain.Account, error)
	ListAccountAddresses(ctx context.Context, accountID int64) ([]domain.AccountAddress, error)
	GetAccountFinancials(ctx context.Context, accountID int64) (*domain.AccountFinancials, error)
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	VerifyAPIKey(ctx context.Context, keyHash string) (bool, error)

	// Invoices
	ListInvoicesByAccount(ctx context.Context, accountID int64) ([]domain.Invoice, error)
	GetInvoiceByID(ctx context.Context, id int64) (*domain.Invoice, error)
	ListInvoiceLines(ctx context.Context, invoiceID int64) ([]domain.InvoiceLine, error)

	// Orders
	ListOrdersByAccount(ctx context.Context, accountID int64) ([]domain.Order, error)
	GetOrderByID(ctx context.Context, id int64) (*domain.Order, error)
	ListOrderLines(ctx context.Context, orderID int64) ([]domain.OrderLine, error)

	// Quotes
	ListQuotesByAccount(ctx context.Context, accountID int64) ([]domain.Quote, error)
	GetQuoteByID(ctx context.Context, id int64) (*domain.Quote, error)
	ListQuoteLines(ctx context.Context, quoteID int64) ([]domain.QuoteLine, error)

	// Statements & Payments
	ListStatementsByAccount(ctx context.Context, accountID int64) ([]domain.Statement, error)
	ListPaymentsByAccount(ctx context.Context, accountID int64) ([]domain.PaymentTransaction, error)

	// Fulfillment
	ListShipmentsByAccount(ctx context.Context, accountID int64) ([]domain.Shipment, error)
	ListJobsByAccount(ctx context.Context, accountID int64) ([]domain.Job, error)
	GetJobByID(ctx context.Context, id int64) (*domain.Job, error)
	GetShipmentByID(ctx context.Context, id int64) (*domain.Shipment, error)

	// Products
	ListProducts(ctx context.Context) ([]domain.Product, error)
	GetProductByID(ctx context.Context, id int64) (*domain.Product, error)
}
