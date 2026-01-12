const mongoose = require('mongoose')

const ptmSchema = new mongoose.Schema({
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    school_id: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    date:{type:Date},
    time:{type:String},
    parent_name:String,
    status:{
        type:String,
        enum:['accepted','done','rejected','pending'],
        default:'pending'
    },

},{timestamps:true})



module.exports = mongoose.model('Ptm', ptmSchema)