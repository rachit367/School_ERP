const subjectModel = require('../models/subjectModel');
const timetableModel=require('./../models/timetableModel');
const userModel=require('./../models/userModel');
const {timeToMin}=require('./../utils/timeToMin')


//req:user_id,class_id,school_id  //res:success
async function handleAllowedEditTimetable(user_id,class_id,school_id){
    const exists=await userModel.exists({_id:user_id,school_id,'teacherProfile.class_teacher_of':class_id})
    if(exists){
        return{success:true}
    }
    return {success:false}
}

//req:school_id,class_id,day,subject,start,end,teacher_id,location  //res:success
async function handleAddPeriod(school_id,class_id,day,subject,start,end,teacher_id,location) {
    await timetableModel.findOneAndUpdate(
        {school_id,class_id,day},
        {
            $push:{
                periods:{subject,start,end,location,teacher:teacher_id}
            }
        },
    {upsert:true});

    await userModel.findOneAndUpdate({
        school_id,
        _id:teacher_id
    },{
        $addToSet:{'teacherProfile.classes_assigned':class_id}
    },
    {upsert:true});

    await subjectModel.findOneAndUpdate(
    { name:subject, teacher_id, class_id, school_id },
    { $setOnInsert:{ name:subject, teacher_id, class_id, school_id }},
    { upsert:true }
)

    return {success:true}
}

//req:school_id,class_id,day,period_id  //res:success
async function handleDeletePeriod(school_id,class_id,day,period_id){

    // 1. Fetch only required period (projection)
    const timetable = await timetableModel.findOne(
        { school_id, class_id, day, 'periods._id': period_id },
        { 'periods.$': 1 }   // returns only matched period
    ).lean()

    if(!timetable || !timetable.periods.length)
        return { success:false, message:"Period not found" }

    const { teacher, subject } = timetable.periods[0]

    // 2. Delete period
    await timetableModel.updateOne(
        { school_id, class_id, day },
        { $pull:{ periods:{ _id:period_id } } }
    )

    // 3. Parallel checks (faster)
    const [teacherExists, subjectExists] = await Promise.all([
        timetableModel.exists({
            school_id,
            class_id,
            'periods.teacher': teacher
        }),
        timetableModel.exists({
            school_id,
            class_id,
            'periods.subject': subject
        })
    ])

    // 4. Cleanup subject
    if(!subjectExists){
        await subjectModel.deleteOne({
            school_id,
            class_id,
            teacher_id: teacher,
            name: subject
        })
    }

    // 5. Cleanup teacher
    if(!teacherExists){
        await userModel.updateOne(
            { school_id, _id: teacher },
            { $pull:{ 'teacherProfile.classes_assigned': class_id } }
        )
    }

    return { success:true }
}

//req:class_id,school_id,  // res: [{ day, periods:[{_id,start,end,teacher_name,location,subject}] }]
async function handleStudentTimetable(class_id,school_id){
    const tt=await timetableModel.find({school_id,class_id})
    .populate({path:'periods.teacher',select:'name'})
    .select('periods day')
    .lean()
    const payload=tt.map(t=>({
        day:t.day,
        periods:t.periods.map(p=>({
            _id:p._id,
            start:p.start,
            end:p.end,
            teacher_name:p.teacher?.name || '',
            location:p.location ||'',
            subject:p.subject
        }))
        .sort((a,b) => timeToMin(a.start) - timeToMin(b.start))
    }))
    return payload
}
// req: teacher_id, school_id  // res: [{ day, periods:[{_id,class_name,section,subject,start,end,location}] }]
async function handleTeacherTimetable(teacher_id,school_id){
    const tt=await timetableModel.find({school_id:school_id,'periods.teacher':teacher_id})
    .populate({path:'class_id',select:'class_name section'})
    .select('class_id day periods')
    .lean();
    const map = {}

    tt.forEach(t => {
        if(!map[t.day]) map[t.day] = []

        t.periods.forEach(p => {
          if(p.teacher?.toString() === teacher_id.toString()){
            map[t.day].push({
            _id:p._id,
              class_name: t.class_id?.class_name || '',
              section: t.class_id?.section || '',
              subject: p.subject,
              start: p.start,
              end: p.end,
              location: p.location || ''
                })
            }
        })
    })

    const payload = Object.keys(map).map(day => ({
        day,
        periods: map[day].sort((a,b) => timeToMin(a.start) - timeToMin(b.start))
    }))

    return payload

}

module.exports={
    handleAddPeriod,
    handleDeletePeriod,
    handleAllowedEditTimetable,
    handleStudentTimetable,
    handleTeacherTimetable
}