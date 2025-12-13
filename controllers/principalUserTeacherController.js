
const { handleGetAllTeachers,handleGetTeacher,handleCreateTeacher,handleDeleteTeacher,handleUpdateTeacher} = require('./../services/principalUserTeacherService')

//req:  //res: [{ _id, name, role, designation, subjects, classes_assigned }]
async function getAllTeachers(req,res,next) {
    try{
        const user_id=req.user_id
        const teachers=await handleGetAllTeachers(user_id)
        return res.json(teachers)
    }catch(err){
        next(err)
    }
}

// req: teacher_id  //res: { _id,name, phone, email, employee_id, designation, subjects, class_teacher_of, classes_assigned }
async function getTeacher(req,res,next) {
    try{
        const teacher_id=req.params.id
        const details=await handleGetTeacher(teacher_id)
        return res.json(details)
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
            employee_id,
            class_teacher_of,
            classes_assigned,
            subjects
        } = req.body;
        const response = await handleCreateTeacher(
            user_id,
            name,
            email,
            role,
            employee_id,
            class_teacher_of,
            classes_assigned,
            subjects
        );
        return res.json(response);
    }catch(err){
        next(err)
    }
}

//req:teacher_id //res:{success}
async function deleteTeacher(req,res,next) {
    try{
        const response=await handleDeleteTeacher(req.params.id)
        return res.json(response)
    }catch(err){
        next(err)
    }
}

async function updateTeacher(req,res,next){
    try{    
        const response=await handleUpdateTeacher(req.params.id,req.body)
        return res.json(response)
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