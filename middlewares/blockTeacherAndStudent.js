const userModel = require('../models/userModel');

async function blockTeacherAndStudent(req, res, next) {
  try {
    const user = await userModel.findById(req.user_id).select('role');

    if (
      !user ||
      user.role === 'Teacher' ||
      user.role === 'Student'
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
