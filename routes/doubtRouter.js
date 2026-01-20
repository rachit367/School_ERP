const express=require('express')
const router=express.Router()

const {authenticateToken}=require('./../middlewares/authenticateToken')
const {isTeacher}=require('./../middlewares/isTeacher')

const {
    getDoubts,
    updateDoubt,
    getSubjectDoubt,
    postDoubt,
    getDoubtDetails
}=require('./../controllers/doubtController')

router.use(authenticateToken)

//=============TEACHER=============

//req:  //res:[{_id,student_name,subject,class_name,section,doubt,status}]
router.get('/',isTeacher,getDoubts)

//req:user_id,doubt_id //res:success
router.patch('/:id',isTeacher,updateDoubt) //send empty reply(in body) to mark doubt as resolved

//==============Student==============

//req:teacher_id  //res:[{_id,subject,doubt,reply,replied_at,status}]
router.get('/subject',getSubjectDoubt)

//req:doubt_id //res:teacher_name,doubt,reply,replied_at
router.get('/:id',getDoubtDetails)

//req:class_id,teacher_id,subject,doubt  //res:success
router.post('/subject',postDoubt)

module.exports=router