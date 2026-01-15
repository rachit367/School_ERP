const classModel=require('./../models/classModel')
const leaveModel=require('./../models/leaveModel')

//req:school_id,user_id  //res:[{_id,status,reason,start_date,end_date}]
async function handleGetLeaveHistory(school_id,student_id) {  //student section
    const history=await leaveModel.find({school_id,student:student_id})
    .select('status reason start_date end_date')
    .sort({start_date:-1})
    .lean()
    return {history}
}

//req:school_id,user_id  //res:[{_id,student_name,start_date,end_date,reason,status}]
async function handleGetLeaveRequest(school_id, teacher_id) {
    const requests = await leaveModel.find({
        school_id,
        class_teacher: teacher_id
    })
    .populate({ path: 'student', select: 'name' })
    .select('student status reason start_date end_date')
    .lean()

    const order = {
        Pending: 1,
        Approved: 2,
        Rejected: 3
    }

    requests.sort((a, b) => {
        // first sort by status
        if (order[a.status] !== order[b.status]) {
            return order[a.status] - order[b.status]
        }

        // if same status → sort by nearest start_date
        return new Date(a.start_date) - new Date(b.start_date)
    })

    return requests.map(r => ({
        student_name: r.student?.name || 'N/A',
        start_date: r.start_date,
        end_date: r.end_date,
        reason: r.reason || '',
        status: r.status
    }))
}

//req:req_id //res:success
async function handleApproveRequest(school_id,req_id){
    await leaveModel.findOneAndUpdate({school_id:school_id,_id:req_id},{status:'Approved'})
    return {success:true}
}

//req:req_id  //res:success
async function handleRejectRequest(school_id,req_id){
    await leaveModel.findOneAndUpdate({school_id:school_id,_id:req_id},{status:'Rejected'})
    return {success:true}
}

//req:school_id,student_id,class_id,reason,start_date,end_date  //res:success
async function handleMakeRequest(school_id,student_id,class_id,reason,start_date,end_date){
    const classDoc=await classModel.findById(class_id)
    .select('class_teacher')
    .lean()
    await leaveModel.create({  //date in YYYY-MM-DD
        school_id,
        student:student_id,
        reason,
        start_date:new Date(start_date),
        end_date:new Date(end_date),
        class_teacher:classDoc.class_teacher
    })
    return {success:true}
}

module.exports={
    handleApproveRequest,
    handleGetLeaveHistory,
    handleGetLeaveRequest,
    handleRejectRequest,
    handleMakeRequest
}