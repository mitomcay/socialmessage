var express = require('express');
var router = express.Router();
const authMiddleware = require('../../middlewares/api/authMiddleware');
const commentcontroller = require('../../controllers/api/commentcontroller');
const { authenticate } = require('passport');

router.get('/:postId', authMiddleware, commentcontroller.getComment);
router.post('/:postId', authMiddleware, commentcontroller.pustComment);
router.post('/:commentId', authMiddleware, commentcontroller.likeComment);
router.delete('/:commentId', authMiddleware, commentcontroller.unLikeComment);

module.exports = router;