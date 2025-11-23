const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema({
    school_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'School',
        required:true
    },
    student_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:['approved','rejected','pending'],
        default:'pending'
    },
    reason:{
        type:String
    },
    start_date:{
        type:Date,
        required:true
    },
    end_date:{
        type:Date,
        default:function(){
            return this.start_date
        }
    },
    reviewed_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null
    }

},{timestamps:true})

module.exports = mongoose.model('Leave', leaveSchema)