const {
    handleGetTeacherClasses
}=require('./../services/teacherService')

async function getTeacherClasses(req,res,next){
    try{
        const user_id=req.user_id
        const result=await handleGetTeacherClasses(user_id)
        res.status(200).json(result)
    }catch(err){
        next(err)
    }
}

module.exports={
    getTeacherClasses
}
