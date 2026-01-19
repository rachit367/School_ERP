const express=require('express')
const router=express.Router()

const {authenticateToken}=require('./../middlewares/authenticateToken')
const{
    getAllSubjects
}=require('./../controllers/studentController')

router.use(authenticateToken)

//req:   //res:[{subject,teacher,teacher_id}]
router.get('/subjects',getAllSubjects)



module.exports=router