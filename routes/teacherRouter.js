const express=require('express')
const router=express.Router()

const {authenticateToken}=require('./../middlewares/authenticateToken')
const {isTeacher}=require('./../middlewares/isTeacher')

const {
    getTeacherClasses,
    getDoubts,
    updateDoubt
}=require('./../controllers/teacherController')


router.use(authenticateToken)
router.use(isTeacher)

//req: user_id  //res:[{id,class_name,section,total_students,class_teacher_name}]
router.get('/assigned-classes',getTeacherClasses)


//=====================DOUBT====================

//req:user_id
router.get('/doubt',getDoubts)

//req:user_id,doubt_id //res:success
router.patch('/doubt/:id',updateDoubt) //send empty reply(in body) to mark doubt as resolved

module.exports=router