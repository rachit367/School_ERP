const announcementModel=require('./../models/announcementModel')
const userModel=require('./../models/userModel')
const classModel=require('./../models/classModel')
const getClassId=require('./../utils/classIdUtil')

//req:   //res: [{_id, message, title, createdAt}]
async function handleGetSchoolAnnouncements(school_id){
    const user=await userModel.findById(user_id)
    if (user.role === 'Student') return [];
    const announcements=await announcementModel.find({school_id:user.school_id})
    .select("message title createdAt _id")
    .sort({createdAt:-1})
    return announcements
}
//req:  //res:[title,message,createdAt,_id]
async function handleGetClassAnnouncements(user_id){
    const user=await userModel.findById(user_id)
    if (!user.studentProfile?.class_id) return [];
    const announcements=await announcementModel.find({school_id: user.school_id,
        $or: [
            { class_id: user.studentProfile.class_id }, // class announcements
            { class_id: { $exists: true, $eq: [] } }                 // school-wide announcements
        ]})
    .select("title message createdAt _id")
    .sort({createdAt:-1})
    return announcements
}

//req:topic,school:[true,false],class:[],description //res:success
async function handleCreateAnnouncement(topic,school,classes,description,user_id){
    const user=await userModel.findById(user_id)
    if(user.role==='Student'){
        return {success:false}
    }
    if(user.role==='Teacher' && user.teacherProfile.announcement_allowed===false){
        return {success:false}
    }
    if(school===true){
        const announcement=await announcementModel.create({
            school_id:user.school_id,
            title:topic,
            message:description,
            created_by:user_id,
            class_id:[]
        })
        return {
            success:true
        }
    }
    const Classes=await classModel.find({
        school_id:user.school_id,
        class_name:{$in:classes}
    })
    
    const announcement=await announcementModel.create({
        school_id:user.school_id,
        title:topic,
        message:description,
        created_by:user_id,
        class_id:Classes.map(c=>c._id)
        })
    return{
        success:true

    }
}

//req:_id  //res:title,created_by,createdAt,description,classes
async function handleGetAnnouncements(_id) {
    const announcement=await announcementModel.findById(_id)
    .populate("created_by","name");
    return {
        title:announcement.title,
        created_by:announcement.created_by.name,
        description:announcement.message,
        createdAt:announcement.createdAt
    }
}
//req:_id //res:success
async function handleDeleteAnnouncement(_id,user_id) {
    const user=await userModel.findById(user_id)
    if(user.role==='Student'){
        return {success:false}
    }
    if(user.role==='Teacher' && user.teacherProfile.announcement_allowed===false){
        return {success:false}
    }
    const announcement=await announcementModel.findByIdAndDelete(_id)
    return {success:true}
}

//req:teacher_id  //res:success
async function handleAssignTeacher(id) {
    await userModel.findByIdAndUpdate(
  id,
  { $set: { 'teacherProfile.announcement_allowed': true } }
);
}

//req:teacher_id  //res:success
async function handleRemoveTeacher(id) {
    await userModel.findByIdAndUpdate(
  id,
  { $set: { 'teacherProfile.announcement_allowed': false } }
);
}

module.exports={handleCreateAnnouncement,handleDeleteAnnouncement,handleGetAnnouncements,handleGetClassAnnouncements,handleGetSchoolAnnouncements,handleRemoveTeacher,handleAssignTeacher}