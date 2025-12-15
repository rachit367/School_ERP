const schoolModel=require('./../models/schoolModel')
const classAttendanceSummaryModel=require('./../models/classAttendaceSummaryModel')

// req: school_id  // res: { total_students, total_teachers, total_absents, [class_name]: { [section]: { attendance, class_teacher } } }
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
    const result={total_students,total_teachers,total_absents:0}
    for(const item of summaries){
        const class_name=item.class_id.class_name;
        const section=item.section;
        const teacher_name=item.class_id.class_teacher?.name ??'';
        if (!result[class_name]) {
            result[class_name] = {};
            }
        result.total_absents+=item.absent_count
        result[class_name][section] = {
        attendance: item.attendance_percent,
        class_teacher: teacher_name
        };
    }
    return result
}



module.exports={handleGetStats}