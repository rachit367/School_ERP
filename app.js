require("dotenv").config({ path: require('path').join(__dirname, '.env') })
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const expressLayouts = require('express-ejs-layouts')
const { connectDB } = require('./config/db')
const express = require('express')
const app = express()

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000']

const errorHandling = require('./middlewares/errorHandling')
const authRouter = require('./routes/authRouter')
const announcementRouter = require('./routes/announcementRouter')
const principalUserRouter = require('./routes/principalUserRouter')
const principalRouter = require('./routes/principalRouter')
const attendanceRouter = require('./routes/attendanceRouter')
const homeworkRouter = require('./routes/homeworkRouter')
const teacherRouter = require('./routes/teacherRouter')
const timetableRouter = require('./routes/timetableRouter')
const leaveRouter = require('./routes/leaveRouter')
const doubtRouter = require('./routes/doubtRouter')
const studentRouter = require('./routes/studentRouter')
const adminRouter = require('./routes/adminRouter')

// Initialize Admin Service to create default admin
const { handleCreateDefaultAdmin } = require('./services/adminService')

connectDB().then(() => {
  // Create default super admin if not exists
  handleCreateDefaultAdmin().catch(console.error)
})

// Set up EJS as view engine for Admin Panel
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts)
app.set('layout', 'admin/layout')
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)


app.use(cors({
  origin: '*'
}));


app.use(cookieParser())

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ADMIN PANEL ROUTES (EJS) ====================
app.use('/admin', adminRouter)

// ==================== API ROUTES ====================
app.use('/api/auth', authRouter)

app.use('/api/principal', principalUserRouter)
app.use('/api/principal/dashboard', principalRouter)

app.use('/api/teacher', teacherRouter)
app.use('/api/student', studentRouter)



app.use('/api/announcement', announcementRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/homework', homeworkRouter)
app.use('/api/timetable', timetableRouter)
app.use('/api/leave', leaveRouter)
app.use('/api/doubt', doubtRouter)


app.use(errorHandling)


module.exports = { app }