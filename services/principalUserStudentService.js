const userModel=require('./../models/userModel');
const classModel=require('./../models/classModel');

//req:school_id  //res:class_name,total_students,total_sections
async function handleGetClasses(school_id){
    const classes=await classModel.find({school_id:school_id})
    .select('class_name section students')
    const payload={}
    for (const {class_name,students} of classes){
        if(!payload[class_name]){
            payload[class_name]={
                class_name,
                total_sections:0,
                total_students:0
            }
        }
        payload[class_name].total_sections+=1;
        payload[class_name].total_students+=students.length
    }
    return Object.values(payload);
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