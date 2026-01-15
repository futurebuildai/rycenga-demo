package bistrack

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	BaseURL            string
	ClientSecret       string
	Username           string
	Password           string
	HTTPClient         *http.Client
	token              string
	tokenExpiry        time.Time
	webTrackInstanceID int
}

func NewClient(baseURL, clientSecret, username, password string) (*Client, error) {
	parsedURL, err := url.Parse(baseURL)
	if err != nil {
		return nil, fmt.Errorf("invalid base URL: %w", err)
	}
	if parsedURL.Scheme == "" || parsedURL.Host == "" {
		return nil, fmt.Errorf("invalid base URL: missing scheme or host")
	}

	return &Client{
		BaseURL:      strings.TrimRight(baseURL, "/"),
		ClientSecret: clientSecret,
		Username:     username,
		Password:     password,
		HTTPClient: &http.Client{
			Timeout: 5 * time.Minute,
			Transport: &http.Transport{
				MaxIdleConns:        20,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}, nil
}

func (c *Client) newRequest(ctx context.Context, method, url string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Accept", "application/json")

	if c.token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))
	}

	if c.webTrackInstanceID > 0 {
		req.Header.Set("X-WebTrack-Instance-Id", fmt.Sprintf("%d", c.webTrackInstanceID))
	}

	if method == "POST" {
		req.Header.Set("Content-Type", "application/json")
	}

	return req, nil
}

func (c *Client) Authenticate(ctx context.Context) error {
	url := fmt.Sprintf("%s/authenticate/customer", c.BaseURL)
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(CustomerLogin{
		ClientSecret: c.ClientSecret,
		Username:     c.Username,
		Password:     c.Password,
		Encrypted:    false,
	}); err != nil {
		return err
	}

	req, err := c.newRequest(ctx, "POST", url, &buf)
	if err != nil {
		return err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("auth failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	var authResp AuthenticatedClient
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return err
	}

	if authResp.AccessToken == nil {
		return fmt.Errorf("no access token received")
	}

	c.token = *authResp.AccessToken
	c.webTrackInstanceID = authResp.WebTrackInstanceID
	if authResp.AccessTokenExpirationUTC != nil {
		c.tokenExpiry = *authResp.AccessTokenExpirationUTC
	} else {
		c.tokenExpiry = time.Now().Add(1 * time.Hour)
	}
	return nil
}

func (c *Client) GetCustomerRaw(ctx context.Context, customerID int) (*Customer, error) {
	if c.token == "" || time.Now().After(c.tokenExpiry) {
		if err := c.Authenticate(ctx); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/customer?customerId=%d&includeAllAddresses=true&includeFinancialDetails=true", c.BaseURL, customerID)
	req, err := c.newRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get customer (status %d): %s", resp.StatusCode, string(body))
	}

	var customers []Customer
	if err := json.NewDecoder(resp.Body).Decode(&customers); err != nil {
		return nil, err
	}

	if len(customers) == 0 {
		return nil, fmt.Errorf("customer %d not found", customerID)
	}

	return &customers[0], nil
}

func (c *Client) SearchCustomersRaw(ctx context.Context, page, pageSize int) ([]Customer, error) {
	if c.token == "" || time.Now().After(c.tokenExpiry) {
		if err := c.Authenticate(ctx); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/customer?includeAllAddresses=true&includeFinancialDetails=true&pageNumber=%d&pageSize=%d", c.BaseURL, page, pageSize)
	req, err := c.newRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to search customers (status %d): %s", resp.StatusCode, string(body))
	}

	var customers []Customer
	if err := json.NewDecoder(resp.Body).Decode(&customers); err != nil {
		return nil, err
	}

	return customers, nil
}
func (c *Client) GetTransactionSummary(ctx context.Context, params TransactionSummaryParameters) (*TransactionSummary, error) {
	if c.token == "" || time.Now().After(c.tokenExpiry) {
		if err := c.Authenticate(ctx); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/transactionsummary", c.BaseURL)
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(params); err != nil {
		return nil, err
	}
	req, err := c.newRequest(ctx, "POST", url, &buf)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get transaction summary (status %d): %s", resp.StatusCode, string(respBody))
	}

	var summary TransactionSummary
	if err := json.NewDecoder(resp.Body).Decode(&summary); err != nil {
		return nil, err
	}

	return &summary, nil
}

func (c *Client) GetTransactionDetails(ctx context.Context, transactionID int, transactionType int) (*TransactionDetails, error) {
	if c.token == "" || time.Now().After(c.tokenExpiry) {
		if err := c.Authenticate(ctx); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/transactiondetails?transactionID=%d&transactionType=%d&includeDeleted=false", c.BaseURL, transactionID, transactionType)
	req, err := c.newRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get transaction details (status %d): %s", resp.StatusCode, string(respBody))
	}

	var details TransactionDetails
	if err := json.NewDecoder(resp.Body).Decode(&details); err != nil {
		return nil, err
	}

	return &details, nil
}

func (c *Client) GetProduct(ctx context.Context, productID int) (*Product, error) {
	if c.token == "" || time.Now().After(c.tokenExpiry) {
		if err := c.Authenticate(ctx); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/product/%d", c.BaseURL, productID)
	req, err := c.newRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get product: %d", resp.StatusCode)
	}

	var product Product
	if err := json.NewDecoder(resp.Body).Decode(&product); err != nil {
		return nil, err
	}

	return &product, nil
}

func (c *Client) SearchProductsRaw(ctx context.Context, params ProductSearchParameters) ([]WebAPIProductCatalogImportLine2, error) {
	if c.token == "" || time.Now().After(c.tokenExpiry) {
		if err := c.Authenticate(ctx); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/product/searchproducts?SearchString=%s&BranchId=%d&excludeDeleted=%t",
		c.BaseURL, url.QueryEscape(params.SearchString), params.BranchId, true)
	req, err := c.newRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to search products: %d", resp.StatusCode)
	}

	var result []WebAPIProductCatalogImportLine2
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result, nil
}

