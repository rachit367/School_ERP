const userModel=require('../models/userModel')
const getClassId=require('../utils/classIdUtil')
const classModel=require('../models/classModel')
const schoolModel=require('./../models/schoolModel')
const homeworkModel=require('./../models/homeworkModel')
const doubtModel=require('../models/doubtModel')
const announcementModel=require('../models/announcementModel')
const examModel=require('../models/examModel')
const timetableModel=require('../models/timetableModel')
const mongoose=require('mongoose')
const leaveModel = require('../models/leaveModel')
const ptmModel = require('../models/ptmModel')
const subjectModel = require('../models/subjectModel')

//req:  //res: [{ _id, name, role, designation, subjects, classes_assigned,announcement_allowed }]
async function handleGetAllTeachers(school_id) {
    const teachers=await userModel.find({
        school_id:school_id,
        role:'Teacher'})
        .populate([
        {
            path:'teacherProfile.class_teacher_of',
            select:'section class_name'
        },
        {
            path:'teacherProfile.classes_assigned',
            select:'section class_name'
        }
    ])
        .select(`
            _id
            name
            role
            teacherProfile.designation
            teacherProfile.subjects
            teacherProfile.classes_assigned
            teacherProfile.class_teacher_of
            teacherProfile.announcement_allowed
        `)
    return teachers.map(t=>({
        _id:t._id,
        name:t.name,
        role:t.role,
        designation:t.teacherProfile?.designation ?? '',
        subjects:t.teacherProfile?.subjects ?? [],
        announcement_allowed:t.teacherProfile.announcement_allowed,
        class_teacher_of:t.teacherProfile?.class_teacher_of
        ? `${t.teacherProfile.class_teacher_of.class_name}${t.teacherProfile.class_teacher_of.section}`
        : '',
        classes_assigned: (t.teacherProfile?.classes_assigned || []).map(c => `${c.class_name}${c.section}`)
    }))

}

// req: teacher_id  //res: { _id,name, phone, email, employee_id, designation, subjects, class_teacher_of, classes_assigned }
async function handleGetTeacher(teacher_id) {
    const teacher=await userModel.findById(teacher_id)
    .populate([
        {
            path:'teacherProfile.class_teacher_of',
            select:'section class_name'
        },
        {
            path:'teacherProfile.classes_assigned',
            select:'section class_name'
        }
    ])
    .select(
        `
        name
        phone
        email
        teacherProfile.employee_id
        teacherProfile.designation
        teacherProfile.subjects
        teacherProfile.class_teacher_of
        teacherProfile.classes_assigned
        `
    )
    return {
    _id:teacher._id,
    name: teacher.name,
    phone: teacher.phone,
    email: teacher.email,
    employee_id: teacher.teacherProfile?.employee_id ?? '',
    designation: teacher.teacherProfile?.designation ?? '',
    subjects: teacher.teacherProfile?.subjects ?? [],
    //  single class
    class_teacher_of: teacher.teacherProfile?.class_teacher_of
        ? `${teacher.teacherProfile.class_teacher_of.class_name}${teacher.teacherProfile.class_teacher_of.section}`
        : '',
    //  multiple classes
    classes_assigned: (teacher.teacherProfile?.classes_assigned || [])
        .map(c => `${c.class_name}${c.section}`)
    }
}

