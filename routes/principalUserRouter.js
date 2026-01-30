const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authenticateToken');
const {getAllTeachers,getTeacher,deleteTeacher,createTeacher,updateTeacher}=require('../controllers/userTeacherController');
const {
    getClasses,
    getSections,
    getStudentsInSection,
    getStudentDetails,
    addStudent,
    deleteStudent,
    transferStudent
} = require('../controllers/userStudentController');

router.use(authenticateToken);

//req:  //res: [{ _id, name, role, designation, subjects, classes_assigned:[],announcement_allowed }]
router.get('/users/teachers',getAllTeachers)

// req: teacher_id  //res: {_id, name, phone, email, employee_id, designation, subjects, class_teacher_of, classes_assigned }
router.get('/users/teachers/:id',getTeacher)

//req:teacher_id  //res:{success}
router.delete('/users/teachers/:id',deleteTeacher)

//req:name,email,phone,role,employee_id,class_teacher_of,subjects  //res:{success,message}
router.post('/users/teachers',createTeacher)    

// req: teacher_id, { class_teacher_of, subjects }  // res: { success, message }
router.put('/users/teachers/:id',updateTeacher)  //optional fields are there


// ===================== CLASSES =====================

// req: school_id
// res: [{ class_name:total_students,total_sections ,[section]:{class_id,class_teacher_name,students}}]
router.get('/users/classes', getClasses);

// req: class_name,school_id
// res: [{ section, class_teacher, total_students, _id }]
router.get('/users/classes/:class_name/sections', getSections);



// ===================== STUDENTS =====================

// req: class_id
// res: [{ _id, name, roll_number }]
router.get('/users/classes/:class_id/students', getStudentsInSection);

// req: student_id
// res: { student_id, name, number, attendance, class, section, ... }
router.get('/users/students/:student_id', getStudentDetails);

// req: name, class_name, section, dob, roll_number, parent details, email, phone
// res: { success }
router.post('/users/students', addStudent);

// req: student_id
// res: { success }
router.delete('/users/students/:student_id', deleteStudent);

// req: student_id, class_id(in which  student to be transfered)
// res: { success }
router.patch('/users/students/:student_id/transfer', transferStudent); 


module.exports=router