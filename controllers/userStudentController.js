const {
    handleGetClasses,
    handleGetSections,
    handleGetStudentsInSection,
    handleGetStudentDetails,
    handleAddStudent,
    handleDeleteStudent,
    handleTransferStudent
} = require('../services/userStudentService');

// req: school_id
// res: [{ class_name, total_students, total_sections }]
async function getClasses(req, res, next) {
    try {
        const  school_id  = req.school_id;
        const data = await handleGetClasses(school_id);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
}

// req: school_id, class_name
// res: [{ section, class_teacher, total_students, _id }]
async function getSections(req, res, next) {
    try {
        const school_id=req.school_id
        const {  class_name } = req.params;

        const data = await handleGetSections(class_name, school_id);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
}

// req: class_id
// res: [{ _id, name, roll_number }]
async function getStudentsInSection(req, res, next) {
    try {
        const { class_id } = req.params;

        const data = await handleGetStudentsInSection(class_id);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
}

// req: student_id
// res: student profile object
async function getStudentDetails(req, res, next) {
    try {
        const { student_id } = req.params;

        const data = await handleGetStudentDetails(student_id);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
}

// req: school_id, name, class_name, section, dob, roll_number,
//      mother_details, father_details, guardian_details, email, phone
// res: success
async function addStudent(req, res, next) {
    try {
        const school_id=req.school_id
        const {
            name,
            class_name,
            section,
            dob,
            roll_number,
            mother_details,
            father_details,
            guardian_details,
            email,
            phone
        } = req.body;

        const result = await handleAddStudent(
            school_id,
            name,
            class_name,
            section,
            dob,
            roll_number,
            mother_details,
            father_details,
            guardian_details,
            email,
            phone
        );

        return res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

// req: student_id
// res: success
async function deleteStudent(req, res, next) {
    try {
        const { student_id } = req.params;

        const result = await handleDeleteStudent(student_id);

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}


// req: student_id, section
// res: success
async function transferStudent(req, res, next) {
    try {
        const { student_id } = req.params;
        const { section } = req.body;

        const result = await handleTransferStudent(student_id, section);

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getClasses,
    getSections,
    getStudentsInSection,
    getStudentDetails,
    addStudent,
    deleteStudent,
    transferStudent
};
