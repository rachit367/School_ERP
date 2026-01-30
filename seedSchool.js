// Comprehensive Database Seeder for Testing
// Seeds: Schools, Users (all roles), Classes, Subjects, Timetables, Announcements,
// Homework, Attendance, Leaves, Exams, Marks, Doubts, Bully Reports, PTM, Admin
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
const Doubt = require("./models/doubtModel")
const Ptm = require("./models/ptmModel")

const MONGO_URI = process.env.MONGO_URI

async function connectDB() {
    await mongoose.connect(MONGO_URI)
    console.log("DB Connected")
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

function getFutureDate(daysAhead) {
    const date = new Date()
    date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1)
    return date
}

// ---------------------------------------------------------
// 1. Create Staff (Principal, Coordinators, Managers)
// ---------------------------------------------------------
async function createSchoolStaff(school) {
    const staff = []

    // Principal
    const principal = await User.create({
        name: `Principal ${school.name.split(' ')[0]}`,
        phone: randomPhone(9000000000),
        email: `principal@${school.name.split(' ')[0].toLowerCase()}.edu`,
        role: "Principal",
        school_id: school._id,
        date_of_birth: new Date('1975-05-15')
    })
    await School.findByIdAndUpdate(school._id, { principal_id: principal._id })
    staff.push(principal)

    // Coordinators
    const wings = ["Junior Wing", "Senior Wing", "Pre-Primary"]
    for (const wing of wings) {
        staff.push(await User.create({
            name: `${wing} Coordinator`,
            phone: randomPhone(9100000000),
            email: `coord.${wing.split(' ')[0].toLowerCase()}@${school.name.split(' ')[0].toLowerCase()}.edu`,
            role: "Coordinator",
            school_id: school._id,
            date_of_birth: new Date('1980-03-20')
        }))
    }

    // Managers
    const depts = ["Operations", "Finance", "HR", "Academic"]
    for (const dept of depts) {
        staff.push(await User.create({
            name: `${dept} Manager`,
            phone: randomPhone(9200000000),
            email: `manager.${dept.toLowerCase()}@${school.name.split(' ')[0].toLowerCase()}.edu`,
            role: "Manager",
            school_id: school._id,
            date_of_birth: new Date('1978-07-10')
        }))
    }

    console.log(`   - Created ${staff.length} Staff for ${school.name}`)
    return staff
}

