var express = require('express');
var router = express.Router();
const authMiddleware = require('../../middlewares/web/authMiddleware');
var postcontroller = require('../../controllers/web/postcontroller');
const multer = require('multer');

router.get('/', authMiddleware, postcontroller.getallpost);
router.get('/mypost', authMiddleware, postcontroller.getmypost);
router.get('/randompost', authMiddleware, postcontroller.getramdompost);

router.post('/', postcontroller.pushpost);
router.post('/like/:postId', postcontroller.likepost);
router.post('/getlike', postcontroller.getlikepost);
module.exports = router;
