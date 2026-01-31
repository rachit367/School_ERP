const {
    handleGetAllHomeworks,
    handleGetHomeworkDetails,
    handlePostHomework,
    handleGetClassHomework,
    handleGetSubjectHomeworks,
    handleSubmitHomework,
    handleGetStudentHomeworkDetails,
    handleGetPendingHomeworksCount
}=require('./../services/homeworkService')

async function getAllHomeworks(req,res,next){
    try{
        const user_id=req.user_id
        const school_id=req.school_id
        const result=await handleGetAllHomeworks(user_id,school_id)
        res.status(200).json(result)
    }catch(err){
        next(err)
    }
}

async function getHomeworkDetails(req,res,next) {
    try{
        const id=req.params.id
        const result=await handleGetHomeworkDetails(id)
        res.status(200).json(result)
    }catch(err){
        next(err)
    }
}


async function postHomework(req,res,next){
    try{
        const {
            Class,
            topic,
            description,
            due_date,
            subject
        }=req.body
        const school_id=req.school_id
        const user_id=req.user_id
        const result=await handlePostHomework(user_id,school_id,Class,topic,description,due_date,subject)
        return res.status(200).json(result)
    }catch(err){
        next(err)
    }
}

async function getClassHomework(req,res,next) {
    try{
        const class_id=req.params.classid
        const user_id=req.user_id
        const result=await handleGetClassHomework(class_id,user_id)
        return res.status(200).json(result)
    }catch(err){
        next(err)
    }
}

async function getSubjectHomeworks(req, res, next){
  try {
    const school_id=req.school_id
    const user_id=req.user_id
    const class_id=req.query.class_id
    const teacher_id=req.query.teacher_id
    const data=await handleGetSubjectHomeworks(school_id,class_id,teacher_id,user_id)
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

async function getStudentHomeworkDetails(req, res, next){
  try {
    const school_id=req.school_id
    const user_id=req.user_id
    const homework_id=req.params.homeworkid
    const class_id=req.query.class_id
    const data=await handleGetStudentHomeworkDetails(homework_id,school_id,class_id)
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

async function getPendingHomeworksCount(req, res, next){
  try {
    const school_id=req.school_id
    const student_id=req.user_id
    const class_id=req.query.class_id
    const data=await handleGetPendingHomeworksCount(school_id,class_id,student_id)
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

async function submitHomework(req, res, next){
  try {
    const data=await handleSubmitHomework()
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

module.exports={
    getAllHomeworks,
    getHomeworkDetails,
    postHomework,
    getClassHomework,
    getSubjectHomeworks,
    postHomework,
    getStudentHomeworkDetails,
    submitHomework,
    getPendingHomeworksCount
}