# Teacher API Manual

## Base URL
`/api/teacher`

## Authentication
All endpoints require authentication via Bearer token.  
All endpoints are restricted to **Teachers only**.

**Request Headers** (All endpoints):
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Get Teacher's Assigned Classes
Get all classes assigned to the authenticated teacher.

**Endpoint**: `GET /api/teacher/assigned-classes`

**Authentication Required**: Yes (Teacher only)

**Request**: No parameters required

**Success Response** (200):
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "class_name": 5,
    "section": "A",
    "total_students": 30,
    "class_teacher_name": "John Smith"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "class_name": 6,
    "section": "B",
    "total_students": 28,
    "class_teacher_name": "Mary Johnson"
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "class_name": 7,
    "section": "A",
    "total_students": 32,
    "class_teacher_name": "John Smith"
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| id | String (ObjectId) | Class unique identifier |
| class_name | Number | Class number (e.g., 5, 6, 10) |
| section | String | Class section (e.g., "A", "B", "C") |
| total_students | Number | Number of students in the class |
| class_teacher_name | String | Name of the class teacher |

---

### 2. Get Teacher Insights/Dashboard Data
Get dashboard insights and statistics for the authenticated teacher.

**Endpoint**: `GET /api/teacher/insights`

**Authentication Required**: Yes (Teacher only)

**Request**: No parameters required

**Success Response** (200):
```json
{
  "total_homeworks": 15,
  "pending_doubts": 8,
  "total_classes": 3,
  "total_students": 85,
  "recent_activity": [...],
  "upcoming_deadlines": [...]
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| total_homeworks | Number | Total number of homeworks created by teacher |
| pending_doubts | Number | Number of unresolved student doubts |
| total_classes | Number | Number of classes assigned to teacher |
| total_students | Number | Total students across all classes |
| recent_activity | Array | Recent activities (optional) |
| upcoming_deadlines | Array | Upcoming homework deadlines (optional) |

**Note**: The exact response structure may vary based on the service implementation. The above represents common dashboard metrics.

---

## Access Control

| Endpoint | Student | Teacher | Principal |
|----------|---------|---------|-----------|
| GET /assigned-classes | ❌ | ✅ | ❌* |
| GET /insights | ❌ | ✅ | ❌* |

*Principal would need to use different endpoints specific to their role

---

## Use Cases

1. **Dashboard Display**:
   - Show all classes taught by the teacher
   - Quick overview of class sizes
   - Identify which classes the teacher is class teacher for

2. **Navigation**:
   - Use class IDs to navigate to class-specific features
   - Filter homeworks, attendance, and timetables by class

3. **Permission Checking**:
   - Verify which classes teacher can access
   - Check if teacher is class teacher (name matches logged-in user)

---

## Notes

1. **Class Teacher vs Subject Teacher**:
   - Response includes all classes where teacher teaches (not just class teacher assignments)
   - `class_teacher_name` indicates who is the official class teacher
   - Teacher's own name in field means they are the class teacher for that class

2. **Subject Information**:
   - This endpoint doesn't include which subject the teacher teaches in each class
   - Subject information is stored in teacher profile
   - For subject-specific data, refer to teacher profile endpoints

3. **Student Count**:
   - `total_students` is the current enrollment in that class
   - This is a live count from the class's students array

4. **Class Assignment**:
   - Classes are assigned to teachers via Principal/Admin endpoints
   - Teacher profile contains `classes_assigned` array
   - This endpoint fetches details for those assigned classes

5. **Sorting**:
   - Results are typically sorted by class_name then section
   - Example order: 5A, 5B, 6A, 6B, 7A

6. **Use with Other Endpoints**:
   ```
   GET /assigned-classes → Get class IDs
        ↓
   Use class ID with:
   - POST /api/attendance/save
   - GET /api/homework/class/:classid
   - POST /api/homework (with Class field)
   - GET /api/timetable/class/:id
   ```

7. **Empty Response**:
   - If teacher has no assigned classes, returns empty array `[]`
   - This can happen for:
     - New teachers not yet assigned
     - Teachers temporarily unassigned
     - Coordinators/administrative teachers

8. **Performance**:
   - This is a lightweight endpoint
   - Safe to call frequently (e.g., on dashboard load)
   - Results are fetched from database with minimal joins

9. **Expected Flow**:
   ```
   Teacher logs in
        ↓
   Call GET /assigned-classes
        ↓
   Display class cards on dashboard
        ↓
   Teacher selects a class
        ↓
   Use class ID for further operations
   ```

---

## Future Enhancements

The following features could be added to improve the Teacher API:

1. **GET /teacher/profile** - Get complete teacher profile
2. **GET /teacher/schedule** - Get teacher's daily schedule
3. **GET /teacher/students** - Get all students across all classes
4. **PATCH /teacher/profile** - Update teacher profile (limited fields)
5. **GET /teacher/performance** - Get teaching performance metrics
