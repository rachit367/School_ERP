# Doubt Management API Manual

## Base URL
`/api/doubt`

## Authentication
All endpoints require authentication via Bearer token.  
All endpoints are restricted to **Teachers only**.

**Request Headers** (All endpoints):
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Get Doubts
Get all doubts from students (for teacher's assigned classes).

**Endpoint**: `GET /api/doubt`

**Authentication Required**: Yes (Teacher only)

**Request**: No parameters required

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "student_id": "507f1f77bcf86cd799439021",
    "student_name": "John Doe",
    "class_name": 5,
    "section": "A",
    "subject": "Mathematics",
    "question": "I don't understand how to solve quadratic equations",
    "reply": "",
    "status": "Pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "student_id": "507f1f77bcf86cd799439022",
    "student_name": "Jane Smith",
    "class_name": 6,
    "section": "B",
    "subject": "Science",
    "question": "What is photosynthesis?",
    "reply": "Photosynthesis is the process by which plants make their food using sunlight...",
    "status": "Resolved",
    "createdAt": "2024-01-14T14:20:00.000Z",
    "repliedAt": "2024-01-14T16:45:00.000Z"
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Doubt unique identifier |
| student_id | String (ObjectId) | Student's user ID |
| student_name | String | Student's full name |
| class_name | Number | Class number (e.g., 5, 6) |
| section | String | Class section (e.g., "A", "B") |
| subject | String | Subject of the doubt |
| question | String | Student's question/doubt |
| reply | String | Teacher's reply (empty if not replied) |
| status | String | "Pending" or "Resolved" |
| createdAt | String (ISO Date) | When doubt was created |
| repliedAt | String (ISO Date) | When teacher replied (only if replied) |

---

### 2. Update Doubt / Reply to Doubt
Reply to a student's doubt or mark it as resolved.

**Endpoint**: `PATCH /api/doubt/:id`

**Authentication Required**: Yes (Teacher only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Doubt ID |

**Request Body** (To reply):
```json
{
  "reply": "To solve quadratic equations, use the formula x = (-b ± √(b²-4ac)) / 2a"
}
```

**Request Body** (To mark as resolved without reply):
```json
{
  "reply": ""
}
```

OR

```json
{}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reply | String | No | Teacher's response to the doubt. Empty string or omit to mark as resolved without adding reply |

**Example**: `PATCH /api/doubt/507f1f77bcf86cd799439011`

**Success Response** (200):
```json
{
  "result": {
    "success": true,
    "message": "Doubt updated successfully"
  }
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| result | Object | Result wrapper |
| result.success | Boolean | Whether update was successful |
| result.message | String | Status message |

---

## Doubt Status

| Status | Description |
|--------|-------------|
| Pending | Doubt has been submitted but not yet addressed by teacher |
| Resolved | Teacher has replied or marked the doubt as resolved |

---

## Access Control

| Endpoint | Student | Teacher | Principal |
|----------|---------|---------|-----------|
| GET / | ❌ | ✅ | ❌* |
| PATCH /:id | ❌ | ✅ | ❌* |

*Principal role can access if specifically granted teacher-like permissions

---

## Workflow

```
Student posts doubt
       ↓
  Status: "Pending"
       ↓
Teacher views doubts (GET /)
       ↓
Teacher replies (PATCH /:id)
       ↓
  Status: "Resolved"
```

---

## Notes

1. **Teacher Only Access**:
   - All doubt endpoints are restricted to teachers
   - Students cannot access these endpoints directly
   - Student doubt submission endpoint needs to be implemented

2. **Reply Behavior**:
   - Sending `reply` with text: Adds teacher's response and marks as resolved
   - Sending empty `reply` or no reply field: Marks doubt as resolved without adding a response
   - Useful for verbal clarifications or doubts resolved in class

3. **Missing Student Endpoints**:
   The following student endpoints are not yet implemented:
   - `POST /api/doubt` - Student creates a new doubt
   - `GET /api/doubt/student` - Student views their own doubts
   - `GET /api/doubt/student/:id` - Student views specific doubt details

4. **Doubt Visibility**:
   - Teachers see doubts from students in their assigned classes
   - Teachers see doubts for subjects they teach

5. **Timestamps**:
   - `createdAt`: When student posted the doubt
   - `repliedAt`: When teacher responded (if applicable)

6. **Multiple Updates**:
   - Teachers can update their reply multiple times
   - Each update changes the `repliedAt` timestamp
   - Status remains "Resolved" once set

7. **Subject Field**:
   - Should match subjects taught by the teacher
   - Used for filtering and organization

8. **Pending Implementation**:
   - File/image attachment for doubts
   - Student endpoints for doubt creation and viewing
   - Notification system when teacher replies
   - Doubt categorization by topic/chapter
