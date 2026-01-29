const userModel = require('./../models/userModel')
const leaveModel = require('./../models/leaveModel')
const doubtModel = require('./../models/doubtModel')

//req: user_id  //res:[{id,class_name,section,total_students,class_teacher_name}]

async function handleGetTeacherClasses(user_id) {
    const user = await userModel
        .findById(user_id)
        .select('name teacherProfile')
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
        .lean();

    if (!user || !user.teacherProfile) return [];

    const { classes_assigned = [], class_teacher_of } = user.teacherProfile;

    const result = [];

    // Add class teacher class (if exists)
    if (class_teacher_of) {
        result.push({
            id: class_teacher_of._id,
            class_name: class_teacher_of.class_name,
            section: class_teacher_of.section,
            total_students: class_teacher_of.students?.length || 0,
            class_teacher_name: user.name
        });
    }

    // Add assigned classes
    const assigned = classes_assigned.map(cls => ({
        id: cls._id,
        class_name: cls.class_name,
        section: cls.section,
        total_students: cls.students?.length || 0,
        class_teacher_name: cls.class_teacher?.name || ''
    }));
    const ans=result.concat(assigned);
    return ans;
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