const schoolModel=require('../models/schoolModel')
const classAttendanceSummaryModel=require('../models/classAttendaceSummaryModel')
const bullyModel=require('./../models/bullyModel');

// req: school_id  // res: { total_students, total_teachers, total_absents, [class_name]: { [section]: { _id,attendance, class_teacher } } }
async function handleGetStats(school_id){
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const school=await schoolModel.findById(school_id)
    const summaries=await classAttendanceSummaryModel.find({
        school_id,date
    })
    .select('class_id section attendance_percent absent_count')
    .populate({
        path:'class_id',
        select:'class_name class_teacher',
        populate:{
            path:'class_teacher',
            select:'name'
        }
    })
    .lean();//to avoid mongo overhead and increase performance

    const total_students=school.total_students
    const total_teachers=school.total_teachers
    let result={total_students,total_teachers,total_absents:0}
    for(const item of summaries){
        const class_name=item.class_id.class_name;
        const section=item.section;
        const teacher_name=item.class_id.class_teacher?.name ??'';
        if (!result[class_name]) {
            result[class_name] = {};
            }
        result.total_absents+=item.absent_count
        result[class_name][section] = {
        _id:item.class_id,
        attendance: item.attendance_percent,
        class_teacher: teacher_name
        };
    }
    return result
}

//req:    //res:bully_name,status,description,reported_by.name,bully_class
async function handleGetAllBullyReport(school_id){
    const reports=await bullyModel.find({school_id})
    .populate({path:'reported_by',select:'name'})
    .lean()
    return  reports
}

//req:report_id   //res:success  
async function handleMarkBullyReport(school_id,report_id){
    await bullyModel.findOneAndUpdate({
        school_id,
        _id:report_id
    },
    {
        status:'Resolved'
    })
    return {success:true}
}

//req:report_id   //res:success  
async function handleDeleteBullyReport(school_id,report_id) {
    await bullyModel.findOneAndDelete({school_id,_id:report_id})
    return {success:true}
}

module.exports={
    handleGetStats,
    handleGetAllBullyReport,
    handleDeleteBullyReport,
    handleMarkBullyReport
}