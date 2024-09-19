var express = require('express');
var router = express.Router();
var userController = require('../controllers/usercontroller');


router.get('/', userController.showRegisterPage);
router.post('/', userController.handleRegister);

module.exports = router;
