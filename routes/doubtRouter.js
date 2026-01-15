const express=require('express')
const router=express.Router()

const {authenticateToken}=require('./../middlewares/authenticateToken')
const {isTeacher}=require('./../middlewares/isTeacher')

const {
    getDoubts,
    updateDoubt
}=require('./../controllers/doubtController')

router.use(authenticateToken)
router.use(isTeacher)

//req:user_id
router.get('/doubt',getDoubts)

//req:user_id,doubt_id //res:success
router.patch('/doubt/:id',updateDoubt) //send empty reply(in body) to mark doubt as resolved

module.exports=router