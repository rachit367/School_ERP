const mongoose=require('mongoose')
const classAttendanceSummarySchema = new mongoose.Schema({
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },

  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true
  },

  section: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    required: true,
    default: () => new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
    index: true
  },

  total_students: {
    type: Number,
    required: true,
    min: 0
  },

  present_count: {
    type: Number,
    required: true,
    min: 0
  },

  absent_count: {
    type: Number,
    required: true,
    min: 0
  },

  attendance_percent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {timestamps: true});


module.exports = mongoose.model('ClassAttendanceSummary',classAttendanceSummarySchema);