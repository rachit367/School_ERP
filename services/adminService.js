const Admin = require('../models/adminModel');
const School = require('../models/schoolModel');
const User = require('../models/userModel');
const Class = require('../models/classModel');
const Attendance = require('../models/attendanceModel');
const ClassAttendanceSummary = require('../models/classAttendanceSummaryModel');
const Homework = require('../models/homeworkModel');
const Exam = require('../models/examModel');
const Marks = require('../models/marksModel');
const Timetable = require('../models/timetableModel');
const mongoose = require('mongoose');

class AdminService {
    // ==================== AUTH SERVICES ====================

    async authenticateAdmin(username, password) {
        const admin = await Admin.findOne({ username });

        if (!admin) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        return admin;
    }

    async createDefaultAdmin() {
        const existingAdmin = await Admin.findOne({ username: 'superadmin' });
        if (!existingAdmin) {
            await Admin.create({
                username: 'superadmin',
                password: 'Admin@123'
            });
            console.log('Default Super Admin created: username=superadmin, password=Admin@123');
        }
    }

    // ==================== DASHBOARD SERVICES ====================

    async getDashboardStats() {
        const [
            totalSchools,
            totalStudents,
            totalTeachers,
            totalClasses
        ] = await Promise.all([
            School.countDocuments(),
            User.countDocuments({ role: 'Student' }),
            User.countDocuments({ role: 'Teacher' }),
            Class.countDocuments()
        ]);

        return {
            totalSchools,
            totalStudents,
            totalTeachers,
            totalClasses
        };
    }

    async getAllSchoolsWithStats() {
        const schools = await School.find().populate('principal_id', 'name email phone').lean();

        const schoolsWithStats = await Promise.all(schools.map(async (school) => {
            const [classCount, studentCount, teacherCount] = await Promise.all([
                Class.countDocuments({ school_id: school._id }),
                User.countDocuments({ school_id: school._id, role: 'Student' }),
                User.countDocuments({ school_id: school._id, role: 'Teacher' })
            ]);

            return {
                ...school,
                classCount,
                studentCount,
                teacherCount
            };
        }));

        return schoolsWithStats;
    }

    // ==================== SCHOOL SERVICES ====================

    async getSchoolById(schoolId) {
        return await School.findById(schoolId).populate('principal_id', 'name email phone').lean();
    }

    async getSchoolDetails(schoolId) {
        const school = await this.getSchoolById(schoolId);
        if (!school) throw new Error('School not found');

        const [teachers, classes, students, principals] = await Promise.all([
            User.find({ school_id: schoolId, role: 'Teacher' }).lean(),
            Class.find({ school_id: schoolId }).populate('class_teacher', 'name').lean(),
            User.find({ school_id: schoolId, role: 'Student' }).lean(),
            User.find({ school_id: schoolId, role: 'Principal' }).lean()
        ]);

        // Add student count to each class
        const classesWithCount = classes.map(cls => ({
            ...cls,
            studentCount: cls.students ? cls.students.length : 0
        }));

        return {
            school,
            teachers,
            classes: classesWithCount,
            students,
            principals,
            stats: {
                teacherCount: teachers.length,
                classCount: classes.length,
                studentCount: students.length
            }
        };
    }

    async createSchool(schoolData) {
        const school = await School.create(schoolData);
        return school;
    }

    async updateSchool(schoolId, schoolData) {
        const school = await School.findByIdAndUpdate(
            schoolId,
            schoolData,
            { new: true, runValidators: true }
        );
        if (!school) throw new Error('School not found');
        return school;
    }

    async deleteSchool(schoolId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Delete all related data
            await Promise.all([
                User.deleteMany({ school_id: schoolId }).session(session),
                Class.deleteMany({ school_id: schoolId }).session(session),
                Attendance.deleteMany({ class_id: { $in: await Class.find({ school_id: schoolId }).distinct('_id') } }).session(session),
                Homework.deleteMany({ school_id: schoolId }).session(session),
                Exam.deleteMany({ school_id: schoolId }).session(session),
                Marks.deleteMany({ school_id: schoolId }).session(session),
                Timetable.deleteMany({ school_id: schoolId }).session(session)
            ]);

            await School.findByIdAndDelete(schoolId).session(session);

            await session.commitTransaction();
            return true;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // ==================== CLASS SERVICES ====================

    async getClassById(classId) {
        return await Class.findById(classId)
            .populate('class_teacher', 'name email phone')
            .populate('students', 'name email phone studentProfile')
            .lean();
    }

    async getClassDetails(classId) {
        const classData = await this.getClassById(classId);
        if (!classData) throw new Error('Class not found');

        const school = await School.findById(classData.school_id).lean();

        return {
            classData,
            school,
            studentCount: classData.students ? classData.students.length : 0
        };
    }

    async createClass(classData) {
        const newClass = await Class.create(classData);
        return newClass;
    }

    async updateClass(classId, classData) {
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            classData,
            { new: true, runValidators: true }
        );
        if (!updatedClass) throw new Error('Class not found');
        return updatedClass;
    }

