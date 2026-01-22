// Comprehensive Database Seeder for Testing
require("dotenv").config({ path: require('path').join(__dirname, '.env') })
const mongoose = require("mongoose")

// Models
const School = require("./models/schoolModel")
const User = require("./models/userModel")
const Class = require("./models/classModel")
const Subject = require("./models/subjectModel")
const Timetable = require("./models/timetableModel")
const Announcement = require("./models/announcementModel")
const Homework = require("./models/homeworkModel")
const Attendance = require("./models/attendanceModel")
const Leave = require("./models/leaveModel")
const Exam = require("./models/examModel")
const Marks = require("./models/marksModel")
const Bully = require("./models/bullyModel")
const ClassAttendanceSummary = require("./models/classAttendanceSummaryModel")

const MONGO_URI = process.env.MONGO_URI

async function connectDB() {
    await mongoose.connect(MONGO_URI)
    console.log("✅ DB Connected")
}

function randomPhone(base) {
    return base + Math.floor(Math.random() * 1000)
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomDate(daysBack) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
    return date
}

// ---------------------------------------------------------
// 1. Create Staff
// ---------------------------------------------------------
async function createSchoolStaff(school) {
    const staff = []

    // Principal
    const principal = await User.create({
        name: `Principal ${school.name.split(' ')[0]}`,
        phone: randomPhone(9000000000),
        email: `principal@${school.name.split(' ')[0].toLowerCase()}.com`,
        role: "Principal",
        school_id: school._id,
        password: "password123"
    })
    await School.findByIdAndUpdate(school._id, { principal_id: principal._id })
    staff.push(principal)

    // Coordinators
    const wings = ["Junior Wing", "Senior Wing"]
    for (const wing of wings) {
        staff.push(await User.create({
            name: `${wing} Coord`,
            phone: randomPhone(9100000000),
            email: `coord.${wing.split(' ')[0].toLowerCase()}@${school.name.split(' ')[0].toLowerCase()}.com`,
            role: "Coordinator",
            school_id: school._id,
            password: "password123"
        }))
    }

    // Managers
    const depts = ["Operations", "Finance"]
    for (const dept of depts) {
        staff.push(await User.create({
            name: `${dept} Manager`,
            phone: randomPhone(9200000000),
            email: `manager.${dept.toLowerCase()}@${school.name.split(' ')[0].toLowerCase()}.com`,
            role: "Manager",
            school_id: school._id,
            password: "password123"
        }))
    }

    console.log(`   - Created Staff for ${school.name}`)
    return staff
}

// ---------------------------------------------------------
// 2. Create Teachers
// ---------------------------------------------------------
async function createTeachers(school, totalClasses) {
    const teachers = []
    const subjectsList = ["Mathematics", "Science", "English", "History", "Physics", "Chemistry"]

    for (let i = 1; i <= totalClasses; i++) {
        teachers.push(await User.create({
            name: `${school.name.split(' ')[0]} Teacher ${i}`,
            phone: randomPhone(9300000000 + i),
            email: `teacher${i}@${school.name.split(' ')[0].toLowerCase()}.com`,
            role: "Teacher",
            school_id: school._id,
            password: "password123",
            teacherProfile: {
                employee_id: `EMP-${school.name.substring(0, 2).toUpperCase()}-${i}`,
                designation: "ST",
                subjects: [getRandomItem(subjectsList), getRandomItem(subjectsList)],
                classes_assigned: []
            }
        }))
    }

    // Extra Subject Teachers
    for (let i = 1; i <= 3; i++) {
        teachers.push(await User.create({
            name: `${school.name.split(' ')[0]} SubTeacher ${i}`,
            phone: randomPhone(9400000000 + i),
            email: `subteacher${i}@${school.name.split(' ')[0].toLowerCase()}.com`,
            role: "Teacher",
            school_id: school._id,
            password: "password123",
            teacherProfile: {
                employee_id: `EXT-${school.name.substring(0, 2).toUpperCase()}-${i}`,
                designation: "Mentor",
                subjects: [getRandomItem(subjectsList)],
                announcement_allowed: true
            }
        }))
    }

    await School.findByIdAndUpdate(school._id, { total_teachers: teachers.length })
    console.log(`   - Created ${teachers.length} Teachers for ${school.name}`)
    return teachers
}

