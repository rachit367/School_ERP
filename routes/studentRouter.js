const express=require('express')
const router=express.Router()

const {authenticateToken}=require('./../middlewares/authenticateToken')
const{
    getAllSubjects,
    getResources,
    getDoubts
}=require('./../controllers/studentController')

router.use(authenticateToken)

//req:   //res:[{subject,teacher,teacher_id,_id}]
router.get('/subjects',getAllSubjects)

//req:subject_id  //res:_id,resources[]
router.get('/subjects/resource',getResources)

//req:  //res:{subject, doubt ,createdAt}
router.get('/subjects/doubts',getDoubts)   //gives only oldest 3 doubts

module.exports=router