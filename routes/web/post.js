var express = require('express');
var router = express.Router();
const authMiddleware = require('../../middlewares/web/authMiddleware');
var postcontroller = require('../../controllers/web/postcontroller');
const multer = require('multer');

router.get('/', authMiddleware, postcontroller.getpost);
router.get('/randompost', authMiddleware, postcontroller.getramdompost);

router.post('/', postcontroller.pushpost);

module.exports = router;
