package spruce

import (
	"bytes"
	"context"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Client struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
}

func NewClient(baseURL, apiKey string) *Client {
	return &Client{
		BaseURL: baseURL,
		APIKey:  apiKey,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

func (c *Client) call(ctx context.Context, action string, request interface{}, response interface{}) error {
	envelope := Envelope{
		Body: Body{
			Content: request,
		},
	}

	xmlBytes, err := xml.MarshalIndent(envelope, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal SOAP envelope: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.BaseURL, bytes.NewBuffer(xmlBytes))
	if err != nil {
		return fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("Content-Type", "text/xml; charset=utf-8")
	req.Header.Set("SOAPAction", fmt.Sprintf("http://SpruceWeb/WebServices/ECommerce/%s", action))

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("soap request failed with status %d: %s", resp.StatusCode, string(body))
	}

	// We wrap the response in a generic envelope to unmarshal
	resEnvelope := struct {
		XMLName xml.Name `xml:"Envelope"`
		Body    struct {
			XMLName xml.Name    `xml:"Body"`
			Content interface{} `xml:",any"`
		}
	}{
		Body: struct {
			XMLName xml.Name    `xml:"Body"`
			Content interface{} `xml:",any"`
		}{
			Content: response,
		},
	}

	err = xml.NewDecoder(resp.Body).Decode(&resEnvelope)
	if err != nil {
		return fmt.Errorf("failed to decode soap response: %w", err)
	}

	return nil
}

func (c *Client) GetAccountRaw(ctx context.Context, accountNumber string) (*Account, error) {
	req := GetAccountRequest{
		APIKey:        c.APIKey,
		AccountNumber: accountNumber,
	}
	var resp GetAccountResponse
	err := c.call(ctx, "GetAccount", req, &resp)
	if err != nil {
		return nil, err
	}
	if !resp.GetAccountResult.Success {
		return nil, fmt.Errorf("api error: %v", resp.GetAccountResult.ErrorMessages)
	}
	return &resp.GetAccountResult, nil
}

func (c *Client) GetAccountsRaw(ctx context.Context, filter AccountFilter) (*AccountResults, error) {
	req := GetAccountsRequest{
		APIKey:        c.APIKey,
		AccountFilter: filter,
	}
	var resp GetAccountsResponse
	err := c.call(ctx, "GetAccounts", req, &resp)
	if err != nil {
		return nil, err
	}
	if !resp.GetAccountsResult.Success {
		return nil, fmt.Errorf("api error: %v", resp.GetAccountsResult.ErrorMessages)
	}
	return &resp.GetAccountsResult, nil
}

func (c *Client) GetBranchesRaw(ctx context.Context, filter BranchFilter) (*BranchResults, error) {
	req := GetBranchesRequest{
		APIKey:       c.APIKey,
		BranchFilter: filter,
	}
	var resp GetBranchesResponse
	err := c.call(ctx, "GetBranches", req, &resp)
	if err != nil {
		return nil, err
	}
	if !resp.GetBranchesResult.Success {
		return nil, fmt.Errorf("api error: %v", resp.GetBranchesResult.ErrorMessages)
	}
	return &resp.GetBranchesResult, nil
}

func (c *Client) GetItemsRaw(ctx context.Context, filter ItemFilter) (*ItemResults, error) {
	req := GetItemsRequest{
		APIKey:     c.APIKey,
		ItemFilter: filter,
	}
	var resp GetItemsResponse
	err := c.call(ctx, "GetItems", req, &resp)
	if err != nil {
		return nil, err
	}
	if !resp.GetItemsResult.Success {
		return nil, fmt.Errorf("api error: %v", resp.GetItemsResult.ErrorMessages)
	}
	return &resp.GetItemsResult, nil
}

func (c *Client) GetGroupsRaw(ctx context.Context) ([]Group, error) {
	req := GetGroupsRequest{
		APIKey: c.APIKey,
	}
	var resp GetGroupsResponse
	err := c.call(ctx, "GetGroups", req, &resp)
	if err != nil {
		return nil, err
	}
	return resp.GetGroupsResult.Groups, nil
}

func (c *Client) GetAccountBalanceDetailRaw(ctx context.Context, accountNumbers []string) (*AccountBalanceDetailResults, error) {
	req := GetAccountBalanceDetailRequest{
		APIKey:         c.APIKey,
		AccountNumbers: accountNumbers,
	}
	var resp GetAccountBalanceDetailResponse
	err := c.call(ctx, "GetAccountBalanceDetail", req, &resp)
	if err != nil {
		return nil, err
	}
	if !resp.GetAccountBalanceDetailResult.Success {
		return nil, fmt.Errorf("api error: %v", resp.GetAccountBalanceDetailResult.ErrorMessages)
	}
	return &resp.GetAccountBalanceDetailResult, nil
}
