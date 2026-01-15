const mongoose = require("mongoose")

const School = require("./models/schoolModel")
const User = require("./models/userModel")
const Class = require("./models/classModel")

const MONGO_URI = "mongodb://127.0.0.1:27017/schoolDB" // change if needed

async function connectDB(){
  await mongoose.connect(MONGO_URI)
  console.log("DB Connected")
}

function randomPhone(base){
  return base + Math.floor(Math.random()*1000)
}

async function createPrincipal(school,index){
  const principal = await User.create({
    name:`Principal ${index}`,
    phone:randomPhone(9000000000),
    role:"Principal",
    school_id:school._id
  })

  await School.findByIdAndUpdate(
    school._id,
    {principal_id:principal._id}
  )

  return principal
}

async function createTeachers(school,totalClasses){

  const teachers=[]

  // class teachers
  for(let i=1;i<=totalClasses;i++){
    const t = await User.create({
      name:`${school.name} CT ${i}`,
      phone:randomPhone(9100000000+i),
      role:"Teacher",
      school_id:school._id,
      teacherProfile:{
        employee_id:`EMP-${school._id}-${i}`,
        designation:"ST",
        subjects:["Math"]
      }
    })
    teachers.push(t)
  }

  // 2 extra teachers
  for(let i=1;i<=2;i++){
    const t = await User.create({
      name:`${school.name} Extra ${i}`,
      phone:randomPhone(9200000000+i),
      role:"Teacher",
      school_id:school._id,
      teacherProfile:{
        employee_id:`EXT-${school._id}-${i}`,
        designation:"Mentor",
        subjects:["English"],
        announcement_allowed: i===1
      }
    })
    teachers.push(t)
  }

  await School.findByIdAndUpdate(
    school._id,
    {total_teachers:teachers.length}
  )

  return teachers
}

async function createClasses(school,classCount,sections,teachers){

  let tIndex=0
  const classes=[]

  for(let c=1;c<=classCount;c++){
    for(const sec of sections){

      const teacher = teachers[tIndex++]

      const cls = await Class.create({
        school_id:school._id,
        class_name:c,
        section:sec,
        class_teacher:teacher._id,
        students:[]
      })

      await User.findByIdAndUpdate(
        teacher._id,
        {"teacherProfile.class_teacher_of":cls._id}
      )

      classes.push(cls)
    }
  }
  return classes
}

async function createStudents(school,classes){

  const students=[]

  for(let i=1;i<=30;i++){

    const cls = classes[i % classes.length]

    const s = await User.create({
      name:`${school.name} Student ${i}`,
      phone:8000000000,  // same parent phone
      role:"Student",
      school_id:school._id,
      studentProfile:{
        class_id:cls._id,
        roll_number:`R${i}`
      }
    })

    await Class.findByIdAndUpdate(
      cls._id,
      {$push:{students:s._id}}
    )

    students.push(s)
  }

  await School.findByIdAndUpdate(
    school._id,
    {total_students:students.length}
  )
}

async function seed(){

  await connectDB()

  // comment this if you dont want delete
  await mongoose.connection.dropDatabase()

  // SCHOOL 1
  const school1 = await School.create({
    name:"Green Valley",
    address:"Delhi"
  })

  await createPrincipal(school1,1)

  const teachers1 = await createTeachers(
    school1,
    6*3
  )

  const classes1 = await createClasses(
    school1,
    6,
    ["A","B","C"],
    teachers1
  )

  await createStudents(school1,classes1)

  // SCHOOL 2
  const school2 = await School.create({
    name:"Blue Star",
    address:"Jaipur"
  })

  await createPrincipal(school2,2)

  const teachers2 = await createTeachers(
    school2,
    12*4
  )

  const classes2 = await createClasses(
    school2,
    12,
    ["A","B","C","D"],
    teachers2
  )

  await createStudents(school2,classes2)

  console.log("SEEDING SUCCESS")
  process.exit()
}

seed()
