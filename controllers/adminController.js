const {
    handleAuthenticateAdmin,
    handleGetDashboardStats,
    handleGetAllSchoolsWithStats,
    handleGetSchoolById,
    handleGetSchoolDetails,
    handleCreateSchool,
    handleUpdateSchool,
    handleDeleteSchool,
    handleGetClassById,
    handleGetClassDetails,
    handleCreateClass,
    handleUpdateClass,
    handleDeleteClass,
    handleGetClassesBySchool,
    handleGetTeacherById,
    handleCreateTeacher,
    handleUpdateTeacher,
    handleDeleteTeacher,
    handleGetTeachersBySchool,
    handleGetAllTeachersGlobal,
    handleGetAllStudentsGlobal,
    handleGetStudentById,
    handleCreateStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    handleGetStudentsBySchool,
    handleGetStudentsByClass,
    handleCreatePrincipal,
    handleUpdatePrincipal,
    handleDeletePrincipal,
    handleBulkCreateStudents,
    handleBulkCreateTeachers,
    handleBulkDeleteStudents,
    handleBulkDeleteTeachers,
    handlePromoteStudents,
    handlePromoteAllClasses,
    handleHardResetAcademicYear,
    handleSearchUsers
} = require('../services/adminService');
const { generateAdminToken } = require('../middlewares/adminAuth');

// ==================== AUTH CONTROLLERS ====================

async function showLoginPage(req, res) {
    res.render('admin/login', {
        title: 'Admin Login',
        error: null,
        layout: false
    });
}

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.render('admin/login', {
                title: 'Admin Login',
                error: 'Please provide username and password',
                layout: false
            });
        }

        const admin = await handleAuthenticateAdmin(username, password);
        const token = generateAdminToken(admin._id);

        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('admin/login', {
            title: 'Admin Login',
            error: error.message,
            layout: false
        });
    }
}

async function logout(req, res) {
    res.clearCookie('adminToken');
    res.redirect('/admin/login');
}

// ==================== DASHBOARD CONTROLLERS ====================

async function showDashboard(req, res, next) {
    try {
        const stats = await handleGetDashboardStats();
        const schools = await handleGetAllSchoolsWithStats();

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            stats,
            schools,
            admin: req.admin
        });
    } catch (error) {
        next(error);
    }
}

// ==================== SCHOOL CONTROLLERS ====================

