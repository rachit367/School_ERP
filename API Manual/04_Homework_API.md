# Homework API Manual

## Base URL
`/api/homework`

## Authentication
All endpoints require authentication via Bearer token.

**Request Headers** (All endpoints):
```
Authorization: Bearer <access_token>
```

---

## Teacher Endpoints

### 1. Get All Homeworks
Get all homework assigned by the authenticated teacher.

**Endpoint**: `GET /api/homework`

**Authentication Required**: Yes (Teacher only)

**Request**: No parameters required

**Success Response** (200):
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "topic": "Chapter 5 Exercise",
    "description": "Complete all questions from page 45 to 50",
    "class_name": 5,
    "section": "A",
    "due_date": "2024-01-20T00:00:00.000Z",
    "total_students": 30,
    "total_submission": 25
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "topic": "Mathematics Assignment",
    "description": "Solve worksheet problems 1-15",
    "class_name": 6,
    "section": "B",
    "due_date": "2024-01-22T00:00:00.000Z",
    "total_students": 28,
    "total_submission": 20
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| id | String (ObjectId) | Homework unique identifier |
| topic | String | Homework topic/title |
| description | String | Detailed homework description |
| class_name | Number | Class number (e.g., 5, 6, 10) |
| section | String | Class section (e.g., "A", "B") |
| due_date | String (ISO Date) | Homework due date |
| total_students | Number | Total students in the class |
| total_submission | Number | Number of submissions received |

---

### 2. Get Class Homework
Get all homework for a specific class.

**Endpoint**: `GET /api/homework/class/:classid`

**Authentication Required**: Yes (Teacher only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| classid | String (ObjectId) | Class ID |

**Example**: `GET /api/homework/class/507f1f77bcf86cd799439013`

**Success Response** (200):
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "topic": "Chapter 5 Exercise",
    "description": "Complete all questions from page 45 to 50",
    "class_name": 5,
    "section": "A",
    "due_date": "2024-01-20T00:00:00.000Z",
    "total_students": 30,
    "total_submission": 25
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| id | String (ObjectId) | Homework unique identifier |
| topic | String | Homework topic/title |
| description | String | Detailed homework description |
| class_name | Number | Class number |
| section | String | Class section |
| due_date | String (ISO Date) | Homework due date |
| total_students | Number | Total students in class |
| total_submission | Number | Number of submissions |

---

### 3. Get Homework Details
Get detailed information about a specific homework including submission list.

**Endpoint**: `GET /api/homework/:id`

**Authentication Required**: Yes (Teacher only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Homework ID |

**Example**: `GET /api/homework/507f1f77bcf86cd799439011`

**Success Response** (200):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "topic": "Chapter 5 Exercise",
  "description": "Complete all questions from page 45 to 50",
  "class_name": 5,
  "section": "A",
  "due_date": "2024-01-20T00:00:00.000Z",
  "total_students": 30,
  "total_submission": 25,
  "submitted_by": [
    {
      "student_id": "507f1f77bcf86cd799439021",
      "student_name": "John Doe",
      "roll_number": "101",
      "file_url": "https://example.com/submissions/hw1_john.pdf",
      "submitted_at": "2024-01-18T14:30:00.000Z"
    },
    {
      "student_id": "507f1f77bcf86cd799439022",
      "student_name": "Jane Smith",
      "roll_number": "102",
      "file_url": "https://example.com/submissions/hw1_jane.pdf",
      "submitted_at": "2024-01-19T10:15:00.000Z"
    }
  ]
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| id | String (ObjectId) | Homework unique identifier |
| topic | String | Homework topic/title |
| description | String | Detailed homework description |
| class_name | Number | Class number |
| section | String | Class section |
| due_date | String (ISO Date) | Homework due date |
| total_students | Number | Total students in class |
| total_submission | Number | Number of submissions |
| submitted_by | Array[Object] | List of students who submitted |
| submitted_by[].student_id | String (ObjectId) | Student's user ID |
| submitted_by[].student_name | String | Student's name |
| submitted_by[].roll_number | String | Student's roll number |
| submitted_by[].file_url | String (URL) | Submission file URL |
| submitted_by[].submitted_at | String (ISO Date) | Submission timestamp |

---

### 4. Post Homework
Create a new homework assignment.

**Endpoint**: `POST /api/homework`

**Authentication Required**: Yes (Teacher only)

**Request Body**:
```json
{
  "Class": "507f1f77bcf86cd799439013",
  "topic": "Chapter 5 Exercise",
  "description": "Complete all questions from page 45 to 50",
  "due_date": "2024-01-20"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Class | String (ObjectId) | Yes | Class ID |
| topic | String | Yes | Homework topic/title |
| description | String | Yes | Detailed homework description |
| due_date | String (YYYY-MM-DD or ISO) | Yes | Homework due date |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Homework posted successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether homework was created |
| message | String | Status message |

---

## Student Endpoints

### 5. Get Subject Homeworks (Student)
Get all homework for a specific subject, categorized by completion status.

**Endpoint**: `GET /api/homework/student`

**Authentication Required**: Yes (Student only)

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| class_id | String (ObjectId) | Yes | Student's class ID |
| teacher_id | String (ObjectId) | Yes | Teacher ID for the subject |

**Example**: `GET /api/homework/student?class_id=507f1f77bcf86cd799439013&teacher_id=507f1f77bcf86cd799439021`

**Success Response** (200):
```json
{
  "completed": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "topic": "Chapter 5 Exercise",
      "description": "Complete all questions",
      "deadline": "2024-01-20T00:00:00.000Z"
    }
  ],
  "pending": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "topic": "Chapter 6 Problems",
      "description": "Solve worksheet",
      "deadline": "2024-01-25T00:00:00.000Z"
    }
  ],
  "submitted": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "topic": "Chapter 4 Review",
      "description": "Late submission",
      "deadline": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| completed | Array | Homework submitted on time |
