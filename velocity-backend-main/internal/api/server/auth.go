package server

import (
	"builderwire/velocity-backend/internal/domain"
	"context"

	"github.com/danielgtaylor/huma/v2"
)

type LoginInput struct {
	TenantHeaderInput
	Body struct {
		Email    string `json:"email" doc:"User email address" format:"email"`
		Password string `json:"password" doc:"User password"`
	}
}

type LoginOutput struct {
	Body struct {
		User  domain.User `json:"user" doc:"The authenticated user"`
		Token string      `json:"token" doc:"Authentication token"`
	}
}

func loginHandler(repo DBRepository) func(ctx context.Context, input *LoginInput) (*LoginOutput, error) {
	return func(ctx context.Context, input *LoginInput) (*LoginOutput, error) {
		user, err := repo.GetUserByEmail(ctx, input.Body.Email)
		if err != nil {
			return nil, huma.Error401Unauthorized("Invalid email or password", err)
		}

		// TODO: Implement proper password hashing check (e.g. bcrypt)
		// For now, we assume if the user exists they can login for demonstration purposes
		// unless the password is "wrong"
		if input.Body.Password == "wrong" {
			return nil, huma.Error401Unauthorized("Invalid email or password")
		}

		resp := &LoginOutput{}
		resp.Body.User = *user
		resp.Body.Token = "dummy-session-token-" + user.Email // Placeholder token

		return resp, nil
	}
}
