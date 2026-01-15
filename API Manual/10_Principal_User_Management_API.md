# Principal User Management API Manual

## Base URL
`/api/principal`

## Authentication
All endpoints require authentication via Bearer token.  
Most endpoints are restricted to **Principal/Coordinator** roles only.

**Request Headers** (All endpoints):
```
Authorization: Bearer <access_token>
```

---

## Teacher Management Endpoints

### 1. Get All Teachers
Get list of all teachers in the school.

**Endpoint**: `GET /api/principal/users/teachers`

**Authentication Required**: Yes (Principal/Coordinator only)

**Request**: No parameters required

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "role": "Teacher",
    "designation": "ST",
    "subjects": ["Mathematics", "Physics"],
    "classes_assigned": [
      { "_id": "507f...", "class_name": 5, "section": "A" },
      { "_id": "507f...", "class_name": 6, "section": "B" }
    ]
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Mary Johnson",
    "role": "Teacher",
    "designation": "Mentor",
    "subjects": ["English", "History"],
    "classes_assigned": [
      { "_id": "507f...", "class_name": 7, "section": "A" }
    ]
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Teacher's user ID |
| name | String | Teacher's full name |
| role | String | "Teacher" |
| designation | String | "ST" (Subject Teacher) or "Mentor" |
| subjects | Array[String] | Subjects the teacher teaches |
| classes_assigned | Array[Object] | Classes assigned to teacher |
| classes_assigned[]._id | String (ObjectId) | Class ID |
| classes_assigned[].class_name | Number | Class number |
| classes_assigned[].section | String | Class section |

---

### 2. Get Teacher Details
Get detailed information about a specific teacher.

**Endpoint**: `GET /api/principal/users/teachers/:id`

**Authentication Required**: Yes (Principal/Coordinator only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Teacher's user ID |

**Example**: `GET /api/principal/users/teachers/507f1f77bcf86cd799439011`

**Success Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Smith",
  "phone": 9876543210,
  "email": "john.smith@school.com",
  "employee_id": "EMP001",
  "designation": "ST",
  "subjects": ["Mathematics", "Physics"],
  "class_teacher_of": {
    "_id": "507f1f77bcf86cd799439021",
    "class_name": 5,
    "section": "A"
  },
  "classes_assigned": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "class_name": 5,
      "section": "A"
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "class_name": 6,
      "section": "B"
    }
  ]
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Teacher's user ID |
| name | String | Teacher's full name |
| phone | Number (10 digits) | Teacher's phone number |
| email | String | Teacher's email |
| employee_id | String | Employee ID |
| designation | String | "ST" or "Mentor" |
| subjects | Array[String] | Subjects taught |
| class_teacher_of | Object or null | Class where teacher is class teacher |
| class_teacher_of._id | String (ObjectId) | Class ID |
| class_teacher_of.class_name | Number | Class number |
| class_teacher_of.section | String | Section |
| classes_assigned | Array[Object] | All assigned classes |

---

### 3. Create Teacher
Add a new teacher to the school.

**Endpoint**: `POST /api/principal/users/teachers`

**Authentication Required**: Yes (Principal/Coordinator only)

