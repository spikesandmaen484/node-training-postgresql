const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('CoachesController');
const appError = require('../utils/appError');
const valid = require('../utils/valid');

const coachController = {
    //取得教練列表
    async getCoaches(req, res, next) {
        const {per, page} = req.query;
        if (valid.isNotValidSting(per) || valid.isNotValidSting(page)) {
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }

        const pageSize = parseInt(per);
        const currentPage = parseInt(page);
        if (valid.isNotValidInteger(pageSize) || valid.isNotValidInteger(currentPage)) {
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }

        const coaches = await dataSource.getRepository('Coach').find({
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
            select: { id: true, experience_years: true, description: true, profile_image_url: true, User: { name: true }},
            relations: { User: true }
        });

        res.status(200).json({
            status: 'success',
            data: coaches.map( (item) => ({
                id: item.id,
                name: item.User.name,
                experience_years: item.experience_years,
                description: item.description,
                profile_image_url: item.profile_image_url
            }))
        });
    },

    //取得教練詳細資訊
    async getCoachDetail(req, res, next) {
        const { coachId } = req.params;
            
        if (valid.isUndefined(coachId) || valid.isNotValidSting(coachId)) {
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }

        const coachRepo = await dataSource.getRepository('Coach');
        const existCoach = await coachRepo.findOne({
            select: {
                id: true,
                user_id: true,
                experience_years: true,
                description: true,
                profile_image_url: true,
                created_at: true,
                updated_at: true,
                User: {
                    name: true,
                    role: true
                }
            },
            where: {
                id: coachId
            },
            relations: {
                User: true
            }
        });

        if (!existCoach) {
            return next(appError(400, 'failed', '找不到該教練', next));
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: existCoach.User,
                coach:{
                    id: existCoach.id,
                    user_id: existCoach.user_id,
                    experience_years: existCoach.experience_years,
                    description: existCoach.description,
                    profile_image_url: existCoach.profile_image_url,
                    created_at: existCoach.created_at,
                    updated_at: existCoach.updated_at
                }
            }
        });
    },

    //取得指定教練課程列表
    async getCoachCourses(req, res, next) {
        const { coachId } = req.params;
        if (valid.isUndefined(coachId) || valid.isNotValidSting(coachId)) {
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }

        const coach = await dataSource.getRepository('Coach').findOne({
            select: {
                id: true,
                user_id: true,
                User: {
                    name: true
                }
            },
            where: {
                id: coachId
            },
            relations: {
                User: true
            }
        });
        if (!coach) {
            logger.warn('找不到該教練');
            return next(appError(400, 'failed', '找不到該教練', next));
        }

        logger.info(`coach: ${JSON.stringify(coach)}`);
        const courses = await dataSource.getRepository('Course').find({
            select: {
                id: true,
                name: true,
                description: true,
                start_at: true,
                end_at: true,
                max_participants: true,
                Skill: {
                    name: true
                }
            },
            where: {
                user_id: coach.user_id
            },
            relations: {
                Skill: true
            }
        });

        logger.info(`courses: ${JSON.stringify(courses)}`);
        res.status(200).json({
            status: 'success',
            data: courses.map((course) => ({
                id: course.id,
                name: course.name,
                description: course.description,
                start_at: course.start_at,
                end_at: course.end_at,
                max_participants: course.max_participants,
                coach_name: coach.User.name,
                skill_name: course.Skill.name
            }))
        });
    }
}


module.exports = coachController;