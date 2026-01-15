package spruce

import "encoding/xml"

// GetBranches
type GetBranchesRequest struct {
	XMLName      xml.Name     `xml:"http://SpruceWeb/WebServices/ECommerce GetBranches"`
	APIKey       string       `xml:"apikey"`
	BranchFilter BranchFilter `xml:"branchFilter"`
}

type BranchFilter struct {
	BranchID    []string `xml:"BranchID>string"`
	Search      string   `xml:"Search"`
	RowStart    int      `xml:"RowStart"`
	RowMaxCount int      `xml:"RowMaxCount"`
}

type GetBranchesResponse struct {
	XMLName           xml.Name      `xml:"http://SpruceWeb/WebServices/ECommerce GetBranchesResponse"`
	GetBranchesResult BranchResults `xml:"GetBranchesResult"`
}

type BranchResults struct {
	BaseModel
	RowTotalCount int      `xml:"RowTotalCount"`
	Branches      []Branch `xml:"Branches"`
}

type Branch struct {
	BaseModel
	BranchId     string `xml:"BranchId"`
	Name         string `xml:"Name"`
	Company      string `xml:"Company"`
	AddressLine1 string `xml:"AddressLine1"`
	AddressLine2 string `xml:"AddressLine2"`
	City         string `xml:"City"`
	StateCode    string `xml:"StateCode"`
	Zip          string `xml:"Zip"`
	PhoneNumber  string `xml:"PhoneNumber"`
}
