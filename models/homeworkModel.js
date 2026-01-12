const mongoose = require('mongoose')

const homeworkSchema = new mongoose.Schema({
    school_id:{ type: mongoose.Schema.Types.ObjectId, ref: "School",required:true },
    created_by:{ type: mongoose.Schema.Types.ObjectId, ref: "User" ,required:true},
    class_id:{ type: mongoose.Schema.Types.ObjectId, ref: "Class" ,required:true},
    topic:String,
    description:String,
    attachments:[{
        name:String,
        url:String
    }],
    deadline:Date,
    submitted_by:[{
        student_id:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
        file_url:{type:String},
        submitted_at:{type:Date,default:Date.now}
    }]
},{timestamps:true})

homeworkSchema.index({school_id:1,class_id:1})
homeworkSchema.index({school_id:1,created_by:1})

module.exports = mongoose.model('Homework', homeworkSchema)