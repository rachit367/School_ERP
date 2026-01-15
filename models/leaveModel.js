const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema({
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
    status:{
        type:String,
        enum:['Approved','Rejected','Pending'],
        default:'Pending'
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
    class_teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    medical_certificate:{
        type:String  //url of certificate
    }

},{timestamps:true})

leaveSchema.index({school_id:1,student:1})

module.exports = mongoose.model('Leave', leaveSchema)