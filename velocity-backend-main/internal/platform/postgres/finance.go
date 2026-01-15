package postgres

import (
	"builderwire/velocity-backend/internal/domain"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// Statements

func (r *Repository) ListStatementsByAccount(ctx context.Context, accountID int64) ([]domain.Statement, error) {
	query := `
		SELECT 
			id, account_id, statement_number, period_start, period_end, 
			statement_date, currency_code, opening_balance, closing_balance, 
			document_id, created_at
		FROM core.statements
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying statements: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.Statement])
}

func (r *Repository) GetStatementByID(ctx context.Context, id int64) (*domain.Statement, error) {
	query := `
		SELECT 
			id, account_id, statement_number, period_start, period_end, 
			statement_date, currency_code, opening_balance, closing_balance, 
			document_id, created_at
		FROM core.statements
		WHERE id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("error querying statement by id: %w", err)
	}
	s, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Statement])
	if err != nil {
		return nil, fmt.Errorf("error collecting statement by id: %w", err)
	}
	return &s, nil
}

// Payments

func (r *Repository) ListPaymentsByAccount(ctx context.Context, accountID int64) ([]domain.PaymentTransaction, error) {
	query := `
		SELECT 
			id, account_id, user_id, external_id, provider, status, 
			currency_code, amount, convenience_fee, total_charged, 
			payment_method_type, submitted_at, settled_at, failure_code, failure_message
		FROM core.payment_transactions
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying payments: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.PaymentTransaction])
}

func (r *Repository) GetPaymentByID(ctx context.Context, id int64) (*domain.PaymentTransaction, error) {
	query := `
		SELECT 
			id, account_id, user_id, external_id, provider, status, 
			currency_code, amount, convenience_fee, total_charged, 
			payment_method_type, submitted_at, settled_at, failure_code, failure_message
		FROM core.payment_transactions
		WHERE id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("error querying payment by id: %w", err)
	}
	p, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.PaymentTransaction])
	if err != nil {
		return nil, fmt.Errorf("error collecting payment by id: %w", err)
	}
	return &p, nil
}

func (r *Repository) ListPaymentAllocations(ctx context.Context, paymentID int64) ([]domain.PaymentAllocation, error) {
	query := `
		SELECT id, payment_id, invoice_id, amount_applied, created_at
		FROM core.payment_allocations
		WHERE payment_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, paymentID)
	if err != nil {
		return nil, fmt.Errorf("error querying payment allocations: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.PaymentAllocation])
}

func (r *Repository) ListPaymentMethodsByAccount(ctx context.Context, accountID int64) ([]domain.PaymentMethod, error) {
	query := `
		SELECT 
			id, account_id, type, provider_token, brand, last4, 
			exp_month, exp_year, is_default, created_at
		FROM core.payment_methods
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying payment methods: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.PaymentMethod])
}

// Inventory

