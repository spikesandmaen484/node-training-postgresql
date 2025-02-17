const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('CreditPackage');
const valid = require('../config/valid');

//取得購買方案列表
router.get('/', async (req, res, next) => {
    try {
        const packages = await appDataSource.getRepository("CreditPackage").find({
          select: ["id", "name", "credit_amount", "price"]
        });
        res.status(200).json({
            status: 'success',
            data: packages
        });
    } 
    catch (error) {
        logger.error(error);
        next(error);
    }
});

//新增購買方案
router.post('/', async (req, res, next) => {
    try {
        const { data } = req.body;
    
        if (valid.isUndefined(data.name) || valid.isNotValidSting(data.name) ||
        valid.isUndefined(data.credit_amount) || valid.isNotValidInteger(data.credit_amount) ||
        valid.isUndefined(data.price) || valid.isNotValidInteger(data.price)) {

            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            });
            return;
        }
    
        const creditPackageRepo = await appDataSource.getRepository("CreditPackage");
        const existPackage = await creditPackageRepo.find({
          where: {
            name: data.name
          }
        });
        if (existPackage.length > 0) {
            res.status(409).json({
                status: 'failed',
                message: '資料重複'
            });
            return;
        }

        const newPackage = await creditPackageRepo.create({
          name: data.name,
          credit_amount: data.credit_amount,
          price: data.price
        });

        const result = await creditPackageRepo.save(newPackage);
        res.status(200).json({
            status: 'success',
            data: result
        });
      } 
      catch (error) {
        logger.error(error);
        next(error);
      }
});

//刪除購買方案
router.delete('/:creditPackageId', async (req, res, next) => {
    try {
        const packageId = req.url.split("/").pop();
    
        if (valid.isUndefined(packageId) || valid.isNotValidSting(packageId)) {
        
            res.status(400).json({
                status: 'failed',
                message: 'ID錯誤'
            });
            return;
        }
    
        const result = await appDataSource.getRepository("CreditPackage").delete(packageId);
        if (result.affected === 0) {
            res.status(400).json({
                status: 'failed',
                message: 'ID錯誤'
            });
            return;
        }
    
        res.status(200).json({
            status: 'success'
        });
    } 
    catch (error) {
        logger.error(error);
        next(error);
    }
});

module.exports = router;
