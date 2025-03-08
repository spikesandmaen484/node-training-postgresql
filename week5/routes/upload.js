const express = require('express');

const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Upload');
const uploadController = require('../controllers/upload');
const uploadImg = require('../middlewares/uploadImg');
const handleErrorAsync = require('../utils/handleErrorAsync');
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
});

const router = express.Router();

router.post('/', auth, uploadImg, handleErrorAsync(uploadController.postUploadImg));

module.exports = router;