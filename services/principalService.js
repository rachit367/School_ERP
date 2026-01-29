const schoolModel=require('../models/schoolModel')
const classAttendanceSummaryModel=require('../models/classAttendanceSummaryModel')
const bullyModel=require('./../models/bullyModel');
const classModel=require('./../models/classModel');

// req: school_id  // res: { total_students, total_teachers, total_absents, [class_name]: { [section]: { _id,attendance, class_teacher } } }
async function handleGetStats(school_id) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const school = await schoolModel.findById(school_id);
    

    const allClasses = await classModel.find({ school_id })
        .select('class_name sections class_teacher')
        .populate({
            path: 'class_teacher',
            select: 'name'
        })
        .lean();


    const summaries = await classAttendanceSummaryModel.find({
        school_id, date
    })
    .select('class_id section attendance_percent absent_count')
    .lean();


    const summaryMap = new Map();
    for (const summary of summaries) {
        const key = `${summary.class_id}_${summary.section}`;
        summaryMap.set(key, summary);
    }

    const total_students = school.total_students;
    const total_teachers = school.total_teachers;
    let result = { total_students, total_teachers, total_absents: 0 };


    for (const classItem of allClasses) {
        const class_name = classItem.class_name;
        const teacher_name = classItem.class_teacher?.name ?? '';

        if (!result[class_name]) {
            result[class_name] = {};
        }


        for (const section of classItem.sections) {
            const key = `${classItem._id}_${section}`;
            const summary = summaryMap.get(key);

            if (summary) {
                // Attendance was taken 
                result.total_absents += summary.absent_count;
                result[class_name][section] = {
                    _id: classItem._id,
                    attendance: summary.attendance_percent,
                    class_teacher: teacher_name
                };
            } else {
                // Attendance NOT taken - return 0%
                result[class_name][section] = {
                    _id: classItem._id,
                    attendance: 0,
                    class_teacher: teacher_name,
                    attendance_not_taken: true 
                };
            }
        }
    }

    return result;
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