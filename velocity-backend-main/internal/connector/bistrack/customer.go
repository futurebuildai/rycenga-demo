package bistrack

import (
	"builderwire/velocity-backend/internal/domain"
	"fmt"
	"time"
)

type CustomerAddress struct {
	AddressId   int     `json:"AddressId"`
	Address1    *string `json:"Address1"`
	Address2    *string `json:"Address2"`
	Address3    *string `json:"Address3"`
	City        *string `json:"City"`
	County      *string `json:"County"`
	Province    *string `json:"Province"`
	PostCode    *string `json:"PostCode"`
	Country     *string `json:"Country"`
	Telephone1  *string `json:"Telephone1"`
	Email       *string `json:"Email"`
	ContactName *string `json:"ContactName"`
}

type Customer struct {
	CustomerId        int               `json:"CustomerId"`
	CustomerCode      *string           `json:"CustomerCode"`
	Name              *string           `json:"Name"`
	Telephone1        *string           `json:"Telephone1"`
	Email             *string           `json:"Email"`
	CustomerStatus    int               `json:"CustomerStatus"`
	Balance           float64           `json:"Balance"`
	OnHold            bool              `json:"OnHold"`
	CreditLimit       float64           `json:"CreditLimit"`
	CustomerAddresses []CustomerAddress `json:"CustomerAddresses"`
	FinancialDetails  *FinancialDetails `json:"FinancialDetails"`

	// Top-level address fields (common in some BiTrack variants)
	CustomerAddress1 *string `json:"CustomerAddress1"`
	CustomerCity     *string `json:"CustomerCity"`
	CustomerCounty   *string `json:"CustomerCounty"`
	CustomerCountry  *string `json:"CustomerCountry"`
	CustomerPostCode *string `json:"CustomerPostCode"`
}

func (bt *Customer) ToDomain() *domain.Account {
	// Status IDs: 3=Active, 4=Operational
	active := bt.CustomerStatus == 3 || bt.CustomerStatus == 4

	// id := int64(bt.CustomerId) // Don't use ERP ID as internal ID
	externalID := fmt.Sprintf("%d", bt.CustomerId)

	acc := &domain.Account{
		// ID:         0, // Let importer/DB resolve specific internal ID
		ExternalID: &externalID,
		Number:     bt.CustomerCode,
		Name:       bt.Name,
		Email:      bt.Email,
		Active:     active,
		Type:       domain.AccountTypeBusiness, // Defaulting to business for BisTrack sync
	}

	if len(bt.CustomerAddresses) > 0 {
		for _, addr := range bt.CustomerAddresses {
			extAddrID := fmt.Sprintf("%d", addr.AddressId)
			localAddr := domain.AccountAddress{
				ExternalID: &extAddrID,
				// AccountID:   0, // Resolved by importer
				Line1:       Deref(addr.Address1),
				Line2:       addr.Address2,
				Line3:       addr.Address3,
				City:        Deref(addr.City),
				State:       Deref(addr.Province),
				Zip:         Deref(addr.PostCode),
				PostalCode:  addr.PostCode,
				Country:     addr.Country,
				AddressType: domain.AddressTypeShipping, // Assuming shipping for sync
			}
			acc.Addresses = append(acc.Addresses, localAddr)
		}
	} else if bt.CustomerAddress1 != nil {
		// Use top-level address if explicit list is empty
		acc.Addresses = append(acc.Addresses, domain.AccountAddress{
			// AccountID:   0, // Resolved by importer
			Line1:       Deref(bt.CustomerAddress1),
			City:        Deref(bt.CustomerCity),
			State:       Deref(bt.CustomerCounty),
			Zip:         Deref(bt.CustomerPostCode),
			PostalCode:  bt.CustomerPostCode,
			Country:     bt.CustomerCountry,
			AddressType: domain.AddressTypeBilling, // Default primary address
			IsDefault:   true,
		})
	}

	if bt.FinancialDetails != nil {
		acc.Summary = &domain.AccountSummary{
			TotalBalance:   bt.FinancialDetails.CurrentBalance,
			PastDueBalance: bt.FinancialDetails.AmountOwing,
			CreditLimit:    bt.CreditLimit,
			LastSyncAt:     time.Now(),
		}

		for _, entry := range bt.FinancialDetails.AccountAgingTable {
			val := entry.ValueOfTransactions
			switch entry.AgingBucket {
			case "Current":
				acc.Summary.AgingCurrent = val
			case "1 to 30 Days", "1-30":
				acc.Summary.Aging30 = val
			case "31 to 60 Days", "31-60":
				acc.Summary.Aging60 = val
			case "61 to 90 Days", "61-90":
				acc.Summary.Aging90 = val
			case "91 to 120 Days", "91-120", "121-150", "151+", "Over 120 Days":
				acc.Summary.Aging90Plus += val
			}
		}
	}

	return acc
}

func Deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
