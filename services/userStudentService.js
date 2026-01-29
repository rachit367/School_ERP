const userModel=require('../models/userModel');
const classModel=require('../models/classModel');
const schoolModel=require('../models/schoolModel')
const attendanceModel=require('./../models/attendanceModel')
const homeworkModel=require('../models/homeworkModel')
const marksModel=require('../models/marksModel')
const feesModel=require('../models/feesModel')
const doubtModel=require('../models/doubtModel')
const leaveModel=require('../models/leaveModel')
const ptmModel=require('../models/ptmModel')
const bullyModel=require('../models/bullyModel')
const mongoose=require('mongoose')

//req:school_id  // res: [{ class_name:total_students,total_sections ,[section]:{_id,class_teacher_name,students}}]
//req:school_id  // res: [{ class_name, total_students, total_sections, [section]: { class_id, class_teacher_name, students } }]
async function handleGetClasses(school_id) {
    const result = await classModel.aggregate([
        { $match: { school_id: new mongoose.Types.ObjectId(school_id) } },
        
        // Lookup class_teacher name
        {
            $lookup: {
                from: 'users',  // collection name for userModel
                localField: 'class_teacher',
                foreignField: '_id',
                as: 'teacher_info'
            }
        },
        
        // Group by class_name
        {
            $group: {
                _id: '$class_name',
                total_students: { $sum: { $size: '$students' } },
                total_sections: { $sum: 1 },
                sections: {
                    $push: {
                        section: '$section',
                        class_id: '$_id',
                        class_teacher_name: { $ifNull: [{ $arrayElemAt: ['$teacher_info.name', 0] }, ''] },
                        students: { $size: '$students' }
                    }
                }
            }
        },
        
        // Reshape output
        {
            $project: {
                _id: 0,
                class_name: '$_id',
                total_students: 1,
                total_sections: 1,
                sections: 1
            }
        }
    ]);

    // Convert sections array to object keys (A, B, C, etc.)
    return result.map(item => {
        const { sections, ...rest } = item;
        const sectionObj = {};
        for (const sec of sections) {
            const { section, ...data } = sec;
            sectionObj[section] = data;
        }
        return { ...rest, ...sectionObj };
    });
}

//req:class_name,school_id //res:section_name,class_teacher,total_students,_id
async function handleGetSections(class_name,school_id){
    const classes=await classModel.find({school_id:school_id,class_name:class_name})
    .populate({
        path:'class_teacher',
        select:'name'
    })
    .select('section class_teacher students _id')
    const payload=classes.map(c=>({
        section:c.section,
        total_students:c.students.length,
        class_teacher:c.class_teacher?.name ??'',
        _id:c._id
    }))
    return payload
}
//req:_id  //res:[name,roll_number]
async function handleGetStudentsInSection(class_id){
    const students=await classModel.findById(class_id)
    .populate({path:'students', match:{ role:'Student' },select:'name studentProfile.roll_number _id'})
    .select('students');
    if (!students) return [];
    const payload=students.students.map(s=>({
        _id:s._id,
        name:s.name,
        roll_number:s.studentProfile?.roll_number??''
    }));
    return payload
}
//req:student_id   //res:name,number,attendance,class,section,email,father_name,father_number,father_email,mother_name,mother_email,mother_number,guardian_name, guardian_number, guardian_email
async function handleGetStudentDetails(student_id){
    const s=await userModel.findById(student_id)
    .populate({path:'studentProfile.class_id',select:'class_name section'})
    .select('name phone email studentProfile');
    const totalPresents = s.studentProfile?.total_presents || 0;
    const totalAbsents = s.studentProfile?.total_absents || 0;
    const attendance =totalPresents + totalAbsents === 0? 0: Number((
                      (totalPresents / (totalPresents + totalAbsents)) *100).toFixed(2));
    const payload = {
        student_id:s._id,
        name: s.name,
        number: s.phone,
        email: s.email ?? '',

        attendance, // percentage

        class: s.studentProfile?.class_id?.class_name ?? '',
        section: s.studentProfile?.class_id?.section ?? '',

        father_name: s.studentProfile?.father_name ?? '',
        father_number: s.studentProfile?.father_number ?? '',
        father_email: s.studentProfile?.father_email ?? '',

        mother_name: s.studentProfile?.mother_name ?? '',
        mother_number: s.studentProfile?.mother_number ?? '',
        mother_email: s.studentProfile?.mother_email ?? '',

        guardian_name: s.studentProfile?.guardian_name ?? '',
        guardian_number: s.studentProfile?.guardian_number ?? '',
        guardian_email: s.studentProfile?.guardian_email ?? ''
    };

    return payload;
}

