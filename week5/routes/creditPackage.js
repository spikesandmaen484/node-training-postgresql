const express = require('express');

const router = express.Router();
const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('CreditPackage');
const creditPackageController = require('../controllers/creditPackage');
const handleErrorAsync = require('../utils/handleErrorAsync');
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
});

//取得購買方案列表
router.get('/', handleErrorAsync(creditPackageController.getAllCreditPackages));

//新增購買方案
router.post('/', handleErrorAsync(creditPackageController.postCreditPackage));

//使用者購買方案
router.post('/:creditPackageId', auth, handleErrorAsync(creditPackageController.postUserCreditPackage));

//刪除購買方案
router.delete('/:creditPackageId', handleErrorAsync(creditPackageController.deleteCreditPackage));

module.exports = router;
