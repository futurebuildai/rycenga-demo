package spruce

import "encoding/xml"

// GetAccountBalanceDetail
type GetAccountBalanceDetailRequest struct {
	XMLName        xml.Name `xml:"http://SpruceWeb/WebServices/ECommerce GetAccountBalanceDetail"`
	APIKey         string   `xml:"apikey"`
	AccountNumbers []string `xml:"accountNumber>string"`
	JobNumber      *int     `xml:"jobNumber"`
}

type GetAccountBalanceDetailResponse struct {
	XMLName                       xml.Name                    `xml:"http://SpruceWeb/WebServices/ECommerce GetAccountBalanceDetailResponse"`
	GetAccountBalanceDetailResult AccountBalanceDetailResults `xml:"GetAccountBalanceDetailResult"`
}

type AccountBalanceDetailResults struct {
	BaseModel
	RowTotalCount         int                    `xml:"RowTotalCount"`
	AccountBalanceDetails []AccountBalanceDetail `xml:"AccountBalanceDetails>AccountBalanceDetail"`
}

type AccountBalanceDetail struct {
	AccountNumber     string               `xml:"AccountNumber"`
	Name              string               `xml:"Name"`
	BalanceDetail     BalanceDetail        `xml:"BalanceDetail"`
	JobBalanceDetails []JobBalanceDetail   `xml:"JobBalanceDetails>JobBalanceDetail"`
	OpenDocuments     []OpenDocumentDetail `xml:"OpenDocuments>OpenDocumentDetail"`
}

type BalanceDetail struct {
	StatementBalance   float64 `xml:"StatementBalance"`
	DiscountDate       string  `xml:"DiscountDate"`
	StatementDiscount  float64 `xml:"StatementDiscount"`
	DiscountBalance    float64 `xml:"DiscountBalance"`
	DiscountRemaining  float64 `xml:"DiscountRemaining"`
	UnbilledCharges    float64 `xml:"UnbilledCharges"`
	TotalDue           float64 `xml:"TotalDue"`
	OutstandingBalance float64 `xml:"OutstandingBalance"`
	LastChargeDate     string  `xml:"LastChargeDate"`
	LastSaleDate       string  `xml:"LastSaleDate"`
	LastPaymentDate    string  `xml:"LastPaymentDate"`
	LastPaymentAmount  float64 `xml:"LastPaymentAmount"`
	YTDDollarsSold     float64 `xml:"YTDDollarsSold"`
	MTDDollarsSold     float64 `xml:"MTDDollarsSold"`
	PMDollarsSold      float64 `xml:"PMDollarsSold"`
	PYDollarsSold      float64 `xml:"PYDollarsSold"`
	Due30Days          float64 `xml:"Due30Days"`
	Due60Days          float64 `xml:"Due60Days"`
	Due90Days          float64 `xml:"Due90Days"`
	Due120Days         float64 `xml:"Due120Days"`
	FinanceCharges     float64 `xml:"FinanceCharges"`
	OpenCredits        float64 `xml:"OpenCredits"`
	CreditAvailable    float64 `xml:"CreditAvailable"`
	StatementDate      string  `xml:"StatementDate"`
	DueDate            string  `xml:"DueDate"`
}

type JobBalanceDetail struct {
	Job           int           `xml:"Job"`
	Name          string        `xml:"Name"`
	BalanceDetail BalanceDetail `xml:"BalanceDetail"`
}

type OpenDocumentDetail struct {
	DocIDInternal int     `xml:"DocIDInternal"`
	DocID         string  `xml:"DocID"`
	DocStatus     int     `xml:"DocStatus"`
	DocType       int     `xml:"DocType"`
	EntryDate     string  `xml:"EntryDate"`
	BranchId      string  `xml:"BranchId"`
	Account       string  `xml:"Account"`
	Job           int     `xml:"Job"`
	DocBalance    float64 `xml:"DocBalance"`
}
