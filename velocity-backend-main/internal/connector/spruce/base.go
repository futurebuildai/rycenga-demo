package spruce

import (
	"encoding/xml"
)

// SOAP Envelope Structures
type Envelope struct {
	XMLName xml.Name `xml:"http://schemas.xmlsoap.org/soap/envelope/ Envelope"`
	Body    Body
}

type Body struct {
	XMLName xml.Name    `xml:"http://schemas.xmlsoap.org/soap/envelope/ Body"`
	Content interface{} `xml:",any"`
}

// Common Structures
type BaseModel struct {
	Success       bool         `xml:"Success"`
	ErrorMessages ArrayOfError `xml:"ErrorMessages,omitempty"`
}

type ArrayOfError struct {
	ErrorMessages []ErrorMessage `xml:"ErrorMessage"`
}

type ErrorMessage struct {
	ErrorCode    string `xml:"ErrorCode"`
	ErrorMessage string `xml:"ErrorMessage"`
}
