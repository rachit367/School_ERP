const express=require('express')
const router=express.Router()
const { authenticateToken } = require('../middlewares/authenticateToken');

const {
    getAllHomeworks,
    getHomeworkDetails,
    postHomework,
    getClassHomework
}=require('./../controllers/homeworkController')

router.use(authenticateToken)

// req:  // res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission }]
router.get('/',getAllHomeworks)

//req:classId //res:res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission }]
router.get('/class/:classId',getClassHomework)

// req: homework_id  // res: { id, topic, description, class_name, section, due_date, total_students, total_submission, submitted_by[] }
router.get('/:id',getHomeworkDetails)

//req: Class,topic,description,due_date  //res:success,message
router.post('/',postHomework)



module.exports=router