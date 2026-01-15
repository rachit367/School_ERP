const express=require('express')
const router=express.Router()
const {authenticateToken}=require('../middlewares/authenticateToken')
const {
    getStats,
    getAllBullyReports,
    deleteBullyReport,
    markBullyReport
}=require('../controllers/principalController')

router.use(authenticateToken)

// req: school_id  // res: { total_students, total_teachers, total_absents, [class_name]: { [section]: { attendance, class_teacher } } }
router.get('/stats',getStats)

//req:    //res:bully_name,status,description,reported_by.name,bully_class
router.get('/bully',getAllBullyReports)

//req:report_id   //res:success  
router.patch('/bully/:id',markBullyReport)

//req:report_id   //res:success  
router.delete('/bully/:id',deleteBullyReport)


module.exports=router