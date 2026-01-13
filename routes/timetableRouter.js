const express=require('express')
const router=express.Router()

const{
  allowedEditTimetable,
  addPeriod,
  deletePeriod,
  studentTimetable,
  teacherTimetable
}=require('../controllers/timetableController')
const {authenticateToken}=require('../middlewares/authenticateToken')
const {isTeacher}=require('./../middlewares/isTeacher')

router.use(authenticateToken)

//req:user_id,class_id,school_id  //res:success
router.get('/allowed',allowedEditTimetable,isTeacher)

//req:school_id,class_id,day,subject,start,end,teacher_id,location  //res:success
router.post('/add-period',addPeriod,isTeacher)

//req:school_id,class_id,day,period_id  //res:success
router.delete('/delete-period',deletePeriod,isTeacher)

// req: teacher_id, school_id  // res: [{ day, periods:[{_id,class_name,section,subject,start,end,location}] }]
router.get('/teacher',teacherTimetable,isTeacher)


//req:class_id,school_id,  // res: [{ day, periods:[{_id,start,end,teacher_name,location,subject}] }]
router.get('/class',studentTimetable)

module.exports=router