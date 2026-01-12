const mongoose = require('mongoose')

const timetableSchema = new mongoose.Schema({
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

timetableSchema.index({ class_id: 1, day: 1 })
timetableSchema.index({ "periods.teacher_id": 1 })

module.exports = mongoose.model('Timetable', timetableSchema)