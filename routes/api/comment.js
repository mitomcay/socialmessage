var express = require('express');
var router = express.Router();
const authMiddleware = require('../../middlewares/api/authMiddleware');
const commentcontroller = require('../../controllers/api/commentcontroller');
const { authenticate } = require('passport');

router.get('/:postId', authMiddleware, commentcontroller.getComment);
router.post('/', authMiddleware, commentcontroller.createComment);
router.post('/like/:commentId', authMiddleware, commentcontroller.likeComment);
router.delete('/like/:commentId', authMiddleware, commentcontroller.unLikeComment);

module.exports = router;