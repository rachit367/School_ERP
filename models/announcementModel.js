const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
    school_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'School',
        required:true
    },
    created_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    class_id:[{  //if empty for whole school
        type:mongoose.Schema.Types.ObjectId,
        ref:'Class',    
    }],
    title:{
        type:String,
        required:true
    },
    message:{
        type:String,
        trim:true
    },
    files:[{
        name:String,
        url:String,
    }]
},{timestamps:true})

module.exports = mongoose.model('Announcement', announcementSchema)