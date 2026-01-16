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
    index: true,
    default: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;             // YYYY-MM-DD
    }
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

classAttendanceSummarySchema.index({school_id:1,class_id:1,date:1})
module.exports = mongoose.model('Classattendancesummary',classAttendanceSummarySchema);