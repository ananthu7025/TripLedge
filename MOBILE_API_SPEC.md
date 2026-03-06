# Trip Ledge — Mobile App API Documentation

> **Read this document top to bottom.** The first section explains the complete app flow so you understand the user journey. The second section is the full API reference for each endpoint used in that flow.

---

# PART 1 — Complete App Flow

## Overview

The Trip Ledge mobile app is used by **technicians** to manage trip hazard inspection and snow removal jobs. The admin draws inspection areas (zones) on the web platform. The technician sees those zones on mobile, navigates to the start point, creates the job on-site with exact GPS coordinates, and then marks it as done.

---

## Step 1 — Login

The technician opens the app and logs in with their email and password.

- The app calls `POST /api/mobile/auth/login`
- On success, a **JWT token** is returned
- Store this token locally — it must be sent in the `Authorization: Bearer <token>` header with every subsequent request
- Also store the `user.id` for later use

---

## Step 2 — Daily Check-In (Attendance)

Every day, before starting work, the technician must check in.

- The app fetches the office GPS coordinates from `GET /api/mobile/checkin/office-location`
- The app captures the technician's current GPS location using the device
- The app calls `POST /api/mobile/checkin/verify-location` with the technician's coordinates

**Two outcomes:**

| Outcome | Condition | What happens |
|---------|-----------|-------------|
| **Auto-approved** | Within 200 metres of office | Attendance is recorded immediately, technician can proceed |
| **Pending approval** | More than 200 metres from office | A check-in request is sent to admin; app polls `GET /api/mobile/checkin/request-status/:requestId` until approved/rejected |

---

## Step 3 — View Zones on Map

After check-in, the technician sees all active inspection zones on a map.

- Call `GET /api/mobile/zones`
- Each zone includes a `startPoint: { lat, lng }` — the first GPS point the admin drew
- Show each zone as a **map pin** at its start point so the technician knows where to go
- The zone also contains `pointsGeojson` if you want to draw the full area polyline

Each zone card shows:
- Zone name
- Zone type: `Proposed` or `Additional`
- Module: `trip`, `snow`, or `both`
- Priority: `high`, `medium`, or `low`

---

## Step 4 — Navigate to Zone

The technician taps a zone to see its details.

- The `startPoint` is shown as a map pin
- The technician taps it to navigate to the location using Google Maps / Apple Maps
- The technician physically travels to the start point of the zone

---

## Step 5 — Add Job On-Site (Creates Job → Inspected)

When the technician arrives at the location and is ready to begin, they tap **"Add Job"**.

A form appears with these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Zone Name | Display only | — | Zone name shown |
| Zone Type | Display only | — | `Proposed` or `Additional` |
| Module | Display only | — | `Trip`, `Snow`, or `Both` |
| Location Captured | GPS auto-fill | — | Device captures current lat/lng; displayed as `10.032798, 76.335989` |
| Street Name | Text input | ✅ Yes | e.g., `100th Street` |
| Avenue / Cross Street | Text input | No | e.g., `17th Avenue` |
| High Point (cm) | Decimal input | No | Dimension measurement |
| Low Point (cm) | Decimal input | No | Dimension measurement |
| Length (meters) | Decimal input | No | Length of the work area |
| Before Photos | Camera / Gallery | ✅ Yes (min 1) | One or more before photos |

**Photo Upload Flow (before submitting the form):**
1. Technician takes/picks each photo
2. For **each photo**, call `POST /api/mobile/upload/photo` (multipart form-data, field name `file`)
3. Each call returns a `photoUrl` string
4. Collect all returned URLs into an array: `["url1", "url2", ...]`
5. Include this array as `before_photos` when submitting the form

**Submit the form:**
- Call `POST /api/mobile/zones/:id/add-job`
- Send `street_name`, `before_photos[]`, and any optional fields
- On success: trip and/or snow job record(s) are **created** and immediately set to **Inspected**
- The response returns `jobsCreated` with the IDs of each created job
- The job(s) now appear in the Inspected tab of the job list

---

## Step 6 — View Job List (Inspected Jobs)

After adding a job, the technician can see it in the job list.

- Call `GET /api/mobile/trip-inspections` for trip inspection jobs
- Call `GET /api/mobile/snow-removals` for snow removal jobs
- Both return only **pending** and **inspected** jobs (completed jobs are hidden)

Each job card shows:
- Job ID (e.g. `T-001`, `S-001`)
- Zone name
- Status badge: `Inspected`
- Job type: Trip or Snow

---

## Step 7 — Open an Inspected Job

The technician taps an **Inspected** job they previously created.

