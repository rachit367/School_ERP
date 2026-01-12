const mongoose = require('mongoose')

const marksSchema = new mongoose.Schema({
    school_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'School',
        required:true   
    },
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

marksSchema.index({school_id:1,exam_id:1})
marksSchema.index({school_id:1,student_id:1})
module.exports = mongoose.model('Marks', marksSchema)