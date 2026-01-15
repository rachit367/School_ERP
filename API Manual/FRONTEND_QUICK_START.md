# Frontend Integration - Quick Reference Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Authentication Flow
```javascript
// 1. Send OTP
fetch('http://your-api-url/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: 9876543210,  // Number, not string
    name: "John Doe"
  })
});

// 2. Verify OTP
const response = await fetch('http://your-api-url/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    otp: "123456",
    phone: 9876543210
  })
});

const { accessToken, refreshToken, user } = await response.json();
// Save these tokens!
```

### Step 2: Making Authenticated Requests
```javascript
const response = await fetch('http://your-api-url/api/endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Step 3: Handle Token Expiry
```javascript
async function refreshAccessToken() {
  const response = await fetch('http://your-api-url/api/auth/refresh-token', {
    method: 'POST',
    headers: {
      'x-refresh-token': refreshToken
    }
  });
  const { accessToken: newToken } = await response.json();
  return newToken;
}
```

---

## 📱 Common API Patterns

### Pattern 1: GET Request
```javascript
const getData = async (endpoint) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh and retry
    accessToken = await refreshAccessToken();
    return getData(endpoint);
  }
  
  return response.json();
};

// Usage
const teachers = await getData('/api/principal/users/teachers');
```

### Pattern 2: POST Request
```javascript
const postData = async (endpoint, data) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
};

// Usage
await postData('/api/homework', {
  Class: "507f1f77bcf86cd799439013",
  topic: "Math Assignment",
  description: "Complete chapter 5",
  due_date: "2024-01-20"
});
```

### Pattern 3: Query Parameters
```javascript
// For GET /api/attendance/student/:id?from_date=X&to_date=Y
const studentId = "507f1f77bcf86cd799439011";
const params = new URLSearchParams({
  from_date: "2024-01-01",
  to_date: "2024-01-31"
});

const attendance = await getData(`/api/attendance/student/${studentId}?${params}`);
```

---

## 🔑 Essential Data Types

### Phone Numbers
```javascript
// ✅ Correct
phone: 9876543210  // Number, 10 digits

// ❌ Wrong
phone: "9876543210"     // String
phone: "+919876543210"  // With country code
phone: 987-654-3210     // With dashes
```

### Dates
```javascript
// For date fields (e.g., dob, start_date)
date: "2024-01-15"  // YYYY-MM-DD

// For time fields (e.g., period start/end)
time: "09:30"  // HH:MM in 24-hour format
```

### ObjectIds
```javascript
// MongoDB ObjectId (24 hex characters)
_id: "507f1f77bcf86cd799439011"
```

### Booleans
```javascript
// Use actual boolean, not strings
school: true  // ✅
school: "true"  // ❌
```

---

## 👥 Role-Based UI Display

```javascript
// After login, check user.role
const { role } = user;

if (role === "Student") {
  // Show student dashboard
  // - Class announcements
  // - Own attendance
  // - Homework list
  // - Leave requests
}

if (role === "Teacher") {
  // Show teacher dashboard
  // - Assigned classes
  // - Mark attendance
  // - Create homework
  // - View doubts
  // - Approve leaves
}

if (role === "Principal" || role === "Coordinator") {
  // Show admin dashboard
  // - School stats
  // - Manage teachers
  // - Manage students
  // - Bully reports
}
```

---

## 📊 Common API Calls by Role

### Student APIs
```javascript
// Get class announcements
GET /api/announcement/class

// Get own attendance
GET /api/attendance/student/:id?from_date=X&to_date=Y

// Submit leave request
POST /api/leave/request
Body: { class_id, reason, start_date, end_date }

// View leave history
GET /api/leave/history

// Get class timetable
GET /api/timetable/class/:id
```

### Teacher APIs
```javascript
// Get assigned classes
GET /api/teacher/assigned-classes

// Get class attendance
GET /api/attendance/class/:classid

// Mark attendance
POST /api/attendance/save
Body: { class_id, attendance: [{student_id, status}] }

// Create homework
POST /api/homework
Body: { Class, topic, description, due_date }

// View doubts
GET /api/doubt

// Approve leave
PATCH /api/leave/approve/:reqid
```

### Principal APIs
```javascript
// Get school stats
GET /api/principal/dashboard/stats

// Get all teachers
GET /api/principal/users/teachers

// Add student
POST /api/principal/users/students
Body: { name, class_name, section, dob, ... }

// Get all classes
GET /api/principal/users/classes

// View bully reports
GET /api/principal/dashboard/bully
```

---

## ⚠️ Common Errors & Solutions

### Error 1: "Authorization header missing"
```javascript
// ❌ Wrong
fetch(url)

