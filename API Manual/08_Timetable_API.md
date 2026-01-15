# Timetable API Manual

## Base URL
`/api/timetable`

## Authentication
All endpoints require authentication via Bearer token.

**Request Headers** (All endpoints):
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Check Timetable Edit Permission
Check if teacher is allowed to edit timetable for a specific class.

**Endpoint**: `GET /api/timetable/allowed`

**Authentication Required**: Yes (Teacher only)

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| class_id | String (ObjectId) | Yes | Class ID to check permission for |

**Example**: `GET /api/timetable/allowed?class_id=507f1f77bcf86cd799439013`

**Success Response** (200):
```json
{
  "allowed": true
}
```

OR

```json
{
  "allowed": false
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| allowed | Boolean | Whether teacher can edit this class's timetable |

---

### 2. Add Period
Add a new period to class timetable.

**Endpoint**: `POST /api/timetable/add-period`

**Authentication Required**: Yes (Teacher only)

**Request Body**:
```json
{
  "class_id": "507f1f77bcf86cd799439013",
  "day": "Monday",
  "subject": "Mathematics",
  "start": "09:00",
  "end": "09:45",
  "teacher_id": "507f1f77bcf86cd799439021",
  "location": "Room 101"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| class_id | String (ObjectId) | Yes | Class ID |
| day | String | Yes | Day of week ("Monday", "Tuesday", etc.) |
| subject | String | Yes | Subject name |
| start | String (HH:MM) | Yes | Period start time (24-hour format) |
| end | String (HH:MM) | Yes | Period end time (24-hour format) |
| teacher_id | String (ObjectId) | Yes | Teacher's user ID |
| location | String | Yes | Classroom/location |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Period added successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether period was added |
| message | String | Status message |

---

### 3. Delete Period
Remove a period from class timetable.

**Endpoint**: `DELETE /api/timetable/delete-period`

**Authentication Required**: Yes (Teacher only)

**Request Body**:
```json
{
  "class_id": "507f1f77bcf86cd799439013",
  "day": "Monday",
  "period_id": "507f1f77bcf86cd799439031"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| class_id | String (ObjectId) | Yes | Class ID |
| day | String | Yes | Day of week ("Monday", "Tuesday", etc.) |
| period_id | String (ObjectId) | Yes | Period's unique ID |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Period deleted successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether period was deleted |
| message | String | Status message |

---

### 4. Get Teacher Timetable
Get timetable for a specific teacher (all classes they teach).

**Endpoint**: `GET /api/timetable/teacher`

**Authentication Required**: Yes (Teacher only)

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| teacher_id | String (ObjectId) | No | Teacher's user ID (defaults to authenticated user if not provided) |

**Example**: `GET /api/timetable/teacher?teacher_id=507f1f77bcf86cd799439021`

OR

`GET /api/timetable/teacher` (gets timetable for logged-in teacher)

**Success Response** (200):
```json
[
  {
    "day": "Monday",
    "periods": [
      {
        "_id": "507f1f77bcf86cd799439031",
        "class_name": 5,
        "section": "A",
        "subject": "Mathematics",
        "start": "09:00",
        "end": "09:45",
        "location": "Room 101"
      },
      {
        "_id": "507f1f77bcf86cd799439032",
        "class_name": 6,
        "section": "B",
        "subject": "Mathematics",
        "start": "10:00",
        "end": "10:45",
        "location": "Room 102"
      }
    ]
  },
  {
    "day": "Tuesday",
    "periods": [
      {
        "_id": "507f1f77bcf86cd799439033",
        "class_name": 5,
        "section": "A",
        "subject": "Mathematics",
        "start": "11:00",
        "end": "11:45",
        "location": "Room 101"
      }
    ]
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| day | String | Day of the week |
| periods | Array[Object] | All periods for that day |
| periods[]._id | String (ObjectId) | Period unique identifier |
| periods[].class_name | Number | Class number (e.g., 5, 6) |
| periods[].section | String | Class section (e.g., "A", "B") |
| periods[].subject | String | Subject being taught |
| periods[].start | String (HH:MM) | Period start time |
| periods[].end | String (HH:MM) | Period end time |
| periods[].location | String | Classroom/location |

---

### 5. Get Class Timetable (Student View)
Get timetable for a specific class.

**Endpoint**: `GET /api/timetable/class/:id`

**Authentication Required**: Yes

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Class ID |

**Example**: `GET /api/timetable/class/507f1f77bcf86cd799439013`

**Success Response** (200):
```json
[
  {
    "day": "Monday",
    "periods": [
      {
        "_id": "507f1f77bcf86cd799439031",
        "start": "09:00",
        "end": "09:45",
        "teacher_name": "John Smith",
        "location": "Room 101",
        "subject": "Mathematics"
      },
      {
        "_id": "507f1f77bcf86cd799439032",
        "start": "10:00",
        "end": "10:45",
        "teacher_name": "Mary Johnson",
        "location": "Science Lab",
        "subject": "Science"
      },
      {
        "_id": "507f1f77bcf86cd799439033",
        "start": "11:00",
        "end": "11:45",
        "teacher_name": "David Brown",
        "location": "Room 103",
        "subject": "English"
      }
    ]
  },
  {
    "day": "Tuesday",
    "periods": [
      {
        "_id": "507f1f77bcf86cd799439034",
        "start": "09:00",
        "end": "09:45",
        "teacher_name": "John Smith",
        "location": "Room 101",
        "subject": "Mathematics"
      }
    ]
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| day | String | Day of the week |
| periods | Array[Object] | All periods for that day |
| periods[]._id | String (ObjectId) | Period unique identifier |
| periods[].start | String (HH:MM) | Period start time |
| periods[].end | String (HH:MM) | Period end time |
| periods[].teacher_name | String | Teacher's full name |
| periods[].location | String | Classroom/location |
| periods[].subject | String | Subject |

---

## Days of Week

Valid day names (case-sensitive):
- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday

---

## Time Format

- Use 24-hour format: "09:00", "14:30", "16:45"
- Always include leading zero: "09:00" not "9:00"
- Minutes are mandatory: "09:00" not "09"

---

## Access Control

| Endpoint | Student | Teacher | Class Teacher | Principal |
|----------|---------|---------|---------------|-----------|
| GET /allowed | ❌ | ✅ | ✅ | ✅ |
| POST /add-period | ❌ | ✅* | ✅ | ✅ |
| DELETE /delete-period | ❌ | ✅* | ✅ | ✅ |
| GET /teacher | ❌ | ✅ | ✅ | ✅ |
| GET /class/:id | ✅ | ✅ | ✅ | ✅ |

*Only teachers with edit permission for that class

---

## Notes

1. **Edit Permissions**:
   - Class teachers can edit their own class timetable
   - Other teachers need explicit permission
   - Use GET /allowed to check before showing edit UI

2. **Period Conflicts**:
   - System should check for time overlaps (not currently implemented)
   - Teacher cannot be in two places at the same time
   - Room conflicts should be validated

3. **Timetable Structure**:
   - Organized by days (Monday to Saturday/Friday)
   - Each day has multiple periods
   - Periods are ordered by start time

4. **Teacher Timetable**:
   - Shows all classes where teacher teaches
   - Useful for teacher's daily schedule
   - Organized by day and time

5. **Class Timetable**:
   - Shows all periods for students in that class
   - Includes teacher names for student reference
   - Useful for student schedules

6. **Default Values**:
   - `teacher_id` in GET /teacher defaults to authenticated user
   - Teachers typically view their own timetable

7. **Location Field**:
   - Can be room number, lab name, or any location identifier
   - Examples: "Room 101", "Science Lab", "Playground", "Computer Lab"

8. **Pending Implementations**:
   - Conflict detection (time overlaps)
   - Break/recess periods
   - Special periods (assembly, sports)
   - Bulk timetable import/export
   - Timetable templates
   - Period duration validation

9. **Best Practices**:
   ```
   1. Check permission before allowing edits:
      GET /allowed?class_id=xxx
   
   2. Validate times before submission:
      - start time < end time
      - No overlaps with existing periods
   
   3. Use consistent time format:
      - Always 24-hour format
      - Always HH:MM pattern
   ```

10. **Typical Workflow**:
    ```
    Class Teacher wants to create timetable
            ↓
    Check permission: GET /allowed
            ↓
    Add periods one by one: POST /add-period
            ↓
    Students view timetable: GET /class/:id
            ↓
    Teachers view their schedule: GET /teacher
    ```
