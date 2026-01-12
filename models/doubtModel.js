const mongoose = require('mongoose')

const doubtSchema = new mongoose.Schema({
    school_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'School',
        required:true
    },
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    student_name:String,
    class_name:String,
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    doubt:{
        type:String,
    },
    doubt_attachments:[{
        url:String
    }],
    reply:{
        text:String,
        attachments:[{type:String}],
        replied_at:Date
    },
    status:{
        type:String,
        enum:['Pending','Resolved'],
        default:'Pending'
    }
},{timestamps:true})

module.exports = mongoose.model('Doubt', doubtSchema)
