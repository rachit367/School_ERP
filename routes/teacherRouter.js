const express=require('express')
const router=express.Router()
const {getTeacherClasses}=require('./../controllers/teacherController')
const {authenticateToken}=require('./../middlewares/authenticateToken')

router.use(authenticateToken)

router.get('/assigned-classes',getTeacherClasses)

module.exports=router