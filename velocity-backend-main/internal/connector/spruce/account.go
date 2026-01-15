package spruce

import "encoding/xml"

// GetAccount
type GetAccountRequest struct {
	XMLName       xml.Name `xml:"http://SpruceWeb/WebServices/ECommerce GetAccount"`
	APIKey        string   `xml:"apikey"`
	AccountNumber string   `xml:"accountNumber"`
}

type GetAccountResponse struct {
	XMLName          xml.Name `xml:"http://SpruceWeb/WebServices/ECommerce GetAccountResponse"`
	GetAccountResult Account  `xml:"GetAccountResult"`
}

type Account struct {
	BaseModel
	Source        string `xml:"Source"`
	AccountNumber string `xml:"AccountNumber"`
	Name          string `xml:"Name"`
	Email         string `xml:"Email"`
	TaxLocation   string `xml:"TaxLocation"`
	Company       string `xml:"Company"`
	AddressLine1  string `xml:"AddressLine1"`
	AddressLine2  string `xml:"AddressLine2"`
	City          string `xml:"City"`
	StateCode     string `xml:"StateCode"`
	Zip           string `xml:"Zip"`
	PhoneNumber   string `xml:"PhoneNumber"`
}

// GetAccounts
type GetAccountsRequest struct {
	XMLName       xml.Name      `xml:"http://SpruceWeb/WebServices/ECommerce GetAccounts"`
	APIKey        string        `xml:"apikey"`
	AccountFilter AccountFilter `xml:"accountFilter"`
}

type AccountFilter struct {
	AccountNumbers []string `xml:"AccountNumbers>string"`
	Search         string   `xml:"Search"`
	EmailAddress   string   `xml:"EmailAddress"`
	PhoneNumber    string   `xml:"PhoneNumber"`
	RowStart       int      `xml:"RowStart"`
	RowMaxCount    int      `xml:"RowMaxCount"`
}

type GetAccountsResponse struct {
	XMLName           xml.Name       `xml:"http://SpruceWeb/WebServices/ECommerce GetAccountsResponse"`
	GetAccountsResult AccountResults `xml:"GetAccountsResult"`
}

type AccountResults struct {
	BaseModel
	RowTotalCount int       `xml:"RowTotalCount"`
	Accounts      []Account `xml:"Accounts"`
}
