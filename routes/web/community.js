const express = require('express');
const router = express.Router();
var authmiddleware = require('../../middlewares/web/authMiddleware');
const communitycontroller = require('../../controllers/web/communitycontroller');

// Tao cong dong
router.post('/create', authmiddleware, communitycontroller.createcomunity);

// Xóa cộng đồng
router.post('/delete', communitycontroller.deleteCommunity);

router.post('/join', communitycontroller.joinCommunity);

router.get('/', authmiddleware, communitycontroller.getcommunity);
router.get('/member', authmiddleware, communitycontroller.getMemberofCommunity);
router.get('/page', authmiddleware, communitycontroller.getcommunitypagemanager);

// routes/community.js
router.get('/page/:communityId', communitycontroller.getCommunityPage);

module.exports = router;