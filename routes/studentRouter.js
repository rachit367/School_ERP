const express=require('express')
const router=express.Router()

const {authenticateToken}=require('./../middlewares/authenticateToken')
const{
    getAllSubjects,
    getResources
}=require('./../controllers/studentController')

router.use(authenticateToken)

//req:   //res:[{subject,teacher,teacher_id,_id}]
router.get('/subjects',getAllSubjects)

//req:subject_id  //res:_id,resources[]
router.get('/subjects/resource',getResources)

module.exports=router