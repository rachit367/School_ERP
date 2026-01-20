const doubtModel=require('./../models/doubtModel')

//req:  //res:[{_id,student_name,subject,class_name,section,doubt,status}]
async function handleGetDoubts(teacher_id,school_id){
    const doubts=await doubtModel.find({
        school_id,
        teacher:teacher_id
    })
    .populate({path:'class_id',select:'class_name section'})
    .populate({path:'student',select:'name'})
    const payload=doubts.map(d=>({
        _id:d._id,
        student_name:d.student.name,
        subject:d.subject,
        doubt:d.doubt,
        status:d.status,
        class_name:d.class_id.class_name,
        section:d.class_id.section
    }))
    return payload
}

//req:doubt_id,reply   //res:success
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

//req:teacher_id  //res:[{_id,subject,doubt,reply,replied_at,status}]
async function handleGetSubjectDoubts(teacher_id,student_id,school_id) {
    const doubts=await doubtModel.find({teacher:teacher_id,student:student_id,school_id})
    .select("subject doubt reply.text reply.replied_at status")
    .lean()
    const payload=doubts.map(s=>({
        _id:s._id,
        subject:s.subject,
        doubt:s.doubt,
        reply:s.reply.text,
        replied_at:s.reply.replied_at,
        status:s.status
    }))
    return payload
}

//req:class_id,teacher_id,subject,doubt  //res:success
async function handlePostDoubt(school_id,student_id,class_id,teacher_id,subject,doubt) {
    const doubt=await doubtModel.create({
        school_id,
        class_id,
        subject,
        student:student_id,
        teacher:teacher_id,
        doubt
    })
    return {success:true}
}

//req:doubt_id //res:teacher_name,doubt,reply,replied_at
async function handleGetDoubtDetails(school_id,student_id,doubt_id) {
    const doubt=await doubtModel.findOne({
        _id:doubt_id,
        student:student_id,
        school_id
    }).populate({path:'teacher',select:'name'})
    .lean()
    const payload={
        teacher:doubt.teacher.name,
        doubt:doubt.doubt,
        reply:doubt.reply.text,
        replied_at:doubt.reply.replied_at
    }
    return payload
}

module.exports={
    handleGetDoubts,
    handleUpdateDoubt,
    handleGetSubjectDoubts,
    handlePostDoubt,
    handleGetDoubtDetails
}