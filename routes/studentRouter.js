const express=require('express')
const router=express.Router()

const {authenticateToken}=require('./../middlewares/authenticateToken')
const{
    getAllSubjects
}=require('./../controllers/studentController')

router.use(authenticateToken)

//req:   //res:[{subject,teacher}]
router.get('/subjects',getAllSubjects)



module.exports=router