const mongoose = require('mongoose')

const marksSchema = new mongoose.Schema({
    exam_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Exam',
        required:true
    },
    student_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    marks_obtained:{
        type:Number,
        required:true,
        min:0
    },
    grade:{
        type:String
    }
},{timestamps:true})

module.exports = mongoose.model('Marks', marksSchema)