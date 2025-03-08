const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('SkillController');
const appError = require('../utils/appError');
const valid = require('../utils/valid');


const skillController = {
    //取得教練專長列表
    async getSkill(req, res, next) {
        const skill = await dataSource.getRepository('Skill').find({
            select: ['id', 'name']
        });

        res.status(200).json({
            status: 'success',
            data: skill
        });
    },
    
    //新增教練專長
    async postSkill(req, res, next) {
        const { name } = req.body;
            
        if (valid.isUndefined(name) || valid.isNotValidSting(name)) {
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }
    
        const skillRepo = await dataSource.getRepository('Skill');
        const existSkill = await skillRepo.findOne({
            where: {
                name
            }
        });
    
        if (existSkill) {
            return next(appError(409, 'failed', '資料重複', next));
        }
        const newSkill = await skillRepo.create({
            name
        });
    
        const result = await skillRepo.save(newSkill);
        res.status(200).json({
            status: 'success',
            data: result
        });
    },
    
    //刪除教練專長
    async deleteSkill(req, res, next) {
        const { skillId } = req.params;
            
        if (valid.isUndefined(skillId) || valid.isNotValidSting(skillId)) {
            return next(appError(400, 'failed', 'ID錯誤', next));
        }
    
        const result = await dataSource.getRepository('Skill').delete(skillId);
        if (result.affected === 0) {
            return next(appError(400, 'failed', 'ID錯誤', next));
        }
        res.status(200).json({
            status: 'success'
        });
    }
}


module.exports = skillController;