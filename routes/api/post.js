var express = require('express');
var router = express.Router();
const authMiddleware = require('../../middlewares/api/authMiddleware')
var postcontroller = require('../../controllers/api/postcontroller');

router.get('/', authMiddleware, postcontroller.getpost)
router.get('/getNewPost/:page/:limit', authMiddleware, postcontroller.getNewPost)
router.post('/pushpost', authMiddleware, postcontroller.pushpost);
router.get('/userpost/:userId', authMiddleware, postcontroller.getUserPost);
router.get('/searchpost/:query/:page/:limit', authMiddleware, postcontroller.searchPost)

module.exports = router;