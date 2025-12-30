const homeworkModel=require('./../models/homeworkModel')
const getClassId=require('./../utils/classIdUtil')

// req:  // res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission }]
async function handleGetAllHomeworks(user_id,school_id) {
    const homeworks = await homeworkModel
    .find({ school_id, created_by: user_id })
    .select('_id topic description deadline submitted_by class_id')
    .populate({
        path: 'class_id',
        select: 'class_name section students'
      })
    .sort({ deadline: 1 })
    .lean();

    const payload = homeworks.map(hw => ({
      id: hw._id,
      topic: hw.topic,
      description: hw.description,
      class_name: hw.class_id?.class_name || null,
      section: hw.class_id?.section || null,
      due_date: hw.deadline,
      total_students: hw.class_id?.students?.length ?? 0,
      total_submission: hw.submitted_by?.length ?? 0
    }));
    return payload
}

// req: homework_id  // res: { id, topic, description, class_name, section, due_date, total_students, total_submission, submitted_by[] }
async function handleGetHomeworkDetails(homework_id){
    const hw=await homeworkModel.findById(homework_id)
    .populate({path:'class_id',select:'class_name section students'})
    .populate({path:'submitted_by.student_id',select:'name'})
    .select('_id class_id topic description deadline submitted_by')
    .lean()
    const payload={
        id:hw._id,
        topic:hw.topic,
        description:hw.description,
        class_name:hw.class_id.class_name,
        section:hw.class_id.section,
        due_date:hw.deadline,
        total_students:hw.class_id?.students?.length || 0,
        total_submission:hw?.submitted_by?.length || 0,
        submitted_by:hw.submitted_by.map(s=>({
            name:s.student_id.name,
            submitted_at:s.submitted_at
        }))
    }
    return payload
}

//req: Class,topic,description,due_date  //res:success,message
async function handlePostHomework(user_id,school_id,Class,topic,description,due_date){
    const class_id=await getClassId(Class,school_id)
    await homeworkModel.create({
        school_id:school_id,
        created_by:user_id,
        class_id:class_id,
        topic:topic,
        description:description,
        deadline:new Date(due_date)
    })
    return {
        success:true,
        message:"Homework uploaded successfully"
    }
}

//req:classId //res:res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission }]
async function handleGetClassHomework(class_id,user_id) {
    const homeworks=await homeworkModel.find({class_id:class_id,created_by:user_id})
    .select('_id class_id topic description deadline submitted_by')
    .populate({path:'class_id',select:'class_name section students'})
    .sort({deadline:1})
    .lean()
    if(homeworks.length===0){
        return []
    }
    const payload=homeworks.map(hw=>({
        id:hw._id,
        topic:hw.topic,
        description:hw.description,
        class_name: hw.class_id?.class_name || null,
        section: hw.class_id?.section || null,
        due_date: hw.deadline,
        total_students: hw.class_id?.students?.length ?? 0,
        total_submission: hw.submitted_by?.length ?? 0
    }))
    return payload

}
module.exports={
    handleGetAllHomeworks,
    handleGetHomeworkDetails,
    handlePostHomework,
    handleGetClassHomework
}