    async deleteClass(classId) {
        const classData = await Class.findById(classId);
        if (!classData) throw new Error('Class not found');

        // Remove class reference from students
        await User.updateMany(
            { 'studentProfile.class_id': classId },
            { $unset: { 'studentProfile.class_id': 1 } }
        );

        // Delete related attendance
        await Attendance.deleteMany({ class_id: classId });

        // Delete the class
        await Class.findByIdAndDelete(classId);
        return true;
    }

    async getClassesBySchool(schoolId) {
        return await Class.find({ school_id: schoolId })
            .populate('class_teacher', 'name')
            .lean();
    }

    // ==================== TEACHER SERVICES ====================

    async getTeacherById(teacherId) {
        return await User.findOne({ _id: teacherId, role: 'Teacher' })
            .populate('school_id', 'name')
            .populate('teacherProfile.class_teacher_of', 'class_name section')
            .populate('teacherProfile.classes_assigned', 'class_name section')
            .lean();
    }

    async createTeacher(teacherData) {
        const teacher = await User.create({
            ...teacherData,
            role: 'Teacher'
        });

        // Update school teacher count
        await School.findByIdAndUpdate(teacherData.school_id, {
            $inc: { total_teachers: 1 }
        });

        return teacher;
    }

    async updateTeacher(teacherId, teacherData) {
        const teacher = await User.findOneAndUpdate(
            { _id: teacherId, role: 'Teacher' },
            teacherData,
            { new: true, runValidators: true }
        );
        if (!teacher) throw new Error('Teacher not found');
        return teacher;
    }

    async deleteTeacher(teacherId) {
        const teacher = await User.findOne({ _id: teacherId, role: 'Teacher' });
        if (!teacher) throw new Error('Teacher not found');

        // Remove as class teacher
        await Class.updateMany(
            { class_teacher: teacherId },
            { $unset: { class_teacher: 1 } }
        );

        // Remove from allowed attendance teachers
        await Class.updateMany(
            { allowed_attendance_teachers: teacherId },
            { $pull: { allowed_attendance_teachers: teacherId } }
        );

        // Update school count
        await School.findByIdAndUpdate(teacher.school_id, {
            $inc: { total_teachers: -1 }
        });

        await User.findByIdAndDelete(teacherId);
        return true;
    }

    async getTeachersBySchool(schoolId) {
        return await User.find({ school_id: schoolId, role: 'Teacher' }).lean();
    }

    // ==================== STUDENT SERVICES ====================

    async getStudentById(studentId) {
        return await User.findOne({ _id: studentId, role: 'Student' })
            .populate('school_id', 'name')
            .populate('studentProfile.class_id', 'class_name section')
            .lean();
    }

    async createStudent(studentData) {
        const student = await User.create({
            ...studentData,
            role: 'Student'
        });

        // Add student to class
        if (studentData.studentProfile?.class_id) {
            await Class.findByIdAndUpdate(studentData.studentProfile.class_id, {
                $push: { students: student._id }
            });
        }

        // Update school student count
        await School.findByIdAndUpdate(studentData.school_id, {
            $inc: { total_students: 1 }
        });

        return student;
    }

    async updateStudent(studentId, studentData) {
        const oldStudent = await User.findOne({ _id: studentId, role: 'Student' });
        if (!oldStudent) throw new Error('Student not found');

        const student = await User.findOneAndUpdate(
            { _id: studentId, role: 'Student' },
            studentData,
            { new: true, runValidators: true }
        );

        // Handle class change
        const oldClassId = oldStudent.studentProfile?.class_id?.toString();
        const newClassId = studentData.studentProfile?.class_id?.toString();

        if (oldClassId !== newClassId) {
            if (oldClassId) {
                await Class.findByIdAndUpdate(oldClassId, {
                    $pull: { students: studentId }
                });
            }
            if (newClassId) {
                await Class.findByIdAndUpdate(newClassId, {
                    $addToSet: { students: studentId }
                });
            }
        }

        return student;
    }

    async deleteStudent(studentId) {
        const student = await User.findOne({ _id: studentId, role: 'Student' });
        if (!student) throw new Error('Student not found');

        // Remove from class
        if (student.studentProfile?.class_id) {
            await Class.findByIdAndUpdate(student.studentProfile.class_id, {
                $pull: { students: studentId }
            });
        }

        // Delete attendance records
        await Attendance.deleteMany({ student_id: studentId });

        // Delete marks
        await Marks.deleteMany({ student_id: studentId });

        // Update school count
        await School.findByIdAndUpdate(student.school_id, {
            $inc: { total_students: -1 }
        });

        await User.findByIdAndDelete(studentId);
        return true;
    }

