const userModel=require('./../models/userModel')
const attendanceModel=require('./../models/attendanceModel')
const classAttendanceModel=require('../models/classAttendanceSummaryModel')
const classModel=require('./../models/classModel')
const {canMarkAttendance}=require('../utils/canMarkAttendance')
const mongoose = require('mongoose');

//req:class_id // res: allowed(true or false)  //alaways run this api before attendance and before adding uss teacher
async function handleCheckAllowedClass(user_id,class_id,school_id) {
    const exists=await classModel.exists({
        _id:class_id,
        school_id:school_id,
        $or:[
            {class_teacher:user_id},
            {allowed_attendance_teachers:user_id}
        ]
    });
    return !!exists
}

//req:{class_id,attendance:[student_id,status]}  //res:success,message     status:P,A only
async function handlesaveDailyAttendance(user_id, class_id, attendance) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Normalize today (00:00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Permission check
        const allowed = await canMarkAttendance(user_id, class_id);
        if (!allowed) {
            throw new Error('Permission not allowed');
        }

        // Fetch class
        const classDoc = await classModel
            .findById(class_id)
            .select('section school_id students')
            .session(session);
        if (attendance.length !== classDoc.students.length) {
            throw new Error("Attendance count mismatch");
        }
        const { section, school_id } = classDoc;
        const total_students = attendance.length;

        // Existing attendance (for edit detection)
        const existingAttendance = await attendanceModel
            .find({ class_id, date: today })
            .session(session)
            .lean();

        const isEdit = existingAttendance.length > 0;
        const existingMap = new Map();

        for (const a of existingAttendance) {
            existingMap.set(a.student_id.toString(), a.status);
        }

        // Bulk operations
        const attendanceOps = [];
        const studentOps = [];

        for (const { student_id, status } of attendance) {
            const oldStatus = existingMap.get(student_id.toString());

            // ---------------- ATTENDANCE ----------------
            if (!isEdit) {
                attendanceOps.push({
                    insertOne: {
                        document: {
                            student_id,
                            class_id,
                            date: today,
                            status
                        }
                    }
                });
            } else if (oldStatus && oldStatus !== status) {
                attendanceOps.push({
                    updateOne: {
                        filter: { student_id, class_id, date: today },
                        update: { $set: { status } }
                    }
                });
            }

            // ---------------- STUDENT COUNTERS ----------------
            if (!isEdit) {
                if (status === 'P') {
                    studentOps.push({
                        updateOne: {
                            filter: { _id: student_id },
                            update: { $inc: { "studentProfile.total_presents": 1 } }
                        }
                    });
                } else {
                    studentOps.push({
                        updateOne: {
                            filter: { _id: student_id },
                            update: { $inc: { "studentProfile.total_absents": 1 } }
                        }
                    });
                }
            } else if (oldStatus && oldStatus !== status) {
                // reverse old
                if (oldStatus === 'P') {
                    studentOps.push({
                        updateOne: {
                            filter: { _id: student_id },
                            update: { $inc: { "studentProfile.total_presents": -1 } }
                        }
                    });
                } else {
                    studentOps.push({
                        updateOne: {
                            filter: { _id: student_id },
                            update: { $inc: { "studentProfile.total_absents": -1 } }
                        }
                    });
                }

                // apply new
                if (status === 'P') {
                    studentOps.push({
                        updateOne: {
                            filter: { _id: student_id },
                            update: { $inc: { "studentProfile.total_presents": 1 } }
                        }
                    });
                } else {
                    studentOps.push({
                        updateOne: {
                            filter: { _id: student_id },
                            update: { $inc: { "studentProfile.total_absents": 1 } }
                        }
                    });
                }
            }
        }

        // Execute bulk operations
        if (attendanceOps.length > 0) {
            await attendanceModel.bulkWrite(attendanceOps, { session });
        }

        if (studentOps.length > 0) {
            await userModel.bulkWrite(studentOps, { session });
        }

        // Recalculate summary
        const present = await attendanceModel.countDocuments(
            { class_id, date: today, status: 'P' },
            { session }
        );

        const absent = total_students - present;
        const attendance_percent =
            total_students === 0
                ? 0
                : Number(((present / total_students) * 100).toFixed(2));

        // Upsert class summary
        await classAttendanceModel.findOneAndUpdate(
            { school_id, class_id, section, date: today },
            {
                school_id,
                class_id,
                section,
                date: today,
                total_students,
                present_count: present,
                absent_count: absent,
                attendance_percent
            },
            { upsert: true, session }
        );

        // Commit
        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            message: isEdit ? 'Attendance Updated' : 'Attendance Marked'
        };

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

