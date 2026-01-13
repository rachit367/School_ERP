const {
    handleGetTeacherClasses,
    handleGetDoubts,
    handleUpdateDoubt
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

async function getDoubts(req, res, next){
  try {
    const user_id=req.user_id
    const result=await handleGetDoubts(user_id)
    res.status(200).json(result);

  } catch (err) {
    next(err);
  }
};


//req:user_id,doubt_id //res:success
async function updateDoubt(req, res, next){
  try {
    //send empty reply to mark doubt as resolved
    const reply=req.reply ?? ''
    const doubt_id=req.params.id
    const result=await handleUpdateDoubt(doubt_id,reply)
    res.status(200).json({result});

  } catch (err) {
    next(err);
  }
};



module.exports={
    getTeacherClasses,
    getDoubts,
    updateDoubt
}