| pending | Array | Homework not yet submitted |
| submitted | Array | Homework submitted late |

---

### 6. Get Homework Details (Student)
Get detailed information about a specific homework.

**Endpoint**: `GET /api/homework/student/:homeworkid`

**Authentication Required**: Yes (Student only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| homeworkid | String (ObjectId) | Homework ID |

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| class_id | String (ObjectId) | Yes | Student's class ID |

**Example**: `GET /api/homework/student/507f1f77bcf86cd799439011?class_id=507f1f77bcf86cd799439013`

**Success Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "topic": "Chapter 5 Exercise",
  "description": "Complete all questions from page 45 to 50",
  "deadline": "2024-01-20T00:00:00.000Z"
}
```

---

### 7. Submit Homework
Submit homework (placeholder - file upload not yet implemented).

**Endpoint**: `POST /api/homework/submit`

**Authentication Required**: Yes (Student only)

**Success Response** (200):
```json
{
  "success": true
}
```

**Note**: File upload functionality is pending S3 bucket integration.

---

## Access Control

| Endpoint | Student | Teacher | Principal |
|----------|---------|---------|-----------|
| GET / | ❌ | ✅ | ✅ |
| GET /class/:classid | ❌ | ✅ | ✅ |
| GET /:id | ❌ | ✅ | ✅ |
| POST / | ❌ | ✅ | ✅ |
| GET /student | ✅ | ❌ | ❌ |
| GET /student/:homeworkid | ✅ | ❌ | ❌ |
| POST /submit | ✅ | ❌ | ❌ |

---

## Notes

1. **Date Format**:
   - `due_date` accepts both "YYYY-MM-DD" and full ISO date strings
   - Stored as Date object in database

2. **Class Parameter**:
   - The field name is "Class" (capital C) in the request body
   - This is the class ID (ObjectId), not class name/number

3. **Submission Tracking**:
   - `total_submission` is automatically calculated
   - `submitted_by` array contains complete submission details

4. **Teacher Permissions**:
   - Teachers can only view homework they created
   - Teachers can post homework for classes they're assigned to

5. **Student Categories**:
   - **completed**: Submitted before deadline
   - **pending**: Not yet submitted
   - **submitted**: Submitted after deadline (late)

6. **Homework Visibility**:
   - Teachers see all homework they created across all their classes
   - Students see homework for their class filtered by teacher/subject

