const{
    handleGetAllSubjects,
    handleGetResources,
    handleGetDoubts
}=require('./../services/studentService')


async function getAllSubjects(req, res, next){
  try {
    const school_id=req.school_id
    const user_id=req.user_id
    const data=await handleGetAllSubjects(user_id,school_id)
    return res.status(200).json(data);

  } catch (err) {
    next(err);
  }
}

async function getResources(req, res, next){
  try {
    const school_id=req.school_id
    const subject_id=req.query.subject_id
    const data=await handleGetResources(school_id,subject_id)
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

async function getDoubts(req, res, next){ //only for subject  page 
  try {
    const student_id=req.user_id
    const school_id=req.school_id
    const data=await handleGetDoubts(school_id,student_id)
    res.status(200).json(data);

  } catch (err) {
    next(err);
  }
};

module.exports={
    getAllSubjects,
    getResources,
    getDoubts
}