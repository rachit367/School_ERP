const homeworkModel=require('./../models/homeworkModel')
const getClassId=require('./../utils/classIdUtil')
const mongoose = require("mongoose");
// req:  // res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission ,subject}]
async function handleGetAllHomeworks(user_id,school_id) {
    const homeworks = await homeworkModel
    .find({ school_id, created_by: user_id })
    .select('_id topic description deadline submitted_by subject class_id')
    .populate({
        path: 'class_id',
        select: 'class_name section students'
      })
    .sort({ deadline: 1 })
    .lean();

    const payload = homeworks.map(hw => ({
      id: hw._id,
      subject:hw.subject,
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

// req: homework_id  // res: { id, topic, description, class_name, section, due_date, total_students,subject, total_submission, submitted_by[] }
async function handleGetHomeworkDetails(homework_id){
    const hw=await homeworkModel.findById(homework_id)
    .populate({path:'class_id',select:'class_name section students'})
    .populate({path:'submitted_by.student_id',select:'name'})
    .select('_id class_id topic description deadline submitted_by subject')
    .lean()
    if (!hw) {
    const err = new Error('Homework not found');
    err.statusCode = 404;
    throw err;
}
    const payload={
        id:hw._id,
        topic:hw.topic,
        subject:hw.subject,
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

//req: Class,topic,description,due_date,subejct  //res:success,message
async function handlePostHomework(user_id,school_id,Class,topic,description,due_date,subject){
    const class_id=await getClassId(Class,school_id)
    await homeworkModel.create({
        school_id:school_id,
        created_by:user_id,
        class_id:class_id,
        topic:topic,
        subject,
        description:description,
        deadline:new Date(due_date)
    })
    return {
        success:true,
        message:"Homework uploaded successfully"
    }
}

//req:classId //res:res: [{ id, topic, description, class_name, section, due_date, total_students, total_submission ,subejct}]
async function handleGetClassHomework(class_id,user_id) {
    const homeworks=await homeworkModel.find({class_id:class_id,created_by:user_id})
    .select('_id class_id topic description deadline subject submitted_by')
    .populate({path:'class_id',select:'class_name section students'})
    .sort({deadline:1})
    .lean()
    if(homeworks.length===0){
        return []
    }
    const payload=homeworks.map(hw=>({
        id:hw._id,
        topic:hw.topic,
        subject:hw.subject,
        description:hw.description,
        class_name: hw.class_id?.class_name || null,
        section: hw.class_id?.section || null,
        due_date: hw.deadline,
        total_students: hw.class_id?.students?.length ?? 0,
        total_submission: hw.submitted_by?.length ?? 0
    }))
    return payload

}

//req:class_id,teacher_id  //res:{completed,pending,submitted}-each is an array of {_id,topic,description,attachments,deadline,subject}
async function handleGetSubjectHomeworks(school_id, class_id, teacher_id, student_id) {
    const studentObjectId = mongoose.Types.ObjectId(student_id);

    const categorized = await homeworkModel.aggregate([
        // Match base criteria
        {
            $match: {
                school_id: mongoose.Types.ObjectId(school_id),
                class_id: mongoose.Types.ObjectId(class_id),
                created_by: mongoose.Types.ObjectId(teacher_id)
            }
        },
        // Filter submissions for this specific student
        {
            $addFields: {
                studentSubmission: {
                    $filter: {
                        input: { $ifNull: ["$submitted_by", []] },
                        as: "sub",
                        cond: { $eq: ["$$sub.student_id", studentObjectId] }
                    }
                }
            }
        },
        // Determine if student has submitted
        {
            $addFields: {
                hasSubmission: { $gt: [{ $size: "$studentSubmission" }, 0] },
                submissionData: { $arrayElemAt: ["$studentSubmission", 0] }
            }
        },
        // Categorize homework
        {
            $addFields: {
                category: {
                    $cond: {
                        if: "$hasSubmission",
                        then: {
                            $cond: {
                                if: { $lte: ["$submissionData.submitted_at", "$deadline"] },
                                then: "completed",  // submitted on time
                                else: "submitted"   // submitted late
                            }
                        },
                        else: "pending"  // not submitted
                    }
                }
            }
        },
        // Remove unnecessary fields
        {
            $project: {
                submitted_by: 0,
                school_id: 0,
                class_id: 0,
                created_by: 0,
                studentSubmission: 0,
                hasSubmission: 0,
                submissionData: 0
            }
        }
    ]);

    // Group results by category
    const completed = categorized.filter(hw => hw.category === "completed");
    const submitted = categorized.filter(hw => hw.category === "submitted");
    const pending = categorized.filter(hw => hw.category === "pending");

    // Remove category field from final results
    completed.forEach(hw => delete hw.category);
    submitted.forEach(hw => delete hw.category);
    pending.forEach(hw => delete hw.category);

    return { completed, pending, submitted }
}

//req:class_id,homework_id  //res:topic,description,deadline,_id
async function handleGetStudentHomeworkDetails(homework_id,school_id,class_id) {
    const homework=await homeworkModel.findOne({
        _id:homework_id,
        school_id,
        class_id
    })
    .select('topic _id description deadline subject')
    .lean()
    return homework
}


async function handleGetPendingHomeworksCount(school_id,class_id,student_id) {
    const studentObjectId = new mongoose.Types.ObjectId(student_id);

    const result = await homeworkModel.aggregate([

        {
            $match: {
                school_id,
                class_id,
                submitted_by: {
                    $not: {
                        $elemMatch: {
                            student_id: studentObjectId
                        }
                    }
                }
            }
        },

        {
            $group: {
                _id: "$subject",
                count: { $sum: 1 }
            }
        },

        {
            $project: {
                _id: 0,
                subject: "$_id",
                count: 1
            }
        }

    ]);

    const formatted = {};

    result.forEach(item => {
        formatted[item.subject] = item.count;
    });

    return formatted;
}


async function handleSubmitHomework() {  //TODO after s3 bucket access
    console.log('TODO when s3 bucket linked')
    return {success:true}
}



module.exports={
    handleGetAllHomeworks,
    handleGetHomeworkDetails,
    handlePostHomework,
    handleGetClassHomework,
    handleGetSubjectHomeworks,
    handleSubmitHomework,
    handleGetStudentHomeworkDetails,
    handleGetPendingHomeworksCount
}