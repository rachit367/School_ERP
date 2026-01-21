 const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdminAuthenticated, isAdminLoggedIn } = require('../middlewares/adminAuth');

// ==================== AUTH ROUTES ====================
router.get('/login', isAdminLoggedIn, adminController.showLoginPage);
router.post('/login', isAdminLoggedIn, adminController.login);
router.get('/logout', adminController.logout);

// ==================== PROTECTED ROUTES ====================
// All routes below require authentication
router.use(isAdminAuthenticated);

// Dashboard
router.get('/', (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', adminController.showDashboard);

// Search API
router.get('/api/search', adminController.search);

// ==================== SCHOOL ROUTES ====================
router.get('/schools', adminController.showSchools);
router.get('/schools/new', adminController.showCreateSchool);
router.post('/schools', adminController.createSchool);
router.get('/schools/:schoolId', adminController.showSchoolDetails);
router.get('/schools/:schoolId/edit', adminController.showEditSchool);
router.post('/schools/:schoolId', adminController.updateSchool);
router.post('/schools/:schoolId/delete', adminController.deleteSchool);

// ==================== CLASS ROUTES ====================
router.get('/schools/:schoolId/classes', adminController.showClasses);
router.get('/schools/:schoolId/classes/new', adminController.showCreateClass);
router.post('/schools/:schoolId/classes', adminController.createClass);
router.get('/schools/:schoolId/classes/:classId', adminController.showClassDetails);
router.get('/schools/:schoolId/classes/:classId/edit', adminController.showEditClass);
router.post('/schools/:schoolId/classes/:classId', adminController.updateClass);
router.post('/schools/:schoolId/classes/:classId/delete', adminController.deleteClass);

// ==================== TEACHER ROUTES ====================
router.get('/schools/:schoolId/teachers', adminController.showTeachers);
router.get('/schools/:schoolId/teachers/new', adminController.showCreateTeacher);
router.post('/schools/:schoolId/teachers', adminController.createTeacher);
router.get('/schools/:schoolId/teachers/:teacherId/edit', adminController.showEditTeacher);
router.post('/schools/:schoolId/teachers/:teacherId', adminController.updateTeacher);
router.post('/schools/:schoolId/teachers/:teacherId/delete', adminController.deleteTeacher);
router.post('/schools/:schoolId/teachers/bulk-delete', adminController.bulkDeleteTeachers);

// ==================== STUDENT ROUTES ====================
router.get('/schools/:schoolId/students', adminController.showStudents);
router.get('/schools/:schoolId/students/new', adminController.showCreateStudent);
router.post('/schools/:schoolId/students', adminController.createStudent);
router.get('/schools/:schoolId/students/:studentId/edit', adminController.showEditStudent);
router.post('/schools/:schoolId/students/:studentId', adminController.updateStudent);
router.post('/schools/:schoolId/students/:studentId/delete', adminController.deleteStudent);
router.post('/schools/:schoolId/students/bulk-delete', adminController.bulkDeleteStudents);

// ==================== PRINCIPAL ROUTES ====================
router.get('/schools/:schoolId/principal/new', adminController.showCreatePrincipal);
router.post('/schools/:schoolId/principal', adminController.createPrincipal);

// ==================== BULK OPERATIONS ROUTES ====================
router.get('/schools/:schoolId/bulk', adminController.showBulkOperations);
router.post('/schools/:schoolId/bulk/students', adminController.bulkCreateStudents);
router.post('/schools/:schoolId/bulk/teachers', adminController.bulkCreateTeachers);

// ==================== PROMOTE ROUTES ====================
router.get('/schools/:schoolId/promote', adminController.showPromoteStudents);
router.post('/schools/:schoolId/promote', adminController.promoteStudents);
router.post('/schools/:schoolId/promote/all', adminController.promoteAllClasses);

// ==================== HARD RESET ROUTES ====================
router.get('/reset', adminController.showHardReset);
router.post('/reset', adminController.hardReset);

module.exports = router;
