var express = require('express');
var router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware')
var postcontroller = require('../../controllers/web/postcontroller');

router.get('/', authMiddleware, postcontroller.getpost)
router.post('/pushpost', authMiddleware, postcontroller.pushpost);


module.exports = router;