const express = require('express');

const router = express.Router();
const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Course');
const courseController = require('../controllers/course');
const handleErrorAsync = require('../utils/handleErrorAsync');
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
});

//取得課程列表
router.get('/', handleErrorAsync(courseController.getAllCourses));

//報名課程
router.post('/:courseId', auth, handleErrorAsync(courseController.postCourseBooking));

//取消課程
router.delete('/:courseId', auth, handleErrorAsync(courseController.deleteCourseBooking));

module.exports = router;