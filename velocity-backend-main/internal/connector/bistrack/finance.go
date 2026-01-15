package bistrack

type TransactionSummaryParameters struct {
	CustomerID      *int          `json:"CustomerID,omitempty"`
	TransactionType string        `json:"TransactionType,omitempty"`
	DateFrom        *BisTrackTime `json:"DateFrom,omitempty"`
	DateTo          *BisTrackTime `json:"DateTo,omitempty"`
	PageNumber      int           `json:"PageNumber,omitempty"`
	PageSize        int           `json:"PageSize,omitempty"`
}

type TransactionSummary []TransactionHeader

type TransactionHeader struct {
	TransactionID       int           `json:"TransactionID"`
	TransactionNumber   int           `json:"TransactionNumber"`
	TransactionTypeName string        `json:"TransactionTypeName"`
	YourRef             string        `json:"YourRef"`
	DateCreated         BisTrackTime  `json:"DateCreated"`
	DateRequired        *BisTrackTime `json:"DateRequired"`
	GoodsTotal          float64       `json:"GoodsTotal"`
	TotalTax            float64       `json:"TotalTax"`
	TotalAmount         float64       `json:"TotalAmount"`
	OutstandingAmount   float64       `json:"OutstandingAmount"`
	StatusName          string        `json:"StatusName"`
}

type TransactionDetails struct {
	Lines []TransactionLine `json:"Lines"`
}

type TransactionLine struct {
	LineNumber    int     `json:"LineNumber"`
	ItemID        int     `json:"ItemID"`
	ItemCode      string  `json:"ItemCode"`
	Description   string  `json:"Description"`
	Quantity      float64 `json:"Quantity"`
	Price         float64 `json:"Price"`
	ExtendedPrice float64 `json:"ExtendedPrice"`
	UOM           string  `json:"UoM"`
}

type FinancialDetails struct {
	CustomerId                  int           `json:"CustomerId"`
	FinancialsType              string        `json:"FinancialsType"`
	CurrentBalance              float64       `json:"CurrentBalance"`
	AmountOnOrder               float64       `json:"AmountOnOrder"`
	CreditLimit                 float64       `json:"CreditLimit"`
	LastInvoiceDate             *BisTrackTime `json:"LastInvoiceDate"`
	LastAccountInvoice          *float64      `json:"LastAccountInvoice"`
	LastPaymentDate             *BisTrackTime `json:"LastPaymentDate"`
	LastAccountPayment          *float64      `json:"LastAccountPayment"`
	NetBalance                  float64       `json:"NetBalance"`
	AvailableSettlementDiscount float64       `json:"AvailableSettlementDiscount"`
	AmountOwing                 float64       `json:"AmountOwing"`
	LastStatementDate           *BisTrackTime `json:"LastStatementDate"`
	LastStatementAmount         float64       `json:"LastStatementAmount"`
	LastStatementDiscount       float64       `json:"LastStatementDiscount"`
	LastStatementNetAmount      float64       `json:"LastStatementNetAmount"`
	LastStatementFinanceCharges float64       `json:"LastStatementFinanceCharges"`
	AccountAgingTable           []AgingEntry  `json:"AccountAgingTable"`
}

type AgingEntry struct {
	AgingBucket           string        `json:"AgingBucket"`
	NumberOfTransactions  int           `json:"NumberOfTransactions"`
	ValueOfTransactions   float64       `json:"ValueOfTransactions"`
	PercentOfTransactions float64       `json:"PercentOfTransactions"`
	AgingDate             *BisTrackTime `json:"AgingDate"`
}
