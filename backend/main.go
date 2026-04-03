package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

// DebugResponse is the full JSON response returned by /api/debug
type DebugResponse struct {
	Timestamp string            `json:"timestamp"`
	Client    ClientInfo        `json:"client"`
	Request   RequestInfo       `json:"request"`
	Headers   map[string]string `json:"headers"`
	Pod       PodInfo           `json:"pod"`
}

// ClientInfo contains IP-related information about the connecting client
type ClientInfo struct {
	RemoteAddr    string `json:"remote_addr"`
	XForwardedFor string `json:"x_forwarded_for"`
	XRealIP       string `json:"x_real_ip"`
}

// RequestInfo contains HTTP request metadata
type RequestInfo struct {
	Method    string `json:"method"`
	URL       string `json:"url"`
	Proto     string `json:"proto"`
	Host      string `json:"host"`
	UserAgent string `json:"user_agent"`
}

// PodInfo contains Kubernetes pod metadata injected via Downward API env vars
type PodInfo struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	NodeName  string `json:"node_name"`
}

func debugHandler(w http.ResponseWriter, r *http.Request) {
	// Flatten all headers into a simple map[string]string
	headers := make(map[string]string)
	for key, values := range r.Header {
		if len(values) > 0 {
			headers[key] = values[0]
		}
	}

	resp := DebugResponse{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Client: ClientInfo{
			RemoteAddr:    r.RemoteAddr,
			XForwardedFor: r.Header.Get("X-Forwarded-For"),
			XRealIP:       r.Header.Get("X-Real-IP"),
		},
		Request: RequestInfo{
			Method:    r.Method,
			URL:       r.URL.String(),
			Proto:     r.Proto,
			Host:      r.Host,
			UserAgent: r.UserAgent(),
		},
		Headers: headers,
		Pod: PodInfo{
			Name:      os.Getenv("POD_NAME"),
			Namespace: os.Getenv("POD_NAMESPACE"),
			NodeName:  os.Getenv("NODE_NAME"),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(resp)
}

func healthzHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"service":"echo-debugger-backend","status":"running"}`))
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/api/debug", debugHandler)
	http.HandleFunc("/healthz", healthzHandler)
	http.HandleFunc("/", rootHandler)

	log.Printf("Server starting on port :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