func (r *Repository) GetInventoryByProductAndLocation(ctx context.Context, productID, locationID int64) (*domain.Inventory, error) {
	query := `
		SELECT 
			id, product_id, location_id, qty_on_hand, qty_committed, qty_available, last_synced_at
		FROM core.inventory
		WHERE product_id = $1 AND location_id = $2
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, productID, locationID)
	if err != nil {
		return nil, fmt.Errorf("error querying inventory: %w", err)
	}
	i, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Inventory])
	if err != nil {
		return nil, fmt.Errorf("error collecting inventory: %w", err)
	}
	return &i, nil
}

func (r *Repository) BulkUpsertInvoices(ctx context.Context, invoices []*domain.Invoice) error {
	if len(invoices) == 0 {
		return nil
	}
	pool, err := r.getPool(ctx)
	if err != nil {
		return err
	}
	batch := &pgx.Batch{}
	query := `
		INSERT INTO core.invoices (
			id, account_id, invoice_number, external_id, invoice_date, 
			due_date, currency_code, subtotal, tax_total, total, 
			amount_paid, balance_due, created_at, updated_at, status, 
			type, last_synced_at, job_id, location_id
		) VALUES (
			$1, $2, $3, $4, $5, 
			$6, $7, $8, $9, $10, 
			$11, $12, NOW(), NOW(), $13, 
			$14, NOW(), $15, $16
		)
		ON CONFLICT (id) DO UPDATE SET
			account_id = EXCLUDED.account_id,
			invoice_number = EXCLUDED.invoice_number,
			external_id = EXCLUDED.external_id,
			invoice_date = EXCLUDED.invoice_date,
			due_date = EXCLUDED.due_date,
			currency_code = EXCLUDED.currency_code,
			subtotal = EXCLUDED.subtotal,
			tax_total = EXCLUDED.tax_total,
			total = EXCLUDED.total,
			amount_paid = EXCLUDED.amount_paid,
			balance_due = EXCLUDED.balance_due,
			updated_at = NOW(),
			status = EXCLUDED.status,
			type = EXCLUDED.type,
			last_synced_at = NOW(),
			job_id = EXCLUDED.job_id,
			location_id = EXCLUDED.location_id
	`
	for _, inv := range invoices {
		batch.Queue(query,
			inv.ID, inv.AccountID, inv.InvoiceNumber, inv.ExternalID, inv.InvoiceDate,
			inv.DueDate, inv.CurrencyCode, inv.Subtotal, inv.TaxTotal, inv.Total,
			inv.AmountPaid, inv.BalanceDue, inv.Status,
			inv.Type, inv.JobID, inv.LocationID,
		)
	}
	br := pool.SendBatch(ctx, batch)
	defer br.Close()
	for i := 0; i < len(invoices); i++ {
		_, err := br.Exec()
		if err != nil {
			return fmt.Errorf("error executing batch upsert for invoice index %d: %w", i, err)
		}
	}
	return nil
}

func (r *Repository) BulkUpsertStatements(ctx context.Context, statements []*domain.Statement) error {
	if len(statements) == 0 {
		return nil
	}
	pool, err := r.getPool(ctx)
	if err != nil {
		return err
	}
	batch := &pgx.Batch{}
	query := `
		INSERT INTO core.statements (
			id, account_id, statement_number, period_start, period_end, 
			statement_date, currency_code, opening_balance, closing_balance, 
			document_id, created_at
		) VALUES (
			$1, $2, $3, $4, $5, 
			$6, $7, $8, $9, 
			$10, NOW()
		)
		ON CONFLICT (id) DO UPDATE SET
			account_id = EXCLUDED.account_id,
			statement_number = EXCLUDED.statement_number,
			period_start = EXCLUDED.period_start,
			period_end = EXCLUDED.period_end,
			statement_date = EXCLUDED.statement_date,
			currency_code = EXCLUDED.currency_code,
			opening_balance = EXCLUDED.opening_balance,
			closing_balance = EXCLUDED.closing_balance,
			document_id = EXCLUDED.document_id
	`
	for _, stmt := range statements {
		batch.Queue(query,
			stmt.ID, stmt.AccountID, stmt.StatementNumber, stmt.PeriodStart, stmt.PeriodEnd,
			stmt.StatementDate, stmt.CurrencyCode, stmt.OpeningBalance, stmt.ClosingBalance,
			stmt.DocumentID,
		)
	}
	br := pool.SendBatch(ctx, batch)
	defer br.Close()
	for i := 0; i < len(statements); i++ {
		_, err := br.Exec()
		if err != nil {
			return fmt.Errorf("error executing batch upsert for statement index %d: %w", i, err)
		}
	}
	return nil
}

func (r *Repository) BulkUpsertPayments(ctx context.Context, payments []*domain.PaymentTransaction) error {
	if len(payments) == 0 {
		return nil
	}
	pool, err := r.getPool(ctx)
	if err != nil {
		return err
	}
	batch := &pgx.Batch{}
	query := `
		INSERT INTO core.payment_transactions (
			id, account_id, user_id, external_id, provider, status, 
			currency_code, amount, convenience_fee, total_charged, 
			payment_method_type, submitted_at, settled_at, failure_code, failure_message
		) VALUES (
			$1, $2, $3, $4, $5, $6, 
			$7, $8, $9, $10, 
			$11, $12, $13, $14, $15
		)
		ON CONFLICT (id) DO UPDATE SET
			account_id = EXCLUDED.account_id,
			user_id = EXCLUDED.user_id,
			external_id = EXCLUDED.external_id,
			provider = EXCLUDED.provider,
			status = EXCLUDED.status,
			currency_code = EXCLUDED.currency_code,
			amount = EXCLUDED.amount,
			convenience_fee = EXCLUDED.convenience_fee,
			total_charged = EXCLUDED.total_charged,
			payment_method_type = EXCLUDED.payment_method_type,
			submitted_at = EXCLUDED.submitted_at,
			settled_at = EXCLUDED.settled_at,
			failure_code = EXCLUDED.failure_code,
			failure_message = EXCLUDED.failure_message
	`
	for _, p := range payments {
		batch.Queue(query,
			p.ID, p.AccountID, p.UserID, p.ExternalID, p.Provider, p.Status,
			p.CurrencyCode, p.Amount, p.ConvenienceFee, p.TotalCharged,
			p.PaymentMethodType, p.SubmittedAt, p.SettledAt, p.FailureCode, p.FailureMessage,
		)
	}
	br := pool.SendBatch(ctx, batch)
	defer br.Close()
	for i := 0; i < len(payments); i++ {
		_, err := br.Exec()
		if err != nil {
			return fmt.Errorf("error executing batch upsert for payment index %d: %w", i, err)
		}
	}
	return nil
}
