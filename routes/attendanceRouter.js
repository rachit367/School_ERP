const express=require('express')
const router=express.Router()
const {
    checkAllowedClass,
    getClassAttendance,
    saveDailyAttendance,
    assignSubstituteTeacher,
    removeSubstituteTeacher,
    getStudentAttendance,
    getOverallAttendance
}=require('./../controllers/attendanceController')


const { authenticateToken } = require('./../middlewares/authenticateToken');
router.use(authenticateToken);

//req:from_date,to_date,student_id  //res:{name,roll_number,{date:status},attendance_percentage,present,absent}
router.get('/student/:id',getStudentAttendance)     //date in YYYY-MM-DD

//req:student_id    //res:P,A,L,overall,total_classes
router.get('/overall',getOverallAttendance)   //for student

//req:class_id // res: allowed(true or false)
router.get('/allowed-class/:id',checkAllowedClass)

// req: class_id  // res: {total_class_attendance_percentage,total_present,total_absent,todays_percentage,students:[{student_id,name,roll_number,attendance_percentage,today_attendance}]}
router.get('/class/:classid',getClassAttendance)

//req:{class_id,attendance:[student_id,status]}  //res:success,message     status:P,A only
router.post('/save',saveDailyAttendance)

//req:school_id,substitute_id   //res:success,message
router.post('/substitute',assignSubstituteTeacher)  //only class teacehr can assign substitute teacher for attendance

//req:school_id,substitute_id   //res:success,message
router.delete('/substitute',removeSubstituteTeacher) //only class teacehr can remove substitute teacher 



module.exports=router