// req: class_id  // res: {class_attendance_percentage,total_present,total_absent,students:[{student_id,name,roll_number,attendance_percentage,today_attendance}]}
async function handleGetClassAttendance(class_id,school_id){

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const classDoc = await classModel.findById(class_id)
        .populate({
            path:'students',
            select:'studentProfile.total_presents studentProfile.total_absents _id studentProfile.roll_number name'
        })
        .select('students')
        .lean();

    // ---------- TODAY DATA ----------
    const todays_attendance = await attendanceModel
        .find({ class_id, date: today })
        .select('student_id status')
        .lean();

    const todayMap = {};
    let todayPresent = 0;
    let todayAbsent = 0;

    for(const a of todays_attendance){
        todayMap[a.student_id.toString()] = a.status;

        if(a.status === 'P') todayPresent++;
        if(a.status === 'A') todayAbsent++;
    }

    // ---------- OVERALL DATA ----------
    let totalPresents = 0;
    let totalAbsents = 0;

    const studentsAttendance = [];

    for(const s of classDoc.students){

        const p = s.studentProfile?.total_presents ?? 0;
        const a = s.studentProfile?.total_absents ?? 0;

        totalPresents += p;
        totalAbsents += a;

        const attendance_percentage =
            p + a === 0 ? 0 : Number(((p / (p + a)) * 100).toFixed(2));

        studentsAttendance.push({
            student_id: s._id,
            name: s.name,
            roll_number: s.studentProfile.roll_number,
            attendance_percentage,
            today_attendance: todayMap[s._id.toString()] ?? 'Not Marked'
        });
    }

    const classAttendance =
        totalPresents + totalAbsents === 0
            ? 0
            : Number(((totalPresents / (totalPresents + totalAbsents)) * 100).toFixed(2));

    return {
        class_attendance_percentage: classAttendance,
        total_present: todayPresent,
        total_absent: todayAbsent,
        students: studentsAttendance
    };
}



//req:school_id,substitute_id   //res:success,message
async function handleAssignSubstituteTeacher(user_id,substitute_id,school_id) {  
    const classDoc=await classModel.findOne({ class_teacher: user_id, school_id });
    if (!classDoc) {
        throw new Error("You are not a class teacher or class not found");
    }
    await classModel.updateOne(
        { _id: classDoc._id },
        { $addToSet: { allowed_attendance_teachers: substitute_id } }
    );
    await userModel.updateOne(
        { _id: substitute_id },
        { $addToSet: { "teacherProfile.classes_assigned": classDoc._id } }
    );
    return {success:true,message:'Substitute Teacher Added'}
}

//req:school_id,substitute_id   //res:success,message
async function handleRemoveSubstituteTeacher(user_id,substitute_id,school_id){
    const classDoc = await classModel.findOne({
        class_teacher: user_id,
        school_id: school_id
    }).select('_id');

    if (!classDoc) {
        throw new Error("Class not found or user not authorized");
    }

    await classModel.updateOne(
        { _id: classDoc._id },
        { $pull: { allowed_attendance_teachers: substitute_id } }
    );

    await userModel.updateOne(
        { _id: substitute_id },
        {
            $pull: {
                "teacherProfile.classes_assigned": classDoc._id
            }
        }
    );

    return {
        success: true,
        message: "Substitute Teacher Removed"
    };
} 

//req:from_date,to_date,student_id  //res:{name,roll_number,{date:status},attendance_percentage,present,absent}
async function handleGetStudentAttendance(from_date,to_date,student_id){  //date in YYYY-MM-DD
    const fromDate = new Date(from_date);
    const toDate = new Date(to_date);
    
    fromDate.setHours(0,0,0,0);
    toDate.setHours(23,59,59,999);
    const records=await attendanceModel.find({
        student_id,
        date:{
            $gte:fromDate,
            $lte:toDate
        }
    })
    .select('date status')
    .sort({date:-1})
    let present = 0;
    let absent = 0;

    for (const r of records) {
        if (r.status === 'P') present++;
        else if (r.status === 'A') absent++;
    }
    const total = present + absent;
    const attendance_percentage =total === 0? 0: Number(((present / total) * 100).toFixed(2));
    const s=await userModel.findById(student_id).select('name studentProfile.roll_number').lean();
    return{
        name:s.name,
        roll_number:s.studentProfile.roll_number,
        present,
        absent,
        attendance_percentage,
        dailyAttendance:records.map(r=>({
            date:r.date,
            status:r.status
        }))
    }
}

module.exports={
    handleCheckAllowedClass,
    handleGetClassAttendance,
    handlesaveDailyAttendance,
    handleAssignSubstituteTeacher,
    handleRemoveSubstituteTeacher,
    handleGetStudentAttendance}