# Authentication API Manual

## Base URL
`/api/auth`

## Authentication
Most endpoints require authentication via Bearer token in the Authorization header (except login endpoints).

---

## Endpoints

### 1. Send OTP
Send OTP to user's phone number for authentication.

**Endpoint**: `POST /api/auth/send-otp`

**Authentication Required**: No

**Request Body**:
```json
{
  "phone": 9876543210,
  "name": "John Doe"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone | Number (10 digits) | Yes | User's phone number |
| name | String | Yes | User's full name (case-insensitive, will be capitalized) |

**Success Response** (200):
```json
{
  "statusCode": 200,
  "message": "OTP sent successfully"
}
```

**Error Response** (401):
```json
{
  "statusCode": 401,
  "message": "User not found"
}
```

---

### 2. Verify OTP
Verify the OTP and get authentication tokens.

**Endpoint**: `POST /api/auth/verify-otp`

**Authentication Required**: No

**Request Body**:
```json
{
  "otp": "123456",
  "phone": 9876543210
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| otp | String | Yes | 6-digit OTP received on phone |
| phone | Number (10 digits) | Yes | User's phone number |

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP verified",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": 9876543210,
    "email": "john@example.com",
    "role": "Student",
    "school_id": "507f1f77bcf86cd799439012",
    "studentProfile": {...},
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

OR

```json
{
  "success": false,
  "message": "OTP not found or expired"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether verification was successful |
| message | String | Status message |
| accessToken | String | JWT token for API authentication (expires in 15min) |
| refreshToken | String | Token to refresh access token (expires in 7 days) |
| user | Object | Complete user profile object |
| user._id | String (ObjectId) | User's unique identifier |
| user.name | String | User's full name |
| user.phone | Number | User's phone number |
| user.email | String | User's email (optional) |
| user.role | String | User's role (Student/Teacher/Principal/Coordinator) |
| user.school_id | String (ObjectId) | School identifier |

---

### 3. Refresh Access Token
Get a new access token using refresh token.

**Endpoint**: `POST /api/auth/refresh-token`

**Authentication Required**: No (but requires refresh token)

**Request Headers**:
```
x-refresh-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| x-refresh-token | String | Yes | Refresh token received from verify-otp |

**Success Response** (200):
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| success | Boolean | Whether token refresh was successful |
| accessToken | String | New JWT access token |

**Error Response** (401):
```json
{
  "message": "Refresh token missing"
}
```

OR

```json
{
  "message": "Invalid or expired refresh token"
}
```

---

### 4. Get User Details
Get currently authenticated user's profile.

**Endpoint**: `GET /api/auth/me`

**Authentication Required**: Yes

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "phone": 9876543210,
  "email": "john@example.com",
  "role": "Student",
  "school_id": "507f1f77bcf86cd799439012",
  "date_of_birth": "2010-05-15T00:00:00.000Z",
  "studentProfile": {
    "father_name": "Richard Doe",
    "mother_name": "Jane Doe",
    "father_email": "richard@example.com",
    "father_number": 9876543211,
    "mother_number": 9876543212,
    "mother_email": "jane@example.com",
    "guardian_name": "Richard Doe",
    "guardian_email": "richard@example.com",
    "guardian_number": 9876543211,
    "class_id": "507f1f77bcf86cd799439013",
    "roll_number": "101",
    "total_presents": 145,
    "total_absents": 5
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| _id | String (ObjectId) | User's unique identifier |
| name | String | User's full name |
| phone | Number | User's phone number |
| email | String | User's email |
| role | String | User's role (Student/Teacher/Principal/Coordinator) |
| school_id | String (ObjectId) | School identifier |
| date_of_birth | String (ISO Date) | User's date of birth |
| studentProfile | Object | Student-specific data (only for Students) |
| teacherProfile | Object | Teacher-specific data (only for Teachers) |
| createdAt | String (ISO Date) | Account creation timestamp |
| updatedAt | String (ISO Date) | Last update timestamp |

**Error Response** (401):
```json
{
  "message": "Access token expired"
}
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "message": "Authorization header missing"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message details"
}
```

---

## Notes

1. **Token Management**:
   - Access tokens expire after 15 minutes
   - Refresh tokens expire after 7 days
   - Use the refresh token to get new access tokens without re-login

2. **Phone Number Format**:
   - Must be a 10-digit number without spaces or special characters
   - Example: 9876543210 (not "+91 9876543210")

3. **OTP Validity**:
   - OTP is valid for 5 minutes
   - Generate a new OTP if expired

4. **Security**:
   - Always use HTTPS in production
   - Store tokens securely (HttpOnly cookies recommended)
   - Never expose refresh tokens in client-side storage
