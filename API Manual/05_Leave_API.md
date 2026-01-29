# Leave Management API Manual

## Base URL
`/api/leave`

## Authentication
All endpoints require authentication via Bearer token.

**Request Headers** (All endpoints):
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Get Leave History
Get leave request history for the authenticated user.

**Endpoint**: `GET /api/leave/history`

**Authentication Required**: Yes

**Request**: No parameters required

**Success Response** (200):
```json
{
  "history": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "status": "Approved",
      "reason": "Fever and cold",
      "start_date": "2024-01-15T00:00:00.000Z",
      "end_date": "2024-01-17T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "status": "Pending",
      "reason": "Family function",
      "start_date": "2024-01-20T00:00:00.000Z",
      "end_date": "2024-01-20T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "status": "Rejected",
      "reason": "",
      "start_date": "2024-01-10T00:00:00.000Z",
      "end_date": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| history | Array | Array of leave request objects |
| history[]._id | String (ObjectId) | Leave request unique identifier |
| history[].status | String | "Approved", "Rejected", or "Pending" |
| history[].reason | String | Reason for leave (optional) |
| history[].start_date | String (ISO Date) | Leave start date |
| history[].end_date | String (ISO Date) | Leave end date |

---

### 2. Get Leave Requests (Teacher)
Get all pending leave requests for students in teacher's class.

**Endpoint**: `GET /api/leave/requests`

**Authentication Required**: Yes (Teacher only)

**Request**: No parameters required

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "student_name": "John Doe",
    "start_date": "2024-01-15T00:00:00.000Z",
    "end_date": "2024-01-17T00:00:00.000Z",
    "reason": "Fever and cold",
    "status": "Pending"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "student_name": "Jane Smith",
    "start_date": "2024-01-20T00:00:00.000Z",
    "end_date": "2024-01-20T00:00:00.000Z",
    "reason": "Family function",
    "status": "Pending"
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Leave request unique identifier |
| student_name | String | Student's full name |
| start_date | String (ISO Date) | Leave start date |
| end_date | String (ISO Date) | Leave end date |
| reason | String | Reason for leave |
| status | String | Leave status ("Pending", "Approved", "Rejected") |

---

### 3. Approve Leave Request
Approve a student's leave request.

**Endpoint**: `PATCH /api/leave/approve/:reqid`

**Authentication Required**: Yes (Teacher only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| reqid | String (ObjectId) | Leave request ID |

**Example**: `PATCH /api/leave/approve/507f1f77bcf86cd799439011`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Leave approved successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether approval was successful |
| message | String | Status message |

---

### 4. Reject Leave Request
Reject a student's leave request.

**Endpoint**: `PATCH /api/leave/reject/:reqid`

**Authentication Required**: Yes (Teacher only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| reqid | String (ObjectId) | Leave request ID |

**Example**: `PATCH /api/leave/reject/507f1f77bcf86cd799439011`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Leave rejected successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether rejection was successful |
| message | String | Status message |

---

### 5. Make Leave Request
Create a new leave request (typically used by students/parents).

**Endpoint**: `POST /api/leave/request`

**Authentication Required**: Yes

**Request Body**:
```json
{
  "class_id": "507f1f77bcf86cd799439013",
  "reason": "Fever and cold",
  "start_date": "2024-01-15",
  "end_date": "2024-01-17"
}
```

OR for single day leave:

```json
{
  "class_id": "507f1f77bcf86cd799439013",
  "reason": "Doctor appointment"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| class_id | String (ObjectId) | Yes | Student's class ID |
| reason | String | No | Reason for leave (defaults to empty string) |
| start_date | String (YYYY-MM-DD or ISO) | Yes | Leave start date |
| end_date | String (YYYY-MM-DD or ISO) | No | Leave end date (defaults to start_date if not provided) |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Leave request submitted successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether request was created |
| message | String | Status message |

---

## Leave Status Workflow

```
Student submits request
        ↓
   Status: "Pending"
        ↓
Teacher reviews request
        ↓
    ┌───────┴───────┐
    ↓               ↓
"Approved"    "Rejected"
```

---

## Access Control

| Endpoint | Student | Parent | Teacher (Class Teacher) | Principal |
|----------|---------|--------|------------------------|-----------|
| GET /history | ✅ | ✅ | ✅ | ✅ |
| GET /requests | ❌ | ❌ | ✅ | ✅ |
| PATCH /approve/:reqid | ❌ | ❌ | ✅ | ✅ |
| PATCH /reject/:reqid | ❌ | ❌ | ✅ | ✅ |
| POST /request | ✅ | ✅ | ✅ | ✅ |

---

## Notes

1. **Date Handling**:
   - Dates can be in "YYYY-MM-DD" or full ISO date format
   - If `end_date` is not provided, it defaults to `start_date` (single day leave)

2. **Leave Status**:
   - All new requests start with "Pending" status
   - Only teachers can approve/reject leave requests
   - Students/parents can view their leave history

3. **Class Teacher Assignment**:
   - The leave request is automatically assigned to the class teacher
   - This is determined from the student's class_id

4. **Medical Certificate**:
   - The schema supports `medical_certificate` field (URL to certificate)
   - This is not yet implemented in the API endpoints
   - Future enhancement: Allow file upload for medical leaves

5. **Reason Field**:
   - `reason` is optional and defaults to empty string
   - Good practice: Always provide a reason for better communication

6. **Multiple Day Leaves**:
   - Use `start_date` and `end_date` for multi-day leaves
   - Example: start_date: "2024-01-15", end_date: "2024-01-17" = 3 days leave

7. **Leave History**:
   - Shows all leave requests (pending, approved, rejected)
   - Sorted by most recent first
   - Includes historical data for tracking

8. **Teacher Workflow**:
   - GET /requests - See all pending requests for their class
   - PATCH /approve/:reqid - Approve specific request
   - PATCH /reject/:reqid - Reject specific request

9. **Automatic User Detection**:
   - `student_id` is automatically extracted from JWT token
   - `school_id` is automatically extracted from JWT token
   - No need to pass these in request body
