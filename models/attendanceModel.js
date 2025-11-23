const mongoose=require('mongoose')

const attendanceSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  date: { 
    type: Date, required: true ,
    default: () => new Date(new Date().setHours(0,0,0,0))  //to store date only time at 00:00
  },
  status: { 
    type: String, 
    enum: ["P", "A", "ML","L"],   // Present, Absent, Medical Leave, Leave
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
