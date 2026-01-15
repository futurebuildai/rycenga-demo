package server

import (
	"builderwire/velocity-backend/internal/domain"
	"context"

	"github.com/danielgtaylor/huma/v2"
)

func listAccountsHandler(repo DBRepository) func(ctx context.Context, input *TenantHeaderInput) (*struct{ Body []domain.Account }, error) {
	return func(ctx context.Context, input *TenantHeaderInput) (*struct{ Body []domain.Account }, error) {
		accounts, err := repo.ListAccounts(ctx)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list accounts", err)
		}
		return &struct{ Body []domain.Account }{Body: accounts}, nil
	}
}

type AccountIDDetailInput struct {
	IDParamInput
	TenantHeaderInput
}

func getAccountHandler(repo DBRepository) func(ctx context.Context, input *AccountIDDetailInput) (*struct{ Body domain.Account }, error) {
	return func(ctx context.Context, input *AccountIDDetailInput) (*struct{ Body domain.Account }, error) {
		account, err := repo.GetAccountByID(ctx, input.ID)
		if err != nil {
			return nil, huma.Error404NotFound("Account not found", err)
		}
		return &struct{ Body domain.Account }{Body: *account}, nil
	}
}

func listAccountAddressesHandler(repo DBRepository) func(ctx context.Context, input *AccountIDDetailInput) (*struct{ Body []domain.AccountAddress }, error) {
	return func(ctx context.Context, input *AccountIDDetailInput) (*struct{ Body []domain.AccountAddress }, error) {
		addresses, err := repo.ListAccountAddresses(ctx, input.ID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list addresses", err)
		}
		return &struct{ Body []domain.AccountAddress }{Body: addresses}, nil
	}
}

func getAccountFinancialsHandler(repo DBRepository) func(ctx context.Context, input *AccountIDDetailInput) (*struct{ Body domain.AccountFinancials }, error) {
	return func(ctx context.Context, input *AccountIDDetailInput) (*struct{ Body domain.AccountFinancials }, error) {
		fin, err := repo.GetAccountFinancials(ctx, input.ID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to get account financials", err)
		}
		return &struct{ Body domain.AccountFinancials }{Body: *fin}, nil
	}
}
