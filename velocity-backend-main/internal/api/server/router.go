package server

import (
	"context"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humago"
)

func NewRouter(repo DBRepository) http.Handler {
	mux := http.NewServeMux()

	// Create a Huma API on top of the standard mux.
	config := huma.DefaultConfig("Velocity API", "1.0.0")
	config.Info.Contact = &huma.Contact{
		Name: "BuilderWire, Inc.",
		URL:  "https://www.builderwire.com",
	}
	config.Info.Description = `## Overview
This is the API for a web-based accounting platform developed by **BuilderWire, Inc.** Specifically designed for the **Lumber and Building Materials industry**, it provides specialized services for managing the complex requirements of LBM dealers, including inventory, sales flow, and financial operations.

### Multi-Tenancy
Each request (excluding health checks and auth) must identify a tenant. This is done by providing the **` + "`" + `X-Tenant-ID` + "`" + `** header field (preferred) or by using a tenant-specific **hostname**.

### Usage Policy
This API is not intended for public use. It is designed to be interfaced with by authorized frontend applications and approved integrations developed by BuilderWire. Access is strictly controlled via API keys.

### Key Features
- **Account Management**: specialized profiles for sub-contractors and builders.
- **Sales Documents**: real-time tracking of Invoices, Orders, and Quotes.
- **Finance**: detailed statements and payment processing.
- **Fulfillment**: coordination of shipyard shipments and warehouse jobs.
- **Catalog**: product browsing with industry-specific UOM and pricing levels.

### Authentication
Private routes require an API key in the ` + "`" + `X-API-Key` + "`" + ` header. Public access is limited to system health and authenticated login.`

	config.Components.SecuritySchemes = map[string]*huma.SecurityScheme{
		"api_key": {
			Type: "apiKey",
			In:   "header",
			Name: "X-API-Key",
		},
	}
	api := humago.New(mux, config)

	// Public routes
	huma.Register(api, huma.Operation{
		OperationID: "get-health",
		Method:      http.MethodGet,
		Path:        "/health",
		Summary:     "Health check",
		Description: "Returns the health status of the API and database.",
		Tags:        []string{"System"},
	}, func(ctx context.Context, input *struct{}) (*struct{ Body HealthResponse }, error) {
		resp := &struct{ Body HealthResponse }{
			Body: healthHandler(repo),
		}
		return resp, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "login",
		Method:      http.MethodPost,
		Path:        "/login",
		Summary:     "User login",
		Description: "Authenticate a user with email and password.",
		Tags:        []string{"Auth"},
	}, loginHandler(repo))

	// Private routes
	huma.Register(api, huma.Operation{
		OperationID: "list-accounts",
		Method:      http.MethodGet,
		Path:        "/accounts",
		Summary:     "List accounts",
		Description: "Returns a list of all accounts associated with the authenticated user within the current tenant.",
		Tags:        []string{"Accounts"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listAccountsHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "get-account",
		Method:      http.MethodGet,
		Path:        "/accounts/{id}",
		Summary:     "Get account by ID",
		Tags:        []string{"Accounts"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, getAccountHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "list-account-addresses",
		Method:      http.MethodGet,
		Path:        "/accounts/{id}/addresses",
		Summary:     "List account addresses",
		Tags:        []string{"Accounts"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listAccountAddressesHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "get-account-financials",
		Method:      http.MethodGet,
		Path:        "/accounts/{id}/financials",
		Summary:     "Get account financials",
		Description: "Returns financial summary and credit details for a specific account.",
		Tags:        []string{"Accounts"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, getAccountFinancialsHandler(repo))

	// Invoices
	huma.Register(api, huma.Operation{
		OperationID: "list-invoices",
		Method:      http.MethodGet,
		Path:        "/invoices",
		Summary:     "List invoices",
		Description: "Returns a list of invoices for a specific account. Requires an `account_id` query parameter.",
		Tags:        []string{"Invoices"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listInvoicesHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "get-invoice",
		Method:      http.MethodGet,
		Path:        "/invoices/{id}",
		Summary:     "Get invoice by ID",
		Tags:        []string{"Invoices"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, getInvoiceHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "list-invoice-lines",
		Method:      http.MethodGet,
		Path:        "/invoices/{id}/lines",
		Summary:     "List invoice lines",
		Tags:        []string{"Invoices"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listInvoiceLinesHandler(repo))

	// Orders
	huma.Register(api, huma.Operation{
		OperationID: "list-orders",
		Method:      http.MethodGet,
		Path:        "/orders",
		Summary:     "List orders",
		Description: "Returns a list of orders for a specific account. Requires an `account_id` query parameter.",
		Tags:        []string{"Orders"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listOrdersHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "get-order",
		Method:      http.MethodGet,
		Path:        "/orders/{id}",
		Summary:     "Get order by ID",
		Tags:        []string{"Orders"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, getOrderHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "list-order-lines",
		Method:      http.MethodGet,
		Path:        "/orders/{id}/lines",
		Summary:     "List order lines",
		Tags:        []string{"Orders"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listOrderLinesHandler(repo))

	// Quotes
	huma.Register(api, huma.Operation{
		OperationID: "list-quotes",
		Method:      http.MethodGet,
		Path:        "/quotes",
		Summary:     "List quotes",
		Tags:        []string{"Quotes"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listQuotesHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "get-quote",
		Method:      http.MethodGet,
		Path:        "/quotes/{id}",
		Summary:     "Get quote by ID",
		Tags:        []string{"Quotes"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, getQuoteHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "list-quote-lines",
		Method:      http.MethodGet,
		Path:        "/quotes/{id}/lines",
		Summary:     "List quote lines",
		Tags:        []string{"Quotes"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listQuoteLinesHandler(repo))

	// Finance
	huma.Register(api, huma.Operation{
		OperationID: "list-statements",
		Method:      http.MethodGet,
		Path:        "/statements",
		Summary:     "List statements",
		Tags:        []string{"Finance"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listStatementsHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "list-payments",
		Method:      http.MethodGet,
		Path:        "/payments",
		Summary:     "List payments",
		Tags:        []string{"Finance"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listPaymentsHandler(repo))

	// Fulfillment
	huma.Register(api, huma.Operation{
		OperationID: "list-shipments",
		Method:      http.MethodGet,
		Path:        "/shipments",
		Summary:     "List shipments",
		Tags:        []string{"Fulfillment"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listShipmentsHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "list-jobs",
		Method:      http.MethodGet,
		Path:        "/jobs",
		Summary:     "List jobs",
		Description: "Returns a list of jobs (sub-accounts) for a specific account. Requires an `account_id` query parameter.",
		Tags:        []string{"Fulfillment"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listJobsHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "get-shipment",
		Method:      http.MethodGet,
		Path:        "/shipments/{id}",
		Summary:     "Get shipment by ID",
		Description: "Returns details for a specific shipment.",
		Tags:        []string{"Fulfillment"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, getShipmentHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "get-job",
		Method:      http.MethodGet,
		Path:        "/jobs/{id}",
		Summary:     "Get job by ID",
		Description: "Returns details for a specific job.",
		Tags:        []string{"Fulfillment"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, getJobHandler(repo))

	// Products
	huma.Register(api, huma.Operation{
		OperationID: "list-products",
		Method:      http.MethodGet,
		Path:        "/products",
		Summary:     "List products",
		Tags:        []string{"Products"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, listProductsHandler(repo))

	huma.Register(api, huma.Operation{
		OperationID: "get-product",
		Method:      http.MethodGet,
		Path:        "/products/{id}",
		Summary:     "Get product by ID",
		Tags:        []string{"Products"},
		Security:    []map[string][]string{{"api_key": {}}},
	}, getProductHandler(repo))

	return loggingMiddleware(TenantMiddleware(repo, authMiddleware(repo, mux)))
}
