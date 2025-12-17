const mongoose=require('mongoose')
// clean this database for every student or class according after every year end 
const attendanceSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  date: { 
    type: String, 
    required: true ,
    default: () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  },
  status: { 
    type: Date, 
    enum: ["P", "A", "ML","L"],   // Present, Absent, Medical Leave, Leave
    required: true 
  }
}, { timestamps: true });

attendanceSchema.index(
  {student_id:1,class_id:1,date:1},
  {unique:true}
)

module.exports = mongoose.model("Attendance", attendanceSchema);
