const {
  handleAllowedEditTimetable,
  handleAddPeriod,
  handleDeletePeriod,
  handleStudentTimetable,
  handleTeacherTimetable
} = require('./../services/timetableService')


// req: user_id, class_id
async function allowedEditTimetable(req, res, next){
  try{
    const { class_id } = req.query
    const user_id = req.user_id
    const school_id = req.school_id

    const data = await handleAllowedEditTimetable(user_id,class_id,school_id)

    return res.status(200).json(data)

  }catch(err){
    next(err)
  }
}

// req: class_id, day, subject, start, end, teacher_id, location
async function addPeriod(req, res, next){
  try{
    const {
      class_id,
      day,
      subject,
      start,
      end,
      teacher_id,
      location
    } = req.body

    const school_id = req.school_id

    const data = await handleAddPeriod(
      school_id,
      class_id,
      day,
      subject,
      start,
      end,
      teacher_id,
      location
    )

    return res.status(200).json(data)

  }catch(err){
    next(err)
  }
}


// req: class_id, day, period_id
async function deletePeriod(req, res, next){
  try{
    const { class_id, day, period_id } = req.body
    const school_id = req.school_id

    const data = await handleDeletePeriod(
      school_id,
      class_id,
      day,
      period_id
    )

    return res.status(200).json(data)

  }catch(err){
    next(err)
  }
}


// req: class_id
async function studentTimetable(req, res, next){
  try{
    const class_id  = req.body.id
    const school_id = req.school_id

    const data = await handleStudentTimetable(
      class_id,
      school_id
    )
    return res.status(200).json(data)

  }catch(err){
    next(err)
  }
}


// req: teacher_id (optional)
async function teacherTimetable(req, res, next){
  try{
    const school_id = req.school_id
    const teacher_id = req.query.teacher_id || req.user_id

    const data = await handleTeacherTimetable(
      teacher_id,
      school_id
    )

    return res.status(200).json(data)

  }catch(err){
    next(err)
  }
}


module.exports = {
  allowedEditTimetable,
  addPeriod,
  deletePeriod,
  studentTimetable,
  teacherTimetable
}
