const {
    handleGetDoubts,
    handleUpdateDoubt,
    handlePostDoubt,
    handleGetSubjectDoubts,
    handleGetDoubtDetails
}=require('./../services/doubtService')

async function getDoubts(req, res, next){
  try {
    const user_id=req.user_id
    const school_id=req.school_id
    const result=await handleGetDoubts(user_id,school_id)
    res.status(200).json(result);

  } catch (err) {
    next(err);
  }
};

async function updateDoubt(req, res, next){
  try {
    //send empty reply to mark doubt as resolved
    const reply=req.body.reply ?? ''
    const doubt_id=req.params.id
    const result=await handleUpdateDoubt(doubt_id,reply)
    res.status(200).json(result);

  } catch (err) {
    next(err);
  }
};

async function postDoubt(req, res, next){
  try {
    const school_id=req.school_id
    const student_id=req.user_id
    const doubt=req.body.doubt
    const class_id=req.body.class_id
    const teacher_id=req.body.teacher_id
    const subject=req.body.subject
    const data=await handlePostDoubt(school_id,student_id,class_id,teacher_id,subject,doubt)
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

async function getSubjectDoubt(req, res, next){
  try {
    const school_id=req.school_id
    const user_id=req.user_id
    const teacher_id=req.query.teacher_id
    const data=await handleGetSubjectDoubts(teacher_id,user_id,school_id)
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

async function getDoubtDetails(req, res, next){
  try {
    const school_id=req.school_id
    const user_id=req.user_id
    const doubt_id=req.params.id
    const data=await handleGetDoubtDetails(school_id,user_id,doubt_id)
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

module.exports={
  updateDoubt,
  getDoubts,
  postDoubt,
  getSubjectDoubt,
  getDoubtDetails
}