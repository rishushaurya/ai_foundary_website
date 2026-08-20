# Observability & Monitoring Specification (OBSERVABILITY.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Structured Logging Format

All server-side logs within API routes and middleware must be formatted as JSON strings:

```json
{
  "timestamp": "2026-08-18T17:00:00.000Z",
  "level": "INFO",
  "requestId": "req_8f19bc32_a10",
  "endpoint": "/api/events/register",
  "method": "POST",
  "statusCode": 200,
  "durationMs": 42,
  "message": "Event registration processed successfully",
  "metadata": {
    "eventId": "evt-01",
    "attendeeEmail": "student@dsu.edu.in"
  }
}
```

---

## 2. Health Check Endpoint Specification

**Endpoint**: `GET /api/health`

### Response Payload (HTTP 200):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-08-18T17:00:00.000Z",
  "uptimeSeconds": 14280,
  "checks": {
    "localStorage": "ok",
    "upstashRedis": "connected",
    "dataFiles": "ok"
  }
}
```

---

## 3. Error Classification Matrix

| Error Class | HTTP Status | Log Level | User-Facing Message |
|---|---|---|---|
| `ValidationError` | 400 | WARN | "Please check your inputs and try again." |
| `AuthenticationError` | 401 | WARN | "Authentication required. Please sign in." |
| `ForbiddenError` | 403 | ERROR | "Access denied. You do not have permission for this resource." |
| `NotFoundError` | 404 | INFO | "The requested item could not be found." |
| `RateLimitError` | 429 | WARN | "Too many requests. Please wait a moment." |
| `InternalServerError` | 500 | ERROR | "An internal error occurred. Please try again later." |
