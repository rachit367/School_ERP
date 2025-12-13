const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./../middlewares/authMiddleware');
const {getAllTeachers,getTeacher,deleteTeacher,createTeacher,updateTeacher}=require('../controllers/principalUserTeacherController');

router.use(authenticateToken);

//req:  //res: [{ _id, name, role, designation, subjects, classes_assigned }]
router.get('/users/teachers',getAllTeachers)

// req: teacher_id  //res: {_id, name, phone, email, employee_id, designation, subjects, class_teacher_of, classes_assigned }
router.get('/users/teachers/:id',getTeacher)

//req:teacher_id  //res:{success}
router.delete('/users/teachers/:id',deleteTeacher)

//req:name,email,role,employee_id,class_teacher_of,classes_assigned,subjects  //res:{success,message}
router.post('/users/teachers',createTeacher)

router.put('/users/teachers/:id',updateTeacher)

module.exports=router