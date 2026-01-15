package server

import (
	"builderwire/velocity-backend/internal/domain"
	"context"

	"github.com/danielgtaylor/huma/v2"
)

func listInvoicesHandler(repo DBRepository) func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Invoice }, error) {
	return func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Invoice }, error) {
		invoices, err := repo.ListInvoicesByAccount(ctx, input.AccountID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list invoices", err)
		}
		return &struct{ Body []domain.Invoice }{Body: invoices}, nil
	}
}

func getInvoiceHandler(repo DBRepository) func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Invoice }, error) {
	return func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Invoice }, error) {
		invoice, err := repo.GetInvoiceByID(ctx, input.ID)
		if err != nil {
			return nil, huma.Error404NotFound("Invoice not found", err)
		}
		return &struct{ Body domain.Invoice }{Body: *invoice}, nil
	}
}

func listInvoiceLinesHandler(repo DBRepository) func(ctx context.Context, input *TenantIDInput) (*struct{ Body []domain.InvoiceLine }, error) {
	return func(ctx context.Context, input *TenantIDInput) (*struct{ Body []domain.InvoiceLine }, error) {
		lines, err := repo.ListInvoiceLines(ctx, input.ID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list invoice lines", err)
		}
		return &struct{ Body []domain.InvoiceLine }{Body: lines}, nil
	}
}

func listOrdersHandler(repo DBRepository) func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Order }, error) {
	return func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Order }, error) {
		orders, err := repo.ListOrdersByAccount(ctx, input.AccountID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list orders", err)
		}
		return &struct{ Body []domain.Order }{Body: orders}, nil
	}
}

func getOrderHandler(repo DBRepository) func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Order }, error) {
	return func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Order }, error) {
		order, err := repo.GetOrderByID(ctx, input.ID)
		if err != nil {
			return nil, huma.Error404NotFound("Order not found", err)
		}
		return &struct{ Body domain.Order }{Body: *order}, nil
	}
}

func listQuotesHandler(repo DBRepository) func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Quote }, error) {
	return func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Quote }, error) {
		quotes, err := repo.ListQuotesByAccount(ctx, input.AccountID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list quotes", err)
		}
		return &struct{ Body []domain.Quote }{Body: quotes}, nil
	}
}

func getQuoteHandler(repo DBRepository) func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Quote }, error) {
	return func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Quote }, error) {
		quote, err := repo.GetQuoteByID(ctx, input.ID)
		if err != nil {
			return nil, huma.Error404NotFound("Quote not found", err)
		}
		return &struct{ Body domain.Quote }{Body: *quote}, nil
	}
}

func listOrderLinesHandler(repo DBRepository) func(ctx context.Context, input *TenantIDInput) (*struct{ Body []domain.OrderLine }, error) {
	return func(ctx context.Context, input *TenantIDInput) (*struct{ Body []domain.OrderLine }, error) {
		lines, err := repo.ListOrderLines(ctx, input.ID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list order lines", err)
		}
		return &struct{ Body []domain.OrderLine }{Body: lines}, nil
	}
}

func listQuoteLinesHandler(repo DBRepository) func(ctx context.Context, input *TenantIDInput) (*struct{ Body []domain.QuoteLine }, error) {
	return func(ctx context.Context, input *TenantIDInput) (*struct{ Body []domain.QuoteLine }, error) {
		lines, err := repo.ListQuoteLines(ctx, input.ID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list quote lines", err)
		}
		return &struct{ Body []domain.QuoteLine }{Body: lines}, nil
	}
}
