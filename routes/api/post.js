var express = require('express');
var router = express.Router();
const authMiddleware = require('../../middlewares/api/authMiddleware')
var postcontroller = require('../../controllers/api/postcontroller');

router.get('/:postId', postcontroller.getpost)
router.get('/getNewPost/:page/:limit', authMiddleware, postcontroller.getNewPost)
router.post('/pushpost', authMiddleware, postcontroller.pushpost);
router.get('/userpost/:userId', authMiddleware, postcontroller.getUserPost);
router.get('/searchpost/:query/:page/:limit', authMiddleware, postcontroller.searchPost);
router.post('/likePost/:postId', authMiddleware, postcontroller.likepost);
router.delete('/unLikePost/:postId', authMiddleware, postcontroller.unlikepost);


module.exports = router;