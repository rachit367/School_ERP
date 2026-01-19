const subjectModel=require('./../models/subjectModel')

//req:   //res:[{subject,teacher}]
async function handleGetAllSubjects(student_id,school_id) {
    const user=await userModel.findOne({_id:student_id})
    .select('studentProfile.class_id')
    .lean()

    const subjects=await subjectModel.find({school_id,class_id:user.studentProfile.class_id})
    .populate({path:'teacher_id',select:'name'})
    .select('name teacher_id')
    .lean()

    let payload=subjects.map(s=>({
        subject:s.name,
        teacher:s.teacher_id?.name ??''
    }))
    return payload
}

module.exports={
    handleGetAllSubjects
}