func (c *Client) GetProductsRaw(ctx context.Context, branchID int) ([]WebAPIProductCatalogImportLine2, error) {
	if c.token == "" || time.Now().After(c.tokenExpiry) {
		if err := c.Authenticate(ctx); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/product?branchid=%d&excludeDeleted=true", c.BaseURL, branchID)
	req, err := c.newRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get products: %d", resp.StatusCode)
	}

	var result []WebAPIProductCatalogImportLine2
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result, nil
}

func (c *Client) GetBranchesRaw(ctx context.Context) ([]WebAPIBranch, error) {
	if c.token == "" || time.Now().After(c.tokenExpiry) {
		if err := c.Authenticate(ctx); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/branch", c.BaseURL)
	req, err := c.newRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get branches: %d", resp.StatusCode)
	}

	var branches []WebAPIBranch
	if err := json.NewDecoder(resp.Body).Decode(&branches); err != nil {
		return nil, err
	}

	return branches, nil
}

func (c *Client) GetStockLevelRaw(ctx context.Context, productID, branchID int) (*StockTotal2, error) {
	if c.token == "" || time.Now().After(c.tokenExpiry) {
		if err := c.Authenticate(ctx); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/product/stocklevel?productid=%d&branchid=%d", c.BaseURL, productID, branchID)
	req, err := c.newRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get stock level: %d", resp.StatusCode)
	}

	var result StockTotal2
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (c *Client) GetProductGroupsRaw(ctx context.Context, groupType string) ([]ProductGroup, error) {
	if c.token == "" || time.Now().After(c.tokenExpiry) {
		if err := c.Authenticate(ctx); err != nil {
			return nil, err
		}
	}

	if groupType == "" {
		groupType = "WebTrack" // Default
	}

	url := fmt.Sprintf("%s/productgroup/%s", c.BaseURL, groupType)
	req, err := c.newRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get product groups: %d", resp.StatusCode)
	}

	var result []ProductGroup
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result, nil
}
