const express = require('express');
const router = express.Router();
const {blockTeacherAndStudent}=require('./../middlewares/blockTeacherAndStudent')
const {
    getSchoolAnnouncements,
    getClassAnnouncements,
    createAnnouncement,
    getAnnouncementById,
    deleteAnnouncement,
    assignTeacher,
    removeTeacher
} = require('./../controllers/announcementController');

const { authenticateToken } = require('./../middlewares/authenticateToken');

// Protect ALL routes
router.use(authenticateToken);

//req:   //res: [{_id, message, title, createdAt}]
// FOR PRINCIPAL + TEACHER
router.get('/school', getSchoolAnnouncements);

// req:  //res:[{title, message, createdAt, _id}]
// FOR STUDENTS (class + school-wide announcements)
router.get('/class', getClassAnnouncements);

// req: topic, school:[true/false], class:[], description
// res: { success:true }
// CREATE ANNOUNCEMENT
router.post('/create', createAnnouncement);

// req: _id  
// res: title, created_by, createdAt, description
router.get('/:id', getAnnouncementById);
// req: _id  
// res: {success:true}
router.delete('/:id', deleteAnnouncement);

//req:teacher_id  //res:success
router.post('/assignteacher/:id',blockTeacherAndStudent,assignTeacher)

//req:teacher_id  //res:success
router.post('/removeteacher/:id',blockTeacherAndStudent,removeTeacher)

module.exports = router;
