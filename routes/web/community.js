const express = require('express');
const router = express.Router();
var authmiddleware = require('../../middlewares/web/authMiddleware');
const communitycontroller = require('../../controllers/web/communitycontroller');
const upload = require('../../middlewares/web/upload'); 

// Tao cong dong
router.post('/create', communitycontroller.createcomunity);

// Xóa cộng đồng
router.post('/delete', communitycontroller.deleteCommunity);

router.post('/join', communitycontroller.joinCommunity);

router.get('/', authmiddleware, communitycontroller.getcommunity);
router.get('/member', authmiddleware, communitycontroller.getMemberofCommunity);
router.get('/page', authmiddleware, communitycontroller.getcommunitypagemanager);

router.get('/search', authmiddleware, communitycontroller.searchCommunity);

// routes/community.js
router.get('/page/:communityId', communitycontroller.getCommunityPage);

module.exports = router;