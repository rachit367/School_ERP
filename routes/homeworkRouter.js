const express=require('express')
const router=express.Router()
const { authenticateToken } = require('../middlewares/authenticateToken');
const {isTeacher}=require('./../middlewares/isTeacher')
const {
    getAllHomeworks,
    getHomeworkDetails,
    postHomework,
    getClassHomework
}=require('./../controllers/homeworkController')

router.use(authenticateToken)

//=========================TEACHER======================

// req:  // res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission }]
router.get('/',isTeacher,getAllHomeworks)

//req:classId //res:res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission }]
router.get('/class/:classId',isTeacher,getClassHomework)

// req: homework_id  // res: { id, topic, description, class_name, section, due_date, total_students, total_submission, submitted_by[] }
router.get('/:id',isTeacher,getHomeworkDetails)

//req: Class,topic,description,due_date  //res:success,message
router.post('/',isTeacher,postHomework)

//========================STUDENT==========================



module.exports=router