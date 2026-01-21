const express=require('express')
const router=express.Router()
const { authenticateToken } = require('../middlewares/authenticateToken');
const {isTeacher}=require('./../middlewares/isTeacher')
const {
    getAllHomeworks,
    getHomeworkDetails,
    postHomework,
    getClassHomework,
    getSubjectHomeworks,
    submitHomework,
    getStudentHomeworkDetails
}=require('./../controllers/homeworkController')

router.use(authenticateToken)

//=========================TEACHER======================

// req:  // res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission }]
router.get('/',isTeacher,getAllHomeworks)

//req:classid //res:res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission }]
router.get('/class/:classid',isTeacher,getClassHomework)

// req: homework_id  // res: { id, topic, description, class_name, section, due_date, total_students, total_submission, submitted_by[] }
router.get('/:id',isTeacher,getHomeworkDetails)

//req: Class,topic,description,due_date  //res:success,message
router.post('/',isTeacher,postHomework)

//========================STUDENT==========================

//req:class_id,teacher_id  //res:{completed,pending,submitted}-each is an array of {_id,topic,description,attachments,deadline}
router.get('/student',getSubjectHomeworks)

router.get('/student/:homeworkid',getStudentHomeworkDetails)

//req:homework_id  //res:success
router.post('/submit',submitHomework)



module.exports=router