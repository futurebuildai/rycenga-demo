package server

import (
	"builderwire/velocity-backend/internal/domain"
	"context"

	"github.com/danielgtaylor/huma/v2"
)

func listShipmentsHandler(repo DBRepository) func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Shipment }, error) {
	return func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Shipment }, error) {
		shipments, err := repo.ListShipmentsByAccount(ctx, input.AccountID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list shipments", err)
		}
		return &struct{ Body []domain.Shipment }{Body: shipments}, nil
	}
}

func listJobsHandler(repo DBRepository) func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Job }, error) {
	return func(ctx context.Context, input *TenantAccountInput) (*struct{ Body []domain.Job }, error) {
		jobs, err := repo.ListJobsByAccount(ctx, input.AccountID)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to list jobs", err)
		}
		return &struct{ Body []domain.Job }{Body: jobs}, nil
	}
}

func getShipmentHandler(repo DBRepository) func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Shipment }, error) {
	return func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Shipment }, error) {
		shipment, err := repo.GetShipmentByID(ctx, input.ID)
		if err != nil {
			return nil, huma.Error404NotFound("Shipment not found", err)
		}
		return &struct{ Body domain.Shipment }{Body: *shipment}, nil
	}
}

func getJobHandler(repo DBRepository) func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Job }, error) {
	return func(ctx context.Context, input *TenantIDInput) (*struct{ Body domain.Job }, error) {
		job, err := repo.GetJobByID(ctx, input.ID)
		if err != nil {
			return nil, huma.Error404NotFound("Job not found", err)
		}
		return &struct{ Body domain.Job }{Body: *job}, nil
	}
}
