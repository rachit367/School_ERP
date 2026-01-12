const express=require('express')
const router=express.Router()
const {authenticateToken}=require('./../middlewares/authenticateToken')
const {getStats}=require('./../controllers/principalDashboardController')

router.use(authenticateToken)

// req: school_id  // res: { total_students, total_teachers, total_absents, [class_name]: { [section]: { attendance, class_teacher } } }
router.get('/stats',getStats)

module.exports=router