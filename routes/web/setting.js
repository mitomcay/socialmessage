var express = require('express');
var router = express.Router();
var userController = require('../../controllers/web/usercontroller');
var profileController = require('../../controllers/web/profilecontroller');

router.get('/settings', profileController.setting);

module.exports = router;