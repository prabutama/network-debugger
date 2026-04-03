# Stage 1 — Builder
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go.mod first for layer cache optimization
COPY go.mod ./
RUN go mod download

# Copy all Go source files
COPY *.go ./

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# Stage 2 — Final minimal image
FROM alpine:3.19

WORKDIR /app

# Copy compiled binary from builder
COPY --from=builder /app/server .

# Run as non-root user
RUN adduser -D appuser
USER appuser

EXPOSE 8080

CMD ["./server"]
