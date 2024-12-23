var express = require('express');
var router = express.Router();
const authMiddleware = require('../../middlewares/web/authMiddleware');
var postcontroller = require('../../controllers/web/postcontroller');
const multer = require('multer');

router.get('/', authMiddleware, postcontroller.getallpost);
router.get('/postdescription', postcontroller.postdescription);
router.get('/mypost', authMiddleware, postcontroller.getmypost);
router.get('/yourpost/:userId', authMiddleware, postcontroller.getyourpost);
router.get('/search', postcontroller.searchpost);
router.get('/:postId', postcontroller.getpostpage);

router.post('/deletepost/:postId', postcontroller.deletepost);
router.post('/', postcontroller.pushpost);
router.post('/like', postcontroller.likepost);

//router.get('/randompost', authMiddleware, postcontroller.getramdompost);
//router.post('/getlike', postcontroller.getlikepost);


module.exports = router;
