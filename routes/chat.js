var express = require('express');
var router = express.Router();
var chatcontroller = require('../controllers/chatcontroller');
var authmiddleware = require('../middlewares/authMiddleware');

router.get('/', authmiddleware, chatcontroller.getchat);
router.post('/createchat', authmiddleware, chatcontroller.createChat);
router.post('/changememberrole', authmiddleware, chatcontroller.changeMemberRole);
router.get('/members', authmiddleware, chatcontroller.getMembers);

module.exports = router;