- Call `GET /api/mobile/trip-inspections/:id` or `GET /api/mobile/snow-removals/:id`
- The response includes:
  - All fields filled during Step 5 (street name, avenue, dimensions, GPS)
  - `startPoint` — map pin still shown
  - `beforePhotos: ["url1", "url2"]` — show these as reference photos in the completion form

---

## Step 8 — Fill "Complete" Form (Inspected → Completed)

When the technician finishes the work, they tap **Complete**.

A form appears with:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Street Name | Display only | — | Filled during Step 5 |
| Avenue | Display only | — | Filled during Step 5 |
| Length | Display only | — | Filled during Step 5 |
| Zone Type | Display only | — | `Proposed` or `Additional` |
| Status | Display only | — | Shows `Inspected` badge |
| Before Photos | Display only (reference) | — | Photos uploaded in Step 5 |
| After Photos | Camera / Gallery | ✅ Yes (min 1) | One or more after photos |
| Notes | Text area | No | Any notes about completed work |

**Photo Upload Flow (same as Step 5):**
1. Upload each after photo via `POST /api/mobile/upload/photo`
2. Collect all returned `photoUrl` strings
3. Pass as `after_photos` array

**Submit the form:**
- Call `POST /api/mobile/trip-inspections/:id/complete` (or `/snow-removals/:id/complete`)
- Send `after_photos[]` and optional `notes`
- On success: status changes from **Inspected → Completed**
- Job disappears from the active list

---

## Full Status Lifecycle

```
Admin draws zone on map (marks inspection area)
       │
       │  No job created yet — zone is just a marked area
       ▼
  ┌─────────────────────────────────────┐
  │  ZONE (active, visible on mobile)  │  ← Technician sees zone on map
  └─────────────────────────────────────┘
       │
       │  Technician travels to startPoint
       │  Technician fills "Add Job" form on-site
       │  (street, avenue, GPS, dimensions, before photos)
       │  POST /zones/:id/add-job
       ▼
  ┌──────────┐
  │ INSPECTED│  ← Job created and immediately inspected
  └──────────┘
       │
       │  Technician fills Complete form
       │  (after photos, notes)
       │  POST /trip-inspections/:id/complete
       ▼
  ┌───────────┐
  │ COMPLETED │  ← Job removed from active list
  └───────────┘
```

Both **Trip Inspection** and **Snow Removal** follow this exact same lifecycle.

---

---

# PART 2 — API Reference

## Base URL
```
http://<your-server-url>/api/mobile
```

## Authentication
All endpoints except `/auth/login` require a JWT Bearer token:
```
Authorization: Bearer <token>
```

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

### POST /auth/logout
Logout the current session.

**Response 200:**
```json
{ "success": true }
```

---

### GET /auth/me
Get basic session info from the JWT token.

**Response 200:**
```json
{
  "id": "uuid",
  "email": "tech@tripledge.com"
}
```

---

### GET /profile
Get full technician profile with role.

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "tech@tripledge.com",
    "role": "technician",
    "status": "active",
    "avatarUrl": "/uploads/avatar.jpg"
  }
}
```

---

## 2. Attendance & Check-In

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
→ Attendance is recorded. Proceed to zone map.

**Response 200 — Pending approval (outside 200m):**
```json
{
  "auto_approved": false,
  "id": "uuid",
  "requestId": "REQ-12345"
}
```
→ Poll `/checkin/request-status/:requestId` until approved.

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

---

## 3. Photo Upload

### POST /upload/photo
Upload a single photo. Call this **before** submitting the Add Job or Complete form.

**Request:** `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `file` | File (image) | Yes |

**Response 200:**
```json
{
  "photoUrl": "/uploads/a1b2c3d4-photo.jpg"
}
```

**Response 400:**
```json
{ "error": "No file uploaded" }
```

> **Usage:** Upload each photo individually. Collect all `photoUrl` strings into an array and pass them as `before_photos` or `after_photos` when calling add-job/complete endpoints.

---

## 4. Zones

### GET /zones
Get all active zones for the technician to view on the map.