**Request Body**:
```json
{
  "name": "John Smith",
  "email": "john.smith@school.com",
  "phone": 9876543210,
  "role": "Teacher",
  "employee_id": "EMP001",
  "class_teacher_of": "507f1f77bcf86cd799439021",
  "subjects": ["Mathematics", "Physics"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | Teacher's full name |
| email | String | Yes | Teacher's email |
| phone | Number (10 digits) | Yes | Teacher's phone number |
| role | String | Yes | Must be "Teacher" |
| employee_id | String | Yes | Unique employee ID |
| class_teacher_of | String (ObjectId) | No | Class ID if assigning as class teacher |
| subjects | Array[String] | Yes | Array of subjects teacher can teach |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Teacher created successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether teacher was created |
| message | String | Status message |

---

### 4. Update Teacher
Update teacher's profile information.

**Endpoint**: `PUT /api/principal/users/teachers/:id`

**Authentication Required**: Yes (Principal/Coordinator only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Teacher's user ID |

**Request Body** (all fields optional):
```json
{
  "class_teacher_of": "507f1f77bcf86cd799439022",
  "subjects": ["Mathematics", "Physics", "Chemistry"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| class_teacher_of | String (ObjectId) | No | New class ID for class teacher assignment |
| subjects | Array[String] | No | Updated subjects list |

**Example**: `PUT /api/principal/users/teachers/507f1f77bcf86cd799439011`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Teacher updated successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether update was successful |
| message | String | Status message |

---

### 5. Delete Teacher
Remove a teacher from the school.

**Endpoint**: `DELETE /api/principal/users/teachers/:id`

**Authentication Required**: Yes (Principal/Coordinator only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Teacher's user ID |

**Example**: `DELETE /api/principal/users/teachers/507f1f77bcf86cd799439011`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Teacher deleted successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether deletion was successful |
| message | String | Status message |

---

## Class Management Endpoints

### 6. Get All Classes
Get overview of all classes in the school.

**Endpoint**: `GET /api/principal/users/classes`

**Authentication Required**: Yes (Principal/Coordinator only)

**Request**: No parameters required

**Success Response** (200):
```json
[
  {
    "class_name": 5,
    "total_students": 60,
    "total_sections": 2
  },
  {
    "class_name": 6,
    "total_students": 55,
    "total_sections": 2
  },
  {
    "class_name": 7,
    "total_students": 48,
    "total_sections": 1
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| class_name | Number | Class number (e.g., 5, 6, 7) |
| total_students | Number | Total students across all sections |
| total_sections | Number | Number of sections in this class |

---

### 7. Get Sections of a Class
Get all sections within a specific class.

**Endpoint**: `GET /api/principal/users/classes/:class_name/sections`

**Authentication Required**: Yes (Principal/Coordinator only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| class_name | Number | Class number (e.g., 5, 6, 10) |

**Example**: `GET /api/principal/users/classes/5/sections`

**Success Response** (200):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "section": "A",
      "class_teacher": "John Smith",
      "total_students": 30
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "section": "B",
      "class_teacher": "Mary Johnson",
      "total_students": 28
    }
  ]
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| data | Array[Object] | Array of sections |
| data[]._id | String (ObjectId) | Section/Class ID |
| data[].section | String | Section name (A, B, C, etc.) |
| data[].class_teacher | String | Class teacher's name |
| data[].total_students | Number | Students in this section |

---

## Student Management Endpoints

### 8. Get Students in Section
Get all students in a specific class section.

**Endpoint**: `GET /api/principal/users/classes/:class_id/students`

**Authentication Required**: Yes (Principal/Coordinator only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| class_id | String (ObjectId) | Class/Section ID |

**Example**: `GET /api/principal/users/classes/507f1f77bcf86cd799439021/students`

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439031",
    "name": "John Doe",
    "roll_number": "101"
  },
  {
    "_id": "507f1f77bcf86cd799439032",
    "name": "Jane Smith",
    "roll_number": "102"
  },
  {
    "_id": "507f1f77bcf86cd799439033",
    "name": "Bob Johnson",
    "roll_number": "103"
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Student's user ID |
| name | String | Student's full name |
| roll_number | String | Student's roll number |

---

### 9. Get Student Details
Get detailed information about a specific student.

**Endpoint**: `GET /api/principal/users/students/:student_id`

**Authentication Required**: Yes (Principal/Coordinator only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| student_id | String (ObjectId) | Student's user ID |

**Example**: `GET /api/principal/users/students/507f1f77bcf86cd799439031`

**Success Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439031",
  "name": "John Doe",
  "phone": 9876543210,
  "email": "john.doe@student.school.com",
  "date_of_birth": "2010-05-15T00:00:00.000Z",
  "class": "5",
  "section": "A",
  "roll_number": "101",
  "attendance_percentage": 92.5,
  "total_presents": 148,
  "total_absents": 12,
  "father_name": "Richard Doe",
  "father_email": "richard@example.com",
  "father_number": 9876543211,
  "mother_name": "Jane Doe",
  "mother_email": "jane@example.com",
  "mother_number": 9876543212,
  "guardian_name": "Richard Doe",
  "guardian_email": "richard@example.com",
  "guardian_number": 9876543211
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Student's user ID |
| name | String | Student's full name |
| phone | Number (10 digits) | Student's/family phone |
| email | String | Student's email |
| date_of_birth | String (ISO Date) | Student's DOB |
| class | String | Class number |
| section | String | Section |
| roll_number | String | Roll number |
| attendance_percentage | Number (Decimal) | Overall attendance % |
| total_presents | Number | Total days present |
| total_absents | Number | Total days absent |
| father_name | String | Father's name |
| father_email | String | Father's email |
| father_number | Number | Father's phone |
| mother_name | String | Mother's name |
| mother_email | String | Mother's email |
| mother_number | Number | Mother's phone |
| guardian_name | String | Guardian's name |
| guardian_email | String | Guardian's email |
| guardian_number | Number | Guardian's phone |

---

### 10. Add Student
Enroll a new student in the school.

**Endpoint**: `POST /api/principal/users/students`

**Authentication Required**: Yes (Principal/Coordinator only)

**Request Body**:
```json
{
  "name": "John Doe",
  "class_name": 5,
  "section": "A",
  "dob": "2010-05-15",
  "roll_number": "101",
  "mother_details": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": 9876543212
  },
  "father_details": {
    "name": "Richard Doe",
    "email": "richard@example.com",
    "phone": 9876543211
  },
  "guardian_details": {
    "name": "Richard Doe",
    "email": "richard@example.com",
    "phone": 9876543211
  },
  "email": "john.doe@student.school.com",
  "phone": 9876543210
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | Student's full name |
| class_name | Number | Yes | Class number (e.g., 5, 6) |
| section | String | Yes | Section (e.g., "A", "B") |
| dob | String (YYYY-MM-DD) | Yes | Date of birth |
| roll_number | String | Yes | Roll number (unique per class) |
| mother_details | Object | Yes | Mother's information |
| mother_details.name | String | Yes | Mother's name |
| mother_details.email | String | No | Mother's email |
| mother_details.phone | Number | No | Mother's phone |
| father_details | Object | Yes | Father's information |
| father_details.name | String | Yes | Father's name |
| father_details.email | String | No | Father's email |
| father_details.phone | Number | No | Father's phone |
| guardian_details | Object | Yes | Guardian's information |
| guardian_details.name | String | Yes | Guardian's name |
| guardian_details.email | String | No | Guardian's email |
| guardian_details.phone | Number | No | Guardian's phone |
| email | String | Yes | Student's email |
| phone | Number (10 digits) | Yes | Student's/family phone |

**Success Response** (201):
```json
{
  "success": true,
  "message": "Student added successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether student was added |
| message | String | Status message |

---

### 11. Delete Student
Remove a student from the school.

**Endpoint**: `DELETE /api/principal/users/students/:student_id`

**Authentication Required**: Yes (Principal/Coordinator only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| student_id | String (ObjectId) | Student's user ID |

**Example**: `DELETE /api/principal/users/students/507f1f77bcf86cd799439031`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether deletion was successful |
| message | String | Status message |

---

### 12. Transfer Student
Transfer student to different section within same class.

**Endpoint**: `PATCH /api/principal/users/students/:student_id/transfer`

**Authentication Required**: Yes (Principal/Coordinator only)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| student_id | String (ObjectId) | Student's user ID |

**Request Body**:
```json
{
  "section": "B"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| section | String | Yes | New section (e.g., "A", "B", "C") |

**Example**: `PATCH /api/principal/users/students/507f1f77bcf86cd799439031/transfer`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Student transferred successfully"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether transfer was successful |
| message | String | Status message |

---

## Access Control

| Functionality | Student | Teacher | Principal/Coordinator |
|---------------|---------|---------|----------------------|
| Teacher Management | ❌ | ❌ | ✅ |
| Class Overview | ❌ | ❌ | ✅ |
| Student Management | ❌ | ❌ | ✅ |

---

## Notes

1. **Teacher Designations**:
   - **ST (Subject Teacher)**: Regular teacher teaching specific subjects
   - **Mentor**: Usually more experienced, may have additional responsibilities

2. **Class Assignment**:
   - `class_teacher_of`: The one class where teacher is class teacher
   - `classes_assigned`: All classes where teacher teaches (includes class_teacher_of)

3. **Phone Number Format**:
   - Must be 10-digit number
   - No spaces, dashes, or special characters
   - No country code

4. **Email Validation**:
   - Should be valid email format
   - Recommended: Use school domain for consistency

5. **Roll Number**:
   - Should be unique within a class section
   - Can be alphanumeric (e.g., "101", "A01")

6. **Student Transfer**:
   - Only transfers within SAME class (different section)
   - For changing class level, delete and re-add student

7. **Guardian Details**:
   - Typically same as father or mother
   - Required for emergency contacts
   - Can be different person (e.g., uncle, grandparent)

8. **Data Consistency**:
   - Deleting a class teacher reassigns class to no teacher
   - Deleting a student removes them from all records
   - Operations are not reversible - confirm before deleting

9. **Bulk Operations** (not implemented):
   - Bulk student upload via CSV
   - Bulk teacher import
   - Batch section transfers

10. **Future Enhancements**:
    - Student promotion to next class
    - Teacher attendance tracking
    - Performance reports for students
    - Parent portal access management

---

## Typical Workflows

### Adding a New Teacher
```
1. Collect teacher information
2. POST /api/principal/users/teachers
3. Optionally: PUT to assign as class teacher
4. Verify: GET /api/principal/users/teachers/:id
```

### Student Admission
```
1. Collect student and parent information
2. Determine class and section
3. POST /api/principal/users/students
4. Verify: GET /api/principal/users/students/:student_id
```

### Class Reorganization
```
1. GET /api/principal/users/classes/:class_name/sections
2. GET students for each section
3. Transfer students as needed:
   PATCH /api/principal/users/students/:id/transfer
```

### Teacher Management
```
1. GET /api/principal/users/teachers (view all)
2. GET /api/principal/users/teachers/:id (select one)
3. PUT to update assignments
4. Monitor via dashboard stats
```
