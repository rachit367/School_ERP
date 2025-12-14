const userModel=require('../models/userModel')
const getClassId=require('./../utils/classIdUtil')
const classModel=require('./../models/classModel')

//req:  //res: [{ _id, name, role, designation, subjects, classes_assigned }]
async function handleGetAllTeachers(user_id) {
    const user=await userModel.findById(user_id).select('school_id')
    const teachers=await userModel.find({
        school_id:user.school_id,
        role:'Teacher'})
        .populate({path:'teacherProfile.classes_assigned',select:'class_name section'})
        .select(`
            _id
            name
            role
            teacherProfile.designation
            teacherProfile.subjects
            teacherProfile.classes_assigned
        `)
    return teachers.map(t=>({
        _id:t._id,
        name:t.name,
        role:t.role,
        designation:t.teacherProfile?.designation ?? '',
        subjects:t.teacherProfile?.subjects ?? [],
        classes_assigned: (t.teacherProfile?.classes_assigned || []).map(c => `${c.class_name}-${c.section}`)
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
        ? `${teacher.teacherProfile.class_teacher_of.class_name}-${teacher.teacherProfile.class_teacher_of.section}`
        : '',
    //  multiple classes
    classes_assigned: (teacher.teacherProfile?.classes_assigned || [])
        .map(c => `${c.class_name}-${c.section}`)
    }
}

//req:teacher_id //res:{success}
async function handleDeleteTeacher(teacher_id) {
    await userModel.deleteOne({_id:teacher_id})
    return {success:true}
}

//req:name,email,role,employee_id,class_teacher_of,classes_assigned,designation,subjects  //res:{success,message}
async function handleCreateTeacher(user_id,name,email,role,employee_id,class_teacher_of,classes_assigned,subjects){
    const user=await userModel.findById(user_id)
    .select('school_id');
    const designation = class_teacher_of ? 'Mentor' : 'ST';
    let classTeacherOfId = null;
    if (class_teacher_of) {
        classTeacherOfId = await getClassId(class_teacher_of, user.school_id);
    }
    let assignedClassIds = [];
    if (Array.isArray(classes_assigned) && classes_assigned.length > 0) {
        assignedClassIds = await Promise.all(
            classes_assigned.map(cls =>
                getClassId(cls, user.school_id)
            )
        );
    }
    const teacher=await userModel.create({
        name:name,
        email:email,
        role:role,
        school_id:user.school_id,
        teacherProfile:{
            employee_id:employee_id,
            class_teacher_of:classTeacherOfId,
            classes_assigned:assignedClassIds,
            designation:designation,
            subjects:subjects
        }
    });
    if (classTeacherOfId!==null){
        await classModel.findByIdAndUpdate(classTeacherOfId,{class_teacher:teacher._id})
    }
    return {success:true,message:"Teacher created successfully"}
} 

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
        
    if (Array.isArray(payload.classes_assigned)) {
        const classIds = [];

        for (let cls of payload.classes_assigned) {
            const classId = await getClassId(cls, school_id);
            classIds.push(classId);
        }

        profile.classes_assigned = classIds;
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