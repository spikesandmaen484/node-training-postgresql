const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const logger = require('../utils/logger')('AdminController');
const valid = require('../utils/valid');

dayjs.extend(utc);
const monthMap = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
}

const adminController = {
    //新增教練課程資料
    async postCourse(req, res, next) {
        const { id } = req.user;
        const {
            user_id: userId, skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
            max_participants: maxParticipants, meeting_url: meetingUrl
        } = req.body;
    
        if (valid.isUndefined(userId) || valid.isNotValidSting(userId) ||
        valid.isUndefined(skillId) || valid.isNotValidSting(skillId) ||
        valid.isUndefined(name) || valid.isNotValidSting(name) ||
        valid.isUndefined(description) || valid.isNotValidSting(description) ||
        valid.isUndefined(startAt) || valid.isNotValidSting(startAt) ||
        valid.isUndefined(endAt) || valid.isNotValidSting(endAt) ||
        valid.isUndefined(maxParticipants) || valid.isNotValidInteger(maxParticipants) ||
        valid.isUndefined(meetingUrl) || valid.isNotValidSting(meetingUrl) || !meetingUrl.startsWith('https')) {
            
            logger.warn('欄位未填寫正確');
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }

        const userRepository = dataSource.getRepository('User');
        const existingUser = await userRepository.findOne({
            select: ['id', 'name', 'role'],
            where: { id: userId }
        });
    
        if (!existingUser) {
            logger.warn('使用者不存在');
            return next(appError(400, 'failed', '使用者不存在', next));
        } 
        else if (existingUser.role !== 'COACH') {
            logger.warn('使用者尚未成為教練');
            return next(appError(400, 'failed', '使用者尚未成為教練', next));
        } 
    
        const courseRepo = dataSource.getRepository('Course');
        const newCourse = courseRepo.create({
            user_id: userId,
            skill_id: skillId,
            name,
            description,
            start_at: startAt,
            end_at: endAt,
            max_participants: maxParticipants,
            meeting_url: meetingUrl
        });
    
        const savedCourse = await courseRepo.save(newCourse);
        const course = await courseRepo.findOne({
            where: { id: savedCourse.id }
        });
    
        res.status(201).json({
            status: 'success',
            data: {
                course
            }
        });
    },

    //將使用者新增為教練
    async postCoach(req, res, next) {
        const { userId } = req.params;
        const { experience_years: experienceYears, description, profile_image_url: profileImageUrl = null } = req.body;
        if (valid.isUndefined(experienceYears) || valid.isNotValidInteger(experienceYears) || valid.isUndefined(description) || valid.isNotValidSting(description)) {
            logger.warn('欄位未填寫正確');
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }
        if (profileImageUrl && !valid.isNotValidSting(profileImageUrl) && !profileImageUrl.startsWith('https')) {
            logger.warn('大頭貼網址錯誤');
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }
        const userRepository = dataSource.getRepository('User');
        const existingUser = await userRepository.findOne({
            select: ['id', 'name', 'role'],
            where: { id: userId }
        });
        if (!existingUser) {
            logger.warn('使用者不存在');
            return next(appError(400, 'failed', '使用者不存在', next));
        } 
        else if (existingUser.role === 'COACH') {
            logger.warn('使用者已經是教練');
            return next(appError(409, 'failed', '使用者已經是教練', next));
        }
        const coachRepo = dataSource.getRepository('Coach');
        const newCoach = coachRepo.create({
            user_id: userId,
            experience_years: experienceYears,
            description,
            profile_image_url: profileImageUrl
        });
        const updatedUser = await userRepository.update({
            id: userId,
            role: 'USER'
        }, {
            role: 'COACH'
        });
        if (updatedUser.affected === 0) {
            logger.warn('更新使用者失敗');
            return next(appError(400, 'failed', '更新使用者失敗', next));
        }
        const savedCoach = await coachRepo.save(newCoach);
        const savedUser = await userRepository.findOne({
            select: ['name', 'role'],
            where: { id: userId }
        });
        res.status(201).json({
            status: 'success',
            data: {
                user: savedUser,
                coach: savedCoach
            }
        });
    },

    //編輯教練課程資料
    async putCourse(req, res, next) {
        const { id } = req.user;
        const { courseId } = req.params;
        const {
            skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
            max_participants: maxParticipants, meeting_url: meetingUrl
        } = req.body;
    
        if (valid.isNotValidSting(courseId) ||
        valid.isUndefined(skillId) || valid.isNotValidSting(skillId) ||
        valid.isUndefined(name) || valid.isNotValidSting(name) ||
        valid.isUndefined(description) || valid.isNotValidSting(description) ||
        valid.isUndefined(startAt) || valid.isNotValidSting(startAt) ||
        valid.isUndefined(endAt) || valid.isNotValidSting(endAt) ||
        valid.isUndefined(maxParticipants) || valid.isNotValidInteger(maxParticipants) ||
        valid.isUndefined(meetingUrl) || valid.isNotValidSting(meetingUrl) || !meetingUrl.startsWith('https')) {
            
            logger.warn('欄位未填寫正確');
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }
        const courseRepo = dataSource.getRepository('Course');
        const existingCourse = await courseRepo.findOne({
            where: { id: courseId, user_id: id }
        });
    
        if (!existingCourse) {
            logger.warn('課程不存在');
            return next(appError(400, 'failed', '課程不存在', next));
        }
        const updateCourse = await courseRepo.update({
            id: courseId
        }, {
            skill_id: skillId,
            name,
            description,
            start_at: startAt,
            end_at: endAt,
            max_participants: maxParticipants,
            meeting_url: meetingUrl
        });
        if (updateCourse.affected === 0) {
            logger.warn('更新課程失敗');
            return next(appError(400, 'failed', '更新課程失敗', next));
        }
        const savedCourse = await courseRepo.findOne({
            where: { id: courseId }
        });
        res.status(200).json({
            status: 'success',
            data: {
                course: savedCourse
            }
        });
    },

    //取得教練自己的月營收資料
    async getCoachMonthlyRevenue(req, res , next) {
        const { id } = req.user;
        const { month } = req.query;
        if (valid.isUndefined(month) || !Object.prototype.hasOwnProperty.call(monthMap, month)) {
            logger.warn('欄位未填寫正確');
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }

        const courseRepo = dataSource.getRepository('Course');
        const courses = await courseRepo.find({
            select: ['id'],
            where: { user_id: id }
        });

        const courseIds = courses.map(course => course.id);
        if (courseIds.length === 0) {
            res.status(200).json({
                status: 'success',
                data: {
                    total: {
                        revenue: 0,
                        participants: 0,
                        course_count: 0
                    }
                }
            });
            return;
        }

        const courseBookingRepo = dataSource.getRepository('CourseBooking');
        const year = new Date().getFullYear();
        const calculateStartAt = dayjs(`${year}-${month}-01`).startOf('month').toISOString();
        const calculateEndAt = dayjs(`${year}-${month}-01`).endOf('month').toISOString();

        const courseCount = await courseBookingRepo.createQueryBuilder('course_booking')
        .select('COUNT(*)', 'count')
        .where('course_id IN (:...ids)', { ids: courseIds })
        .andWhere('cancelled_at IS NULL')
        .andWhere('created_at >= :startDate', { startDate: calculateStartAt })
        .andWhere('created_at <= :endDate', { endDate: calculateEndAt })
        .getRawOne();

        const participants = await courseBookingRepo.createQueryBuilder('course_booking')
        .select('COUNT(DISTINCT(user_id))', 'count')
        .where('course_id IN (:...ids)', { ids: courseIds })
        .andWhere('cancelled_at IS NULL')
        .andWhere('created_at >= :startDate', { startDate: calculateStartAt })
        .andWhere('created_at <= :endDate', { endDate: calculateEndAt })
        .getRawOne();

        const totalCreditPackage = await dataSource.getRepository('CreditPackage').createQueryBuilder('credit_package')
        .select('SUM(credit_amount)', 'total_credit_amount')
        .addSelect('SUM(price)', 'total_price')
        .getRawOne();

        const perCreditPrice = totalCreditPackage.total_price / totalCreditPackage.total_credit_amount;
        const totalRevenue = courseCount.count * perCreditPrice;

        res.status(200).json({
            status: 'success',
            data: {
                total: {
                    revenue: Math.floor(totalRevenue),
                    participants: parseInt(participants.count, 10),
                    course_count: parseInt(courseCount.count, 10)
                }
            }
        });
    },

    //取得教練自己的課程列表
    async getCoachCourses(req, res, next) {
        const { id } = req.user;
        const courses = await dataSource.getRepository('Course').find({
            select: {
                id: true,
                name: true,
                start_at: true,
                end_at: true,
                max_participants: true
            },
            where: {
                user_id: id
            }
        });

        const courseIds = courses.map((course) => course.id);
        const coursesParticipant = await dataSource.getRepository('CourseBooking')
        .createQueryBuilder('course_booking')
        .select('course_id')
        .addSelect('COUNT(course_id)', 'count')
        .where('course_id IN (:...courseIds)', { courseIds })
        .andWhere('cancelled_at is null')
        .groupBy('course_id')
        .getRawMany();

        logger.info(`coursesParticipant: ${JSON.stringify(coursesParticipant, null, 1)}`);
        const now = new Date();
        res.status(200).json({
            status: 'success',
            data: courses.map((course) => {
                const startAt = new Date(course.start_at);
                const endAt = new Date(course.end_at);

                let status = '尚未開始';
                if (startAt < now) {
                    status = '進行中';
                    if (endAt < now) {
                        status = '已結束';
                    }
                }

                const courseParticipant = coursesParticipant.find((courseParticipant) => courseParticipant.course_id === course.id);
                return {
                    id: course.id,
                    name: course.name,
                    status,
                    start_at: course.start_at,
                    end_at: course.end_at,
                    max_participants: course.max_participants,
                    participants: courseParticipant ? courseParticipant.count : 0
                }
            })
        });
    },

    //取得教練自己的課程詳細資料
    async getCoachCourseDetail(req, res, next) {
        const { id } = req.user;
        const course = await dataSource.getRepository('Course').findOne({
            select: {
                id: true,
                name: true,
                description: true,
                start_at: true,
                end_at: true,
                max_participants: true,
                meeting_url: true,
                Skill: {
                    name: true
                }
            },
            where: {
                user_id: id
            },
            relations: {
                Skill: true
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                id: course.id,
                name: course.name,
                description: course.description,
                start_at: course.start_at,
                end_at: course.end_at,
                max_participants: course.max_participants,
                skill_name: course.Skill.name,
                meeting_url: course.meeting_url
            }
        });
    },

    //變更教練資料
    async putCoachProfile(req, res, next) {
        const { id } = req.user;
        const {
            experience_years: experienceYears,
            description,
            profile_image_url: profileImageUrl = null,
            skill_ids: skillIds
        } = req.body;

        if (valid.isUndefined(experienceYears) || valid.isNotValidInteger(experienceYears) ||
        valid.isUndefined(description) || valid.isNotValidSting(description) ||
        valid.isUndefined(profileImageUrl) || valid.isNotValidSting(profileImageUrl) ||
        !profileImageUrl.startsWith('https') ||
        valid.isUndefined(skillIds) || !Array.isArray(skillIds)) {
        
            logger.warn('欄位未填寫正確');
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }
        if (skillIds.length === 0 || skillIds.every(skill => valid.isUndefined(skill) || valid.isNotValidSting(skill))) {
            logger.warn('欄位未填寫正確');
            return next(appError(400, 'failed', '欄位未填寫正確', next));
        }

        const coachRepo = dataSource.getRepository('Coach');
        const coach = await coachRepo.findOne({
            select: ['id'],
            where: { user_id: id }
        });
        await coachRepo.update({
            id: coach.id
        }, {
            experience_years: experienceYears,
            description,
            profile_image_url: profileImageUrl
        });

        const coachLinkSkillRepo = dataSource.getRepository('CoachLinkSkill');
        const newCoachLinkSkill = skillIds.map(skill => ({
            coach_id: coach.id,
            skill_id: skill
        }));

        await coachLinkSkillRepo.delete({ coach_id: coach.id });
        const insert = await coachLinkSkillRepo.insert(newCoachLinkSkill);

        logger.info(`newCoachLinkSkill: ${JSON.stringify(newCoachLinkSkill, null, 1)}`);
        logger.info(`insert: ${JSON.stringify(insert, null, 1)}`);

        const result = await coachRepo.find({
            select: {
                id: true,
                experience_years: true,
                description: true,
                profile_image_url: true,
                CoachLinkSkill: {
                    skill_id: true
                }
            },
            where: { id: coach.id },
            relations: {
                CoachLinkSkill: true
            }
        });

        logger.info(`result: ${JSON.stringify(result, null, 1)}`);
        res.status(200).json({
            status: 'success',
            data: {
                id: result[0].id,
                experience_years: result[0].experience_years,
                description: result[0].description,
                profile_image_url: result[0].profile_image_url,
                skill_ids: result[0].CoachLinkSkill.map(skill => skill.skill_id)
            }
        });
    },

    //取得教練自己的詳細資料
    async getCoachProfile(req, res, next) {
        const { id } = req.user;
        const coachRepo = dataSource.getRepository('Coach');
        const coach = await coachRepo.findOne({
            select: ['id'],
            where: { user_id: id }
        });
        const result = await dataSource.getRepository('Coach').findOne({
            select: {
                id: true,
                experience_years: true,
                description: true,
                profile_image_url: true,
                CoachLinkSkill: {
                    skill_id: true
                }
            },
            where: { id: coach.id },
            relations: {
                CoachLinkSkill: true
            }
        });

        logger.info(`result: ${JSON.stringify(result, null, 1)}`);
        res.status(200).json({
            status: 'success',
            data: {
                id: result.id,
                experience_years: result.experience_years,
                description: result.description,
                profile_image_url: result.profile_image_url,
                skill_ids: result.CoachLinkSkill.length > 0 ? result.CoachLinkSkill.map(skill => skill.skill_id) : result.CoachLinkSkill
            }
        });
    }
}


module.exports = adminController;