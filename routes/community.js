const express = require('express');
const router = express.Router();
var authmiddleware = require('../middlewares/authMiddleware');
const communitycontroller = require('../controllers/communitycontroller');

router.post('/create', authmiddleware, communitycontroller.createcomunity);
router.get('/', authmiddleware, communitycontroller.getcommunity);
router.get('/member', authmiddleware, communitycontroller.getMemberofCommunity);

module.exports = router;