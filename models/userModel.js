const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    email:{
        type:String,
    },
    role:{
        type:String,
        enum:['Student','Principal','Teacher','Coordinator'],
        required:true
    },
    school_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'School'
    },
     // ---------- STUDENT PROFILE ----------
    studentProfile:{
        father_name:String,
        mother_name:String,
        class_id:{type:mongoose.Schema.Types.ObjectId,ref:'Class'},
        roll_number:{type:String ,required:true},
        attendance_percentage:Number
    },
     // ---------- TEACHER PROFILE ----------
    teacherProfile:{
        employee_id:{type:String,required:true},
        class_teacher_of:{type:mongoose.Schema.Types.ObjectId,ref:'Class'},
        classes_assigned:[{type:mongoose.Schema.Types.ObjectId,ref:'Class'}],
        timetable:String,
        designation:{
            type:String,
            enum:['ST','Mentor'],        //add manager and small roles of other employees here 
            required:true
        },
        annoucement_allowed:{type:Boolean,default:false}    
    }
},{timestamps:true})

module.exports = mongoose.model('User', userSchema)