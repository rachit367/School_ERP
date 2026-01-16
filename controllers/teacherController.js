const {
    handleGetTeacherClasses,
    handleGetInsights
}=require('./../services/teacherService')

//req: user_id  //res:[{id,class_name,section,total_students,class_teacher_name}]
async function getTeacherClasses(req,res,next){
    try{
        const user_id=req.user_id
        const result=await handleGetTeacherClasses(user_id)
        res.status(200).json(result)
    }catch(err){
        next(err)
    }
}

async function getInsights(req,res,next) {
    try{
        const user_id=req.user_id
        const school_id=req.school_id
        const data=handleGetInsights(user_id,school_id)
        return res.status(200).json(data)
    }catch(err){
        next(err)
    }
}

module.exports={
    getTeacherClasses,
    getInsights
}