// ---------------------------------------------------------
// 3. Create Classes, Subjects & Timetables
// ---------------------------------------------------------
async function createClassesAndAcademic(school, classCount, sections, teachers) {
    const classes = []
    let tIndex = 0
    const subjectsList = ["Mathematics", "Science", "English", "History", "Physics", "Chemistry", "Computer Science"]
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    for (let c = 1; c <= classCount; c++) {
        for (const sec of sections) {
            const classTeacher = teachers[tIndex % teachers.length]
            tIndex++

            const cls = await Class.create({
                school_id: school._id,
                class_name: c,
                section: sec,
                class_teacher: classTeacher._id,
                students: []
            })
            classes.push(cls)

            // Sync Teacher Profile (Manual Sync in Seed)
            await User.findByIdAndUpdate(classTeacher._id, {
                $set: { "teacherProfile.class_teacher_of": cls._id },
                $addToSet: { "teacherProfile.classes_assigned": cls._id }
            })

            const classSubjects = []
            for (let k = 0; k < 5; k++) {
                const subName = subjectsList[k % subjectsList.length]
                const subTeacher = teachers[(tIndex + k) % teachers.length]

                const subject = await Subject.create({
                    name: subName,
                    class_id: cls._id,
                    school_id: school._id,
                    teacher_id: subTeacher._id
                })
                classSubjects.push(subject)

                await User.findByIdAndUpdate(subTeacher._id, {
                    $addToSet: { "teacherProfile.classes_assigned": cls._id }
                })

                // Exam
                await Exam.create({
                    school_id: school._id,
                    class_id: cls._id,
                    exam_type: "Midterm",
                    subject: subName,
                    max_marks: 100,
                    date_of_exam: getRandomDate(10)
                })
            }

            // Timetable
            for (const day of days) {
                const periods = []
                for (let p = 1; p <= 6; p++) {
                    const subject = classSubjects[(p - 1) % classSubjects.length]
                    periods.push({
                        start: `${8 + p}:00`,
                        end: `${9 + p}:00`,
                        subject: subject.name,
                        location: `Room ${c}-${sec}`,
                        teacher: subject.teacher_id
                    })
                }
                await Timetable.create({
                    school_id: school._id,
                    class_id: cls._id,
                    day: day,
                    periods: periods
                })
            }

            // Announcements
            for (let i = 0; i < 3; i++) {
                await Announcement.create({
                    title: `Notice for Class ${c}-${sec} - ${i + 1}`,
                    message: "Important update.",
                    school_id: school._id,
                    created_by: classTeacher._id,
                    class_id: [cls._id]
                })
            }

            // Homework
            for (const sub of classSubjects) {
                await Homework.create({
                    topic: `${sub.name} Assignment`,
                    description: `Complete exercises`,
                    class_id: cls._id,
                    created_by: sub.teacher_id,
                    school_id: school._id,
                    deadline: new Date(Date.now() + 86400000 * 5)
                })
            }
        }
    }
    console.log(`   - Created ${classes.length} Classes with Academic Data`)
    return classes
}