//req:school_id,name,class_name,section,dob,roll_number,mother_details,father_details,guardian_details,email,phone //res:success
async function handleAddStudent(school_id,name,class_name,section,dob,roll_number,mother_details,father_details,guardian_details,email,phone) {
        const classDoc = await classModel.findOne({
        school_id,
        class_name,
        section,
    });
    await schoolModel.findByIdAndUpdate(school_id,{
        $inc:{total_students:1}
    })
    // build studentProfile dynamically
    const studentProfile = {
        class_id: classDoc._id,
        roll_number
    };

    // father details (only if provided)
    if (father_details) {
        if (father_details.name) {
            studentProfile.father_name = father_details.name;
        }
        if (father_details.number) {
            studentProfile.father_number = father_details.number;
        }
        if (father_details.email) {
            studentProfile.father_email = father_details.email;
        }
    }

    // mother details (only if provided)
    if (mother_details) {
        if (mother_details.name) {
            studentProfile.mother_name = mother_details.name;
        }
        if (mother_details.number) {
            studentProfile.mother_number = mother_details.number;
        }
        if (mother_details.email) {
            studentProfile.mother_email = mother_details.email;
        }
    }

    // guardian details (only if provided)
    if (guardian_details) {
        if (guardian_details.name) {
            studentProfile.guardian_name = guardian_details.name;
        }
        if (guardian_details.number) {
            studentProfile.guardian_number = guardian_details.number;
        }
        if (guardian_details.email) {
            studentProfile.guardian_email = guardian_details.email;
        }
    }

    // create user
    const user = await userModel.create({
        school_id,
        name,
        phone,
        email,
        role: 'Student',
        date_of_birth: new Date(dob),
        studentProfile
    });
    classDoc.students.push(user._id)
    await classDoc.save()
    return {success:true}
}

//req:student_id  //res:success
async function handleDeleteStudent(student_id){
const session = await mongoose.startSession();

    await session.withTransaction(async () => {

        const user = await userModel
            .findOne({ _id: student_id, role: "Student" })
            .session(session);

        if (!user) {
            throw new Error("Student not found");
        }

        await schoolModel.findByIdAndUpdate(
            user.school_id,
            { $inc: { total_students: -1 } },
            { session }
        );

        await classModel.updateOne(
            { students: student_id },
            { $pull: { students: student_id } },
            { session }
        );

        await attendanceModel.deleteMany({ student_id }, { session });

        await homeworkModel.updateMany(
            { "submitted_by.student_id": student_id },
            { $pull: { submitted_by: { student_id } } },
            { session }
        );

        await marksModel.deleteMany({ student_id }, { session });

        await feesModel.deleteMany({ student_id }, { session });

        await doubtModel.deleteMany({ student_id }, { session });

        await leaveModel.deleteMany({ student_id }, { session });

        await ptmModel.deleteMany({ student_id }, { session });

        await bullyModel.deleteMany(
            {
                $or: [
                    { reporter_id: student_id },
                    { accused_id: student_id }
                ]
            },
            { session }
        );

        await userModel.deleteOne({ _id: student_id }, { session });
    });

    session.endSession();

    return { success: true };
}


module.exports={
    handleAddStudent,
    handleDeleteStudent,
    handleGetClasses,
    handleGetSections,
    handleGetStudentDetails,
    handleGetStudentsInSection,
    handleTransferStudent
}