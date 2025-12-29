const express=require('express')
const router=express.Router()
const { authenticateToken } = require('../middlewares/authenticateToken');

const {
    getAllHomeworks,
    getHomeworkDetails,
    postHomework
}=require('./../controllers/homeworkController')

router.use(authenticateToken)

// req:  // res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission }]
router.get('/homework',getAllHomeworks)

// req: homework_id  // res: { id, topic, description, class_name, section, due_date, total_students, total_submission, submitted_by[] }
router.get('/homework/:id',getHomeworkDetails)

//req: Class,topic,description,due_date  //res:success,message
router.post('/homework',postHomework)


module.exports=router