const express=require('express')
const router=express.Router()
const {
    checkAllowedClass,
    getClassAttendance,
    saveDailyAttendance,
    assignSubstituteTeacher,
    removeSubstituteTeacher,
    getStudentAttendance
}=require('./../controllers/attendanceController')


const { authenticateToken } = require('./../middlewares/authenticateToken');
router.use(authenticateToken);

//req:from_date,to_date,student_id  //res:{name,roll_number,{date:status},attendance_percentage,present,absent}
router.get('/student/:id',getStudentAttendance)     //date in YYYY-MM-DD

//req:class_id // res: allowed(true or false)
router.get('/allowed-class/:id',checkAllowedClass)

//req:classid  //res:{payload-{student_id,name,roll_number,attendance_percent,todays_status}}
router.get('/class/:classid',getClassAttendance)

//req:class_id,attendance  //res:success,message
router.post('/save',saveDailyAttendance)

//req:school_id,substitute_id   //res:success,message
router.post('/substitute',assignSubstituteTeacher)  //only class teacehr can assign substitute teacher for attendance

//req:school_id,substitute_id   //res:success,message
router.delete('/substitute',removeSubstituteTeacher) //only class teacehr can remove substitute teacher 



module.exports=router