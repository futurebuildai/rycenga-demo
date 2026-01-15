package server

import (
	"builderwire/velocity-backend/internal/domain"
	"context"

	"github.com/danielgtaylor/huma/v2"
)

func listProductsHandler(repo DBRepository) func(ctx context.Context, input *TenantHeaderInput) (*struct{ Body []domain.Product }, error) {
	return func(ctx context.Context, input *TenantHeaderInput) (*struct{ Body []domain.Product }, error) {
		products, err := repo.ListProducts(ctx)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list products", err)
		}
		return &struct{ Body []domain.Product }{Body: products}, nil
	}
}

func getProductHandler(repo DBRepository) func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Product }, error) {
	return func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Product }, error) {
		product, err := repo.GetProductByID(ctx, input.ID)
		if err != nil {
			return nil, huma.Error404NotFound("Product not found", err)
		}
		return &struct{ Body domain.Product }{Body: *product}, nil
	}
}
