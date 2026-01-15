package bistrack

import "time"

type ClientSecret struct {
	ClientSecret string `json:"client_secret"`
}

type CustomerLogin struct {
	ClientSecret string `json:"client_secret"`
	Username     string `json:"username"`
	Password     string `json:"password"`
	Encrypted    bool   `json:"encrypted"`
}

type AuthenticatedClient struct {
	AccessToken              *string    `json:"AccessToken"`
	AccessTokenExpirationUTC *time.Time `json:"AccessTokenExpirationUTC"`
	AccessTokenIssueDateUTC  *time.Time `json:"AccessTokenIssueDateUTC"`
	RefreshToken             *string    `json:"RefreshToken"`
	WebTrackInstanceID       int        `json:"WebTrackInstanceID"`
	LoginID                  *string    `json:"LoginID"`
}
