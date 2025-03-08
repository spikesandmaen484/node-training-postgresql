const express = require('express');

const router = express.Router();
const skillController = require('../controllers/skill');
const handleErrorAsync = require('../utils/handleErrorAsync');


router.get('/', handleErrorAsync(skillController.getSkill));

router.post('/', handleErrorAsync(skillController.postSkill));

router.delete('/:skillId', handleErrorAsync(skillController.deleteSkill));

module.exports = router;