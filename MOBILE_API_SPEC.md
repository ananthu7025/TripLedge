# Trip Ledge Mobile API Documentation

This document provides details for the technician mobile app to integrate with the Trip Ledge backend.

## Base URL
`http://<your-server-url>/api/mobile`

## Authentication
All requests (except `/auth/login`) require a Bearer token in the `Authorization` header.

```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### [POST] /auth/login
Log in with technician credentials to receive a session token.

**Request Body:**
```json
{
  "email": "tech@tripledge.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "tech@tripledge.com",
    "roleId": "uuid"
  }
}
```

### [POST] /auth/logout
Logs the technician out (invalidates session on app side).

**Response (200 OK):**
```json
{ "success": true }
```

### [GET] /auth/me
Get current basic session data. (Legacy-like, returns subset of user)

### [GET] /profile
Get full technician profile details including role.

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "tech@tripledge.com",
    "role": "technician",
    "status": "active",
    "avatarUrl": "https://..."
  }
}
```

---

## 2. Attendance & Location

### [GET] /checkin/office-location
Get the office coordinates (Latitude, Longitude) for the mobile app radius display.

**Response (200 OK):**
```json
{
  "latitude": 52.7758,
  "longitude": -108.2972,
  "locationName": "Main Office"
}
```

### [POST] /checkin/verify-location
Verify technician location against office coordinates.

**Request Body:**
```json
{
  "latitude": 52.7758,
  "longitude": -108.2972
}
```

**Response (200 OK):**
- **If within 200m:**
  ```json
  { "auto_approved": true }
  ```
- **If outside radius:**
  ```json
  {
    "auto_approved": false,
    "id": "uuid",
    "requestId": "REQ-12345"
  }
  ```

### [GET] /checkin/request-status/:requestId
Check the status of a pending check-in request.

---

## 3. Trip Inspections

### [GET] /trip-inspections
List all pending and inspected trip jobs.

**Response (200 OK):**
```json
{
  "trips": [
    {
      "id": "uuid",
      "tripId": "T-001",
      "status": "pending",
      "zone": { "name": "North Zone" }
    }
  ]
}
```

### [GET] /trip-inspections/:id
Get full details of a single trip inspection job.

**Response (200 OK):**
```json
{
  "trip": {
    "id": "uuid",
    "tripId": "T-001",
    "streetName": "Main St",
    "status": "pending",
    "zone": { "name": "North Zone" }
  }
}
```

### [PATCH] /trip-inspections/:id/start
Mark a trip inspection as started.

### [POST] /trip-inspections/:id/complete
Submit completion form for a trip.

---

## 4. Snow Removals

### [GET] /snow-removals
List all pending and in-progress snow removal jobs.

### [GET] /snow-removals/:id
Get full details of a single snow removal job.

### [PATCH] /snow-removals/:id/start
Mark as in-progress.

### [POST] /snow-removals/:id/complete
Complete the job with photo and notes.

---

## 5. Media Upload

### [POST] /upload/photo
Upload a multipart form-data image.
Returns `photoUrl` to be used in `/complete` endpoints.
