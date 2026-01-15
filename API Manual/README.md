# School ERP - Complete API Documentation

## 📚 Table of Contents

This directory contains comprehensive API documentation for the School ERP backend system. Each document provides detailed information about request/response formats, data types, authentication requirements, and usage examples.

---

## 📖 API Manuals

### 1. [Authentication API](./01_Authentication_API.md)
**Base URL**: `/api/auth`

Core authentication endpoints for login, OTP verification, token management, and user profile retrieval.

**Key Endpoints**:
- `POST /send-otp` - Send OTP for authentication
- `POST /verify-otp` - Verify OTP and get tokens
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user profile

**Access**: Public (login) + Authenticated

---

### 2. [Announcement API](./02_Announcement_API.md)
**Base URL**: `/api/announcement`

Manage school-wide and class-specific announcements.

**Key Endpoints**:
- `GET /school` - Get school announcements (Teachers/Principal)
- `GET /class` - Get class announcements (Students)
- `POST /create` - Create announcement
- `DELETE /:id` - Delete announcement
- `POST /assignteacher/:id` - Grant announcement permission
- `POST /removeteacher/:id` - Revoke announcement permission

**Access**: Authenticated (role-based)

---

### 3. [Attendance API](./03_Attendance_API.md)
**Base URL**: `/api/attendance`

Complete attendance management system for students and classes.

**Key Endpoints**:
- `GET /student/:id` - Get student attendance history
- `GET /class/:classid` - Get class attendance summary
- `POST /save` - Mark/update attendance
- `GET /allowed-class/:id` - Check edit permissions
- `POST /substitute` - Assign substitute teacher
- `DELETE /substitute` - Remove substitute teacher

**Access**: Authenticated (Teachers for marking, All for viewing)

**Attendance Codes**: P (Present), A (Absent), ML (Medical Leave), L (Leave)

---

### 4. [Homework API](./04_Homework_API.md)
**Base URL**: `/api/homework`

Homework assignment and submission tracking.

**Key Endpoints**:
- `GET /` - Get all teacher's homeworks
- `GET /class/:classid` - Get class-specific homework
- `POST /` - Create new homework
- `GET /:id` - Get homework details with submissions

**Access**: Teachers only (Student endpoints pending)

**Note**: Student submission features are planned but not yet implemented.

---

### 5. [Leave Management API](./05_Leave_API.md)
**Base URL**: `/api/leave`

Student leave request and approval system.

**Key Endpoints**:
- `POST /request` - Submit leave request
- `GET /history` - View leave request history
- `GET /requests` - View pending requests (Teachers)
- `PATCH /approve/:reqid` - Approve request (Teachers)
- `PATCH /reject/:reqid` - Reject request (Teachers)

**Access**: All (Students submit, Teachers approve)

**Leave Status**: Pending → Approved/Rejected

---

### 6. [Doubt Management API](./06_Doubt_API.md)
**Base URL**: `/api/doubt`

Student doubt/question submission and teacher response system.

**Key Endpoints**:
- `GET /` - Get all doubts (Teachers)
- `PATCH /:id` - Reply to doubt or mark resolved

**Access**: Teachers only

**Note**: Student doubt submission endpoints are planned but not yet implemented.

---

### 7. [Teacher API](./07_Teacher_API.md)
**Base URL**: `/api/teacher`

Teacher-specific functionality and class management.

**Key Endpoints**:
- `GET /assigned-classes` - Get teacher's assigned classes

**Access**: Teachers only

---

### 8. [Timetable API](./08_Timetable_API.md)
**Base URL**: `/api/timetable`

Timetable creation, editing, and viewing.

**Key Endpoints**:
- `GET /allowed` - Check edit permissions
- `POST /add-period` - Add period to timetable
- `DELETE /delete-period` - Remove period
- `GET /teacher` - Get teacher's timetable
- `GET /class/:id` - Get class timetable

**Access**: Teachers (edit with permission), All (view)

**Days**: Monday - Saturday  
**Time Format**: 24-hour (HH:MM)

---

### 9. [Principal Dashboard API](./09_Principal_Dashboard_API.md)
**Base URL**: `/api/principal/dashboard`

Principal dashboard with school statistics and bullying reports.

**Key Endpoints**:
- `GET /stats` - Get school statistics
- `GET /bully` - Get all bully reports
- `PATCH /bully/:id` - Mark report as resolved
- `DELETE /bully/:id` - Delete report

**Access**: Principal/Coordinator only

---

### 10. [Principal User Management API](./10_Principal_User_Management_API.md)
**Base URL**: `/api/principal`

Comprehensive user management for teachers, classes, and students.

**Key Endpoints**:

**Teachers**:
- `GET /users/teachers` - List all teachers
- `GET /users/teachers/:id` - Get teacher details
- `POST /users/teachers` - Create teacher
- `PUT /users/teachers/:id` - Update teacher
- `DELETE /users/teachers/:id` - Delete teacher

**Classes**:
- `GET /users/classes` - Get all classes overview
- `GET /users/classes/:class_name/sections` - Get class sections

**Students**:
- `GET /users/classes/:class_id/students` - List students in section
- `GET /users/students/:student_id` - Get student details
- `POST /users/students` - Add new student
- `DELETE /users/students/:student_id` - Delete student
- `PATCH /users/students/:student_id/transfer` - Transfer student to different section

**Access**: Principal/Coordinator only

---

## 🔐 Authentication

All API endpoints (except login endpoints) require authentication using JWT Bearer tokens.

### Request Headers
```http
Authorization: Bearer <access_token>
```

### Token Types
- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access tokens

### Token Refresh Flow
```
Access token expires
      ↓
POST /api/auth/refresh-token
with x-refresh-token header
      ↓
Receive new access token
      ↓
Continue making API calls
```

