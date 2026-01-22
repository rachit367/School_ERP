const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{   
        type:String,
        required:true,
        set: v => v.replace(/\b\w/g, c => c.toUpperCase())        //first letter of every word capital
    },
    phone:{                         //10 digit no spaces
        type:Number,
        required:true 
    },
    email:{
        type:String,
    },
    role:{
        type:String,
        enum:['Student','Principal','Teacher','Coordinator','Manager'],
        required:true
    },
    school_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'School',
        required:true
    },
    date_of_birth:{
        type:Date
    },
    refreshToken:String,    // make it store with bcrypt afterwards for security purpose
     // ---------- STUDENT PROFILE ----------
    studentProfile:{
        father_name:String,
        mother_name:String,
        father_email:String,
        father_number:Number,
        mother_number:Number,
        mother_email:String,
        guardian_name:String,
        guardian_email:String,
        guardian_number:Number,
        class_id:{type:mongoose.Schema.Types.ObjectId,ref:'Class'},
        roll_number:{type:String },
        total_presents:{type:Number,default:0},
        total_absents:{type:Number,default:0}
    },
     // ---------- TEACHER PROFILE ----------
    teacherProfile:{
        employee_id:{type:String},
        class_teacher_of:{type:mongoose.Schema.Types.ObjectId,ref:'Class'},
        classes_assigned:[{type:mongoose.Schema.Types.ObjectId,ref:'Class'}],
        timetable_url:String,         //make the url always unique while uploading on aws
        designation:{
            type:String,
            enum:['ST','Mentor']      
        },
        subjects:[{
            type:String,
            set: v => v.replace(/\b\w/g, c => c.toUpperCase())
        }],
        announcement_allowed:{type:Boolean,default:false},
    }
},{timestamps:true})

userSchema.index({school_id:1,role:1})

module.exports = mongoose.model('User', userSchema)