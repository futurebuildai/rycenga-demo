package postgres

import (
	"builderwire/velocity-backend/internal/domain"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// Accounts

func (r *Repository) ListAccounts(ctx context.Context) ([]domain.Account, error) {
	query := `
		SELECT 
			id, number, external_id, name, email, phone, active, 
			created_at, updated_at, currency_code, payment_terms_code, 
			tax_id, timezone, last_synced_at, type, 
			parent_account_id, default_price_level_id, home_location_id
		FROM core.accounts
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying accounts: %w", err)
	}

	// pgx.CollectRows is the idiomatic way in v5 to handle slice scanning
	accounts, err := pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.Account])
	if err != nil {
		return nil, fmt.Errorf("error collecting accounts: %w", err)
	}
	return accounts, nil
}

func (r *Repository) GetAccountByID(ctx context.Context, id int64) (*domain.Account, error) {
	query := `
		SELECT 
			id, number, external_id, name, email, phone, active, 
			created_at, updated_at, currency_code, payment_terms_code, 
			tax_id, timezone, last_synced_at, type, 
			parent_account_id, default_price_level_id, home_location_id
		FROM core.accounts
		WHERE id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("error querying account by id: %w", err)
	}
	a, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Account])
	if err != nil {
		return nil, fmt.Errorf("error collecting account by id: %w", err)
	}
	return &a, nil
}

func (r *Repository) ListAccountAddresses(ctx context.Context, accountID int64) ([]domain.AccountAddress, error) {
	query := `
		SELECT 
			address_id, account_id, line_1, line_2, line_3, city, state, zip, 
			country, is_default, postal_code, address_type
		FROM core.account_addresses
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying account addresses: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.AccountAddress])
}

func (r *Repository) ListAccountAssignments(ctx context.Context, accountID int64) ([]domain.AccountAssignment, error) {
	query := `
		SELECT id, account_id, user_id, assignment_type, created_at
		FROM core.account_assignments
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying account assignments: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.AccountAssignment])
}

