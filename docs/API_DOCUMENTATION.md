# CivicPulse REST & WebSocket API Specification

Base URL: `http://localhost:8000` (Local) / `https://<render-url>.onrender.com` (Production)

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account with bcrypt password hashing.

**Request Body:**
```json
{
  "full_name": "Rajesh Sharma",
  "phone_number": "9876543210",
  "password": "Password@123",
  "confirm_password": "Password@123",
  "role": "CITIZEN"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account registered successfully! Welcome to CivicPulse.",
  "token": "dGVzdF9zZXNzaW9uX3Rva2Vu...",
  "user": {
    "id": "USR-101",
    "full_name": "Rajesh Sharma",
    "phone_number": "9876543210",
    "role": "CITIZEN",
    "created_at": "2026-10-31 08:11:43 UTC",
    "last_login": "2026-10-31 08:11:43 UTC"
  }
}
```

---

### `POST /api/auth/login`
Authenticates a returning user via phone number or user ID.

**Request Body:**
```json
{
  "login_identifier": "9876543210",
  "password": "Password@123",
  "remember_me": true
}
```

---

### `GET /api/auth/me`
Validates active session token.

**Headers:**
`Authorization: Bearer <session_token>`

---

### `POST /api/auth/logout`
Terminates active session token.

**Headers:**
`Authorization: Bearer <session_token>`

---

## 2. Incident & Citizen Endpoints

### `GET /api/incidents`
Lists all active incidents with optional query filters:
- `zone_id` (int)
- `priority` (P1_CRITICAL, P2_HIGH, P3_MEDIUM, P4_LOW)
- `status` (SUBMITTED, VERIFIED, IN_PROGRESS, RESOLVED, etc.)

---

### `GET /api/incidents/{tracking_number}`
Retrieves complete details for a single incident (e.g. `CP102`).

---

### `POST /api/reports/submit`
Executes end-to-end LangGraph AI verification pipeline.

**Request Body:**
```json
{
  "raw_text": "Deep road void on main road",
  "audio_preset": "odia_pothole",
  "latitude": 20.2961,
  "longitude": 85.8245,
  "media_type": "VIDEO",
  "media_url": "/images/road_pothole_before.jpg",
  "reporter_alias": "Citizen A",
  "is_recycled_test": false
}
```

**Response (200 OK):**
```json
{
  "status": "CREATED",
  "message": "New ticket #CP103 created & routed",
  "tracking_number": "CP103",
  "is_duplicate": false,
  "incident": { ... }
}
```

---

### `POST /api/incidents/{tracking_number}/confirm`
Registers a 1-tap community upvote (+1) from nearby citizens.

---

### `POST /api/incidents/{tracking_number}/verify-repair`
Officer uploads after-repair photo. Runs Vision AI comparison and sets status to `AWAITING_CITIZEN_CONFIRMATION`.

**Request Body:**
```json
{
  "after_image_url": "/images/road_pothole_after.jpg",
  "officer_name": "Er. Alok Das (Zonal Engineer)",
  "officer_id": "OFFICER-ZN3-01",
  "latitude": 20.2961,
  "longitude": 85.8245
}
```

---

### `POST /api/incidents/{tracking_number}/citizen-feedback`
Citizen inspects repair and confirms resolution or files a dispute.

**Request Body:**
```json
{
  "action": "CONFIRM",
  "dispute_reason": null
}
```

---

## 3. Municipal Operations Endpoints

### `GET /api/zones`
Returns Municipal Zones 1–5 polygon boundaries and department contacts.

### `GET /api/kpi`
Returns strictly the 6 core municipal metrics.

### `GET /api/review-queue`
Returns low-confidence items held for human review.

### `POST /api/review-queue/{tracking_number}/approve`
Officer manually approves a flagged item.

---

## 4. Real-Time WebSocket Feed

### `WS /ws/live-feed`
Establishes two-way live synchronization stream.

**Broadcast Events:**
- `INCIDENT_CREATED`
- `DUPLICATE_MERGED`
- `UPVOTE_ADDED`
- `REPAIR_VERIFIED`
- `CITIZEN_FEEDBACK_RECORDED`
- `INCIDENT_STATUS_UPDATED`
- `REVIEW_ITEM_APPROVED`
- `STATE_RESET`