// ---------------------------------------------------------
// 4. Create Students & Records (Attendance Summary, Bully)
// ---------------------------------------------------------
async function createStudentsAndRecords(school, classes) {
    const allStudents = []
    const totalStudentsPerClass = 35

    for (const cls of classes) {
        const classStudents = []
        const exams = await Exam.find({ class_id: cls._id })

        // 1. Create Students
        for (let i = 1; i <= totalStudentsPerClass; i++) {
            const s = await User.create({
                name: `${school.name.split(' ')[0]} Student ${i}`,
                phone: randomPhone(8000000000),
                email: `student${classes.indexOf(cls)}-${i}@${school.name.split(' ')[0].toLowerCase()}.com`,
                role: "Student",
                password: "password123",
                school_id: school._id,
                studentProfile: {
                    class_id: cls._id,
                    roll_number: `R-${cls.class_name}${cls.section}-${i}`,
                    father_name: `Father`,
                    mother_name: `Mother`,
                    total_presents: 0,
                    total_absents: 0
                }
            })
            classStudents.push(s)

            // Marks & Leaves
            for (const exam of exams) {
                await Marks.create({
                    school_id: school._id,
                    exam_id: exam._id,
                    student_id: s._id,
                    marks_obtained: Math.floor(Math.random() * 100)
                })
            }
            if (Math.random() > 0.8) {
                await Leave.create({
                    student: s._id,
                    school_id: school._id,
                    reason: "Sick Leave",
                    start_date: getRandomDate(15),
                    end_date: getRandomDate(14),
                    status: 'Pending',
                    class_teacher: cls.class_teacher
                })
            }

            // Bully Report (Random)
            if (Math.random() > 0.95) {
                await Bully.create({
                    school_id: school._id,
                    reported_by: s._id,
                    bully_name: "Bad Guy",
                    bully_class: cls._id, // Reporting someone in same class
                    description: "He took my lunch.",
                    status: 'Pending'
                })
            }
        }

        await Class.findByIdAndUpdate(cls._id, { $push: { students: { $each: classStudents.map(s => s._id) } } })
        allStudents.push(...classStudents)

        // 2. Attendance & Summary (Last 10 Days)
        for (let d = 0; d < 10; d++) {
            const date = new Date()
            date.setDate(date.getDate() - d)
            date.setHours(0, 0, 0, 0)
            if (date.getDay() === 0 || date.getDay() === 6) continue

            let presentCount = 0
            let absentCount = 0

            // Mark attendance for whole class
            for (const s of classStudents) {
                const rand = Math.random()
                let status = 'P'
                if (rand > 0.9) status = 'A'
                else if (rand > 0.85) status = 'L'

                if (status === 'P') presentCount++
                if (status === 'A') absentCount++

                await Attendance.create({
                    school_id: school._id,
                    date: date,
                    student_id: s._id, // FIXED: Flat structure
                    class_id: cls._id,
                    status: status     // FIXED: Flat structure
                })

                // Update student stats
                if (status === 'P') s.studentProfile.total_presents++
                else if (status === 'A') s.studentProfile.total_absents++
                await s.save()
            }

            // Create ClassAttendanceSummary
            const total = classStudents.length
            const attendance_percent = total === 0 ? 0 : Number(((presentCount / total) * 100).toFixed(2))

            await ClassAttendanceSummary.create({
                school_id: school._id,
                class_id: cls._id,
                section: cls.section,
                date: date,
                total_students: total,
                present_count: presentCount,
                absent_count: absentCount,
                attendance_percent
            })
        }
    }
    await School.findByIdAndUpdate(school._id, { total_students: allStudents.length })
    console.log(`   - Created ${allStudents.length} Students, Records, Attendance Summaries & Bully Reports`)
}

// ---------------------------------------------------------
// Main Execution
// ---------------------------------------------------------
async function seed() {
    console.log("🚀 Starting Seeding Process...")
    await connectDB()

    console.log("🗑️ Cleaning Database...")
    await mongoose.connection.dropDatabase()

    // --- School 1 ---
    console.log("\n🏫 Creating School 1: Green Valley High")
    const school1 = await School.create({ name: "Green Valley High", address: "Delhi", isActive: true })
    await createSchoolStaff(school1)
    const teachers1 = await createTeachers(school1, 10)
    const classes1 = await createClassesAndAcademic(school1, 5, ["A", "B"], teachers1)
    await createStudentsAndRecords(school1, classes1)

    // --- School 2 ---
    console.log("\n🏫 Creating School 2: Blue Star Academy")
    const school2 = await School.create({ name: "Blue Star Academy", address: "Jaipur", isActive: true })
    await createSchoolStaff(school2)
    const teachers2 = await createTeachers(school2, 24)
    const classes2 = await createClassesAndAcademic(school2, 12, ["A", "B"], teachers2)
    await createStudentsAndRecords(school2, classes2)

    console.log("\n✅ SEEDING COMPLETE!")
    process.exit()
}

seed().catch(err => {
    console.error("❌ Seeding Failed:", err)
    process.exit(1)
})
