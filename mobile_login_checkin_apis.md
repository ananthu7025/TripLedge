# Mobile Login and Check-In APIs

## Base URL
`https://trip-ledge.vercel.app/api/mobile`

---

## 1. Authentication

### POST /auth/login
Login with technician credentials.

**Request Body:**
```json
{
  "email": "tech@tripledge.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "3f8e2a1b-...",
    "fullName": "John Doe",
    "email": "tech@tripledge.com",
    "roleId": "uuid"
  }
}
```

**Response 401:**
```json
{ "error": "Invalid credentials" }
```

---

## 2. Check-In & Attendance

*Note: All endpoints below require the JWT token from the login response in the `Authorization: Bearer <token>` header.*

### GET /checkin/office-location
Get the office GPS coordinates for display on the map.

**Response 200:**
```json
{
  "latitude": "52.7758000",
  "longitude": "-108.2972000",
  "locationName": "Main Office"
}
```

---

### POST /checkin/verify-location
Submit technician's current GPS location for check-in verification.

**Request Body:**
```json
{
  "latitude": 52.7760,
  "longitude": -108.2975
}
```

**Response 200 — Auto approved (within 200m):**
```json
{
  "auto_approved": true
}
```
*(Attendance is recorded. Proceed to zone map.)*

**Response 200 — Pending approval (outside 200m):**
```json
{
  "auto_approved": false,
  "id": "uuid",
  "requestId": "REQ-12345"
}
```
*(Poll `/checkin/request-status/:requestId` until approved.)*

---

### GET /checkin/request-status/:requestId
Poll the status of a pending check-in request.

**Response 200:**
```json
{
  "status": "pending"
}
```
or
```json
{
  "status": "approved"
}
```
or
```json
{
  "status": "rejected"
}
```
