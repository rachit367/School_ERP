const mongoose=require('mongoose')

const attendanceSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  date: { type: Date, required: true ,default:Date.now},
  status: { 
    type: String, 
    enum: ["P", "A", "ML"],   // Present, Absent, Medical Leave
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
