const express = require('express');

const router = express.Router();
const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Admin');
const adminController = require('../controllers/admin');
const handleErrorAsync = require('../utils/handleErrorAsync');
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
});
const isCoach = require('../middlewares/isCoach');

//新增教練課程資料
router.post('/coaches/courses', auth, isCoach, handleErrorAsync(adminController.postCourse));

//編輯教練課程資料
router.put('/coaches/courses/:courseId', auth, isCoach, handleErrorAsync(adminController.putCourse));

//將使用者新增為教練
router.post('/coaches/:userId', handleErrorAsync(adminController.postCoach));

//取得教練自己的月營收資料
router.get('/coaches/revenue', auth, isCoach, handleErrorAsync(adminController.getCoachMonthlyRevenue));

//取得教練自己的課程詳細資料
router.get('/coaches/courses/:courseId', auth, handleErrorAsync(adminController.getCoachCourseDetail));

//取得教練自己的課程列表
router.get('/coaches/courses', auth, isCoach, handleErrorAsync(adminController.getCoachCourses));

//變更教練資料
router.put('/coaches', auth, isCoach, handleErrorAsync(adminController.putCoachProfile));

//取得教練自己的詳細資料
router.get('/coaches', auth, isCoach, handleErrorAsync(adminController.getCoachProfile));

module.exports = router;