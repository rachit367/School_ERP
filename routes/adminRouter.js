const express = require('express');
const router = express.Router();
const {
    showLoginPage,
    login,
    logout,
    showDashboard,
    showSchools,
    showSchoolDetails,
    showCreateSchool,
    createSchool,
    showEditSchool,
    updateSchool,
    deleteSchool,
    showClasses,
    showClassDetails,
    showCreateClass,
    createClass,
    showEditClass,
    updateClass,
    deleteClass,
    showTeachers,
    showAllTeachers,
    showCreateTeacher,
    createTeacher,
    showEditTeacher,
    updateTeacher,
    deleteTeacher,
    showStudents,
    showAllStudents,
    showCreateStudent,
    createStudent,
    showEditStudent,
    updateStudent,
    deleteStudent,
    showCreatePrincipal,
    createPrincipal,
    showEditPrincipal,
    updatePrincipal,
    deletePrincipal,
    showBulkOperations,
    bulkCreateStudents,
    bulkCreateTeachers,
    bulkDeleteStudents,
    bulkDeleteTeachers,
    showPromoteStudents,
    promoteStudents,
    promoteAllClasses,
    showHardReset,
    hardReset,
    search
} = require('../controllers/adminController');
const { isAdminAuthenticated, isAdminLoggedIn } = require('../middlewares/adminAuth');

// ==================== AUTH ROUTES ====================
router.get('/login', isAdminLoggedIn, showLoginPage);
router.post('/login', isAdminLoggedIn, login);
router.get('/logout', logout);

// ==================== PROTECTED ROUTES ====================
// All routes below require authentication
router.use(isAdminAuthenticated);

// Dashboard
router.get('/', (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', showDashboard);

// Search API
router.get('/api/search', search);

// ==================== GLOBAL LISTS ROUTES ====================
router.get('/students', showAllStudents);
router.get('/teachers', showAllTeachers);

// ==================== SCHOOL ROUTES ====================
router.get('/schools', showSchools);
router.get('/schools/new', showCreateSchool);
router.post('/schools', createSchool);
router.get('/schools/:schoolId', showSchoolDetails);
router.get('/schools/:schoolId/edit', showEditSchool);
router.post('/schools/:schoolId', updateSchool);
router.post('/schools/:schoolId/delete', deleteSchool);

// ==================== CLASS ROUTES ====================
router.get('/schools/:schoolId/classes', showClasses);
router.get('/schools/:schoolId/classes/new', showCreateClass);
router.post('/schools/:schoolId/classes', createClass);
router.get('/schools/:schoolId/classes/:classId', showClassDetails);
router.get('/schools/:schoolId/classes/:classId/edit', showEditClass);
router.post('/schools/:schoolId/classes/:classId', updateClass);
router.post('/schools/:schoolId/classes/:classId/delete', deleteClass);

// ==================== TEACHER ROUTES ====================
router.get('/schools/:schoolId/teachers', showTeachers);
router.get('/schools/:schoolId/teachers/new', showCreateTeacher);
router.post('/schools/:schoolId/teachers', createTeacher);
router.get('/schools/:schoolId/teachers/:teacherId/edit', showEditTeacher);
router.post('/schools/:schoolId/teachers/:teacherId', updateTeacher);
router.post('/schools/:schoolId/teachers/:teacherId/delete', deleteTeacher);
router.post('/schools/:schoolId/teachers/bulk-delete', bulkDeleteTeachers);

// ==================== STUDENT ROUTES ====================
router.get('/schools/:schoolId/students', showStudents);
router.get('/schools/:schoolId/students/new', showCreateStudent);
router.post('/schools/:schoolId/students', createStudent);
router.get('/schools/:schoolId/students/:studentId/edit', showEditStudent);
router.post('/schools/:schoolId/students/:studentId', updateStudent);
router.post('/schools/:schoolId/students/:studentId/delete', deleteStudent);
router.post('/schools/:schoolId/students/bulk-delete', bulkDeleteStudents);

// ==================== PRINCIPAL ROUTES ====================
router.get('/schools/:schoolId/principal/new', showCreatePrincipal);
router.post('/schools/:schoolId/principal', createPrincipal);
router.get('/schools/:schoolId/principal/:principalId/edit', showEditPrincipal);
router.post('/schools/:schoolId/principal/:principalId', updatePrincipal);
router.post('/schools/:schoolId/principal/:principalId/delete', deletePrincipal);

// ==================== BULK OPERATIONS ROUTES ====================
router.get('/schools/:schoolId/bulk', showBulkOperations);
router.post('/schools/:schoolId/bulk/students', bulkCreateStudents);
router.post('/schools/:schoolId/bulk/teachers', bulkCreateTeachers);

// ==================== PROMOTE ROUTES ====================
router.get('/schools/:schoolId/promote', showPromoteStudents);
router.post('/schools/:schoolId/promote', promoteStudents);
router.post('/schools/:schoolId/promote/all', promoteAllClasses);

// ==================== HARD RESET ROUTES ====================
router.get('/reset', showHardReset);
router.post('/reset', hardReset);

module.exports = router;
