const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({
    name:{
        type:String,
        set: v => v.replace(/\b\w/g, c => c.toUpperCase())  
    },
    teacher_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
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
    resources:[{
        type:String
    }]
    
})
subjectSchema.index({school_id:1,class_id:1})

module.exports = mongoose.model('Subject', subjectSchema)