async function showSchools(req, res, next) {
    try {
        const schools = await handleGetAllSchoolsWithStats();
        res.render('admin/schools/list', {
            title: 'Manage Schools',
            schools,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        next(error);
    }
}

async function showSchoolDetails(req, res, next) {
    try {
        const { schoolId } = req.params;
        const data = await handleGetSchoolDetails(schoolId);

        res.render('admin/schools/detail', {
            title: `${data.school.name} - Details`,
            ...data,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        next(error);
    }
}

async function showCreateSchool(req, res) {
    res.render('admin/schools/form', {
        title: 'Create School',
        school: null,
        isEdit: false
    });
}

async function createSchool(req, res, next) {
    try {
        const { name, address, principal_name, principal_phone, principal_email } = req.body;

        // Create the school first
        const school = await handleCreateSchool({ name, address });

        // Create the principal and link to school
        if (principal_name && principal_phone) {
            await handleCreatePrincipal({
                name: principal_name,
                phone: parseInt(principal_phone),
                email: principal_email || undefined,
                school_id: school._id
            });
        }

        res.redirect('/admin/schools?success=School and Principal created successfully');
    } catch (error) {
        res.render('admin/schools/form', {
            title: 'Create School',
            school: null,
            isEdit: false,
            error: error.message
        });
    }
}

async function showEditSchool(req, res, next) {
    try {
        const school = await handleGetSchoolById(req.params.schoolId);
        if (!school) {
            return res.redirect('/admin/schools?error=School not found');
        }
        res.render('admin/schools/form', {
            title: 'Edit School',
            school,
            isEdit: true
        });
    } catch (error) {
        res.redirect('/admin/schools?error=' + error.message);
    }
}

async function updateSchool(req, res, next) {
    try {
        const { name, address } = req.body;
        await handleUpdateSchool(req.params.schoolId, { name, address });
        res.redirect('/admin/schools?success=School updated successfully');
    } catch (error) {
        res.redirect('/admin/schools?error=' + error.message);
    }
}

async function deleteSchool(req, res, next) {
    try {
        await handleDeleteSchool(req.params.schoolId);
        res.redirect('/admin/schools?success=School deleted successfully');
    } catch (error) {
        res.redirect('/admin/schools?error=' + error.message);
    }
}

// ==================== CLASS CONTROLLERS ====================

async function showClasses(req, res, next) {
    try {
        const { schoolId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const classes = await handleGetClassesBySchool(schoolId);
        const teachers = await handleGetTeachersBySchool(schoolId);

        res.render('admin/classes/list', {
            title: 'Manage Classes',
            school,
            classes,
            teachers,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        next(error);
    }
}

async function showClassDetails(req, res, next) {
    try {
        const { classId } = req.params;
        const data = await handleGetClassDetails(classId);

        res.render('admin/classes/detail', {
            title: `Class ${data.classData.class_name}-${data.classData.section}`,
            ...data,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        next(error);
    }
}

async function showCreateClass(req, res, next) {
    try {
        const { schoolId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const teachers = await handleGetTeachersBySchool(schoolId);

        res.render('admin/classes/form', {
            title: 'Create Class',
            school,
            teachers,
            classData: null,
            isEdit: false
        });
    } catch (error) {
        next(error);
    }
}

async function createClass(req, res, next) {
    try {
        const { schoolId } = req.params;
        const { class_name, section, class_teacher } = req.body;

        await handleCreateClass({
            school_id: schoolId,
            class_name: parseInt(class_name),
            section,
            class_teacher: class_teacher || undefined
        });

        res.redirect(`/admin/schools/${schoolId}/classes?success=Class created successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/classes?error=${error.message}`);
    }
}

async function showEditClass(req, res, next) {
    try {
        const { schoolId, classId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const classData = await handleGetClassById(classId);
        const teachers = await handleGetTeachersBySchool(schoolId);

        res.render('admin/classes/form', {
            title: 'Edit Class',
            school,
            teachers,
            classData,
            isEdit: true
        });
    } catch (error) {
        next(error);
    }
}

async function updateClass(req, res, next) {
    try {
        const { schoolId, classId } = req.params;
        const { class_name, section, class_teacher } = req.body;

        await handleUpdateClass(classId, {
            class_name: parseInt(class_name),
            section,
            class_teacher: class_teacher || null
        });

        res.redirect(`/admin/schools/${schoolId}/classes?success=Class updated successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/classes?error=${error.message}`);
    }
}

async function deleteClass(req, res, next) {
    try {
        const { schoolId, classId } = req.params;
        await handleDeleteClass(classId);
        res.redirect(`/admin/schools/${schoolId}/classes?success=Class deleted successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/classes?error=${error.message}`);
    }
}

// ==================== TEACHER CONTROLLERS ====================

async function showTeachers(req, res, next) {
    try {
        const { schoolId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const teachers = await handleGetTeachersBySchool(schoolId);

        res.render('admin/teachers/list', {
            title: 'Manage Teachers',
            school,
            teachers,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        next(error);
    }
}

async function showCreateTeacher(req, res, next) {
    try {
        const { schoolId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const classes = await handleGetClassesBySchool(schoolId);

        res.render('admin/teachers/form', {
            title: 'Add Teacher',
            school,
            classes,
            teacher: null,
            isEdit: false
        });
    } catch (error) {
        next(error);
    }
}

async function createTeacher(req, res, next) {
    try {
        const { schoolId } = req.params;
        const { name, phone, email, date_of_birth, employee_id, designation, subjects, class_teacher_of } = req.body;

        await handleCreateTeacher({
            name,
            phone: parseInt(phone),
            email,
            date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
            school_id: schoolId,
            teacherProfile: {
                employee_id,
                designation,
                subjects: subjects ? subjects.split(',').map(s => s.trim()) : [],
                class_teacher_of: class_teacher_of || undefined
            }
        });

        res.redirect(`/admin/schools/${schoolId}/teachers?success=Teacher added successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/teachers?error=${error.message}`);
    }
}

async function showEditTeacher(req, res, next) {
    try {
        const { schoolId, teacherId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const teacher = await handleGetTeacherById(teacherId);
        const classes = await handleGetClassesBySchool(schoolId);

        res.render('admin/teachers/form', {
            title: 'Edit Teacher',
            school,
            classes,
            teacher,
            isEdit: true
        });
    } catch (error) {
        next(error);
    }
}

async function updateTeacher(req, res, next) {
    try {
        const { schoolId, teacherId } = req.params;
        const { name, phone, email, date_of_birth, employee_id, designation, subjects, class_teacher_of } = req.body;

        await handleUpdateTeacher(teacherId, {
            name,
            phone: parseInt(phone),
            email,
            date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
            teacherProfile: {
                employee_id,
                designation,
                subjects: subjects ? subjects.split(',').map(s => s.trim()) : [],
                class_teacher_of: class_teacher_of || undefined
            }
        });

        res.redirect(`/admin/schools/${schoolId}/teachers?success=Teacher updated successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/teachers?error=${error.message}`);
    }
}

async function deleteTeacher(req, res, next) {
    try {
        const { schoolId, teacherId } = req.params;
        await handleDeleteTeacher(teacherId);
        res.redirect(`/admin/schools/${schoolId}/teachers?success=Teacher deleted successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/teachers?error=${error.message}`);
    }
}

// ==================== STUDENT CONTROLLERS ====================

async function showStudents(req, res, next) {
    try {
        const { schoolId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const students = await handleGetStudentsBySchool(schoolId);
        const classes = await handleGetClassesBySchool(schoolId);

        res.render('admin/students/list', {
            title: 'Manage Students',
            school,
            students,
            classes,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        next(error);
    }
}

async function showCreateStudent(req, res, next) {
    try {
        const { schoolId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const classes = await handleGetClassesBySchool(schoolId);

        res.render('admin/students/form', {
            title: 'Add Student',
            school,
            classes,
            student: null,
            isEdit: false
        });
    } catch (error) {
        next(error);
    }
}

async function createStudent(req, res, next) {
    try {
        const { schoolId } = req.params;
        const {
            name, phone, email, date_of_birth, class_id, roll_number,
            father_name, mother_name, father_number, mother_number,
            father_email, mother_email
        } = req.body;

        await handleCreateStudent({
            name,
            phone: parseInt(phone),
            email,
            date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
            school_id: schoolId,
            studentProfile: {
                class_id: class_id || undefined,
                roll_number,
                father_name,
                mother_name,
                father_number: father_number ? parseInt(father_number) : undefined,
                mother_number: mother_number ? parseInt(mother_number) : undefined,
                father_email,
                mother_email
            }
        });

        res.redirect(`/admin/schools/${schoolId}/students?success=Student added successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/students?error=${error.message}`);
    }
}

async function showEditStudent(req, res, next) {
    try {
        const { schoolId, studentId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const student = await handleGetStudentById(studentId);
        const classes = await handleGetClassesBySchool(schoolId);

        res.render('admin/students/form', {
            title: 'Edit Student',
            school,
            classes,
            student,
            isEdit: true
        });
    } catch (error) {
        next(error);
    }
}

async function updateStudent(req, res, next) {
    try {
        const { schoolId, studentId } = req.params;
        const {
            name, phone, email, date_of_birth, class_id, roll_number,
            father_name, mother_name, father_number, mother_number,
            father_email, mother_email
        } = req.body;

        await handleUpdateStudent(studentId, {
            name,
            phone: parseInt(phone),
            email,
            date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
            studentProfile: {
                class_id: class_id || undefined,
                roll_number,
                father_name,
                mother_name,
                father_number: father_number ? parseInt(father_number) : undefined,
                mother_number: mother_number ? parseInt(mother_number) : undefined,
                father_email,
                mother_email
            }
        });

        res.redirect(`/admin/schools/${schoolId}/students?success=Student updated successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/students?error=${error.message}`);
    }
}

async function deleteStudent(req, res, next) {
    try {
        const { schoolId, studentId } = req.params;
        await handleDeleteStudent(studentId);
        res.redirect(`/admin/schools/${schoolId}/students?success=Student deleted successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/students?error=${error.message}`);
    }
}

// ==================== PRINCIPAL CONTROLLERS ====================

async function showCreatePrincipal(req, res, next) {
    try {
        const { schoolId } = req.params;
        const school = await handleGetSchoolById(schoolId);

        res.render('admin/principals/form', {
            title: 'Add Principal',
            school,
            principal: null,
            isEdit: false
        });
    } catch (error) {
        next(error);
    }
}

async function createPrincipal(req, res, next) {
    try {
        const { schoolId } = req.params;
        const { name, phone, email, date_of_birth } = req.body;

        await handleCreatePrincipal({
            name,
            phone: parseInt(phone),
            email,
            date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
            school_id: schoolId
        });

        res.redirect(`/admin/schools/${schoolId}?success=Principal added successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}?error=${error.message}`);
    }
}

async function showEditPrincipal(req, res, next) {
    try {
        const { schoolId, principalId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const User = require('../models/userModel');
        const principal = await User.findOne({ _id: principalId, role: 'Principal' }).lean();

        if (!principal) {
            return res.redirect(`/admin/schools/${schoolId}?error=Principal not found`);
        }

        res.render('admin/principals/form', {
            title: 'Edit Principal',
            school,
            principal,
            isEdit: true
        });
    } catch (error) {
        next(error);
    }
}

async function updatePrincipal(req, res, next) {
    try {
        const { schoolId, principalId } = req.params;
        const { name, phone, email, date_of_birth } = req.body;

        await handleUpdatePrincipal(principalId, {
            name,
            phone: parseInt(phone),
            email,
            date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined
        });

        res.redirect(`/admin/schools/${schoolId}?success=Principal updated successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}?error=${error.message}`);
    }
}

async function deletePrincipal(req, res, next) {
    try {
        const { schoolId, principalId } = req.params;
        await handleDeletePrincipal(principalId);
        res.redirect(`/admin/schools/${schoolId}?success=Principal removed successfully`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}?error=${error.message}`);
    }
}

// ==================== BULK OPERATIONS CONTROLLERS ====================

async function showBulkOperations(req, res, next) {
    try {
        const { schoolId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const classes = await handleGetClassesBySchool(schoolId);

        res.render('admin/bulk/index', {
            title: 'Bulk Operations',
            school,
            classes,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        next(error);
    }
}

async function bulkCreateStudents(req, res, next) {
    try {
        const { schoolId } = req.params;
        const { class_id, students_data } = req.body;

        // Parse CSV data
        const lines = students_data.trim().split('\n');
        const studentsData = lines.map(line => {
            const [name, phone, email, roll_number] = line.split(',').map(s => s.trim());
            return {
                name,
                phone: parseInt(phone),
                email,
                studentProfile: { roll_number }
            };
        });

        const result = await handleBulkCreateStudents(studentsData, schoolId, class_id);
        res.redirect(`/admin/schools/${schoolId}/bulk?success=Successfully added ${result.length} students`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/bulk?error=${error.message}`);
    }
}

async function bulkCreateTeachers(req, res, next) {
    try {
        const { schoolId } = req.params;
        const { teachers_data } = req.body;

        // Parse CSV data
        const lines = teachers_data.trim().split('\n');
        const teachersData = lines.map(line => {
            const [name, phone, email, employee_id] = line.split(',').map(s => s.trim());
            return {
                name,
                phone: parseInt(phone),
                email,
                teacherProfile: { employee_id }
            };
        });

        const result = await handleBulkCreateTeachers(teachersData, schoolId);
        res.redirect(`/admin/schools/${schoolId}/bulk?success=Successfully added ${result.length} teachers`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/bulk?error=${error.message}`);
    }
}

async function bulkDeleteStudents(req, res, next) {
    try {
        const { schoolId } = req.params;
        const { student_ids } = req.body;

        const ids = Array.isArray(student_ids) ? student_ids : [student_ids];
        const count = await handleBulkDeleteStudents(ids);

        res.redirect(`/admin/schools/${schoolId}/students?success=Successfully deleted ${count} students`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/students?error=${error.message}`);
    }
}

async function bulkDeleteTeachers(req, res, next) {
    try {
        const { schoolId } = req.params;
        const { teacher_ids } = req.body;

        const ids = Array.isArray(teacher_ids) ? teacher_ids : [teacher_ids];
        const count = await handleBulkDeleteTeachers(ids);

        res.redirect(`/admin/schools/${schoolId}/teachers?success=Successfully deleted ${count} teachers`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/teachers?error=${error.message}`);
    }
}

// ==================== PROMOTE STUDENTS ====================

async function showPromoteStudents(req, res, next) {
    try {
        const { schoolId } = req.params;
        const school = await handleGetSchoolById(schoolId);
        const classes = await handleGetClassesBySchool(schoolId);

        res.render('admin/promote/index', {
            title: 'Promote Students',
            school,
            classes,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        next(error);
    }
}

async function promoteStudents(req, res, next) {
    try {
        const { schoolId } = req.params;
        const { from_class_id, to_class_id } = req.body;

        const count = await handlePromoteStudents(from_class_id, to_class_id);
        res.redirect(`/admin/schools/${schoolId}/promote?success=Successfully promoted ${count} students`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/promote?error=${error.message}`);
    }
}

async function promoteAllClasses(req, res, next) {
    try {
        const { schoolId } = req.params;
        const results = await handlePromoteAllClasses(schoolId);

        const totalPromoted = results.reduce((sum, r) => sum + r.studentsPromoted, 0);
        res.redirect(`/admin/schools/${schoolId}/promote?success=Promoted ${totalPromoted} students across ${results.length} class transitions`);
    } catch (error) {
        res.redirect(`/admin/schools/${req.params.schoolId}/promote?error=${error.message}`);
    }
}

// ==================== HARD RESET ====================

async function showHardReset(req, res, next) {
    try {
        const schools = await handleGetAllSchoolsWithStats();

        res.render('admin/reset/index', {
            title: 'Hard Reset Academic Year',
            schools,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        next(error);
    }
}

async function hardReset(req, res, next) {
    try {
        const { school_id, confirm } = req.body;

        if (confirm !== 'CONFIRM') {
            return res.redirect('/admin/reset?error=Please type CONFIRM to proceed');
        }

        const result = await handleHardResetAcademicYear(school_id || null);

        const message = `Reset complete. Deleted: ${result.attendanceDeleted} attendance, ${result.homeworkDeleted} homework, ${result.examsDeleted} exams, ${result.marksDeleted} marks, ${result.timetablesDeleted} timetables`;
        res.redirect('/admin/reset?success=' + encodeURIComponent(message));
    } catch (error) {
        res.redirect('/admin/reset?error=' + error.message);
    }
}

// ==================== SEARCH ====================

async function search(req, res, next) {
    try {
        const { q, school_id, role } = req.query;

        if (!q || q.length < 2) {
            return res.json({ results: [] });
        }

        const results = await handleSearchUsers(q, school_id, role);
        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ==================== GLOBAL LISTS CONTROLLERS ====================

async function showAllStudents(req, res, next) {
    try {
        const students = await handleGetAllStudentsGlobal();
        res.render('admin/students/all', {
            title: 'All Students',
            currentPage: 'all-students',
            students
        });
    } catch (error) {
        next(error);
    }
}

async function showAllTeachers(req, res, next) {
    try {
        const teachers = await handleGetAllTeachersGlobal();
        res.render('admin/teachers/all', {
            title: 'All Teachers',
            currentPage: 'all-teachers',
            teachers
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
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
};
