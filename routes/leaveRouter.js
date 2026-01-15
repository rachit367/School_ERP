const express=require('express')
const router=express.Router()
const {
    getLeaveHistory,
    getLeaveRequests,
    approveLeave,
    rejectLeave,
    MakeRequest
}=require('./../controllers/leaveController')
const {authenticateToken}=require('./../middlewares/authenticateToken');
const {isTeacher}=require('./../middlewares/isTeacher')

router.use(authenticateToken)

//req:school_id,user_id  //res:[{_id,status,reason,start_date,end_date}]
router.get('/history',getLeaveHistory)

//req:school_id,user_id  //res:[{_id,student_name,start_date,end_date,reason,status}]
router.get('/requests',isTeacher,getLeaveRequests)

//req:req_id //res:success
router.patch('/approve/:reqid',isTeacher,approveLeave)

//req:req_id //res:success
router.patch('/reject/:reqid',isTeacher,rejectLeave)

//req:school_id,student_id,class_id,reason,start_date,end_date  //res:success
router.post('/request',MakeRequest)

module.exports=router
