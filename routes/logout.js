var express = require('express');
var router = express.Router();
var userController = require('../controllers/usercontroller');


/* GET login page. */
router.get('/', userController.logout);


module.exports = router;
