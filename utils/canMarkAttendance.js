const classModel=require('../models/classModel')
const mongoose=require('mongoose')

async function canMarkAttendance(user_id, class_id) {
    return !!await classModel.exists({
        _id: new mongoose.Types.ObjectId(class_id),
        $or: [
            { class_teacher: new mongoose.Types.ObjectId(user_id) },
            { allowed_attendance_teachers: new mongoose.Types.ObjectId(user_id) }
        ]
    });
}
module.exports={canMarkAttendance}