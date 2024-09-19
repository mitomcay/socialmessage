var express = require('express');
var router = express.Router();
var authMiddleware = require('../middlewares/authMiddleware');
var friendController = require('../controllers/friendrequestcontroller');

router.get('/', authMiddleware, friendController.listfriend);
router.post('/addfriend',friendController.addfriend);
router.post('/acceptfriend', friendController.acceptfriend);
router.post('/removeFriend', friendController.removeFriend);

module.exports = router;
