package postgres

import (
	"builderwire/velocity-backend/internal/domain"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// Orders

func (r *Repository) ListOrdersByAccount(ctx context.Context, accountID int64) ([]domain.Order, error) {
	query := `
		SELECT 
			id, account_id, order_number, external_id, order_date, currency_code, 
			subtotal, tax_total, shipping_total, total, created_at, updated_at, 
			status, last_synced_at, job_id, location_id
		FROM core.orders
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying orders: %w", err)
	}

	orders, err := pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.Order])
	if err != nil {
		return nil, fmt.Errorf("error collecting orders: %w", err)
	}
	return orders, nil
}

func (r *Repository) GetOrderByID(ctx context.Context, id int64) (*domain.Order, error) {
	query := `
		SELECT 
			id, account_id, order_number, external_id, order_date, currency_code, 
			subtotal, tax_total, shipping_total, total, created_at, updated_at, 
			status, last_synced_at, job_id, location_id
		FROM core.orders
		WHERE id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("error querying order by id: %w", err)
	}
	o, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Order])
	if err != nil {
		return nil, fmt.Errorf("error collecting order by id: %w", err)
	}
	return &o, nil
}

func (r *Repository) ListOrderLines(ctx context.Context, orderID int64) ([]domain.OrderLine, error) {
	query := `
		SELECT 
			id, order_id, line_number, item_code, description, quantity_ordered, 
			quantity_shipped, quantity_backordered, uom, unit_price, extended_price, 
			created_at, conversion_factor
		FROM core.order_lines
		WHERE order_id = $1
		ORDER BY line_number
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, orderID)
	if err != nil {
		return nil, fmt.Errorf("error querying order lines: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.OrderLine])
}

// Invoices

func (r *Repository) ListInvoicesByAccount(ctx context.Context, accountID int64) ([]domain.Invoice, error) {
	query := `
		SELECT 
			id, account_id, invoice_number, external_id, invoice_date, due_date, 
			currency_code, subtotal, tax_total, total, amount_paid, balance_due, 
			created_at, updated_at, status, type, last_synced_at, job_id, location_id
		FROM core.invoices
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying invoices: %w", err)
	}

	invoices, err := pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.Invoice])
	if err != nil {
		return nil, fmt.Errorf("error collecting invoices: %w", err)
	}
	return invoices, nil
}

func (r *Repository) GetInvoiceByID(ctx context.Context, id int64) (*domain.Invoice, error) {
	query := `
		SELECT 
			id, account_id, invoice_number, external_id, invoice_date, due_date, 
			currency_code, subtotal, tax_total, total, amount_paid, balance_due, 
			created_at, updated_at, status, type, last_synced_at, job_id, location_id
		FROM core.invoices
		WHERE id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("error querying invoice by id: %w", err)
	}
	i, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Invoice])
	if err != nil {
		return nil, fmt.Errorf("error collecting invoice by id: %w", err)
	}
	return &i, nil
}

func (r *Repository) ListInvoiceLines(ctx context.Context, invoiceID int64) ([]domain.InvoiceLine, error) {
	query := `
		SELECT 
			id, invoice_id, line_number, item_code, description, quantity_billed, 
			uom, unit_price, extended_price, created_at, conversion_factor
		FROM core.invoice_lines
		WHERE invoice_id = $1
		ORDER BY line_number
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, invoiceID)
	if err != nil {
		return nil, fmt.Errorf("error querying invoice lines: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.InvoiceLine])
}

// Quotes

func (r *Repository) ListQuotesByAccount(ctx context.Context, accountID int64) ([]domain.Quote, error) {
	query := `
		SELECT 
			id, account_id, quote_number, external_id, quote_date, expires_on, 
			currency_code, subtotal, tax_total, total, created_at, updated_at, 
			status, last_synced_at, job_id, location_id
		FROM core.quotes
		WHERE account_id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("error querying quotes: %w", err)
	}

	quotes, err := pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.Quote])
	if err != nil {
		return nil, fmt.Errorf("error collecting quotes: %w", err)
	}
	return quotes, nil
}

func (r *Repository) GetQuoteByID(ctx context.Context, id int64) (*domain.Quote, error) {
	query := `
		SELECT 
			id, account_id, quote_number, external_id, quote_date, expires_on, 
			currency_code, subtotal, tax_total, total, created_at, updated_at, 
			status, last_synced_at, job_id, location_id
		FROM core.quotes
		WHERE id = $1
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("error querying quote by id: %w", err)
	}
	q, err := pgx.CollectOneRow(rows, pgx.RowToStructByNameLax[domain.Quote])
	if err != nil {
		return nil, fmt.Errorf("error collecting quote by id: %w", err)
	}
	return &q, nil
}

func (r *Repository) ListQuoteLines(ctx context.Context, quoteID int64) ([]domain.QuoteLine, error) {
	query := `
		SELECT 
			id, quote_id, line_number, item_code, description, quantity, 
			uom, unit_price, extended_price, section_name, created_at
		FROM core.quote_lines
		WHERE quote_id = $1
		ORDER BY line_number
	`
	pool, err := r.getPool(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := pool.Query(ctx, query, quoteID)
	if err != nil {
		return nil, fmt.Errorf("error querying quote lines: %w", err)
	}
	return pgx.CollectRows(rows, pgx.RowToStructByNameLax[domain.QuoteLine])
}