    async getStudentsBySchool(schoolId) {
        return await User.find({ school_id: schoolId, role: 'Student' })
            .populate('studentProfile.class_id', 'class_name section')
            .lean();
    }

    async getStudentsByClass(classId) {
        return await User.find({
            'studentProfile.class_id': classId,
            role: 'Student'
        }).lean();
    }

    // ==================== PRINCIPAL SERVICES ====================

    async createPrincipal(principalData) {
        const principal = await User.create({
            ...principalData,
            role: 'Principal'
        });

        // Update school principal
        await School.findByIdAndUpdate(principalData.school_id, {
            principal_id: principal._id
        });

        return principal;
    }

    async updatePrincipal(principalId, principalData) {
        const principal = await User.findOneAndUpdate(
            { _id: principalId, role: 'Principal' },
            principalData,
            { new: true, runValidators: true }
        );
        if (!principal) throw new Error('Principal not found');
        return principal;
    }

    async deletePrincipal(principalId) {
        const principal = await User.findOne({ _id: principalId, role: 'Principal' });
        if (!principal) throw new Error('Principal not found');

        // Remove from school
        await School.findByIdAndUpdate(principal.school_id, {
            $unset: { principal_id: 1 }
        });

        await User.findByIdAndDelete(principalId);
        return true;
    }

    // ==================== BULK OPERATIONS ====================

