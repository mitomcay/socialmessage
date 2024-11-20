var express = require('express');
var router = express.Router();
const authMiddleware = require('../../middlewares/web/authMiddleware');
var postcontroller = require('../../controllers/web/postcontroller');
const multer = require('multer');

// Set up multer storage (if you haven't already set it up in the controller)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/', authMiddleware, postcontroller.getpost);
router.get('/randompost', authMiddleware, postcontroller.getramdompost);
router.post('/', authMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), postcontroller.pushpost);

module.exports = router;