---

## 👥 Role-Based Access Control

### Roles
1. **Student** - Can view their data, submit requests
2. **Teacher** - Can manage classes, mark attendance, create homework
3. **Principal/Coordinator** - Full access to user management and school data

### Permission Matrix

| Feature | Student | Teacher | Principal |
|---------|---------|---------|-----------|
| View own data | ✅ | ✅ | ✅ |
| Submit leave | ✅ | ✅ | ✅ |
| Mark attendance | ❌ | ✅ | ✅ |
| Create homework | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View reports | ❌ | ❌ | ✅ |

---

## 📊 Data Types Reference

### Common Field Types

| Field Type | Example | Description |
|------------|---------|-------------|
| ObjectId | "507f1f77bcf86cd799439011" | MongoDB unique identifier (24 hex chars) |
| Number | 9876543210 | Numeric value (phone, roll number) |
| String | "John Doe" | Text value |
| Boolean | true / false | True or false value |
| ISO Date | "2024-01-15T10:30:00.000Z" | Date-time in ISO 8601 format |
| Date (YYYY-MM-DD) | "2024-01-15" | Date only format |
| Time (HH:MM) | "09:30" | 24-hour time format |
| Array | [1, 2, 3] | List of values |
| Object | {"key": "value"} | Key-value pairs |

---

## 🚀 Quick Start Guide

### 1. Authentication
```javascript
// Step 1: Send OTP
POST /api/auth/send-otp
Body: { "phone": 9876543210, "name": "John Doe" }

// Step 2: Verify OTP
POST /api/auth/verify-otp
Body: { "otp": "123456", "phone": 9876543210 }

// Response includes accessToken and refreshToken
// Use accessToken in Authorization header for all subsequent requests
```

### 2. Making Authenticated Requests
```javascript
GET /api/auth/me
Headers: {
  "Authorization": "Bearer <accessToken>"
}
```

### 3. Handling Token Expiry
```javascript
// When you get 401 error with "Access token expired"
POST /api/auth/refresh-token
Headers: {
  "x-refresh-token": "<refreshToken>"
}

// Use new accessToken for next requests
```

---

## 📝 Response Format Standards

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created successfully
- **400**: Bad request / validation error
- **401**: Unauthorized / authentication failed
- **403**: Forbidden / insufficient permissions
- **404**: Resource not found
- **500**: Internal server error

---

## 🐛 Error Handling

### Common Errors

#### Authentication Errors
```json
{
  "message": "Authorization header missing",
  "statusCode": 401
}
```

```json
{
  "message": "Access token expired",
  "statusCode": 401
}
```

#### Validation Errors
```json
{
  "message": "Phone number is required",
  "statusCode": 400
}
```

#### Permission Errors
```json
{
  "success": false,
  "message": "Access denied.",
  "statusCode": 403
}
```

---

## 💡 Best Practices

### 1. Phone Number Format
- Use 10-digit numbers: `9876543210`
- No country code, spaces, or special characters

### 2. Date Handling
- **Dates**: Use "YYYY-MM-DD" format
- **Date-Time**: Use ISO 8601 format
- **Time**: Use "HH:MM" 24-hour format

### 3. Request Body
- Always send `Content-Type: application/json`
- Validate data before sending
- Use exact field names (case-sensitive)

### 4. Error Handling
- Always check response status codes
- Handle 401 errors with token refresh
- Display user-friendly error messages

### 5. Security
- Never expose tokens in URLs or logs
- Use HTTPS in production
- Store refresh tokens securely (HttpOnly cookies recommended)
- Implement token rotation for better security

---

## 🔄 Data Flow Examples

### Student Leave Request Flow
```
Student submits leave request
        ↓
POST /api/leave/request
Status: "Pending"
        ↓
Teacher views requests
GET /api/leave/requests
        ↓
Teacher approves/rejects
PATCH /api/leave/approve/:reqid
        ↓
Status: "Approved" or "Rejected"
        ↓
Student checks history
GET /api/leave/history
```

### Attendance Marking Flow
```
Teacher selects class
        ↓
GET /api/attendance/class/:classid
(View current attendance)
        ↓
Teacher marks attendance
        ↓
POST /api/attendance/save
        ↓
Students/parents can view
GET /api/attendance/student/:id
```

---

## 📅 Version History

- **v1.0** (Current) - Initial release with core functionality
  - Authentication system
  - User management (Teachers, Students)
  - Attendance tracking
  - Homework management
  - Leave management
  - Timetable management
  - Announcement system
  - Principal dashboard

---

## 🚧 Known Limitations & Planned Features

### Current Limitations
1. Student homework submission not implemented
2. Student doubt submission not implemented
3. File upload functionality pending
4. Bulk operations not available
5. Advanced reporting not implemented

### Planned Features
1. File/image upload for homework and doubts
2. Student-side homework and doubt submission
3. Bulk student/teacher import via CSV
4. Advanced analytics and reports
5. Notification system
6. Parent portal
7. Exam management module
8. Fee management module

---

## 📞 Support

For issues or questions:
1. Check the specific API manual for detailed information
2. Review the ERROR_REPORT.md file for known issues and fixes
3. Verify authentication tokens are valid
4. Check request body format matches examples
5. Ensure correct role/permissions for the endpoint

---

## 📖 Additional Resources

- **ERROR_REPORT.md** - Comprehensive list of bugs found and fixes applied
- **package.json** - List of dependencies
- **Models** - Database schema definitions in `/models` directory
- **Services** - Business logic in `/services` directory

---

**Last Updated**: 2026-01-15  
**API Version**: 1.0  
**Backend Framework**: Express.js + MongoDB (Mongoose)
