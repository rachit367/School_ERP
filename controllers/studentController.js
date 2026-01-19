const{
    handleGetAllSubjects
}=require('./../services/studentService')


async function getAllSubjects(req, res, next){
  try {
    const school_id=req.school_id
    const user_id=req.user_id
    const data=await handleGetAllSubjects(user_id,school_id)
    res.status(200).json(data);

  } catch (err) {
    next(err);
  }
}

module.exports={
    getAllSubjects
}