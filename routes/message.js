var express = require('express');
var router = express.Router();
var messagecontroller = require('../controllers/messagecontroller');
var authmiddleware = require('../middlewares/authMiddleware');

router.get('/', authmiddleware, messagecontroller.getMessage);
router.post('/sendmessage', authmiddleware, messagecontroller.sendMessage);
router.post('/messagelike', authmiddleware, messagecontroller.likeMessage);

module.exports = router; 