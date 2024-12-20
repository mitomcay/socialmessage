const express = require('express');
const router = express.Router();
var authmiddleware = require('../../middlewares/web/authMiddleware');
const commentcontroller = require('../../controllers/web/commentcontroller');

router.post('/', authmiddleware, commentcontroller.postComment);
router.post('/getcomment', authmiddleware, commentcontroller.getComment);
router.post('/like/:commentId', authmiddleware, commentcontroller.likeComment);

module.exports = router;