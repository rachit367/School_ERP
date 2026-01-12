function isTeacher(req,res,next){
    try{
        const role=req.role
        if(role!=='Teacher'){
            return res.status(403).json({
            success: false,
            message: 'Access denied.'
        })}
        next()
    }catch(err){
        next(err)
    }
}

module.exports={isTeacher}