package registry

import (
	"fmt"
	"sync"

	"builderwire/velocity-backend/internal/connector/bistrack"
	"builderwire/velocity-backend/internal/connector/erp"
	"builderwire/velocity-backend/internal/connector/spruce"
)

// Factory defines a function that creates a new ERP connector.
type Factory func(cfg erp.Config) (erp.Connector, error)

var (
	factories = make(map[string]Factory)
	mu        sync.RWMutex
)

// Register registers a factory for a given ERP type.
func Register(erpType string, factory Factory) {
	mu.Lock()
	defer mu.Unlock()
	factories[erpType] = factory
}

// GetConnector creates a new connector instance based on the configuration.
func GetConnector(cfg erp.Config) (erp.Connector, error) {
	mu.RLock()
	factory, ok := factories[cfg.Type]
	mu.RUnlock()

	if !ok {
		// Fallback for built-in types if not explicitly registered via init() or runtime
		// In a real plugin system we might strictly rely on Register, but here we lazy load default support.
		switch cfg.Type {
		case "bistrack":
			// We wrap the Bistrack constructor to match the interface
			return bistrack.NewClient(cfg.BaseURL, cfg.ClientSecret, cfg.Username, cfg.Password)
		case "spruce":
			return spruce.NewClient(cfg.BaseURL, cfg.ApiKey), nil
		default:
			return nil, fmt.Errorf("unsupported ERP type: %s", cfg.Type)
		}
	}

	return factory(cfg)
}
