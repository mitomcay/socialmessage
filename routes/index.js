var express = require('express');
var router = express.Router();
var authMiddleware = require('../middlewares/authMiddleware');


// Route for the home page
router.get('/', authMiddleware, (req, res) => {
    try {
        res.status(200).json({message: 'access congratulation',user: req.session.user });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
