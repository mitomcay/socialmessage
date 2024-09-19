var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var authMiddleware = require('../middlewares/authMiddleware');
var User = require('../models/users');

const tweets = [
    {
        name: 'John Doe',
        username: 'johndoe',
        avatar: 'https://via.placeholder.com/48',
        timestamp: '2h',
        text: 'Just had an amazing breakthrough in my project! 🎉 #coding #success',
        replies: 5,
        retweets: 12,
        likes: 24
    },
    {
        name: 'Jane Smith',
        username: 'janesmith',
        avatar: 'https://via.placeholder.com/48',
        timestamp: '5h',
        text: 'Excited to announce my new book release! 📚 Available now on Amazon. #newbook #author',
        image: 'https://via.placeholder.com/500x300',
        replies: 15,
        retweets: 50,
        likes: 137
    }
];

const trends = [
    { category: 'Technology', name: '#CodingLife', tweets: '12.5K' },
    { category: 'Science', name: 'SpaceX', tweets: '5,120' },
    { category: 'Trending', name: '#FridayFeeling', tweets: '2,764' }
];

const whoToFollow = [
    { name: 'Tech Insider', username: 'techinsider', avatar: 'https://via.placeholder.com/48' },
    { name: 'Science News', username: 'sciencenews', avatar: 'https://via.placeholder.com/48' },
    { name: 'Coding Tips', username: 'codingtips', avatar: 'https://via.placeholder.com/48' }
];

// Route for the home page
router.get('/',authMiddleware, (req, res) => {
    try {
        res.render('index', { tweets, trends, whoToFollow });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
