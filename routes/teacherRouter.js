const express=require('express')
const router=express.Router()

const {authenticateToken}=require('./../middlewares/authenticateToken')
const {isTeacher}=require('./../middlewares/isTeacher')

const {
    getTeacherClasses,
    getInsights
}=require('./../controllers/teacherController')


router.use(authenticateToken)
router.use(isTeacher)

//======================DASHBOARD=================

router.get('/insights',getInsights)

//======================CLASSES=================

//res:[{id,class_name,section,total_students,class_teacher_name}]
router.get('/assigned-classes',getTeacherClasses)

module.exports=router