**Response 200:**
```json
{
  "zones": [
    {
      "id": "uuid",
      "name": "North Zone",
      "zoneType": "proposed",
      "module": "trip",
      "priority": "high",
      "startPoint": {
        "lat": 10.032798,
        "lng": 76.335989
      },
      "pointsGeojson": "[{\"lat\":10.032798,\"lng\":76.335989,\"order\":0}]",
      "totalPoints": 5,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

> `startPoint` is the first coordinate of the zone polyline. Use this to show a map pin and help the technician navigate to the location.

---

### POST /zones/:id/add-job
Technician submits the Add Job form after arriving at the zone start point. Creates trip and/or snow job record(s) based on the zone's module and immediately marks them as **Inspected**.

**Request Body:**
```json
{
  "street_name": "100th Street",
  "avenue_name": "17th Avenue",
  "high_point": 3.5,
  "low_point": 1.2,
  "length": 8.3,
  "captured_latitude": 10.032798,
  "captured_longitude": 76.335989,
  "before_photos": [
    "/uploads/photo1.jpg",
    "/uploads/photo2.jpg"
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| `street_name` | string | ✅ Yes |
| `before_photos` | string[] (min 1) | ✅ Yes |
| `avenue_name` | string | No |
| `high_point` | number | No |
| `low_point` | number | No |
| `length` | number | No |
| `captured_latitude` | number | No |
| `captured_longitude` | number | No |

**Response 200:**
```json
{
  "success": true,
  "jobsCreated": [
    { "type": "trip", "id": "uuid", "jobId": "T-001" },
    { "type": "snow", "id": "uuid", "jobId": "S-001" }
  ]
}
```

> `jobsCreated` will contain one entry for `module: "trip"` or `module: "snow"`, and two entries for `module: "both"`.

**Response 400 — Missing required fields:**
```json
{ "error": "street_name is required" }
```
or
```json
{ "error": "before_photos must be a non-empty array" }
```

**Response 400 — Job already exists:**
```json
{ "error": "A trip inspection job already exists for this zone" }
```

**Response 404:**
```json
{ "error": "Zone not found" }
```

---

## 5. Trip Inspections

### GET /trip-inspections
Get all active (pending + inspected) trip inspection jobs.

**Response 200:**
```json
{
  "trips": [
    {
      "id": "uuid",
      "tripId": "T-001",
      "zoneId": "uuid",
      "streetName": "100th Street",
      "avenueName": "17th Avenue",
      "zoneType": "proposed",
      "status": "inspected",
      "highPoint": "3.50",
      "lowPoint": "1.20",
      "length": "8.30",
      "capturedLatitude": "10.0327980",
      "capturedLongitude": "76.3359890",
      "inspectedAt": "2025-01-15T09:00:00.000Z",
      "completedAt": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "zone": {
        "id": "uuid",
        "name": "North Zone",
        "zoneType": "proposed",
        "module": "trip",
        "priority": "high",
        "pointsGeojson": "[{\"lat\":10.032798,\"lng\":76.335989,\"order\":0}]",
        "totalPoints": 5
      }
    }
  ]
}
```

---

### GET /trip-inspections/:id
Get full details of one trip inspection job including map start point and photos.

**Response 200:**
```json
{
  "trip": {
    "id": "uuid",
    "tripId": "T-001",
    "zoneId": "uuid",
    "streetName": "100th Street",
    "avenueName": "17th Avenue",
    "zoneType": "proposed",
    "status": "inspected",
    "highPoint": "3.50",
    "lowPoint": "1.20",
    "length": "8.30",
    "capturedLatitude": "10.0327980",
    "capturedLongitude": "76.3359890",
    "notes": null,
    "inspectedAt": "2025-01-15T09:00:00.000Z",
    "completedAt": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T09:00:00.000Z",
    "zone": {
      "id": "uuid",
      "name": "North Zone",
      "zoneType": "proposed",
      "pointsGeojson": "[{\"lat\":10.032798,\"lng\":76.335989,\"order\":0},{\"lat\":10.033000,\"lng\":76.336100,\"order\":1}]"
    },
    "inspectedByUser": {
      "id": "uuid",
      "fullName": "John Doe"
    },
    "completedByUser": null
  },
  "startPoint": {
    "lat": 10.032798,
    "lng": 76.335989
  },
  "beforePhotos": [
    "/uploads/photo1.jpg",
    "/uploads/photo2.jpg"
  ],
  "afterPhotos": []
}
```

---

### POST /trip-inspections/:id/complete
Submit the completion form and change status from `inspected` → `completed`.

**Request Body:**
```json
{
  "after_photos": [
    "/uploads/after1.jpg"
  ],
  "notes": "Grinding completed successfully. Surface is now level."
}
```

| Field | Type | Required |
|-------|------|----------|
| `after_photos` | string[] (min 1) | ✅ Yes |
| `notes` | string | No |

**Response 200:**
```json
{ "success": true }
```

**Response 400 — Missing photos:**
```json
{ "error": "after_photos must be a non-empty array" }
```

**Response 400 — Wrong status:**
```json
{ "error": "Trip must be in inspected status to complete" }
```

---

## 6. Snow Removals

Snow removal endpoints follow the **exact same structure** as trip inspections. The status lifecycle is also identical: jobs are created as `inspected` (via `/zones/:id/add-job`) then move to `completed`.

---

### GET /snow-removals
Get all active (pending + inspected) snow removal jobs.

**Response 200:**
```json
{
  "snows": [
    {
      "id": "uuid",
      "snowId": "S-001",
      "zoneId": "uuid",
      "streetName": "101st Street",
      "avenueName": "18th Avenue",
      "zoneType": "proposed",
      "status": "inspected",
      "highPoint": "2.00",
      "lowPoint": "0.50",
      "length": "12.00",
      "capturedLatitude": "10.0330000",
      "capturedLongitude": "76.3360000",
      "inspectedAt": "2025-01-15T10:00:00.000Z",
      "completedAt": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "zone": {
        "id": "uuid",
        "name": "South Zone",
        "zoneType": "proposed",
        "module": "snow",
        "priority": "medium"
      }
    }
  ]
}
```

---

### GET /snow-removals/:id
Get full details of one snow removal job.

**Response 200:**
```json
{
  "snow": {
    "id": "uuid",
    "snowId": "S-001",
    "streetName": "101st Street",
    "avenueName": "18th Avenue",
    "zoneType": "proposed",
    "status": "inspected",
    "highPoint": "2.00",
    "lowPoint": "0.50",
    "length": "12.00",
    "capturedLatitude": "10.0330000",
    "capturedLongitude": "76.3360000",
    "notes": null,
    "inspectedAt": "2025-01-15T10:00:00.000Z",
    "completedAt": null,
    "zone": { "name": "South Zone", "zoneType": "proposed" },
    "inspectedByUser": { "id": "uuid", "fullName": "John Doe" },
    "completedByUser": null
  },
  "startPoint": {
    "lat": 10.033000,
    "lng": 76.336000
  },
  "beforePhotos": ["/uploads/snow-before1.jpg"],
  "afterPhotos": []
}
```

---

### POST /snow-removals/:id/complete
Submit the completion form. Status: `inspected → completed`.

**Request Body:**
```json
{
  "after_photos": ["/uploads/snow-after1.jpg"],
  "notes": "Snow cleared. Road is safe."
}
```

**Response 200:**
```json
{ "success": true }
```

**Response 400 — Wrong status:**
```json
{ "error": "Snow removal job must be in inspected status to complete" }
```

---

## Error Responses (Common)

| HTTP Code | Meaning |
|-----------|---------|
| `400` | Bad request — missing or invalid fields |
| `401` | Unauthorized — missing or invalid JWT token |
| `404` | Resource not found |
| `500` | Internal server error |

**401 response format:**
```json
{ "error": "Unauthorized" }
```

---

## Data Types Reference

| Field | DB Type | JSON Type | Example |
|-------|---------|-----------|---------|
| `id` | UUID | string | `"3f8e2a1b-..."` |
| `tripId` / `snowId` | VARCHAR | string | `"T-001"`, `"S-001"` |
| `status` | VARCHAR | string | `"inspected"`, `"completed"` |
| `zoneType` | VARCHAR | string | `"proposed"`, `"additional"` |
| `module` | VARCHAR | string | `"trip"`, `"snow"`, `"both"` |
| `highPoint` / `lowPoint` / `length` | DECIMAL | string (from DB) | `"8.30"` |
| `capturedLatitude` / `capturedLongitude` | DECIMAL | string (from DB) | `"10.0327980"` |
| `inspectedAt` / `completedAt` | TIMESTAMP | string (ISO 8601) or null | `"2025-01-15T09:00:00.000Z"` |
| `photoUrl` | VARCHAR | string | `"/uploads/uuid-photo.jpg"` |
| `startPoint` | computed | object | `{ "lat": 10.03, "lng": 76.33 }` |
| `beforePhotos` / `afterPhotos` | from job_photos | string[] | `["/uploads/p1.jpg"]` |

---

## Complete API Endpoint List

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/auth/me` | Yes | Session info |
| GET | `/profile` | Yes | Full profile |
| GET | `/checkin/office-location` | Yes | Office GPS |
| POST | `/checkin/verify-location` | Yes | Check-in |
| GET | `/checkin/request-status/:requestId` | Yes | Check-in status |
| POST | `/upload/photo` | Yes | Upload photo |
| GET | `/zones` | Yes | List all active zones with start points |
| POST | `/zones/:id/add-job` | Yes | Create job(s) on-site from zone |
| GET | `/trip-inspections` | Yes | List active trips |
| GET | `/trip-inspections/:id` | Yes | Trip detail + map + photos |
| POST | `/trip-inspections/:id/complete` | Yes | Complete job |
| GET | `/snow-removals` | Yes | List active snow jobs |
| GET | `/snow-removals/:id` | Yes | Snow detail + map + photos |
| POST | `/snow-removals/:id/complete` | Yes | Complete job |
