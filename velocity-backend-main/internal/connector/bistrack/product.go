package bistrack

type Product struct {
	ProductId       int     `json:"ProductId"`
	Description     *string `json:"Description"`
	ProductCode     *string `json:"ProductCode"`
	ProductGroupId  int     `json:"ProductGroupId"`
	FullDescription *string `json:"FullDescription"`
	Deleted         bool    `json:"Deleted"`
}

type ProductSearchParameters struct {
	SearchString string `json:"SearchString"`
	BranchId     int    `json:"BranchId,omitempty"`
	PageNumber   int    `json:"pageNumber,omitempty"`
	PageSize     int    `json:"pageSize,omitempty"`
}

type Stock2 struct {
	Actual    float64 `json:"Actual"`
	Available float64 `json:"Available"`
	PerCode   *string `json:"PerCode"`
}

type StockTotal2 struct {
	TotalStock Stock2 `json:"TotalStock"`
}

type WebAPIProductCatalogImportLine2 struct {
	ProductId         int     `json:"ProductId"`
	ProductCode       *string `json:"ProductCode"`
	Description       *string `json:"Description"`
	FullDescription   *string `json:"FullDescription"`
	ProductGroupId    int     `json:"ProductGroupId"`
	StandardSellPrice float64 `json:"StandardSellPrice"`
	BaseUOM           *string `json:"SellPerText"` // SellPerText in Swagger is often the UOM
	Deleted           bool    `json:"Deleted"`
}

type ProductGroup struct {
	ProductGroupID         int     `json:"ProductGroupID"`
	WebTrackProductGroupID int     `json:"WebTrackProductGroupID"`
	ParentID               *int    `json:"ParentID"`
	Level1ID               int     `json:"Level1ID"`
	Level2ID               *int    `json:"Level2ID"`
	Level3ID               *int    `json:"Level3ID"`
	Level4ID               *int    `json:"Level4ID"`
	Level5ID               *int    `json:"Level5ID"`
	TreeLevel              int     `json:"TreeLevel"`
	TreeSequence           int     `json:"TreeSequence"`
	Name                   *string `json:"Name"`
	Description            *string `json:"Description"`
}
