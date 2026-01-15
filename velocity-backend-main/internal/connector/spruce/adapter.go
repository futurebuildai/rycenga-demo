package spruce

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"builderwire/velocity-backend/internal/connector/erp"
	"builderwire/velocity-backend/internal/domain"
)

// Ensure Client implements erp.Connector
var _ erp.Connector = (*Client)(nil)

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func (c *Client) GetAccount(ctx context.Context, id int) (*domain.Account, error) {
	acc, err := c.GetAccountRaw(ctx, strconv.Itoa(id))
	if err != nil {
		return nil, err
	}
	return acc.ToDomain(), nil
}

// Map Spruce Account to domain.Account
func (a *Account) ToDomain() *domain.Account {
	return &domain.Account{
		ExternalID: &a.AccountNumber,
		Number:     &a.AccountNumber,
		Name:       &a.Name,
		Email:      &a.Email,
		Phone:      &a.PhoneNumber,
		Active:     a.Success,
		Addresses: []domain.AccountAddress{
			{
				Line1:      a.AddressLine1,
				Line2:      &a.AddressLine2,
				City:       a.City,
				State:      a.StateCode,
				Zip:        a.Zip,
				PostalCode: &a.Zip,
			},
		},
	}
}

func (c *Client) SearchAccounts(ctx context.Context, query string, page, pageSize int) ([]*domain.Account, error) {
	filter := AccountFilter{
		Search:      query,
		RowStart:    (page - 1) * pageSize,
		RowMaxCount: pageSize,
	}
	results, err := c.GetAccountsRaw(ctx, filter)
	if err != nil {
		return nil, err
	}

	items := make([]*domain.Account, len(results.Accounts))
	for i, acc := range results.Accounts {
		items[i] = acc.ToDomain()
	}
	return items, nil
}

func (c *Client) GetFinancialSummary(ctx context.Context, id int) (*domain.FinancialSummary, error) {
	accID := strconv.Itoa(id)
	results, err := c.GetAccountBalanceDetailRaw(ctx, []string{accID})
	if err != nil {
		return nil, err
	}

	if len(results.AccountBalanceDetails) == 0 {
		return nil, fmt.Errorf("no balance details found for account %s", accID)
	}

	detail := results.AccountBalanceDetails[0]

	summary := &domain.FinancialSummary{
		CurrentBalance:  detail.BalanceDetail.OutstandingBalance,
		AvailableCredit: detail.BalanceDetail.CreditAvailable,
		PastDue:         detail.BalanceDetail.Due30Days + detail.BalanceDetail.Due60Days + detail.BalanceDetail.Due90Days + detail.BalanceDetail.Due120Days,
		// CreditLimit not explicitly in BalanceDetail? Assume Available + Current
		CreditLimit: detail.BalanceDetail.CreditAvailable + detail.BalanceDetail.OutstandingBalance,
		AgeBuckets: map[string]float64{
			"0-30":  detail.BalanceDetail.Due30Days,
			"31-60": detail.BalanceDetail.Due60Days,
			"61-90": detail.BalanceDetail.Due90Days,
			"90+":   detail.BalanceDetail.Due120Days,
		},
	}

	return summary, nil
}

func (c *Client) GetTransactions(ctx context.Context, id int, start, end *time.Time) ([]*domain.Transaction, error) {
	return []*domain.Transaction{}, nil // Placeholder
}

func (c *Client) SearchProducts(ctx context.Context, query string, page, pageSize int) ([]*domain.Product, error) {
	filter := ItemFilter{
		Search:      query,
		RowStart:    (page - 1) * pageSize,
		RowMaxCount: pageSize,
	}
	results, err := c.GetItemsRaw(ctx, filter)
	if err != nil {
		return nil, err
	}

	items := make([]*domain.Product, len(results.Items))
	for i, item := range results.Items {
		items[i] = &domain.Product{
			ExternalID: &item.ItemNumber, // Assuming ItemNumber is string
			SKU:        item.ItemNumber,
			Name:       item.Description,
			BaseUOM:    item.CustomerPriceUM,
			IsActive:   item.Success,
		}
	}
	return items, nil
}

func (c *Client) GetBranches(ctx context.Context, pageSize int) ([]*domain.Location, error) {
	if pageSize == 0 {
		pageSize = 100
	}
	filter := BranchFilter{
		RowStart:    0,
		RowMaxCount: pageSize,
	}
	results, err := c.GetBranchesRaw(ctx, filter)
	if err != nil {
		return nil, err
	}

	items := make([]*domain.Location, len(results.Branches))
	for i, b := range results.Branches {
		loc := &domain.Location{
			ID:           int64(i + 1), // Fake ID as Spruce branches use string BranchId
			ExternalID:   &b.BranchId,
			Name:         b.Name,
			Code:         b.BranchId,
			AddressLine1: strPtr(b.AddressLine1),
			City:         strPtr(b.City),
			State:        strPtr(b.StateCode),
			Zip:          strPtr(b.Zip),
		}
		items[i] = loc
	}
	return items, nil
}

func (c *Client) GetProducts(ctx context.Context, branchID string, skip int, pageSize int) ([]*domain.Product, error) {
	if pageSize == 0 {
		pageSize = 100
	}
	filter := ItemFilter{
		Branch:      branchID,
		RowStart:    skip,
		RowMaxCount: pageSize,
	}
	results, err := c.GetItemsRaw(ctx, filter)
	if err != nil {
		return nil, err
	}

	items := make([]*domain.Product, len(results.Items))
	for i, item := range results.Items {
		items[i] = &domain.Product{
			ExternalID: &item.ItemNumber,
			SKU:        item.ItemNumber,
			Name:       item.Description,
			BaseUOM:    item.CustomerPriceUM,
			IsActive:   item.Success,
		}
	}
	return items, nil
}

func (c *Client) GetProductGroups(ctx context.Context, groupType string) ([]*domain.ProductCategory, error) {
	groups, err := c.GetGroupsRaw(ctx)
	if err != nil {
		return nil, err
	}

	items := make([]*domain.ProductCategory, len(groups))
	for i, g := range groups {
		id := strconv.Itoa(g.GroupID)
		items[i] = &domain.ProductCategory{
			ExternalID: &id,
			Name:       g.Description,
			IsActive:   true,
		}
	}
	return items, nil
}
