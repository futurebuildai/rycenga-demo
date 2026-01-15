package domain

type HealthStatus struct {
	API      string `json:"api"`
	Database string `json:"database"`
}
