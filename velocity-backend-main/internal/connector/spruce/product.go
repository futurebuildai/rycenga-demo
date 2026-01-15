package spruce

import "encoding/xml"

// GetItems
type GetItemsRequest struct {
	XMLName    xml.Name   `xml:"http://SpruceWeb/WebServices/ECommerce GetItems"`
	APIKey     string     `xml:"apikey"`
	ItemFilter ItemFilter `xml:"itemFilter"`
}

type ItemFilter struct {
	ItemNumbers          *[]string `xml:"ItemNumbers>string,omitempty"`
	Search               string    `xml:"Search,omitempty"`
	Group                *int      `xml:"Group,omitempty"`
	Section              *int      `xml:"Section,omitempty"`
	Branch               string    `xml:"Branch,omitempty"` // Branch usually required but good practice
	AccountNumber        string    `xml:"AccountNumber,omitempty"`
	RowStart             int       `xml:"RowStart"`
	RowMaxCount          int       `xml:"RowMaxCount"`
	Job                  *int      `xml:"Job,omitempty"` // Changed to pointer to support omitempty
	LastModifiedDateTime string    `xml:"LastModifiedDateTime,omitempty"`
	StockedValue         *int      `xml:"StockedValue,omitempty"`
}

type GetItemsResponse struct {
	XMLName        xml.Name    `xml:"http://SpruceWeb/WebServices/ECommerce GetItemsResponse"`
	GetItemsResult ItemResults `xml:"GetItemsResult"`
}

type ItemResults struct {
	BaseModel
	RowTotalCount int    `xml:"RowTotalCount"`
	Items         []Item `xml:"Items"`
}

type Item struct {
	BaseModel
	ItemNumber           string  `xml:"ItemNumber"`
	Branch               string  `xml:"Branch"`
	Description          string  `xml:"Description"`
	CustomerPrice        float64 `xml:"CustomerPrice"`
	SOAverageCost        float64 `xml:"SOAverageCost"`
	CustomerPriceUM      string  `xml:"CustomerPriceUM"`
	IsSalePrice          bool    `xml:"IsSalePrice"`
	QtyAvailable         float64 `xml:"QtyAvailable"`
	QtyOnHand            float64 `xml:"QtyOnHand"`
	PriceID              string  `xml:"PriceID"`
	PriceCode            int     `xml:"PriceCode"`
	IsTally              bool    `xml:"IsTally"`
	TallyType            int     `xml:"TallyType"`
	LastModifiedDateTime string  `xml:"LastModifiedDateTime"`
	Stocked              bool    `xml:"Stocked"`
}

// GetGroups
type GetGroupsRequest struct {
	XMLName xml.Name `xml:"http://SpruceWeb/WebServices/ECommerce GetGroups"`
	APIKey  string   `xml:"apikey"`
}

type GetGroupsResponse struct {
	XMLName         xml.Name `xml:"http://SpruceWeb/WebServices/ECommerce GetGroupsResponse"`
	GetGroupsResult struct {
		Groups []Group `xml:"Group"`
	} `xml:"GetGroupsResult"`
}

type Group struct {
	BaseModel
	GroupID     int       `xml:"Group"`
	Description string    `xml:"Description"`
	Sections    []Section `xml:"Sections>Section"`
}

type Section struct {
	SectionID   int    `xml:"Section"`
	Description string `xml:"Description"`
}