func (r *Repository) GetAccountFinancials(ctx context.Context, accountID int64) (*domain.AccountFinancials, error) {
	query := `
		SELECT 
			account_id, account_number, account_name, currency_code, credit_limit, 
			total_balance, aging_30, aging_60, aging_90, aging_90_plus, 
			available_credit, last_sync_at
		FROM core.account_financials
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying account financials: %w", err)
	}
	f, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.AccountFinancials])
	if err != nil {
		return nil, fmt.Errorf("error collecting account financials: %w", err)
	}
	return &f, nil
}

// Users

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT 
			id, email, email_verified, password_hash, name, phone, is_active, 
			last_login_at, created_at, updated_at, account_id, role
		FROM auth.users
		WHERE lower(email) = lower($1)
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, email)
	if err != nil {
		return nil, fmt.Errorf("error querying user by email: %w", err)
	}
	u, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.User])
	if err != nil {
		return nil, fmt.Errorf("error collecting user by email: %w", err)
	}
	return &u, nil
}

// API Keys

func (r *Repository) VerifyAPIKey(ctx context.Context, keyHash string) (bool, error) {
	pool, err := r.getPool(ctx)
	if err != nil {
		return false, err
	}
	var exists bool
	err = pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM auth.api_keys WHERE key_hash = $1 AND revoked = FALSE)", keyHash).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error verifying api key: %w", err)
	}
	return exists, nil
}

func (r *Repository) BulkUpsertAccounts(ctx context.Context, accounts []*domain.Account) (map[string]int64, error) {
	if len(accounts) == 0 {
		return nil, nil
	}

	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}

	batch := &pgx.Batch{}
	query := `
		INSERT INTO core.accounts (
			number, external_id, name, email, phone, active, 
			updated_at, currency_code, payment_terms_code, 
			tax_id, timezone, last_synced_at, type, parent_account_id, 
			default_price_level_id, home_location_id
		) VALUES (
			$1, $2, $3, $4, $5, $6, 
			NOW(), $7, $8, 
			$9, $10, NOW(), $11, $12, 
			$13, $14
		)
		ON CONFLICT (external_id) DO UPDATE SET
			number = EXCLUDED.number,
			name = EXCLUDED.name,
			email = EXCLUDED.email,
			phone = EXCLUDED.phone,
			active = EXCLUDED.active,
			updated_at = NOW(),
			currency_code = EXCLUDED.currency_code,
			payment_terms_code = EXCLUDED.payment_terms_code,
			tax_id = EXCLUDED.tax_id,
			timezone = EXCLUDED.timezone,
			last_synced_at = NOW(),
			type = EXCLUDED.type,
			parent_account_id = EXCLUDED.parent_account_id,
			default_price_level_id = EXCLUDED.default_price_level_id,
			home_location_id = EXCLUDED.home_location_id
		RETURNING id, external_id
	`

	for _, a := range accounts {
		batch.Queue(query,
			a.Number, a.ExternalID, a.Name, a.Email, a.Phone, a.Active,
			a.CurrencyCode, a.PaymentTermsCode,
			a.TaxID, a.Timezone, a.Type, a.ParentAccountID,
			a.DefaultPriceLevelID, a.HomeLocationID,
		)
	}

	br := pool.SendBatch(ctx, batch)
	defer br.Close()

	idMap := make(map[string]int64)
	for i := 0; i < len(accounts); i++ {
		var id int64
		var extID *string
		if err := br.QueryRow().Scan(&id, &extID); err != nil {
			return nil, fmt.Errorf("error executing batch upsert for account index %d: %w", i, err)
		}
		if extID != nil {
			idMap[*extID] = id
		}
	}

	return idMap, nil
}

func (r *Repository) BulkUpsertAccountAddresses(ctx context.Context, addresses []*domain.AccountAddress) error {
	if len(addresses) == 0 {
		return nil
	}

	pool, err := r.getPool(ctx)
	if err != nil {
		return err
	}

	batch := &pgx.Batch{}
	query := `
		INSERT INTO core.account_addresses (
			account_id, external_id, line_1, line_2, line_3, city, state, zip, 
			country, is_default, postal_code, address_type
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, 
			$9, $10, $11, $12
		)
		ON CONFLICT (external_id) DO UPDATE SET
			account_id = EXCLUDED.account_id,
			line_1 = EXCLUDED.line_1,
			line_2 = EXCLUDED.line_2,
			line_3 = EXCLUDED.line_3,
			city = EXCLUDED.city,
			state = EXCLUDED.state,
			zip = EXCLUDED.zip,
			country = EXCLUDED.country,
			is_default = EXCLUDED.is_default,
			postal_code = EXCLUDED.postal_code,
			address_type = EXCLUDED.address_type
	`

	for _, addr := range addresses {
		batch.Queue(query,
			addr.AccountID, addr.ExternalID, addr.Line1, addr.Line2, addr.Line3, addr.City, addr.State, addr.Zip,
			addr.Country, addr.IsDefault, addr.PostalCode, addr.AddressType,
		)
	}

	br := pool.SendBatch(ctx, batch)
	defer br.Close()

	for i := 0; i < len(addresses); i++ {
		_, err := br.Exec()
		if err != nil {
			return fmt.Errorf("error executing batch upsert for address index %d: %w", i, err)
		}
	}

	return nil
}
func (r *Repository) BulkUpsertAccountSummaries(ctx context.Context, summaries []*domain.AccountSummary) error {
	if len(summaries) == 0 {
		return nil
	}

	pool, err := r.getPool(ctx)
	if err != nil {
		return err
	}

	batch := &pgx.Batch{}
	query := `
		INSERT INTO core.account_summaries (
			account_id, aging_current, aging_30, aging_60, aging_90, 
			aging_90_plus, total_balance, past_due_balance, credit_limit, last_sync_at
		) VALUES (
			$1, $2, $3, $4, $5, 
			$6, $7, $8, $9, NOW()
		)
		ON CONFLICT (account_id) DO UPDATE SET
			aging_current = EXCLUDED.aging_current,
			aging_30 = EXCLUDED.aging_30,
			aging_60 = EXCLUDED.aging_60,
			aging_90 = EXCLUDED.aging_90,
			aging_90_plus = EXCLUDED.aging_90_plus,
			total_balance = EXCLUDED.total_balance,
			past_due_balance = EXCLUDED.past_due_balance,
			credit_limit = EXCLUDED.credit_limit,
			last_sync_at = NOW()
	`

	for _, s := range summaries {
		batch.Queue(query,
			s.AccountID, s.AgingCurrent, s.Aging30, s.Aging60, s.Aging90,
			s.Aging90Plus, s.TotalBalance, s.PastDueBalance, s.CreditLimit,
		)
	}

	br := pool.SendBatch(ctx, batch)
	defer br.Close()

	for i := 0; i < len(summaries); i++ {
		_, err := br.Exec()
		if err != nil {
			return fmt.Errorf("error executing batch upsert for summary index %d: %w", i, err)
		}
	}

	return nil
}
