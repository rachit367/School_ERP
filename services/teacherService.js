const userModel=require('./../models/userModel')
const leaveModel=require('./../models/leaveModel')
const doubtModel=require('./../models/doubtModel')

//req: user_id  //res:[{id,class_name,section,total_students,class_teacher_name}]

async function handleGetTeacherClasses(user_id) {
    const user = await userModel.findById(user_id)
        .populate({
            path: 'teacherProfile.classes_assigned',
            select: 'class_name section students class_teacher',
            populate: {
                path: 'class_teacher',
                select: 'name'
            }
        })
        .populate({
            path: 'teacherProfile.class_teacher_of',
            select: 'class_name section students'
        })
        .select('name teacherProfile')
        .lean();

    const assignedClasses = user.teacherProfile?.classes_assigned || [];
    const classTeacherClasses = user.teacherProfile?.class_teacher_of || [];

    const result = [
    ...classTeacherClasses.map(cls => ({
        id: cls._id,
        class_name: cls.class_name,
        section: cls.section,
        total_students: cls.students?.length || 0,
        class_teacher_name: user.name,
    })),
    ...assignedClasses.map(cls => ({
        id: cls._id,
        class_name: cls.class_name,
        section: cls.section,
        total_students: cls.students?.length || 0,
        class_teacher_name: cls.class_teacher?.name || '',
    }))
    ];
    return result;
}

async function handleGetInsights(user_id,school_id) {
    const pendingLeaveRequests=await leaveModel.countDocuments({school_id,class_teacher:user_id,status:'Pending'})
    const pendingDoubts=await doubtModel.countDocuments({school_id,teacher:user_id,status:'Pending'})
    return {pendingDoubts,pendingLeaveRequests}
}

module.exports={
    handleGetTeacherClasses,
    handleGetInsights
}