// ---------------------------------------------------------
// 2. Create Teachers
// ---------------------------------------------------------
async function createTeachers(school, totalClasses) {
    const teachers = []
    const subjectsList = ["Mathematics", "Science", "English", "Hindi", "Social Studies", "Physics", "Chemistry", "Biology", "Computer Science", "Physical Education", "Art", "Music"]
    const designations = ["ST", "Mentor"]

    // Class Teachers (one per class) - initially ST, will become Mentor when assigned
    for (let i = 1; i <= totalClasses; i++) {
        teachers.push(await User.create({
            name: `${school.name.split(' ')[0]} Teacher ${i}`,
            phone: randomPhone(9300000000 + i),
            email: `teacher${i}@${school.name.split(' ')[0].toLowerCase()}.edu`,
            role: "Teacher",
            school_id: school._id,
            date_of_birth: new Date(1985 + Math.floor(i / 5), i % 12, 1 + i),
            teacherProfile: {
                employee_id: `EMP-${school.name.substring(0, 2).toUpperCase()}-${String(i).padStart(3, '0')}`,
                designation: "ST",
                subjects: [getRandomItem(subjectsList), getRandomItem(subjectsList)],
                classes_assigned: [],
                announcement_allowed: i % 3 === 0
            }
        }))
    }

    // Subject Specialists (extra teachers) - always ST since not class teachers
    const specialists = Math.ceil(totalClasses / 3)
    for (let i = 1; i <= specialists; i++) {
        teachers.push(await User.create({
            name: `${school.name.split(' ')[0]} Specialist ${i}`,
            phone: randomPhone(9400000000 + i),
            email: `specialist${i}@${school.name.split(' ')[0].toLowerCase()}.edu`,
            role: "Teacher",
            school_id: school._id,
            date_of_birth: new Date(1982 + i, 5, 15),
            teacherProfile: {
                employee_id: `SPL-${school.name.substring(0, 2).toUpperCase()}-${String(i).padStart(3, '0')}`,
                designation: "ST",
                subjects: [subjectsList[i % subjectsList.length]],
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
    const subjectsList = ["Mathematics", "Science", "English", "Hindi", "Social Studies", "Computer Science", "Physical Education"]
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const examTypes = ["Unit Test 1", "Unit Test 2", "Midterm", "Final"]

    for (let c = 1; c <= classCount; c++) {
        for (const sec of sections) {
            const classTeacher = teachers[tIndex % teachers.length]
            tIndex++

            const cls = await Class.create({
                school_id: school._id,
                class_name: c,
                section: sec,
                class_teacher: classTeacher._id,
                students: [],
                timetable: { name: `Class ${c}-${sec} Timetable`, url: null },
                syllabus: { name: `Class ${c}-${sec} Syllabus`, url: null }
            })
            classes.push(cls)

            // Sync Teacher Profile - set as class teacher and update designation to Mentor
            await User.findByIdAndUpdate(classTeacher._id, {
                $set: {
                    "teacherProfile.class_teacher_of": cls._id,
                    "teacherProfile.designation": "Mentor"
                },
                $addToSet: { "teacherProfile.classes_assigned": cls._id }
            })

            const classSubjects = []
            for (let k = 0; k < subjectsList.length; k++) {
                const subName = subjectsList[k]
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
            }

            // Create Exams for each subject and type
            for (const examType of examTypes) {
                for (const sub of classSubjects) {
                    await Exam.create({
                        school_id: school._id,
                        class_id: cls._id,
                        exam_type: examType,
                        subject: sub.name,
                        max_marks: examType.includes("Unit") ? 50 : 100,
                        date_of_exam: getFutureDate(30)
                    })
                }
            }

            // Create Timetable (6 days, 8 periods each)
            const formatTime = (hour, minute) => {
                const period = hour >= 12 ? 'PM' : 'AM'
                const h12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
                return `${h12}:${String(minute).padStart(2, '0')} ${period}`
            }
            for (const day of days) {
                const periods = []
                for (let p = 1; p <= 8; p++) {
                    const subject = classSubjects[(p - 1) % classSubjects.length]
                    const startHour = 7 + p  // 8, 9, 10, 11, 12, 13, 14, 15
                    periods.push({
                        start: formatTime(startHour, 0),
                        end: formatTime(startHour, 45),
                        subject: subject.name,
                        location: `Room ${c}${sec}`,
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

            // Announcements (mix of class-specific and school-wide)
            const announcementTitles = [
                "Parent-Teacher Meeting Schedule",
                "Holiday Notice",
                "Sports Day Announcement",
                "Exam Schedule Released",
                "Fee Reminder"
            ]
            for (let i = 0; i < 3; i++) {
                await Announcement.create({
                    title: `${announcementTitles[i % announcementTitles.length]} - Class ${c}-${sec}`,
                    message: `Important update for students of Class ${c}-${sec}. Please check with your class teacher for more details.`,
                    school_id: school._id,
                    created_by: classTeacher._id,
                    class_id: [cls._id]
                })
            }

            // Homework for each subject
            const homeworkTopics = [
                "Complete Chapter Questions",
                "Practice Problems Set",
                "Read and Summarize",
                "Prepare Presentation",
                "Write Essay"
            ]
            for (let i = 0; i < classSubjects.length; i++) {
                const sub = classSubjects[i]
                await Homework.create({
                    topic: `${sub.name} - ${homeworkTopics[i % homeworkTopics.length]}`,
                    description: `Complete the assigned work from your textbook. Submit before deadline.`,
                    class_id: cls._id,
                    created_by: sub.teacher_id,
                    school_id: school._id,
                    deadline: getFutureDate(7)
                })
            }
        }
    }
    console.log(`   - Created ${classes.length} Classes with Subjects, Timetables, Exams, Announcements, Homework`)
    return classes
}

// ---------------------------------------------------------
// 4. Create Students & All Records
// ---------------------------------------------------------
async function createStudentsAndRecords(school, classes, teachers) {
    const allStudents = []
    const studentsPerClass = 30

    for (const cls of classes) {
        const classStudents = []
        const exams = await Exam.find({ class_id: cls._id })
        const subjects = await Subject.find({ class_id: cls._id })

        // Create Students
        for (let i = 1; i <= studentsPerClass; i++) {
            const s = await User.create({
                name: `Student ${cls.class_name}${cls.section}-${String(i).padStart(2, '0')}`,
                phone: randomPhone(8000000000),
                email: `student.${cls.class_name}${cls.section.toLowerCase()}${i}@${school.name.split(' ')[0].toLowerCase()}.edu`,
                role: "Student",
                school_id: school._id,
                date_of_birth: new Date(2010 - cls.class_name, i % 12, 1 + i),
                studentProfile: {
                    class_id: cls._id,
                    roll_number: `${cls.class_name}${cls.section}-${String(i).padStart(2, '0')}`,
                    father_name: `Father of Student ${i}`,
                    mother_name: `Mother of Student ${i}`,
                    father_number: randomPhone(9500000000),
                    mother_number: randomPhone(9600000000),
                    father_email: `father${i}@parent.com`,
                    mother_email: `mother${i}@parent.com`,
                    total_presents: 0,
                    total_absents: 0
                }
            })
            classStudents.push(s)

            // Create Marks for each exam
            for (const exam of exams) {
                await Marks.create({
                    school_id: school._id,
                    exam_id: exam._id,
                    student_id: s._id,
                    marks_obtained: Math.floor(Math.random() * (exam.max_marks * 0.4)) + (exam.max_marks * 0.5)
                })
            }

            // Leave Applications (20% of students)
            if (Math.random() > 0.8) {
                const leaveReasons = ["Sick Leave", "Family Function", "Medical Appointment", "Personal Work"]
                const leaveStart = getRandomDate(10)
                const leaveEnd = new Date(leaveStart)
                leaveEnd.setDate(leaveEnd.getDate() + Math.floor(Math.random() * 3) + 1) // 1-3 days after start
                await Leave.create({
                    student: s._id,
                    school_id: school._id,
                    reason: getRandomItem(leaveReasons),
                    start_date: leaveStart,
                    end_date: leaveEnd,
                    status: getRandomItem(['Pending', 'Approved', 'Rejected']),
                    class_teacher: cls.class_teacher
                })
            }

            // Bully Reports (3% of students)
            if (Math.random() > 0.97) {
                await Bully.create({
                    school_id: school._id,
                    reported_by: s._id,
                    bully_name: "Anonymous Student",
                    bully_class: cls._id,
                    description: "Reported incident of verbal harassment during lunch break.",
                    status: getRandomItem(['Pending', 'Resolved'])
                })
            }

            // Doubts (15% of students)
            if (Math.random() > 0.85 && subjects.length > 0) {
                const randomSubject = getRandomItem(subjects)
                await Doubt.create({
                    school_id: school._id,
                    student: s._id,
                    class_id: cls._id,
                    subject: randomSubject.name,
                    teacher: randomSubject.teacher_id,
                    doubt: `I have a question about the recent topic covered in ${randomSubject.name} class. Can you please explain again?`,
                    status: getRandomItem(['Pending', 'Resolved']),
                    reply: Math.random() > 0.5 ? {
                        text: "Sure, please meet me during the revision period or check the study material shared.",
                        replied_at: new Date()
                    } : undefined
                })
            }

            // PTM Meetings (10% of students)
            if (Math.random() > 0.9) {
                await Ptm.create({
                    teacher_id: cls.class_teacher,
                    student_id: s._id,
                    school_id: school._id,
                    date: getFutureDate(14),
                    time: getRandomItem(["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]),
                    parent_name: `Parent of ${s.name}`,
                    status: getRandomItem(['pending', 'accepted', 'done'])
                })
            }
        }

        await Class.findByIdAndUpdate(cls._id, { $push: { students: { $each: classStudents.map(s => s._id) } } })
        allStudents.push(...classStudents)

        // Attendance & Summary (Last 15 working days)
        for (let d = 0; d < 15; d++) {
            const date = new Date()
            date.setDate(date.getDate() - d)
            date.setHours(0, 0, 0, 0)
            if (date.getDay() === 0) continue // Skip Sundays

            let presentCount = 0
            let absentCount = 0
            let lateCount = 0

            for (const s of classStudents) {
                const rand = Math.random()
                let status = 'P'
                if (rand > 0.92) status = 'A'
                else if (rand > 0.88) status = 'L'

                if (status === 'P') presentCount++
                else if (status === 'A') absentCount++
                else lateCount++

                await Attendance.create({
                    school_id: school._id,
                    date: date,
                    student_id: s._id,
                    class_id: cls._id,
                    status: status
                })

                // Update student attendance stats
                if (status === 'P') {
                    await User.findByIdAndUpdate(s._id, { $inc: { "studentProfile.total_presents": 1 } })
                } else if (status === 'A') {
                    await User.findByIdAndUpdate(s._id, { $inc: { "studentProfile.total_absents": 1 } })
                }
            }

            // Class Attendance Summary
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
    console.log(`   - Created ${allStudents.length} Students with Marks, Leaves, Doubts, PTM, Attendance`)
}

// ---------------------------------------------------------
// School Configurations
// ---------------------------------------------------------
const schoolConfigs = [
    {
        name: "Green Valley International School",
        address: "123 Education Lane, New Delhi, 110001",
        plan: "Automate",
        logo: "https://example.com/logos/greenvalley.png",
        classCount: 12,
        sections: ["A", "B", "C"]
    },
    {
        name: "Blue Star Academy",
        address: "456 Knowledge Park, Jaipur, Rajasthan 302001",
        plan: "Autonomy",
        logo: "https://example.com/logos/bluestar.png",
        classCount: 10,
        sections: ["A", "B"]
    },
    {
        name: "Sunrise Public School",
        address: "789 Learning Street, Mumbai, Maharashtra 400001",
        plan: "Assist",
        logo: null,
        classCount: 8,
        sections: ["A", "B"]
    },
    {
        name: "Oakwood High School",
        address: "321 Scholar Road, Bangalore, Karnataka 560001",
        plan: "Automate",
        logo: "https://example.com/logos/oakwood.png",
        classCount: 12,
        sections: ["A", "B", "C", "D"]
    },
    {
        name: "Little Scholars Academy",
        address: "555 Primary Way, Pune, Maharashtra 411001",
        plan: "Assist",
        logo: null,
        classCount: 5,
        sections: ["A"]
    }
]

// ---------------------------------------------------------
// Main Execution
// ---------------------------------------------------------
async function seed() {
    console.log("\n==============================================")
    console.log("       GYANAMA DATABASE SEEDING")
    console.log("==============================================\n")

    await connectDB()

    console.log("Cleaning Database...")
    await mongoose.connection.dropDatabase()
    console.log("Database cleaned.\n")

    // Create all schools
    for (let i = 0; i < schoolConfigs.length; i++) {
        const config = schoolConfigs[i]
        console.log(`[${i + 1}/${schoolConfigs.length}] Creating: ${config.name}`)
        console.log(`   Plan: ${config.plan} | Classes: ${config.classCount} | Sections: ${config.sections.join(', ')}`)

        const school = await School.create({
            name: config.name,
            address: config.address,
            plan: config.plan,
            logo: config.logo
        })

        await createSchoolStaff(school)
        const totalClassesNeeded = config.classCount * config.sections.length
        const teachers = await createTeachers(school, totalClassesNeeded)
        const classes = await createClassesAndAcademic(school, config.classCount, config.sections, teachers)
        await createStudentsAndRecords(school, classes, teachers)

        console.log(`   Completed: ${config.name}\n`)
    }

    // Summary
    const stats = {
        schools: await School.countDocuments(),
        users: await User.countDocuments(),
        classes: await Class.countDocuments(),
        subjects: await Subject.countDocuments(),
        timetables: await Timetable.countDocuments(),
        announcements: await Announcement.countDocuments(),
        homework: await Homework.countDocuments(),
        attendance: await Attendance.countDocuments(),
        leaves: await Leave.countDocuments(),
        exams: await Exam.countDocuments(),
        marks: await Marks.countDocuments(),
        doubts: await Doubt.countDocuments(),
        bullies: await Bully.countDocuments(),
        ptm: await Ptm.countDocuments(),
        summaries: await ClassAttendanceSummary.countDocuments()
    }

    console.log("==============================================")
    console.log("           SEEDING COMPLETE")
    console.log("==============================================")
    console.log("\nDatabase Statistics:")
    console.log(`  Schools:       ${stats.schools}`)
    console.log(`  Users:         ${stats.users}`)
    console.log(`  Classes:       ${stats.classes}`)
    console.log(`  Subjects:      ${stats.subjects}`)
    console.log(`  Timetables:    ${stats.timetables}`)
    console.log(`  Announcements: ${stats.announcements}`)
    console.log(`  Homework:      ${stats.homework}`)
    console.log(`  Attendance:    ${stats.attendance}`)
    console.log(`  Leaves:        ${stats.leaves}`)
    console.log(`  Exams:         ${stats.exams}`)
    console.log(`  Marks:         ${stats.marks}`)
    console.log(`  Doubts:        ${stats.doubts}`)
    console.log(`  Bully Reports: ${stats.bullies}`)
    console.log(`  PTM Meetings:  ${stats.ptm}`)
    console.log(`  Att. Summaries:${stats.summaries}`)
    console.log("==============================================\n")

    process.exit()
}

seed().catch(err => {
    console.error("Seeding Failed:", err)
    process.exit(1)
})
