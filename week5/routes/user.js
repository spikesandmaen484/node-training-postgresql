const express = require('express');

const router = express.Router();
const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Users');
const userController = require('../controllers/user');
const handleErrorAsync = require('../utils/handleErrorAsync');
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
});

// 新增使用者
router.post('/signup', handleErrorAsync(userController.postUser));

//使用者登入
router.post('/login', handleErrorAsync(userController.postLogin));

//取得個人資料
router.get('/profile', auth, handleErrorAsync(userController.getUserProfile));

//更新個人資料
router.put('/profile', auth, handleErrorAsync(userController.putUserProfile));

//取得已預約的課程列表
router.get('/courses', auth, handleErrorAsync(userController.getCourseBooking));

//取得使用者已購買的方案列表
router.get('/credit-package', auth, handleErrorAsync(userController.getCreditPackage));

//使用者更新密碼
router.put('/password', auth, handleErrorAsync(userController.putPassword));

module.exports = router;