package bistrack

type WebAPIBranch struct {
	BranchID      int            `json:"BranchID"`
	Name          *string        `json:"Name"`
	BranchAddress *WebAPIAddress `json:"BranchAddress"`
	Code          *string        `json:"Code"`
	ComputerID    int            `json:"ComputerID"`
	RegionID      int            `json:"RegionID"`
	DivisionID    int            `json:"DivisionID"`
}

type WebAPIAddress struct {
	Address1   *string `json:"Address1"`
	Address2   *string `json:"Address2"`
	City       *string `json:"City"`
	State      *string `json:"State"`
	PostalCode *string `json:"PostalCode"`
}