    async bulkCreateStudents(studentsData, schoolId, classId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const students = await User.insertMany(
                studentsData.map(s => ({
                    ...s,
                    role: 'Student',
                    school_id: schoolId,
                    studentProfile: {
                        ...s.studentProfile,
                        class_id: classId
                    }
                })),
                { session }
            );

            // Add to class
            await Class.findByIdAndUpdate(
                classId,
                { $push: { students: { $each: students.map(s => s._id) } } },
                { session }
            );

            // Update school count
            await School.findByIdAndUpdate(
                schoolId,
                { $inc: { total_students: students.length } },
                { session }
            );

            await session.commitTransaction();
            return students;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async bulkCreateTeachers(teachersData, schoolId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const teachers = await User.insertMany(
                teachersData.map(t => ({
                    ...t,
                    role: 'Teacher',
                    school_id: schoolId
                })),
                { session }
            );

            // Update school count
            await School.findByIdAndUpdate(
                schoolId,
                { $inc: { total_teachers: teachers.length } },
                { session }
            );

            await session.commitTransaction();
            return teachers;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async bulkDeleteStudents(studentIds) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const students = await User.find({
                _id: { $in: studentIds },
                role: 'Student'
            }).lean();

            // Group by school for count updates
            const schoolCounts = {};
            const classCounts = {};

            students.forEach(s => {
                schoolCounts[s.school_id] = (schoolCounts[s.school_id] || 0) + 1;
                if (s.studentProfile?.class_id) {
                    classCounts[s.studentProfile.class_id] = classCounts[s.studentProfile.class_id] || [];
                    classCounts[s.studentProfile.class_id].push(s._id);
                }
            });

            // Remove from classes
            for (const [classId, ids] of Object.entries(classCounts)) {
                await Class.findByIdAndUpdate(
                    classId,
                    { $pull: { students: { $in: ids } } },
                    { session }
                );
            }

            // Update school counts
            for (const [schoolId, count] of Object.entries(schoolCounts)) {
                await School.findByIdAndUpdate(
                    schoolId,
                    { $inc: { total_students: -count } },
                    { session }
                );
            }

            // Delete attendance and marks
            await Attendance.deleteMany({ student_id: { $in: studentIds } }).session(session);
            await Marks.deleteMany({ student_id: { $in: studentIds } }).session(session);

            // Delete students
            await User.deleteMany({ _id: { $in: studentIds } }).session(session);

            await session.commitTransaction();
            return students.length;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async bulkDeleteTeachers(teacherIds) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const teachers = await User.find({
                _id: { $in: teacherIds },
                role: 'Teacher'
            }).lean();

            // Group by school for count updates
            const schoolCounts = {};
            teachers.forEach(t => {
                schoolCounts[t.school_id] = (schoolCounts[t.school_id] || 0) + 1;
            });

            // Remove as class teacher
            await Class.updateMany(
                { class_teacher: { $in: teacherIds } },
                { $unset: { class_teacher: 1 } },
                { session }
            );

            // Remove from allowed attendance teachers
            await Class.updateMany(
                { allowed_attendance_teachers: { $in: teacherIds } },
                { $pull: { allowed_attendance_teachers: { $in: teacherIds } } },
                { session }
            );

            // Update school counts
            for (const [schoolId, count] of Object.entries(schoolCounts)) {
                await School.findByIdAndUpdate(
                    schoolId,
                    { $inc: { total_teachers: -count } },
                    { session }
                );
            }

            // Delete teachers
            await User.deleteMany({ _id: { $in: teacherIds } }).session(session);

            await session.commitTransaction();
            return teachers.length;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // ==================== PROMOTE STUDENTS ====================

    async promoteStudents(fromClassId, toClassId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const fromClass = await Class.findById(fromClassId);
            const toClass = await Class.findById(toClassId);

            if (!fromClass || !toClass) {
                throw new Error('Class not found');
            }

            const studentIds = fromClass.students || [];

            // Update students' class_id
            await User.updateMany(
                { _id: { $in: studentIds } },
                { 'studentProfile.class_id': toClassId },
                { session }
            );

            // Move students from old class to new class
            await Class.findByIdAndUpdate(
                fromClassId,
                { $set: { students: [] } },
                { session }
            );

            await Class.findByIdAndUpdate(
                toClassId,
                { $push: { students: { $each: studentIds } } },
                { session }
            );

            // Reset attendance counts for promoted students
            await User.updateMany(
                { _id: { $in: studentIds } },
                {
                    'studentProfile.total_presents': 0,
                    'studentProfile.total_absents': 0
                },
                { session }
            );

            await session.commitTransaction();
            return studentIds.length;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async promoteAllClasses(schoolId) {
        const classes = await Class.find({ school_id: schoolId }).sort({ class_name: 1 });

        // Group classes by name
        const classGroups = {};
        classes.forEach(c => {
            if (!classGroups[c.class_name]) {
                classGroups[c.class_name] = [];
            }
            classGroups[c.class_name].push(c);
        });

        const results = [];
        const classNames = Object.keys(classGroups).map(Number).sort((a, b) => b - a);

        // Promote from highest to lowest class
        for (let i = 0; i < classNames.length - 1; i++) {
            const currentClassName = classNames[i];
            const nextClassName = classNames[i + 1];

            // For each section in the lower class
            for (const fromClass of classGroups[nextClassName]) {
                // Find matching section in higher class
                const toClass = classGroups[currentClassName].find(c => c.section === fromClass.section);
                if (toClass) {
                    const count = await this.promoteStudents(fromClass._id.toString(), toClass._id.toString());
                    results.push({
                        from: `Class ${fromClass.class_name}-${fromClass.section}`,
                        to: `Class ${toClass.class_name}-${toClass.section}`,
                        studentsPromoted: count
                    });
                }
            }
        }

        return results;
    }

    // ==================== HARD RESET ====================

    async hardResetAcademicYear(schoolId = null) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const filter = schoolId ? { school_id: schoolId } : {};
            const classFilter = schoolId
                ? { school_id: schoolId }
                : {};

            // Get all class IDs for the filter
            const classIds = await Class.find(classFilter).distinct('_id');

            // Delete academic data
            const [
                attendanceDeleted,
                homeworkDeleted,
                examsDeleted,
                marksDeleted,
                timetablesDeleted,
                summaryDeleted
            ] = await Promise.all([
                Attendance.deleteMany(schoolId ? { class_id: { $in: classIds } } : {}).session(session),
                Homework.deleteMany(filter).session(session),
                Exam.deleteMany(filter).session(session),
                Marks.deleteMany(filter).session(session),
                Timetable.deleteMany(filter).session(session),
                ClassAttendanceSummary.deleteMany(filter).session(session)
            ]);

            // Reset student attendance counts
            const studentFilter = schoolId
                ? { school_id: schoolId, role: 'Student' }
                : { role: 'Student' };

            await User.updateMany(
                studentFilter,
                {
                    'studentProfile.total_presents': 0,
                    'studentProfile.total_absents': 0
                },
                { session }
            );

            await session.commitTransaction();

            return {
                attendanceDeleted: attendanceDeleted.deletedCount,
                homeworkDeleted: homeworkDeleted.deletedCount,
                examsDeleted: examsDeleted.deletedCount,
                marksDeleted: marksDeleted.deletedCount,
                timetablesDeleted: timetablesDeleted.deletedCount,
                summaryDeleted: summaryDeleted.deletedCount
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // ==================== UTILITY METHODS ====================

    async searchUsers(query, schoolId = null, role = null) {
        const filter = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        };

        if (schoolId) filter.school_id = schoolId;
        if (role) filter.role = role;

        return await User.find(filter)
            .populate('school_id', 'name')
            .populate('studentProfile.class_id', 'class_name section')
            .limit(50)
            .lean();
    }

    async getAvailableTeachersForClass(schoolId) {
        return await User.find({
            school_id: schoolId,
            role: 'Teacher'
        }).select('name email teacherProfile.employee_id').lean();
    }
}

module.exports = new AdminService();
