const express = require('express');
const router = express.Router();
var authmiddleware = require('../../middlewares/api/authMiddleware');
const communitycontroller = require('../../controllers/api/communitycontroller');

router.post('/create', authmiddleware, communitycontroller.createCommunity);
router.get('/', authmiddleware, communitycontroller.getMyCommunity);
router.get('/member', authmiddleware, communitycontroller.getMemberOfCommunity);

module.exports = router;