//req:teacher_id //res:{success}
async function handleDeleteTeacher(teacher_id, school_id) {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {

            // Remove from arrays
            await classModel.updateMany(
                {
                    $or: [
                        { teachers: teacher_id },
                        { allowed_attendance_teachers: teacher_id }
                    ]
                },
                {
                    $pull: {
                        teachers: teacher_id,
                        allowed_attendance_teachers: teacher_id
                    }
                },
                { session }
            );

            // Remove as class teacher
            await classModel.updateMany(
                { class_teacher: teacher_id },
                { $set: { class_teacher: null } },
                { session }
            );

            // Delete related data
            await homeworkModel.deleteMany(
                { created_by: teacher_id },
                { session }
            );

            await announcementModel.deleteMany(
                { created_by: teacher_id },
                { session }
            );

            await leaveModel.updateMany(
                { class_teacher: teacher_id },
                { $set: { class_teacher: null } },
                { session }
            );

            await ptmModel.deleteMany(
                { teacher_id },
                { session }
            );

            await subjectModel.deleteMany(
                { teacher_id },
                { session }
            );

            await timetableModel.updateMany(
                { "periods.teacher": teacher_id },
                { $set: { "periods.$[elem].teacher": null } },
                {
                    arrayFilters: [{ "elem.teacher": teacher_id }],
                    session
                }
            );

            await schoolModel.updateOne(
                { _id: school_id, total_teachers: { $gt: 0 } },
                { $inc: { total_teachers: -1 } },
                { session }
            );

            await userModel.deleteOne(
                { _id: teacher_id, role: "Teacher" },
                { session }
            );
        });

        return { success: true };

    } catch (error) {

        console.error("Delete Teacher Error:", error);

        return {
            success: false,
            message: error.message
        };

    } finally {

        await session.endSession();
    }
}




//req:name,email,role,employee_id,class_teacher_of,classes_assigned,subjects  //res:{success,message}
async function handleCreateTeacher(name,email,phone,role,employee_id,class_teacher_of,subjects,school_id){
    const designation = class_teacher_of ? 'Mentor' : 'ST';
    let classTeacherOfId = null;
    if (class_teacher_of) {
        classTeacherOfId = await getClassId(class_teacher_of, school_id);
    }

    const teacher=await userModel.create({
        name:name,
        email:email,
        phone:phone,
        role:role,
        school_id:school_id,
        teacherProfile:{
            employee_id:employee_id,
            class_teacher_of:classTeacherOfId,
            designation:designation,
            subjects:subjects
        }
    });
    await schoolModel.findByIdAndUpdate(
    school_id,
    { $inc: { total_teachers: 1 } }
    );
    if (classTeacherOfId!==null){
        await classModel.findByIdAndUpdate(classTeacherOfId,{class_teacher:teacher._id})
    }
    return {success:true,message:"Teacher created successfully"}
} 

// req: teacher_id, { class_teacher_of, subjects }  // res: { success, message }
async function handleUpdateTeacher(teacher_id,payload) {
    const teacher=await userModel.findById(teacher_id)
    .select('teacherProfile school_id _id')

    const school_id=teacher.school_id
    const profile=teacher.teacherProfile

    if(payload.class_teacher_of!==undefined){
    // 1️⃣ Remove teacher from old class (if any)
        if (profile.class_teacher_of) {
            await classModel.findByIdAndUpdate(
                profile.class_teacher_of,
                { class_teacher: null }
            );
        }

        // 2️⃣ Assign new class (if provided)
        if (payload.class_teacher_of) {
            const classID = await getClassId(payload.class_teacher_of, school_id);
            const CLASS = await classModel.findById(classID);

            // remove previous teacher of this class
            if (CLASS.class_teacher) {
                await userModel.findByIdAndUpdate(
                    CLASS.class_teacher,
                    { 'teacherProfile.class_teacher_of': null }
                );
            }

            // assign
            profile.class_teacher_of = classID;
            await classModel.findByIdAndUpdate(
                classID,
                { class_teacher: teacher_id }
            );

            profile.designation = 'Mentor';
        } else {
            profile.class_teacher_of = null;
            profile.designation = 'ST';
        }
    }
        

    if (Array.isArray(payload.subjects)) {
        profile.subjects = payload.subjects;
    }
    teacher.teacherProfile=profile
    await teacher.save()
    return {
        success: true,
        message: "Teacher updated successfully"
    };

}

module.exports={
    handleGetAllTeachers,
    handleGetTeacher,
    handleCreateTeacher,
    handleDeleteTeacher,
    handleUpdateTeacher
}