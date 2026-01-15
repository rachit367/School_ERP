const userModel = require('../models/userModel');

async function blockTeacherAndStudent(req, res, next) {
  try {
    const role=req.role
    if (
      !role ||
      role === 'Teacher' ||
      role === 'Student'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { blockTeacherAndStudent };
