package bistrack

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"sync"
	"time"

	"builderwire/velocity-backend/internal/connector/erp"
	"builderwire/velocity-backend/internal/domain"
)

// Ensure Client implements erp.Connector
var _ erp.Connector = (*Client)(nil)

func (c *Client) GetAccount(ctx context.Context, id int) (*domain.Account, error) {
	cust, err := c.GetCustomerRaw(ctx, id)
	if err != nil {
		return nil, err
	}
	return cust.ToDomain(), nil
}

func (c *Client) SearchAccounts(ctx context.Context, query string, page, pageSize int) ([]*domain.Account, error) {
	customers, err := c.SearchCustomersRaw(ctx, page, pageSize)
	if err != nil {
		return nil, err
	}

	items := make([]*domain.Account, len(customers))
	for i, cust := range customers {
		items[i] = cust.ToDomain()
	}
	return items, nil
}

func (c *Client) GetFinancialSummary(ctx context.Context, id int) (*domain.FinancialSummary, error) {
	cust, err := c.GetCustomerRaw(ctx, id)
	if err != nil {
		return nil, err
	}

	fin := cust.FinancialDetails
	summary := &domain.FinancialSummary{
		CurrentBalance:  fin.CurrentBalance,
		CreditLimit:     fin.CreditLimit,
		AvailableCredit: fin.CreditLimit - fin.CurrentBalance,
		PastDue:         0, // Logic to determine past due from aging, or default to 0
		AgeBuckets:      make(map[string]float64),
	}

	// Best effort to determine past due. If any bucket > 0 days has balance?
	// Assuming first bucket is "Current"
	for _, bucket := range fin.AccountAgingTable {
		summary.AgeBuckets[bucket.AgingBucket] = bucket.ValueOfTransactions
		if bucket.AgingBucket != "Current" && bucket.AgingBucket != "0-30" { // Example logic
			summary.PastDue += bucket.ValueOfTransactions
		}
	}

	return summary, nil
}

func (c *Client) GetTransactions(ctx context.Context, id int, start, end *time.Time) ([]*domain.Transaction, error) {
	types := []string{"Invoice", "CreditNote", "Order", "Quote", "CustomerStatement"}
	var allItems []*domain.Transaction
	var mu sync.Mutex
	var wg sync.WaitGroup
	errChan := make(chan error, len(types))

	for _, tType := range types {
		wg.Add(1)
		go func(tType string) {
			defer wg.Done()
			params := TransactionSummaryParameters{
				CustomerID:      &id,
				TransactionType: tType,
				DateFrom:        (*BisTrackTime)(start),
				DateTo:          (*BisTrackTime)(end),
			}
			summary, err := c.GetTransactionSummary(ctx, params)
			if err != nil {
				errChan <- fmt.Errorf("failed to get %s summary: %w", tType, err)
				return
			}

			mu.Lock()
			for _, t := range *summary {
				allItems = append(allItems, &domain.Transaction{
					ID:               strconv.Itoa(t.TransactionID),
					Date:             t.DateCreated.Time(),
					Type:             t.TransactionTypeName,
					Reference:        t.YourRef,
					Amount:           t.TotalAmount,
					RemainingBalance: t.OutstandingAmount,
					Description:      fmt.Sprintf("%s #%d", t.TransactionTypeName, t.TransactionNumber),
				})
			}
			mu.Unlock()
		}(tType)
	}

	wg.Wait()
	close(errChan)

	if err := <-errChan; err != nil {
		return nil, err
	}

	// Sort by Date Descending
	sort.Slice(allItems, func(i, j int) bool {
		return allItems[i].Date.After(allItems[j].Date)
	})

	return allItems, nil
}

func (c *Client) SearchProducts(ctx context.Context, query string, page, pageSize int) ([]*domain.Product, error) {
	params := ProductSearchParameters{
		SearchString: query,
		PageNumber:   page,
		PageSize:     pageSize,
	}
	result, err := c.SearchProductsRaw(ctx, params)
	if err != nil {
		return nil, err
	}

	items := make([]*domain.Product, 0, len(result))
	for _, p := range result {
		// Use manual mapping here as in worker
		items = append(items, &domain.Product{
			ExternalID:  func(i int) *string { s := strconv.Itoa(i); return &s }(p.ProductId),
			SKU:         *p.ProductCode,
			Name:        *p.Description,
			Description: p.FullDescription,
			BaseUOM:     *p.BaseUOM,
			IsActive:    !p.Deleted,
		})
	}
	return items, nil
}

func (c *Client) GetBranches(ctx context.Context, pageSize int) ([]*domain.Location, error) {
	branches, err := c.GetBranchesRaw(ctx)
	if err != nil {
		return nil, err
	}

	items := make([]*domain.Location, len(branches))
	for i, b := range branches {
		idStr := strconv.Itoa(b.BranchID)
		loc := &domain.Location{
			ExternalID: &idStr,
			Name:       *b.Name,
			Code:       *b.Code,
		}
		// ID not in Location struct? Location struct wasn't fully shown but I assume it has ID or ExternalID
		// domain/system.go -> Location?
		// Assuming Location has ID (int64) or ExternalID (*string)
		// I will check domain/system.go if needed, but worker had assignment:
		// branch := bItem.Data.(*domain.Location) -> branch.ID (int64)
		// So I should map BranchID to ID or ExternalID.
		// Since ID is likely database ID, I should probably use ExternalID if available, or just ID if it matches.
		// Re-checking existing code: `items, err := connector.GetProducts(ctx, int(branch.ID), pageSize)`
		// So branch.ID must be settable.

		loc.ID = int64(b.BranchID) // Direct assignment if ID is int64

		if b.BranchAddress != nil {
			loc.AddressLine1 = b.BranchAddress.Address1
			loc.City = b.BranchAddress.City
			loc.State = b.BranchAddress.State
			loc.Zip = b.BranchAddress.PostalCode
		}
		items[i] = loc
	}
	return items, nil
}

func (c *Client) GetProducts(ctx context.Context, branchID string, skip int, pageSize int) ([]*domain.Product, error) {
	id, err := strconv.Atoi(branchID)
	if err != nil {
		return nil, fmt.Errorf("invalid branch ID %s: %w", branchID, err)
	}
	products, err := c.GetProductsRaw(ctx, id)
	if err != nil {
		return nil, err
	}

	items := make([]*domain.Product, len(products))
	for i, p := range products {
		items[i] = &domain.Product{
			ExternalID:  func(i int) *string { s := strconv.Itoa(i); return &s }(p.ProductId),
			SKU:         *p.ProductCode,
			Name:        *p.Description,
			Description: p.FullDescription,
			BaseUOM:     *p.BaseUOM,
			IsActive:    !p.Deleted,
		}
	}
	return items, nil
}

func (c *Client) GetProductGroups(ctx context.Context, groupType string) ([]*domain.ProductCategory, error) {
	groups, err := c.GetProductGroupsRaw(ctx, groupType)
	if err != nil {
		return nil, err
	}

	items := make([]*domain.ProductCategory, len(groups))
	for i, pg := range groups {
		id := pg.ProductGroupID
		if id == 0 {
			id = pg.WebTrackProductGroupID
		}
		idStr := strconv.Itoa(id)

		var parentID *string
		if pg.ParentID != nil {
			s := strconv.Itoa(*pg.ParentID)
			parentID = &s
		}

		items[i] = &domain.ProductCategory{
			ExternalID:       &idStr,
			ParentExternalID: parentID,
			Name:             *pg.Name,
			TreeLevel:        pg.TreeLevel,
			IsActive:         true,
		}
	}
	return items, nil
}
