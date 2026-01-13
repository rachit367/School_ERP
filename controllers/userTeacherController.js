
const { handleGetAllTeachers,handleGetTeacher,handleCreateTeacher,handleDeleteTeacher,handleUpdateTeacher} = require('../services/userTeacherService')

//req:  //res: [{ _id, name, role, designation, subjects, classes_assigned }]
async function getAllTeachers(req,res,next) {
    try{
        const school_id=req.school_id
        const teachers=await handleGetAllTeachers(school_id)   
        return res.status(200).json(teachers)
    }catch(err){
        next(err)
    }
}

// req: teacher_id  //res: { _id,name, phone, email, employee_id, designation, subjects, class_teacher_of, classes_assigned }
async function getTeacher(req,res,next) {
    try{
        const teacher_id=req.params.id
        const details=await handleGetTeacher(teacher_id)
        return res.status(200).json(details)
    }catch(err){
        next(err)
    }
}

//req:name,email,role,employee_id,class_teacher_of,classes_assigned,designation,subjects  //res:{success,message}
async function createTeacher(req,res,next){
    try{
        const user_id = req.user_id;
        const {
            name,
            email,
            role,
            phone,
            employee_id,
            class_teacher_of,
            classes_assigned,
            subjects
        } = req.body;
        const response = await handleCreateTeacher(
            user_id,
            name,
            email,
            phone,
            role,
            employee_id,
            class_teacher_of,
            classes_assigned,
            subjects
        );
        return res.status(200).json(response);
    }catch(err){
        next(err)
    }
}

//req:teacher_id //res:{success}
async function deleteTeacher(req,res,next) {
    try{
        const response=await handleDeleteTeacher(req.params.id,req.school_id)
        return res.status(200).json(response)
    }catch(err){
        next(err)
    }
}

async function updateTeacher(req,res,next){
    try{    
        const response=await handleUpdateTeacher(req.params.id,req.body)
        return res.status(200).json(response)
    }catch(err){
        next(err)
    }
}
module.exports = {
    getAllTeachers,
    getTeacher,
    deleteTeacher,
    createTeacher,
    updateTeacher
}