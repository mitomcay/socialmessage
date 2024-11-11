var express = require('express');
var router = express.Router();
var authMiddleware = require('../../middlewares/api/authMiddleware');
var friendController = require('../../controllers/api/friendrequestcontroller');

router.get('/', authMiddleware, friendController.listfriend);
router.get('/FriendSuggestions',authMiddleware, friendController.friendSuggestions),
router.get('/Requestfriend', authMiddleware, friendController.listrequestfriend);
router.get('/Orderfriend', authMiddleware, friendController.listorderfriend);
router.post('/addfriend', friendController.addfriend);
router.post('/acceptfriend', friendController.acceptfriend);
router.post('/removeFriend', friendController.removeFriend);

module.exports = router;
