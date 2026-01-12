const mongoose = require('mongoose')

const timetableSchema = new mongoose.Schema({
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
    day:String,
    periods:[{
        start:String,
        end:String,
        subject:String,
        location:String,
        teacher_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    }]
},{timestamps:true})

timetableSchema.index({ school_id:1,class_id: 1, day: 1 })
timetableSchema.index({ school_id:1,"periods.teacher_id": 1 })

module.exports = mongoose.model('Timetable', timetableSchema)