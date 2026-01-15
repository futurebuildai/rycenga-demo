package server

import (
	"encoding/json"
	"net/http"
)

type HealthResponse struct {
	API      string `json:"api" doc:"API status"`
	Database string `json:"database" doc:"Database status"`
}

func healthHandler(repo DBRepository) HealthResponse {
	return HealthResponse{
		API:      "ok",
		Database: "ok",
	}
}

// jsonResponse is a helper to write JSON responses
func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		if err := json.NewEncoder(w).Encode(data); err != nil {
			// In a real app, we'd log this error
		}
	}
}

// errorResponse is a helper to write error responses
func errorResponse(w http.ResponseWriter, status int, message string) {
	jsonResponse(w, status, map[string]string{"error": message})
}
