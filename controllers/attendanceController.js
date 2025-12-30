const userModel = require('../models/userModel');
const {
    handleCheckAllowedClass,
    handlesaveDailyAttendance,
    handleAssignSubstituteTeacher,
    handleRemoveSubstituteTeacher,
    handleGetStudentAttendance,
    handleGetClassAttendance}=require('./../services/attendanceService')

//req:class_id // res: allowed(true or false)
async function checkAllowedClass(req, res, next) {
    try {
        const school_id=req.school_id;
        if (!school_id) {
            throw new Error("school_id is required");
        }
        const user_id=req.user_id
        const class_id=req.params.id
        const allowed =await handleCheckAllowedClass(user_id,class_id,school_id)
        return res.status(200).json({allowed})
    } catch (err) {
        next(err);
    }
}

//req:class_name  //res:{payload-{student_id,name,roll_number,attendance_percent,todays_status}}
async function getClassAttendance(req, res, next) {
    try {
        const user_id=req.user_id
        const class_id=req.params.classid
        const result=await handleGetClassAttendance(user_id,class_id)
        return res.status(200).json(result)
    } catch (err) {
        next(err);
    }
}

//req:class_id,attendance  //res:success,message
async function saveDailyAttendance(req, res, next) {
    try {
        const attendance=req.body.attendance
        const class_id=req.body.class_id
        const user_id=req.user_id
        const result=await handlesaveDailyAttendance(user_id,class_id,attendance)
        return res.status(200).json(result)
    } catch (err) {
        next(err);
    }
}

//req:school_id,substitute_id   //res:success,message
async function assignSubstituteTeacher(req, res, next) {
    try {
        const substitute_id=req.body.substitute_id
        const school_id=req.school_id
        const user_id=req.user_id
        const result=await handleAssignSubstituteTeacher(user_id,substitute_id,school_id) 
        return res.status(200).json(result)
    } catch (err) {
        next(err);
    }
}
//req:school_id,substitute_id   //res:success,message
async function removeSubstituteTeacher(req, res, next) {
    try {
        const substitute_id=req.body.substitute_id
        const school_id=req.school_id
        const user_id=req.user_id
        const result=await handleRemoveSubstituteTeacher(user_id,substitute_id,school_id) 
        return res.status(200).json(result)
    } catch (err) {
        next(err);
    }
}

//req:from_date,to_date,student_id  //res:{name,roll_number,{date:status},attendance_percentage,present,absent}
async function getStudentAttendance(req, res, next) {
    try {
        const {from_date,to_date}=req.query
        const student_id=req.params.id
        const result=await handleGetStudentAttendance(from_date,to_date,student_id)
        return res.status(200).json(result)
    } catch (err) {
        next(err);
    }
}

module.exports = {
    checkAllowedClass,
    getClassAttendance,
    saveDailyAttendance,
    assignSubstituteTeacher,
    removeSubstituteTeacher,
    getStudentAttendance
};
