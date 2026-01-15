# Principal Dashboard API Manual

## Base URL
`/api/principal/dashboard`

## Authentication
All endpoints require authentication via Bearer token.  
All endpoints are restricted to **Principal/Coordinator** roles only.

**Request Headers** (All endpoints):
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Get Dashboard Statistics
Get overall school statistics for principal's dashboard.

**Endpoint**: `GET /api/principal/dashboard/stats`

**Authentication Required**: Yes (Principal/Coordinator only)

**Request**: No parameters required

**Success Response** (200):
```json
{
  "total_students": 450,
  "total_teachers": 35,
  "total_absents": 12,
  "5": {
    "A": {
      "attendance": 95.5,
      "class_teacher": "John Smith"
    },
    "B": {
      "attendance": 92.3,
      "class_teacher": "Mary Johnson"
    }
  },
  "6": {
    "A": {
      "attendance": 88.7,
      "class_teacher": "David Brown"
    },
    "B": {
      "attendance": 94.2,
      "class_teacher": "Sarah Wilson"
    }
  },
  "7": {
    "A": {
      "attendance": 90.1,
      "class_teacher": "Michael Davis"
    }
  }
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| total_students | Number | Total students enrolled in school |
| total_teachers | Number | Total teachers in school |
| total_absents | Number | Total students absent today |
| [class_number] | Object | Object for each class (e.g., "5", "6", "7") |
| [class_number].[section] | Object | Object for each section in that class |
| [class_number].[section].attendance | Number (Decimal) | Attendance percentage for that section |
| [class_number].[section].class_teacher | String | Class teacher's name |

**Example Access**:
```javascript
// To get Class 5A attendance
response["5"]["A"].attendance  // 95.5

// To get Class 6B class teacher
response["6"]["B"].class_teacher  // "Mary Johnson"
```

---

### 2. Get All Bully Reports
Get all bullying incident reports.

**Endpoint**: `GET /api/principal/dashboard/bully`

**Authentication Required**: Yes (Principal/Coordinator only)

**Request**: No parameters required

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "bully_name": "Robert Johnson",
    "status": "Pending",
    "description": "Verbal harassment during recess",
    "reported_by": {
      "name": "John Doe"
    },
    "bully_class": "8A",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "bully_name": "Michael Brown",
    "status": "Resolved",
    "description": "Physical altercation in corridor",
    "reported_by": {
      "name": "Jane Smith"
    },
    "bully_class": "9B",
    "createdAt": "2024-01-14T14:20:00.000Z"
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Report unique identifier |
| bully_name | String | Name of student accused of bullying |
| status | String | "Pending" or "Resolved" |
| description | String | Details of the incident |
| reported_by | Object | Reporter information |
| reported_by.name | String | Name of person who reported |
| bully_class | String | Class and section of bully (e.g., "8A") |
| createdAt | String (ISO Date) | When report was created |

---

### 3. Mark Bully Report as Resolved
Mark a bullying report as resolved after taking action.

**Endpoint**: `PATCH /api/principal/dashboard/bully/:id`

**Authentication Required**: Yes (Principal/Coordinator only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Report ID |

**Example**: `PATCH /api/principal/dashboard/bully/507f1f77bcf86cd799439011`

**Request Body**: No body required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Report marked as resolved"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether operation was successful |
| message | String | Status message |

---

### 4. Delete Bully Report
Delete a bullying report (e.g., if filed incorrectly or duplicate).

**Endpoint**: `DELETE /api/principal/dashboard/bully/:id`

**Authentication Required**: Yes (Principal/Coordinator only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Report ID |

**Example**: `DELETE /api/principal/dashboard/bully/507f1f77bcf86cd799439011`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether deletion was successful |
| message | String | Status message |

---

## Access Control

| Endpoint | Student | Teacher | Principal/Coordinator |
|----------|---------|---------|----------------------|
| GET /stats | ❌ | ❌ | ✅ |
| GET /bully | ❌ | ❌ | ✅ |
| PATCH /bully/:id | ❌ | ❌ | ✅ |
| DELETE /bully/:id | ❌ | ❌ | ✅ |

---

## Dashboard Statistics Breakdown

### Overall Metrics
- **total_students**: Count of all enrolled students
- **total_teachers**: Count of all teachers
- **total_absents**: Students absent today (across all classes)

### Class-wise Data
Organized hierarchically:
```
Class Number → Section → {
    attendance: percentage,
    class_teacher: teacher name
}
```

**Example**:
```json
"5": {                          // Class 5
    "A": {                      // Section A
        "attendance": 95.5,
        "class_teacher": "John Smith"
    },
    "B": {                      // Section B
        "attendance": 92.3,
        "class_teacher": "Mary Johnson"
    }
}
```

---

## Bully Report Workflow

```
Student/Teacher reports incident
            ↓
     Status: "Pending"
            ↓
Principal reviews (GET /bully)
            ↓
Principal takes action
            ↓
Principal marks as resolved (PATCH /bully/:id)
            ↓
     Status: "Resolved"
```

OR

```
Principal determines report is invalid
            ↓
Principal deletes report (DELETE /bully/:id)
```

---

## Notes

1. **Dashboard Stats**:
   - Provides snapshot of entire school
   - Attendance data is for current day
   - Class-wise breakdown helps identify problem areas

2. **Class Organization**:
   - Response uses class numbers as keys (not arrays)
   - Each class can have multiple sections
   - Empty sections are not included in response

3. **Attendance Calculation**:
   - Percentages are rounded to 1 decimal place
   - Based on today's attendance marking
   - Classes with no attendance marked yet may show 0% or be excluded

4. **Bully Reports**:
   - Critical for maintaining safe school environment
   - Principal has full visibility of all reports
   - Only Principal/Coordinator can access and manage

5. **Report Status**:
   - **Pending**: Newly filed, awaiting action
   - **Resolved**: Principal has addressed the issue

6. **Report Deletion**:
   - Use sparingly - for duplicates or errors
   - Better to mark as resolved for record-keeping
   - Deletion is permanent

7. **Missing Features** (to be implemented):
   - GET /bully/:id - Get specific report details
   - PATCH /bully/:id with body - Add resolution notes
   - Filtering by date, class, or status
   - Report submission endpoint (for teachers/students)

8. **Security**:
   - All endpoints verify Principal/Coordinator role
   - Students and Teachers cannot access
   - school_id automatically filtered from JWT token

9. **Performance**:
   - Dashboard stats query can be heavy on large schools
   - Consider caching for frequently accessed data
   - May need optimization for schools with 1000+ students

10. **Typical Usage**:
    ```
    Principal logs in
          ↓
    Navigate to dashboard
          ↓
    Call GET /stats
          ↓
    Display overall metrics and class grid
          ↓
    Call GET /bully
          ↓
    Display pending reports count
    ```

---

## Data Interpretation

### Dashboard Stats Example
```json
{
  "total_students": 450,
  "total_teachers": 35,
  "total_absents": 12
}
```

**Interpretation**:
- School has 450 enrolled students
- 35 teachers on staff
- 12 students absent today (2.67% absence rate)

### Class Grid Example
```json
"5": {
    "A": { "attendance": 95.5, "class_teacher": "John Smith" },
    "B": { "attendance": 92.3, "class_teacher": "Mary Johnson" }
}
```

**Interpretation**:
- Class 5 has 2 sections (A and B)
- 5-A: 95.5% attendance, taught by John Smith
- 5-B: 92.3% attendance, taught by Mary Johnson
- Class 5-A performing better than 5-B in attendance
