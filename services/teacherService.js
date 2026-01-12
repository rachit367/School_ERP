const doubtModel=require('./../models/doubtModel')
const userModel=require('./../models/userModel')


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

//req:user_id
async function handleGetDoubts(user_id){
    const doubts=await doubtModel.find({teacher:user_id})
    .select('_id student_name class_name doubt status createdAt')
    .lean()
    return doubts
}


async function handleUpdateDoubt(doubt_id,reply) { //send empty reply to mark doubt as resolved
    const doubt=await doubtModel.findOneAndUpdate({
        _id:doubt_id
    },{
        'reply.text':reply,
        'reply.replied_at':new Date(),
        status:'Resolved'
    })
    return {success:true}
}


module.exports={
    handleGetTeacherClasses,
    handleGetDoubts,
    handleUpdateDoubt
}