const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('CreditPackageController');
const appError = require('../utils/appError');
const valid = require('../utils/valid');

const creditPackageController = {
    //取得購買方案列表
    async getAllCreditPackages(req, res, next) {
        const creditPackage  = await dataSource.getRepository("CreditPackage").find({
            select: ["id", "name", "credit_amount", "price"]
        });
        res.status(200).json({
            status: 'success',
            data: creditPackage
        });
    },

    //新增購買方案
    async postCreditPackage(req, res, next) {
        const { name, credit_amount: creditAmount, price } = req.body;
            
        if (valid.isUndefined(name) || valid.isNotValidSting(name) ||
        valid.isUndefined(creditAmount) || valid.isNotValidInteger(creditAmount) ||
        valid.isUndefined(price) || valid.isNotValidInteger(price)) {

            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }
    
        const creditPackageRepo = dataSource.getRepository("CreditPackage");
        const existCreditPackage = await creditPackageRepo.find({
            where: {
                name
            }
        });
        if (existCreditPackage.length > 0) {
            return next(appError(409, 'failed', '資料重複', next));
        }

        const newCreditPurchase = await creditPackageRepo.create({
            name,
            credit_amount: creditAmount,
            price
        });

        const result = await creditPackageRepo.save(newCreditPurchase);
        res.status(200).json({
            status: 'success',
            data: result
        });
    },

    //使用者購買方案
    async postUserCreditPackage(req, res, next) {
        const { id } = req.user;
        const { creditPackageId } = req.params;
        const creditPackageRepo = dataSource.getRepository('CreditPackage');
        const creditPackage = await creditPackageRepo.findOne({
            where: {
                id: creditPackageId
            }
        });
        if (!creditPackage) {
            return next(appError(400, 'failed', 'ID錯誤', next));
        }

        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase');
        const newPurchase = await creditPurchaseRepo.create({
            user_id: id,
            credit_package_id: creditPackageId,
            purchased_credits: creditPackage.credit_amount,
            price_paid: creditPackage.price,
            purchaseAt: new Date().toISOString()
        });
        await creditPurchaseRepo.save(newPurchase);
        res.status(200).json({
            status: 'success',
            data: null
        });
    },

    //刪除購買方案
    async deleteCreditPackage(req, res, next) {
        const { creditPackageId } = req.params;
                
        if (valid.isUndefined(creditPackageId) || valid.isNotValidSting(creditPackageId)) {
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }
    
        const result = await dataSource.getRepository("CreditPackage").delete(creditPackageId);
        if (result.affected === 0) {
            return next(appError(400, 'failed', 'ID錯誤', next));
        }
    
        res.status(200).json({
            status: 'success',
            data: result
        });
    }
}


module.exports = creditPackageController;