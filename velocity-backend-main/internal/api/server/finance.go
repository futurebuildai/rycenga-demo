package server

import (
	"builderwire/velocity-backend/internal/domain"
	"context"

	"github.com/danielgtaylor/huma/v2"
)

func listStatementsHandler(repo DBRepository) func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Statement }, error) {
	return func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Statement }, error) {
		statements, err := repo.ListStatementsByAccount(ctx, input.AccountID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list statements", err)
		}
		return &struct{ Body []domain.Statement }{Body: statements}, nil
	}
}

func listPaymentsHandler(repo DBRepository) func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.PaymentTransaction }, error) {
	return func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.PaymentTransaction }, error) {
		payments, err := repo.ListPaymentsByAccount(ctx, input.AccountID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list payments", err)
		}
		return &struct{ Body []domain.PaymentTransaction }{Body: payments}, nil
	}
}
