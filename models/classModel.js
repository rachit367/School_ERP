const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    school_id:{type:mongoose.Schema.ObjectId,ref:'School', required:true},
    class_name:{type:Number,required:true},  //always integer 1,2,3 not roman
    section:{type:String,set: v => v.replace(/\b\w/g, c => c.toUpperCase())},
    class_teacher:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    teachers:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    students:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    allowed_attendance_teachers:[{type:mongoose.Schema.Types.ObjectId,ref:'User',index:true}],
    timetable: {type:{ name:String,url:String }},   // PDF / doc / link
    syllabus: {type:{ name:String,url:String }},    // PDF / doc / link
    exam: {type:{ name:String,url:String }}        // optional link to exam schedule or resources

},{timestamps:true})

classSchema.index(
  { school_id: 1, class_name: 1, section: 1 },
  { unique: true }
);

module.exports = mongoose.model('Class', classSchema)