const classModel=require('../models/classModel')

async function canMarkAttendance(user_id,class_id){
    const classDoc=await classModel.exists({
        _id:class_id,
        $or:[
            {class_teacher:user_id},
            {allowed_attendance_teachers:user_id}
        ]
    })
    if(classDoc!==null){
        return true
    }
    return false
}
module.exports={canMarkAttendance}