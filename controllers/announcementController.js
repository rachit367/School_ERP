const {
    handleCreateAnnouncement,
    handleDeleteAnnouncement,
    handleGetAnnouncements,
    handleGetClassAnnouncements,
    handleGetSchoolAnnouncements,
    handleAssignTeacher,
    handleRemoveTeacher
} = require("./../services/announcementService");
//req:   //res: [_id, message, title, createdAt, _id]
async function getSchoolAnnouncements(req, res, next) {
    try {
        const user_id = req.user_id;

        const announcements = await handleGetSchoolAnnouncements(user_id);

        return res.status(200).json(announcements);

    } catch (err) {
        next(err);
    }
}

//req:  //res:[title, message, createdAt, _id]
async function getClassAnnouncements(req, res, next) {
    try {
        const user_id = req.user_id;

        const announcements = await handleGetClassAnnouncements(user_id);

        return res.status(200).json(announcements);

    } catch (err) {
        next(err);
    }
}

//req:topic,school[true,false],class:[],description //res:success
async function createAnnouncement(req, res, next) {
    try {
        const user_id = req.user_id;
        const { topic, school, classes, description } = req.body;

        const result = await handleCreateAnnouncement(
            topic,
            school,
            classes,
            description,
            user_id
        );

        return res.status(201).json(result);

    } catch (err) {
        next(err);
    }
}

//req:_id  //res:title,created_by,createdAt,description
async function getAnnouncementById(req, res, next) {
    try {
        const { id } = req.params; // /announcement/:id

        const announcement = await handleGetAnnouncements(id);

        return res.status(200).json(announcement);

    } catch (err) {
        next(err);
    }
}

//req:_id //res:{success:true}
async function deleteAnnouncement(req, res, next) {
    try {
        const { id } = req.params;

        await handleDeleteAnnouncement(id,req.user_id);
        return res.status(200).json({ success: true });

    } catch (err) {
        next(err);
    }
}
//req:teacher_id  //res:success
async function assignTeacher(req,res,next) {
    try{
        const id=req.params.id
        await handleAssignTeacher(id)
        return res.json({
            success:true
        })
    }catch(err){
        next(err)
    }
}
//req:teacher_id  //res:success
async function removeTeacher(req,res,next) {
    try{
        const id =req.params.id
        await handleRemoveTeacher(id)
        return res.json({
            success:true
        })
    }catch(err){
        next(err)
    }
}

module.exports = {
    getSchoolAnnouncements,
    getClassAnnouncements,
    createAnnouncement,
    getAnnouncementById,
    deleteAnnouncement,
    removeTeacher,
    assignTeacher
};