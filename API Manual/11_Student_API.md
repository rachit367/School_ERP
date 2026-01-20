# Student API Manual

## Base URL
`/api/student`

## Authentication
All endpoints require authentication via Bearer token.  
All endpoints are accessible to **Students only**.

**Request Headers** (All endpoints):
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Get All Subjects for Student
Get all subjects assigned to the authenticated student's class.

**Endpoint**: `GET /api/student/subjects`

**Authentication Required**: Yes (Student only)

**Request**: No parameters required

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "subject": "Mathematics",
    "teacher": "John Smith",
    "teacher_id": "507f1f77bcf86cd799439012"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "subject": "Science",
    "teacher": "Mary Johnson",
    "teacher_id": "507f1f77bcf86cd799439014"
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Subject unique identifier |
| subject | String | Name of the subject |
| teacher | String | Name of the teacher for this subject |
| teacher_id | String (ObjectId) | Teacher's unique identifier |

**Use Cases**:
- Display all subjects on student dashboard
- Navigate to subject-specific resources
- View teacher information for each subject

---

### 2. Get Resources for a Subject
Get all learning resources (notes, documents, links) for a specific subject.

**Endpoint**: `GET /api/student/subjects/resource`

**Authentication Required**: Yes (Student only)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| subject_id | String (ObjectId) | Yes | ID of the subject to fetch resources for |

**Request Example**:
```
GET /api/student/subjects/resource?subject_id=507f1f77bcf86cd799439011
```

**Success Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "resources": [
    {
      "title": "Chapter 1 - Algebra Basics",
      "type": "PDF",
      "url": "https://example.com/resource1.pdf",
      "uploaded_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "title": "Practice Problems",
      "type": "Document",
      "url": "https://example.com/resource2.pdf",
      "uploaded_at": "2024-01-16T14:20:00.000Z"
    }
  ]
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Subject unique identifier |
| resources | Array | List of resource objects |
| resources[].title | String | Resource title or name |
| resources[].type | String | Type of resource (PDF, Document, Link, etc.) |
| resources[].url | String | URL to access the resource |
| resources[].uploaded_at | String (ISO Date) | When the resource was uploaded |

**Error Responses**:

**400 Bad Request** - Missing subject_id:
```json
{
  "success": false,
  "message": "subject_id is required"
}
```

**404 Not Found** - Invalid subject_id:
```json
{
  "success": false,
  "message": "Subject not found"
}
```

---

## Access Control

| Endpoint | Student | Teacher | Principal |
|----------|---------|---------|-----------| 
| GET /subjects | ✅ | ❌ | ❌ |
| GET /subjects/resource | ✅ | ❌ | ❌ |

---

## Use Cases

### 1. **Student Dashboard**
```
Student logs in
     ↓
GET /api/student/subjects
     ↓
Display subject cards with teacher names
     ↓
Student clicks on a subject
     ↓
GET /api/student/subjects/resource?subject_id=XXX
     ↓
Display all resources for that subject
```

### 2. **Resource Library**
- Students can browse all available learning materials
- Filter resources by subject
- Access study materials uploaded by teachers
- Download or view resources directly

### 3. **Study Planning**
- View all subjects to plan study schedule
- Access subject-specific materials
- Contact teachers for specific subjects

---

## Notes

1. **Subject Assignment**:
   - Subjects are automatically assigned based on student's class
   - All students in the same class/section see the same subjects
   - Subject list is managed by Principal/Admin

2. **Resources**:
   - Resources are uploaded by teachers or admin
   - Resources array may be empty if teacher hasn't uploaded any materials
   - Resources are shared across all students in the class

3. **Teacher Information**:
   - Teacher name and ID are included for each subject
   - Use teacher_id with other endpoints (like `/api/doubt/subject` or `/api/homework/student`)

4. **Data Freshness**:
   - Subject list updates when admin modifies class subjects
   - Resources update in real-time when teachers upload new materials

5. **Related Endpoints**:
   - Use subject information with homework endpoints: `/api/homework/student`
   - Use teacher_id with doubt endpoints: `/api/doubt/subject`
   - View subject timetable: `/api/timetable/class/:id`

---

## Future Enhancements

Planned features for student endpoints:

1. **GET /student/profile** - View complete student profile
2. **GET /student/marks** - View exam marks and grades
3. **GET /student/fees** - Check fee payment status
4. **POST /student/resource/download** - Track resource downloads
5. **GET /student/notifications** - View personalized notifications
