const mongoose = require('mongoose')

const examSchema = new mongoose.Schema({
    school_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'School',
        required:true
    },
    class_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Class',
        required:true
    },
    exam_type:{       // add either enum or a particular format for accessing
        type:String,
        required:true,
        set: v => v.replace(/\b\w/g, c => c.toUpperCase())
    },
    subject:{  //add a particular format for accessing
        type:String,
        set: v => v.replace(/\b\w/g, c => c.toUpperCase()),
        required:true
    },
    max_marks:{
        type:Number,
        required:true
    },
    date_of_exam:{
        type:Date,
        required:true
    }

},{timestamps:true})

module.exports = mongoose.model('Exam', examSchema)