package bistrack

import (
	"fmt"
	"strings"
	"time"
)

// BisTrackTime handles custom date formats from BisTrack (like MM-DD-YYYY)
type BisTrackTime time.Time

func (bt *BisTrackTime) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")
	if s == "" || s == "null" {
		return nil
	}

	// Try common BisTrack formats
	layouts := []string{
		"01-02-2006",          // MM-DD-YYYY
		"2006-01-02T15:04:05", // RFC3339-ish
		time.RFC3339,
	}

	var t time.Time
	var err error
	for _, layout := range layouts {
		t, err = time.Parse(layout, s)
		if err == nil {
			*bt = BisTrackTime(t)
			return nil
		}
	}

	return fmt.Errorf("failed to parse BisTrackTime %s: %w", s, err)
}

func (bt BisTrackTime) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("\"%s\"", time.Time(bt).Format("01-02-2006"))), nil
}

func (bt BisTrackTime) Time() time.Time {
	return time.Time(bt)
}
