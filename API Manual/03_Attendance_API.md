# Attendance API Manual

## Base URL
`/api/attendance`

## Authentication
All endpoints require authentication via Bearer token.

**Request Headers** (All endpoints):
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Get Student Attendance
Get attendance records for a specific student within a date range.

**Endpoint**: `GET /api/attendance/student/:id`

**Authentication Required**: Yes

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Student's user ID |

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from_date | String (YYYY-MM-DD) | Yes | Start date for attendance records |
| to_date | String (YYYY-MM-DD) | Yes | End date for attendance records |

**Example**: `GET /api/attendance/student/507f1f77bcf86cd799439011?from_date=2024-01-01&to_date=2024-01-31`

**Success Response** (200):
```json
{
  "name": "John Doe",
  "roll_number": "101",
  "present": 18,
  "absent": 2,
  "attendance_percentage": 90.00,
  "dailyAttendance": [
    {
      "date": "2024-01-31T00:00:00.000Z",
      "status": "P"
    },
    {
      "date": "2024-01-30T00:00:00.000Z",
      "status": "A"
    },
    {
      "date": "2024-01-29T00:00:00.000Z",
      "status": "P"
    }
  ]
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| name | String | Student's full name |
| roll_number | String | Student's roll number |
| present | Number | Total present days in date range |
| absent | Number | Total absent days in date range |
| attendance_percentage | Number (Decimal) | Attendance percentage |
| dailyAttendance | Array[Object] | Daily attendance records |
| dailyAttendance[].date | String (ISO Date) | Attendance date |
| dailyAttendance[].status | String | Attendance status: "P" (Present), "A" (Absent), "ML" (Medical Leave), "L" (Leave) |

---

### 2. Check Allowed Class
Check if the authenticated teacher can mark attendance for a specific class.

**Endpoint**: `GET /api/attendance/allowed-class/:id`

**Authentication Required**: Yes (Teacher only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Class ID |

**Example**: `GET /api/attendance/allowed-class/507f1f77bcf86cd799439013`

**Success Response** (200):
```json
{
  "allowed": true
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| allowed | Boolean | Whether teacher can mark attendance for this class |

---

### 3. Get Class Attendance
Get attendance summary for a specific class.

**Endpoint**: `GET /api/attendance/class/:classid`

**Authentication Required**: Yes

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| classid | String (ObjectId) | Class ID |

**Example**: `GET /api/attendance/class/507f1f77bcf86cd799439013`

**Success Response** (200):
```json
{
  "class_attendance_percentage": 85.50,
  "total_present": 28,
  "total_absent": 2,
  "students": [
    {
      "student_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "roll_number": "101",
      "attendance_percentage": 90.00,
      "today_attendance": "P"
    },
    {
      "student_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "roll_number": "102",
      "attendance_percentage": 95.50,
      "today_attendance": "A"
    },
    {
      "student_id": "507f1f77bcf86cd799439014",
      "name": "Bob Johnson",
      "roll_number": "103",
      "attendance_percentage": 88.20,
      "today_attendance": "Not Marked"
    }
  ]
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| class_attendance_percentage | Number (Decimal) | Overall class attendance percentage |
| total_present | Number | Students present today |
| total_absent | Number | Students absent today |
| students | Array[Object] | List of all students in class |
| students[].student_id | String (ObjectId) | Student's user ID |
| students[].name | String | Student's full name |
| students[].roll_number | String | Student's roll number |
| students[].attendance_percentage | Number (Decimal) | Student's overall attendance % |
| students[].today_attendance | String | Today's status: "P", "A", "ML", "L", or "Not Marked" |

---

### 4. Save Daily Attendance
Mark or update attendance for a class.

**Endpoint**: `POST /api/attendance/save`

**Authentication Required**: Yes (Teacher with permission for this class)

**Request Body**:
```json
{
  "class_id": "507f1f77bcf86cd799439013",
  "attendance": [
    {
      "student_id": "507f1f77bcf86cd799439011",
      "status": "P"
    },
    {
      "student_id": "507f1f77bcf86cd799439012",
      "status": "A"
    },
    {
      "student_id": "507f1f77bcf86cd799439014",
      "status": "P"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| class_id | String (ObjectId) | Yes | Class ID |
| attendance | Array[Object] | Yes | Attendance records for all students |
| attendance[].student_id | String (ObjectId) | Yes | Student's user ID |
| attendance[].status | String | Yes | "P" (Present), "A" (Absent), "ML" (Medical Leave), or "L" (Leave) |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Attendance Marked"
}
```

OR if updating existing attendance:

```json
{
  "success": true,
  "message": "Attendance Updated"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether attendance was saved |
| message | String | Status message |

**Error Response** (403):
```json
{
  "message": "Permission not allowed"
}
```

**Error Response** (400):
```json
{
  "message": "Attendance count mismatch"
}
```

---

### 5. Assign Substitute Teacher
Allow another teacher to mark attendance for your class.

**Endpoint**: `POST /api/attendance/substitute`

**Authentication Required**: Yes (Class Teacher only)

**Request Body**:
```json
{
  "substitute_id": "507f1f77bcf86cd799439015"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| substitute_id | String (ObjectId) | Yes | Teacher ID to grant attendance permission |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Substitute Teacher Added"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether substitute was added |
| message | String | Status message |

---

### 6. Remove Substitute Teacher
Revoke substitute teacher's attendance permission.

**Endpoint**: `DELETE /api/attendance/substitute`

**Authentication Required**: Yes (Class Teacher only)

**Request Body**:
```json
{
  "substitute_id": "507f1f77bcf86cd799439015"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| substitute_id | String (ObjectId) | Yes | Teacher ID to revoke attendance permission |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Substitute Teacher Removed"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether substitute was removed |
| message | String | Status message |

---

## Attendance Status Codes

| Code | Full Form | Description |
|------|-----------|-------------|
| P | Present | Student was present |
| A | Absent | Student was absent without leave |
| ML | Medical Leave | Student on medical leave (with certificate) |
| L | Leave | Student on approved leave |

---

## Access Control

| Endpoint | Student | Teacher | Class Teacher | Principal |
|----------|---------|---------|---------------|-----------|
| GET /student/:id | ✅ | ✅ | ✅ | ✅ |
| GET /allowed-class/:id | ❌ | ✅ | ✅ | ✅ |
| GET /class/:classid | ❌ | ✅ | ✅ | ✅ |
| POST /save | ❌ | ✅* | ✅ | ✅ |
| POST /substitute | ❌ | ❌ | ✅ | ❌ |
| DELETE /substitute | ❌ | ❌ | ✅ | ❌ |

*Only teachers with permission for that specific class

---

## Notes

1. **Date Format**:
   - Always use YYYY-MM-DD format (e.g., "2024-01-31")
   - Dates are stored with time 00:00:00 UTC

2. **Attendance Permissions**:
   - Class teacher can always mark attendance for their class
   - Other teachers need explicit permission (substitute teacher)
   - Substitute teachers are added via POST /substitute endpoint

3. **Editing Attendance**:
   - You can edit today's attendance by sending the same request again
   - The system automatically detects if it's an edit and updates accordingly
   - Student counters (total_presents, total_absents) are automatically adjusted

4. **Attendance Array**:
   - Must include ALL students in the class
   - If student count doesn't match, you'll get "Attendance count mismatch" error

5. **Transaction Safety**:
   - Attendance saving uses MongoDB transactions
   - If any part fails, entire operation is rolled back

6. **Substitute Teacher Workflow**:
   - Only class teachers can add/remove substitutes
   - When a substitute is added, they appear in the class attendance permission list
   - Substitute can mark attendance until removed
