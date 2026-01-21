const adminService = require('../services/adminService');
const { generateAdminToken } = require('../middlewares/adminAuth');

class AdminController {
    
    // ==================== AUTH CONTROLLERS ====================
    
    async showLoginPage(req, res) {
        res.render('admin/login', { 
            title: 'Admin Login',
            error: null,
            layout: false
        });
    }
    
    async login(req, res) {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.render('admin/login', {
                    title: 'Admin Login',
                    error: 'Please provide username and password',
                    layout: false
                });
            }
            
            const admin = await adminService.authenticateAdmin(username, password);
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
    
    async logout(req, res) {
        res.clearCookie('adminToken');
        res.redirect('/admin/login');
    }

    // ==================== DASHBOARD CONTROLLERS ====================
    
    async showDashboard(req, res) {
        try {
            const [stats, schools] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getAllSchoolsWithStats()
            ]);
            
            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                stats,
                schools,
                admin: req.admin
            });
        } catch (error) {
            res.render('admin/error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    // ==================== SCHOOL CONTROLLERS ====================
    
    async showSchools(req, res) {
        try {
            const schools = await adminService.getAllSchoolsWithStats();
            res.render('admin/schools/list', {
                title: 'Manage Schools',
                schools,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async showSchoolDetails(req, res) {
        try {
            const { schoolId } = req.params;
            const data = await adminService.getSchoolDetails(schoolId);
            
            res.render('admin/schools/detail', {
                title: `${data.school.name} - Details`,
                ...data,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async showCreateSchool(req, res) {
        res.render('admin/schools/form', {
            title: 'Create School',
            school: null,
            isEdit: false
        });
    }
    
    async createSchool(req, res) {
        try {
            const { name, address } = req.body;
            await adminService.createSchool({ name, address });
            res.redirect('/admin/schools?success=School created successfully');
        } catch (error) {
            res.render('admin/schools/form', {
                title: 'Create School',
                school: req.body,
                isEdit: false,
                error: error.message
            });
        }
    }
    
    async showEditSchool(req, res) {
        try {
            const school = await adminService.getSchoolById(req.params.schoolId);
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
    
    async updateSchool(req, res) {
        try {
            const { name, address } = req.body;
            await adminService.updateSchool(req.params.schoolId, { name, address });
            res.redirect('/admin/schools?success=School updated successfully');
        } catch (error) {
            res.redirect('/admin/schools?error=' + error.message);
        }
    }
    
    async deleteSchool(req, res) {
        try {
            await adminService.deleteSchool(req.params.schoolId);
            res.redirect('/admin/schools?success=School deleted successfully');
        } catch (error) {
            res.redirect('/admin/schools?error=' + error.message);
        }
    }

    // ==================== CLASS CONTROLLERS ====================
    
    async showClasses(req, res) {
        try {
            const { schoolId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const classes = await adminService.getClassesBySchool(schoolId);
            const teachers = await adminService.getTeachersBySchool(schoolId);
            
            res.render('admin/classes/list', {
                title: 'Manage Classes',
                school,
                classes,
                teachers,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async showClassDetails(req, res) {
        try {
            const { classId } = req.params;
            const data = await adminService.getClassDetails(classId);
            
            res.render('admin/classes/detail', {
                title: `Class ${data.classData.class_name}-${data.classData.section}`,
                ...data,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async showCreateClass(req, res) {
        try {
            const { schoolId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const teachers = await adminService.getTeachersBySchool(schoolId);
            
            res.render('admin/classes/form', {
                title: 'Create Class',
                school,
                teachers,
                classData: null,
                isEdit: false
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async createClass(req, res) {
        try {
            const { schoolId } = req.params;
            const { class_name, section, class_teacher } = req.body;
            
            await adminService.createClass({
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
    
    async showEditClass(req, res) {
        try {
            const { schoolId, classId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const classData = await adminService.getClassById(classId);
            const teachers = await adminService.getTeachersBySchool(schoolId);
            
            res.render('admin/classes/form', {
                title: 'Edit Class',
                school,
                teachers,
                classData,
                isEdit: true
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async updateClass(req, res) {
        try {
            const { schoolId, classId } = req.params;
            const { class_name, section, class_teacher } = req.body;
            
            await adminService.updateClass(classId, {
                class_name: parseInt(class_name),
                section,
                class_teacher: class_teacher || null
            });
            
            res.redirect(`/admin/schools/${schoolId}/classes?success=Class updated successfully`);
        } catch (error) {
            res.redirect(`/admin/schools/${req.params.schoolId}/classes?error=${error.message}`);
        }
    }
    
    async deleteClass(req, res) {
        try {
            const { schoolId, classId } = req.params;
            await adminService.deleteClass(classId);
            res.redirect(`/admin/schools/${schoolId}/classes?success=Class deleted successfully`);
        } catch (error) {
            res.redirect(`/admin/schools/${req.params.schoolId}/classes?error=${error.message}`);
        }
    }

    // ==================== TEACHER CONTROLLERS ====================
    
    async showTeachers(req, res) {
        try {
            const { schoolId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const teachers = await adminService.getTeachersBySchool(schoolId);
            
            res.render('admin/teachers/list', {
                title: 'Manage Teachers',
                school,
                teachers,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async showCreateTeacher(req, res) {
        try {
            const { schoolId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const classes = await adminService.getClassesBySchool(schoolId);
            
            res.render('admin/teachers/form', {
                title: 'Add Teacher',
                school,
                classes,
                teacher: null,
                isEdit: false
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async createTeacher(req, res) {
        try {
            const { schoolId } = req.params;
            const { name, phone, email, date_of_birth, employee_id, designation, subjects, class_teacher_of } = req.body;
            
            await adminService.createTeacher({
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
    
    async showEditTeacher(req, res) {
        try {
            const { schoolId, teacherId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const teacher = await adminService.getTeacherById(teacherId);
            const classes = await adminService.getClassesBySchool(schoolId);
            
            res.render('admin/teachers/form', {
                title: 'Edit Teacher',
                school,
                classes,
                teacher,
                isEdit: true
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async updateTeacher(req, res) {
        try {
            const { schoolId, teacherId } = req.params;
            const { name, phone, email, date_of_birth, employee_id, designation, subjects, class_teacher_of } = req.body;
            
            await adminService.updateTeacher(teacherId, {
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
    
    async deleteTeacher(req, res) {
        try {
            const { schoolId, teacherId } = req.params;
            await adminService.deleteTeacher(teacherId);
            res.redirect(`/admin/schools/${schoolId}/teachers?success=Teacher deleted successfully`);
        } catch (error) {
            res.redirect(`/admin/schools/${req.params.schoolId}/teachers?error=${error.message}`);
        }
    }

    // ==================== STUDENT CONTROLLERS ====================
    
    async showStudents(req, res) {
        try {
            const { schoolId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const students = await adminService.getStudentsBySchool(schoolId);
            const classes = await adminService.getClassesBySchool(schoolId);
            
            res.render('admin/students/list', {
                title: 'Manage Students',
                school,
                students,
                classes,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async showCreateStudent(req, res) {
        try {
            const { schoolId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const classes = await adminService.getClassesBySchool(schoolId);
            
            res.render('admin/students/form', {
                title: 'Add Student',
                school,
                classes,
                student: null,
                isEdit: false
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async createStudent(req, res) {
        try {
            const { schoolId } = req.params;
            const { 
                name, phone, email, date_of_birth, class_id, roll_number,
                father_name, mother_name, father_number, mother_number,
                father_email, mother_email
            } = req.body;
            
            await adminService.createStudent({
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
    
    async showEditStudent(req, res) {
        try {
            const { schoolId, studentId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const student = await adminService.getStudentById(studentId);
            const classes = await adminService.getClassesBySchool(schoolId);
            
            res.render('admin/students/form', {
                title: 'Edit Student',
                school,
                classes,
                student,
                isEdit: true
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async updateStudent(req, res) {
        try {
            const { schoolId, studentId } = req.params;
            const { 
                name, phone, email, date_of_birth, class_id, roll_number,
                father_name, mother_name, father_number, mother_number,
                father_email, mother_email
            } = req.body;
            
            await adminService.updateStudent(studentId, {
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
    
    async deleteStudent(req, res) {
        try {
            const { schoolId, studentId } = req.params;
            await adminService.deleteStudent(studentId);
            res.redirect(`/admin/schools/${schoolId}/students?success=Student deleted successfully`);
        } catch (error) {
            res.redirect(`/admin/schools/${req.params.schoolId}/students?error=${error.message}`);
        }
    }

    // ==================== PRINCIPAL CONTROLLERS ====================
    
    async showCreatePrincipal(req, res) {
        try {
            const { schoolId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            
            res.render('admin/principals/form', {
                title: 'Add Principal',
                school,
                principal: null,
                isEdit: false
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async createPrincipal(req, res) {
        try {
            const { schoolId } = req.params;
            const { name, phone, email, date_of_birth } = req.body;
            
            await adminService.createPrincipal({
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

    // ==================== BULK OPERATIONS CONTROLLERS ====================
    
    async showBulkOperations(req, res) {
        try {
            const { schoolId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const classes = await adminService.getClassesBySchool(schoolId);
            
            res.render('admin/bulk/index', {
                title: 'Bulk Operations',
                school,
                classes,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async bulkCreateStudents(req, res) {
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
            
            const result = await adminService.bulkCreateStudents(studentsData, schoolId, class_id);
            res.redirect(`/admin/schools/${schoolId}/bulk?success=Successfully added ${result.length} students`);
        } catch (error) {
            res.redirect(`/admin/schools/${req.params.schoolId}/bulk?error=${error.message}`);
        }
    }
    
    async bulkCreateTeachers(req, res) {
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
            
            const result = await adminService.bulkCreateTeachers(teachersData, schoolId);
            res.redirect(`/admin/schools/${schoolId}/bulk?success=Successfully added ${result.length} teachers`);
        } catch (error) {
            res.redirect(`/admin/schools/${req.params.schoolId}/bulk?error=${error.message}`);
        }
    }
    
    async bulkDeleteStudents(req, res) {
        try {
            const { schoolId } = req.params;
            const { student_ids } = req.body;
            
            const ids = Array.isArray(student_ids) ? student_ids : [student_ids];
            const count = await adminService.bulkDeleteStudents(ids);
            
            res.redirect(`/admin/schools/${schoolId}/students?success=Successfully deleted ${count} students`);
        } catch (error) {
            res.redirect(`/admin/schools/${req.params.schoolId}/students?error=${error.message}`);
        }
    }
    
    async bulkDeleteTeachers(req, res) {
        try {
            const { schoolId } = req.params;
            const { teacher_ids } = req.body;
            
            const ids = Array.isArray(teacher_ids) ? teacher_ids : [teacher_ids];
            const count = await adminService.bulkDeleteTeachers(ids);
            
            res.redirect(`/admin/schools/${schoolId}/teachers?success=Successfully deleted ${count} teachers`);
        } catch (error) {
            res.redirect(`/admin/schools/${req.params.schoolId}/teachers?error=${error.message}`);
        }
    }

    // ==================== PROMOTE STUDENTS ====================
    
    async showPromoteStudents(req, res) {
        try {
            const { schoolId } = req.params;
            const school = await adminService.getSchoolById(schoolId);
            const classes = await adminService.getClassesBySchool(schoolId);
            
            res.render('admin/promote/index', {
                title: 'Promote Students',
                school,
                classes,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async promoteStudents(req, res) {
        try {
            const { schoolId } = req.params;
            const { from_class_id, to_class_id } = req.body;
            
            const count = await adminService.promoteStudents(from_class_id, to_class_id);
            res.redirect(`/admin/schools/${schoolId}/promote?success=Successfully promoted ${count} students`);
        } catch (error) {
            res.redirect(`/admin/schools/${req.params.schoolId}/promote?error=${error.message}`);
        }
    }
    
    async promoteAllClasses(req, res) {
        try {
            const { schoolId } = req.params;
            const results = await adminService.promoteAllClasses(schoolId);
            
            const totalPromoted = results.reduce((sum, r) => sum + r.studentsPromoted, 0);
            res.redirect(`/admin/schools/${schoolId}/promote?success=Promoted ${totalPromoted} students across ${results.length} class transitions`);
        } catch (error) {
            res.redirect(`/admin/schools/${req.params.schoolId}/promote?error=${error.message}`);
        }
    }

    // ==================== HARD RESET ====================
    
    async showHardReset(req, res) {
        try {
            const schools = await adminService.getAllSchoolsWithStats();
            
            res.render('admin/reset/index', {
                title: 'Hard Reset Academic Year',
                schools,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render('admin/error', { title: 'Error', message: error.message });
        }
    }
    
    async hardReset(req, res) {
        try {
            const { school_id, confirm } = req.body;
            
            if (confirm !== 'CONFIRM') {
                return res.redirect('/admin/reset?error=Please type CONFIRM to proceed');
            }
            
            const result = await adminService.hardResetAcademicYear(school_id || null);
            
            const message = `Reset complete. Deleted: ${result.attendanceDeleted} attendance, ${result.homeworkDeleted} homework, ${result.examsDeleted} exams, ${result.marksDeleted} marks, ${result.timetablesDeleted} timetables`;
            res.redirect('/admin/reset?success=' + encodeURIComponent(message));
        } catch (error) {
            res.redirect('/admin/reset?error=' + error.message);
        }
    }

    // ==================== SEARCH ====================
    
    async search(req, res) {
        try {
            const { q, school_id, role } = req.query;
            
            if (!q || q.length < 2) {
                return res.json({ results: [] });
            }
            
            const results = await adminService.searchUsers(q, school_id, role);
            res.json({ results });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AdminController();
