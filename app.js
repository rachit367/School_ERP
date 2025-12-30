require("dotenv").config()
const cors=require('cors')
const {connectDB}=require('./config/db')
const express=require('express')
const app=express()
const errorHandling=require('./middlewares/errorHandling')
const allowedOrigins=process.env.ALLOWED_ORIGINS.split(',')
const authRouter=require('./routes/authRouter')
const announcementRouter=require('./routes/announcementRouter')
const principalUserRouter=require('./routes/principalUserRouter')
const principalDashboardRouter=require('./routes/principalDashboardRouter')
const attendanceRouter=require('./routes/attendanceRouter')
const homeworkRouter=require('./routes/homeworkRouter')

connectDB()

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); 
    } else {
      callback(new Error("Not allowed by CORS")); 
    }
  },
  credentials: true
}));
//app.use(cors({origin:allowedOrigins}))  //DEPLOYMENT

app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use('/api/auth',authRouter)
app.use('/api/announcement',announcementRouter)

app.use('/api/principal',principalUserRouter)
app.use('/api/principal/dashboard',principalDashboardRouter)

app.use('/api/attendance',attendanceRouter)
app.use('/api/homework',homeworkRouter)

app.use('/api/teacher')

app.use(errorHandling)


module.exports={app}