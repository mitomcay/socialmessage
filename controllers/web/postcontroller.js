const { urlencoded } = require('express');
const Post = require('../../models/post/post');
const postlike = require('../../models/post/postlike');
const postmedia = require('../../models/post/postmedia');
const Media = require('../../models/media/media'); // Assuming you have this model for media files
const multer = require('multer');

exports.getpost = async (req, res) => {
  try {
    const userId = req.session.userId;
    const mypost = await Post.find({
      Author: userId,
    });
    
    if (!mypost) {
      return res.status(400).json({ message: 'No post found' });
    }

    return res.status(200).json({ message: 'List your post', post: mypost });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.getramdompost = async (req, res) => {
  try {
    const mypost = await Post.aggregate([{ $sample: { size: 10 } }]);
    
    if (!mypost) {
      return res.status(400).json({ message: 'No post found' });
    }

    return res.status(200).json({ message: 'List your post', post: mypost });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Folder to store the uploaded files
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Renaming file
  }
});

const upload = multer({ storage: storage });

exports.pushpost = async (req, res) => {
  try {
    const userId = req.session.userId;
    const content = req.body.content;  // Data from form
    const IsCommunityPost = req.query.IsCommunityPost === 'true'; // From query params
    const image = req.files?.image;
    const video = req.files?.video;

    console.log('Content:', content);
    console.log('Image:', image);
    console.log('Video:', video);

    // Create the new post
    const newPost = new Post({
      Author: userId,
      content: content,
      IsCommunityPost: IsCommunityPost,
    });

    // Save media files if provided
    if (image) {
      const media = new Media({
        type: 'image',
        filePath: image[0].path, // Fix: Ensure it's an array since it's an object from `upload.fields()`
      });
      await media.save();
      newPost.media = media._id;
    }

    if (video) {
      const media = new Media({
        type: 'video',
        filePath: video[0].path, // Fix: Ensure it's an array since it's an object from `upload.fields()`
      });
      await media.save();
      newPost.media = media._id;
    }

    await newPost.save();
    return res.status(200).json({ message: 'Post created successfully' });

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.likepost = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { postId } = req.body;
    const existinglikepost = await postlike.findOne({
      post: postId,
      User: userId,
    });

    if (existinglikepost) {
      // Remove like if it already exists
      await postlike.deleteOne(existinglikepost);
    }

    const newlikepost = new postlike({
      post: postId,
      User: userId,
    });
    await newlikepost.save();

    res.status(200).json({ message: 'Like post success' });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
