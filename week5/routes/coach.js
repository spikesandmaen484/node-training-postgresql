const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');

const logger = require('../utils/logger')('Coach');
const valid = require('../config/valid');

//取得教練列表
router.get('/?', async (req, res, next) => {
  try {
    const per = parseInt(req.query.per);
    const page = parseInt(req.query.page);

    if (valid.isUndefined(per) || valid.isNotValidInteger(per) || valid.isUndefined(page) || valid.isNotValidInteger(page)) {
        res.status(400).json({
            status: 'failed',
            message: '參數格式錯誤'
        });
        return;
    }

    const coaches = await dataSource.getRepository('User').find({
      select: ['id', 'name'],
      where: { role: 'COACH'}
    });
    res.status(200).json({
      status: 'success',
      data: coaches
    });
  } 
  catch (error) {
    logger.error(error);
    next(error);
  }
});

//取得教練詳細資訊
router.get('/:coachId', async (req, res, next) => {
    try {
        const coachId = req.url.split('/').pop();

        if (valid.isUndefined(coachId) || valid.isNotValidSting(coachId)) {
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            });
            return;
        }

        const coachRepo = await dataSource.getRepository('Coach');
        const existCoach = await coachRepo.find({
            where: {
                user_id: coachId
            }
        });

        if (existCoach.length == 0) {
            res.status(400).json({
                status: 'failed',
                message: '找不到該教練'
            });
            return;
        }

        const user = await dataSource.getRepository('User').findOne({
            select: ['name', 'role'],
            where: { id: coachId }
        });
        const coach = await dataSource.getRepository('Coach').findOne({
            select: ['id', 'user_id', 'experience_years', 'description', 'profile_image_url', 'created_at', 'updated_at'],
            where: { user_id: coachId }
        });
        const result = { 
            user,
            coach
        };

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

module.exports = router;