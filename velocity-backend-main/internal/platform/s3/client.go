package s3

import (
	"builderwire/velocity-backend/internal/domain"
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

var ErrNotFound = errors.New("object not found")

type Config struct {
	Endpoint        string
	Region          string
	AccessKeyID     string
	SecretAccessKey string
}

type Client struct {
	Config Config
}

func NewClient(cfg Config) *Client {
	if cfg.Region == "" {
		cfg.Region = "us-east-1"
	}
	return &Client{Config: cfg}
}

func (c *Client) Upload(ctx context.Context, bucket, key string, data []byte) error {
	tenant := domain.TenantFromContext(ctx)
	if tenant == nil {
		return fmt.Errorf("missing tenant context for S3 upload")
	}
	// Prepend tenant slug
	key = fmt.Sprintf("%s/%s", tenant.Slug, key)

	url := fmt.Sprintf("%s/%s/%s", c.Config.Endpoint, bucket, key)
	req, err := http.NewRequestWithContext(ctx, "PUT", url, bytes.NewReader(data))
	if err != nil {
		return err
	}

	contentSHA256 := sha256Sum(data)
	now := time.Now().UTC()
	date := now.Format("20060102T150405Z")
	shortDate := now.Format("20060102")

	req.Header.Set("x-amz-content-sha256", contentSHA256)
	req.Header.Set("x-amz-date", date)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Host", req.URL.Host)

	// SigV4 Signing (Simplified)
	signedHeaders := "content-type;host;x-amz-content-sha256;x-amz-date"
	canonicalRequest := fmt.Sprintf("PUT\n/%s/%s\n\ncontent-type:application/json\nhost:%s\nx-amz-content-sha256:%s\nx-amz-date:%s\n\n%s\n%s",
		bucket, key, req.URL.Host, contentSHA256, date, signedHeaders, contentSHA256)

	scope := fmt.Sprintf("%s/%s/s3/aws4_request", shortDate, c.Config.Region)
	stringToSign := fmt.Sprintf("AWS4-HMAC-SHA256\n%s\n%s\n%s", date, scope, sha256Sum([]byte(canonicalRequest)))

	signature := c.calculateSignature(shortDate, stringToSign)
	authHeader := fmt.Sprintf("AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		c.Config.AccessKeyID, scope, signedHeaders, signature)

	req.Header.Set("Authorization", authHeader)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusNoContent {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("upload failed: %d - %s", resp.StatusCode, string(body))
	}

	return nil
}

func (c *Client) Download(ctx context.Context, bucket, key string) ([]byte, error) {
	tenant := domain.TenantFromContext(ctx)
	if tenant == nil {
		return nil, fmt.Errorf("missing tenant context for S3 download")
	}
	key = fmt.Sprintf("%s/%s", tenant.Slug, key)

	url := fmt.Sprintf("%s/%s/%s", c.Config.Endpoint, bucket, key)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	contentSHA256 := "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" // SHA256 of empty body
	now := time.Now().UTC()
	date := now.Format("20060102T150405Z")
	shortDate := now.Format("20060102")

	req.Header.Set("x-amz-content-sha256", contentSHA256)
	req.Header.Set("x-amz-date", date)
	req.Header.Set("Host", req.URL.Host)

	// SigV4 Signing (Simplified)
	signedHeaders := "host;x-amz-content-sha256;x-amz-date"
	canonicalRequest := fmt.Sprintf("GET\n/%s/%s\n\nhost:%s\nx-amz-content-sha256:%s\nx-amz-date:%s\n\n%s\n%s",
		bucket, key, req.URL.Host, contentSHA256, date, signedHeaders, contentSHA256)

	scope := fmt.Sprintf("%s/%s/s3/aws4_request", shortDate, c.Config.Region)
	stringToSign := fmt.Sprintf("AWS4-HMAC-SHA256\n%s\n%s\n%s", date, scope, sha256Sum([]byte(canonicalRequest)))

	signature := c.calculateSignature(shortDate, stringToSign)
	authHeader := fmt.Sprintf("AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		c.Config.AccessKeyID, scope, signedHeaders, signature)

	req.Header.Set("Authorization", authHeader)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		if resp.StatusCode == http.StatusNotFound {
			return nil, ErrNotFound
		}
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("download failed: %d - %s", resp.StatusCode, string(body))
	}

	return io.ReadAll(resp.Body)
}

func (c *Client) ListObjects(ctx context.Context, bucket, prefix string) ([]string, error) {
	tenant := domain.TenantFromContext(ctx)
	if tenant == nil {
		return nil, fmt.Errorf("missing tenant context for S3 list")
	}
	// Prefix logic: prepend tenant slug
	// e.g. prefix="customers/" -> "tenantA/customers/"
	prefix = fmt.Sprintf("%s/%s", tenant.Slug, prefix)

	// 1. Build URL and Query
	baseURL := fmt.Sprintf("%s/%s/", c.Config.Endpoint, bucket)
	if !strings.HasSuffix(c.Config.Endpoint, "/") && !strings.HasPrefix(bucket, "/") {
		baseURL = fmt.Sprintf("%s/%s/", c.Config.Endpoint, bucket)
	}

	u, err := url.Parse(baseURL)
	if err != nil {
		return nil, err
	}
	v := url.Values{}
	v.Set("prefix", prefix)
	u.RawQuery = v.Encode()

	req, err := http.NewRequestWithContext(ctx, "GET", u.String(), nil)
	if err != nil {
		return nil, err
	}

	contentSHA256 := "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
	now := time.Now().UTC()
	date := now.Format("20060102T150405Z")
	shortDate := now.Format("20060102")

	host := req.URL.Host
	req.Header.Set("x-amz-content-sha256", contentSHA256)
	req.Header.Set("x-amz-date", date)
	req.Header.Set("Host", host)

	// SigV4 Signing
	signedHeaders := "host;x-amz-content-sha256;x-amz-date"
	// Canonical Query String must be sorted and encoded
	canonicalQuery := v.Encode()
	// Canonical URI
	canonicalURI := fmt.Sprintf("/%s/", bucket)

	canonicalRequest := fmt.Sprintf("GET\n%s\n%s\nhost:%s\nx-amz-content-sha256:%s\nx-amz-date:%s\n\n%s\n%s",
		canonicalURI, canonicalQuery, host, contentSHA256, date, signedHeaders, contentSHA256)

	scope := fmt.Sprintf("%s/%s/s3/aws4_request", shortDate, c.Config.Region)
	stringToSign := fmt.Sprintf("AWS4-HMAC-SHA256\n%s\n%s\n%s", date, scope, sha256Sum([]byte(canonicalRequest)))

	signature := c.calculateSignature(shortDate, stringToSign)
	authHeader := fmt.Sprintf("AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		c.Config.AccessKeyID, scope, signedHeaders, signature)

	req.Header.Set("Authorization", authHeader)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("list failed: %d - %s", resp.StatusCode, string(body))
	}

	// This is a very simplified XML parser, but enough for testing with Minio
	body, _ := io.ReadAll(resp.Body)
	var keys []string
	contentBlocks := strings.Split(string(body), "<Key>")
	for i := 1; i < len(contentBlocks); i++ {
		keyParts := strings.Split(contentBlocks[i], "</Key>")
		if len(keyParts) > 0 {
			// keyParts[0] includes tenant prefix, e.g. "tenantA/customers/1.json"
			// We should probably return it as is, and let the caller strip it if they know the prefix logic.
			keys = append(keys, keyParts[0])
		}
	}

	return keys, nil
}

func (c *Client) Delete(ctx context.Context, bucket, key string) error {
	tenant := domain.TenantFromContext(ctx)
	if tenant == nil {
		return fmt.Errorf("missing tenant context for S3 delete")
	}
	key = fmt.Sprintf("%s/%s", tenant.Slug, key)

	url := fmt.Sprintf("%s/%s/%s", c.Config.Endpoint, bucket, key)
	req, err := http.NewRequestWithContext(ctx, "DELETE", url, nil)
	if err != nil {
		return err
	}

	contentSHA256 := "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
	now := time.Now().UTC()
	date := now.Format("20060102T150405Z")
	shortDate := now.Format("20060102")

	req.Header.Set("x-amz-content-sha256", contentSHA256)
	req.Header.Set("x-amz-date", date)
	req.Header.Set("Host", req.URL.Host)

	// SigV4 Signing
	signedHeaders := "host;x-amz-content-sha256;x-amz-date"
	canonicalURI := fmt.Sprintf("/%s/%s", bucket, key)
	canonicalRequest := fmt.Sprintf("DELETE\n%s\n\nhost:%s\nx-amz-content-sha256:%s\nx-amz-date:%s\n\n%s\n%s",
		canonicalURI, req.URL.Host, contentSHA256, date, signedHeaders, contentSHA256)

	scope := fmt.Sprintf("%s/%s/s3/aws4_request", shortDate, c.Config.Region)
	stringToSign := fmt.Sprintf("AWS4-HMAC-SHA256\n%s\n%s\n%s", date, scope, sha256Sum([]byte(canonicalRequest)))

	signature := c.calculateSignature(shortDate, stringToSign)
	authHeader := fmt.Sprintf("AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		c.Config.AccessKeyID, scope, signedHeaders, signature)

	req.Header.Set("Authorization", authHeader)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("delete failed: %d - %s", resp.StatusCode, string(body))
	}

	return nil
}

func (c *Client) calculateSignature(date, stringToSign string) string {
	kDate := hmacSHA256([]byte("AWS4"+c.Config.SecretAccessKey), date)
	kRegion := hmacSHA256(kDate, c.Config.Region)
	kService := hmacSHA256(kRegion, "s3")
	kSigning := hmacSHA256(kService, "aws4_request")
	return hex.EncodeToString(hmacSHA256(kSigning, stringToSign))
}

func hmacSHA256(key []byte, data string) []byte {
	h := hmac.New(sha256.New, key)
	h.Write([]byte(data))
	return h.Sum(nil)
}

func sha256Sum(data []byte) string {
	h := sha256.New()
	h.Write(data)
	return hex.EncodeToString(h.Sum(nil))
}
