package bistrack

import (
	"encoding/json"
	"testing"
	"time"
)

func TestBisTrackTime_UnmarshalJSON(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    time.Time
		wantErr bool
	}{
		{
			name:  "MM-DD-YYYY",
			input: `"01-07-2026"`,
			want:  time.Date(2026, 1, 7, 0, 0, 0, 0, time.UTC),
		},
		{
			name:  "standard date-time",
			input: `"2026-01-07T15:04:05Z"`,
			want:  time.Date(2026, 1, 7, 15, 4, 5, 0, time.UTC),
		},
		{
			name:  "null",
			input: `null`,
			want:  time.Time{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var bt BisTrackTime
			err := json.Unmarshal([]byte(tt.input), &bt)
			if (err != nil) != tt.wantErr {
				t.Errorf("UnmarshalJSON() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && !time.Time(bt).Equal(tt.want) {
				t.Errorf("UnmarshalJSON() = %v, want %v", time.Time(bt), tt.want)
			}
		})
	}
}
