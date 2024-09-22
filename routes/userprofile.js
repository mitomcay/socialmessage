var express = require('express');
var router = express.Router();
var usercontroller = require('../controllers/usercontroller')

/* GET profile user. */
router.get('/', usercontroller.showprofilepages);


module.exports = router;
