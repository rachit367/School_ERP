const subjectModel=require('./../models/subjectModel')
const userModel=require('./../models/userModel')

//req:   //res:[{subject,teacher,teacher_id,_id}]
async function handleGetAllSubjects(student_id,school_id) {
    const user=await userModel.findOne({_id:student_id})
    .select('studentProfile.class_id')
    .lean()

    const subjects=await subjectModel.find({school_id,class_id:user.studentProfile.class_id})
    .populate({path:'teacher_id',select:'name'})
    .select('name teacher_id')
    .lean()

    let payload=subjects.map(s=>({
        _id:s._id,
        subject:s.name,
        teacher:s.teacher_id?.name ??'',
        teacher_id:s.teacher_id._id
    }))
    return payload
}

//req:subject_id  //res:_id,resources[]
async function handleGetResources(school_id,subject_id){
    const subject=await subjectModel.findOne({school_id,_id:subject_id})
    .select('resources')
    .lean()
    return subject
}

module.exports={
    handleGetAllSubjects,
    handleGetResources
}