// ✅ Correct
fetch(url, {
  headers: { 'Authorization': `Bearer ${accessToken}` }
})
```

### Error 2: "Access token expired"
```javascript
// Implement auto-refresh
if (error.message === "Access token expired") {
  accessToken = await refreshAccessToken();
  // Retry the request
}
```

### Error 3: "Invalid OTP"
```javascript
// OTP is case-sensitive and expires in 5 minutes
// Always ensure user enters exactly what they received
```

### Error 4: "Attendance count mismatch"
```javascript
// Must send attendance for ALL students
// Get student list first, then send status for each
const students = await getData(`/api/attendance/class/${classId}`);
const attendance = students.students.map(s => ({
  student_id: s.student_id,
  status: "P" // or "A", "ML", "L"
}));
```

---

## 🎨 Sample UI Components

### Login Component
```javascript
function Login() {
  const [step, setStep] = useState(1); // 1=phone, 2=otp
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  
  const sendOtp = async () => {
    await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: Number(phone), name })
    });
    setStep(2);
  };
  
  const verifyOtp = async () => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, phone: Number(phone) })
    });
    const data = await res.json();
    // Save tokens and redirect
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  };
}
```

### Attendance Marking Component
```javascript
function AttendanceMark({ classId }) {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  
  useEffect(() => {
    // Load class students
    fetch(`/api/attendance/class/${classId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(r => r.json())
    .then(data => {
      setStudents(data.students);
      // Initialize with today's attendance or empty
      const initial = {};
      data.students.forEach(s => {
        initial[s.student_id] = s.today_attendance === "Not Marked" 
          ? "P" 
          : s.today_attendance;
      });
      setAttendance(initial);
    });
  }, [classId]);
  
  const saveAttendance = async () => {
    const attendanceArray = students.map(s => ({
      student_id: s.student_id,
      status: attendance[s.student_id]
    }));
    
    await fetch('/api/attendance/save', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        class_id: classId,
        attendance: attendanceArray
      })
    });
  };
  
  return (
    <div>
      {students.map(student => (
        <div key={student.student_id}>
          <span>{student.name} ({student.roll_number})</span>
          <select 
            value={attendance[student.student_id]}
            onChange={(e) => setAttendance({
              ...attendance,
              [student.student_id]: e.target.value
            })}
          >
            <option value="P">Present</option>
            <option value="A">Absent</option>
            <option value="ML">Medical Leave</option>
            <option value="L">Leave</option>
          </select>
        </div>
      ))}
      <button onClick={saveAttendance}>Save Attendance</button>
    </div>
  );
}
```

---

## 📦 Recommended State Management

```javascript
// Using React Context or Redux
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false
};

// Actions
const login = (user, accessToken, refreshToken) => ({
  type: 'LOGIN',
  payload: { user, accessToken, refreshToken }
});

const logout = () => ({
  type: 'LOGOUT'
});

// In your requests
const apiCall = async (endpoint, options = {}) => {
  const token = store.getState().accessToken;
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Auto refresh token
    const newToken = await refreshAccessToken();
    store.dispatch(updateToken(newToken));
    // Retry request
    return apiCall(endpoint, options);
  }
  
  return response.json();
};
```

---

## 🔒 Security Best Practices

### 1. Token Storage
```javascript
// ✅ Best: HttpOnly cookies (backend sets them)
// ✅ Good: localStorage for access token, httpOnly cookie for refresh
// ❌ Bad: localStorage for refresh token (XSS vulnerable)

// If using localStorage
localStorage.setItem('accessToken', token);  // OK for short-lived
// Never store sensitive data in plain text
```

### 2. Token Refresh
```javascript
// Implement token refresh BEFORE it expires
// Check token expiry and refresh 5 minutes before

const isTokenExpiringSoon = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiryTime = payload.exp * 1000;
  const currentTime = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  return expiryTime - currentTime < fiveMinutes;
};
```

### 3. Logout
```javascript
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  // Redirect to login
  window.location.href = '/login';
};
```

---

## 📚 Full Documentation

For complete API documentation with all endpoints, request/response formats, and examples:

**Read**: `API manuals/README.md`

Each API has detailed documentation in its own file:
- Authentication: `01_Authentication_API.md`
- Announcements: `02_Announcement_API.md`
- Attendance: `03_Attendance_API.md`
- Homework: `04_Homework_API.md`
- Leaves: `05_Leave_API.md`
- Doubts: `06_Doubt_API.md`
- Teacher: `07_Teacher_API.md`
- Timetable: `08_Timetable_API.md`
- Principal Dashboard: `09_Principal_Dashboard_API.md`
- User Management: `10_Principal_User_Management_API.md`

---

## 🐛 Known Issues

See `ERROR_REPORT.md` for:
- Fixed bugs (don't worry about these)
- Pending features (student homework submission, student doubt submission)
- Recommendations for future improvements

---

## ❓ FAQ

**Q: What's the base URL?**  
A: `http://localhost:PORT` for development. Check your `.env` file for PORT.

**Q: Phone number format?**  
A: 10-digit number (not string): `9876543210`

**Q: Date format?**  
A: "YYYY-MM-DD" for dates, "HH:MM" for times

**Q: How to handle 401 errors?**  
A: Refresh token first, then retry the request

**Q: Can students submit homework?**  
A: Not yet implemented. Check `04_Homework_API.md` for planned endpoints.

**Q: Where are the attendance status codes?**  
A: "P" (Present), "A" (Absent), "ML" (Medical Leave), "L" (Leave)

---

**Happy Coding! 🚀**
