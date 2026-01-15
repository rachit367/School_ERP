# Announcement API Manual

## Base URL
`/api/announcement`

## Authentication
All endpoints require authentication via Bearer token.

**Request Headers** (All endpoints):
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Get School Announcements
Get all school-wide announcements. Available for Teachers, Principals, and Coordinators only.

**Endpoint**: `GET /api/announcement/school`

**Authentication Required**: Yes (Teachers/Principal/Coordinator only)

**Request**: No parameters required

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Annual Sports Day",
    "message": "Annual sports day will be held on 25th January 2024",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Parent-Teacher Meeting",
    "message": "PTM scheduled for next Saturday",
    "createdAt": "2024-01-14T09:00:00.000Z"
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Announcement unique identifier |
| title | String | Announcement title/topic |
| message | String | Announcement description |
| createdAt | String (ISO Date) | Creation timestamp |

---

### 2. Get Class Announcements
Get announcements for student's class (includes class-specific and school-wide announcements).

**Endpoint**: `GET /api/announcement/class`

**Authentication Required**: Yes (Students only)

**Request**: No parameters required

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Math Assignment Due",
    "message": "Chapter 5 assignment submission by Friday",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "School Holiday",
    "message": "School will remain closed on Republic Day",
    "createdAt": "2024-01-14T09:00:00.000Z"
  }
]
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | Announcement unique identifier |
| title | String | Announcement title/topic |
| message | String | Announcement description |
| createdAt | String (ISO Date) | Creation timestamp |

---

### 3. Create Announcement
Create a new announcement (school-wide or class-specific).

**Endpoint**: `POST /api/announcement/create`

**Authentication Required**: Yes (Principal/Coordinator or Teachers with announcement permission)

**Request Body**:
```json
{
  "topic": "Sports Day Announcement",
  "description": "Annual sports day will be held on 25th January 2024. All students must participate.",
  "school": true,
  "classes": []
}
```

OR for class-specific announcement:

```json
{
  "topic": "Math Test",
  "description": "Unit test on Monday for Chapter 5",
  "school": false,
  "classes": [5, 6, 7]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| topic | String | Yes | Announcement title |
| description | String | Yes | Detailed announcement message |
| school | Boolean | Yes | true = school-wide, false = class-specific |
| classes | Array[Number] | Conditional | Required if school=false. Array of class numbers (e.g., [5, 6, 7]) |

**Success Response** (201):
```json
{
  "success": true
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether announcement was created successfully |

**Error Response** (403):
```json
{
  "success": false
}
```

---

### 4. Get Announcement by ID
Get detailed information about a specific announcement.

**Endpoint**: `GET /api/announcement/:id`

**Authentication Required**: Yes

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Announcement ID |

**Example**: `GET /api/announcement/507f1f77bcf86cd799439011`

**Success Response** (200):
```json
{
  "title": "Annual Sports Day",
  "created_by": "John Smith",
  "description": "Annual sports day will be held on 25th January 2024. All students must participate.",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| title | String | Announcement title |
| created_by | String | Name of user who created announcement |
| description | String | Full announcement message |
| createdAt | String (ISO Date) | Creation timestamp |

---

### 5. Delete Announcement
Delete an announcement.

**Endpoint**: `DELETE /api/announcement/:id`

**Authentication Required**: Yes (Principal/Coordinator or Teachers with announcement permission)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Announcement ID to delete |

**Example**: `DELETE /api/announcement/507f1f77bcf86cd799439011`

**Success Response** (200):
```json
{
  "success": true
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether deletion was successful |

---

### 6. Assign Teacher Announcement Permission
Give a teacher permission to create/delete announcements.

**Endpoint**: `POST /api/announcement/assignteacher/:id`

**Authentication Required**: Yes (Principal/Coordinator only - no Teachers/Students)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Teacher's user ID |

**Example**: `POST /api/announcement/assignteacher/507f1f77bcf86cd799439015`

**Success Response** (200):
```json
{
  "success": true
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether permission was granted |

**Error Response** (403):
```json
{
  "success": false,
  "message": "Access denied."
}
```

---

### 7. Remove Teacher Announcement Permission
Revoke teacher's permission to create/delete announcements.

**Endpoint**: `POST /api/announcement/removeteacher/:id`

**Authentication Required**: Yes (Principal/Coordinator only - no Teachers/Students)

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String (ObjectId) | Teacher's user ID |

**Example**: `POST /api/announcement/removeteacher/507f1f77bcf86cd799439015`

**Success Response** (200):
```json
{
  "success": true
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether permission was revoked |

**Error Response** (403):
```json
{
  "success": false,
  "message": "Access denied."
}
```

---

## Access Control

| Endpoint | Student | Teacher | Teacher (with permission) | Principal/Coordinator |
|----------|---------|---------|---------------------------|----------------------|
| GET /school | ❌ | ✅ | ✅ | ✅ |
| GET /class | ✅ | ❌ | ❌ | ❌ |
| POST /create | ❌ | ❌ | ✅ | ✅ |
| GET /:id | ✅ | ✅ | ✅ | ✅ |
| DELETE /:id | ❌ | ❌ | ✅ | ✅ |
| POST /assignteacher/:id | ❌ | ❌ | ❌ | ✅ |
| POST /removeteacher/:id | ❌ | ❌ | ❌ | ✅ |

---

## Notes

1. **School-wide vs Class Announcements**:
   - School-wide announcements: Set "school": true and "classes": []
   - Class-specific: Set "school": false and provide class numbers in "classes" array

2. **Teacher Permissions**:
   - By default, teachers cannot create announcements
   - Principal/Coordinator must grant permission using /assignteacher endpoint
   - Students can never create announcements

3. **Class Numbers**:
   - Use numeric class values (e.g., 5 for Class 5, 10 for Class 10)
   - Not Roman numerals

4. **Visibility**:
   - Students only see announcements for their class + school-wide announcements
   - Teachers/Principal see all school announcements
