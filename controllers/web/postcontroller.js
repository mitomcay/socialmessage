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
    }).populate('Author', 'username') // Lấy thông tin tác giả
    .populate({
      path: 'media',
      model: 'postmedia',
      populate: { path: 'media', model: 'media' }, // Lấy thông tin file
    })
    .exec();
    
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
    const mypost = await Post.aggregate([
      { $sample: { size: 10 } }, // Lấy ngẫu nhiên 10 bài post
      {
        $lookup: {
          from: 'users', // Tên collection của User
          localField: 'Author',
          foreignField: '_id',
          as: 'AuthorDetails',
        },
      },
      { $unwind: '$AuthorDetails' }, // Giải phóng mảng AuthorDetails
      {
        $lookup: {
          from: 'postmedias', // Tên collection của PostMedia
          localField: '_id',
          foreignField: 'Post',
          as: 'media',
        },
      },
      {
        $lookup: {
          from: 'medias', // Tên collection của Media
          localField: 'media.media',
          foreignField: '_id',
          as: 'mediaFiles',
        },
      },
    ]);
    
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

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and MP4 are allowed.'));
    }
  },
})

exports.pushpost = async (req, res) => {
  try {
    const userId = req.session.userId; // Lấy ID người dùng từ session
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { content } = req.body;
      const isCommunityPost = req.query.IsCommunityPost === 'true';
      const communityId = req.body.communityId || null; // ID cộng đồng nếu có

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Content is required' });
      }

      // Tạo bài post mới
      const newPost = new Post({
        Author: userId,
        Community: isCommunityPost ? communityId : null,
        content: content,
        IsCommunityPost: isCommunityPost,
      });

      await newPost.save();

      // Lưu thông tin media vào bảng PostMedia
      const mediaIds = [];
      const saveMedia = async (files, type) => {
        for (const file of files) {
          const media = new Media({
            type: type,
            filePath: file.path,
          });
          await media.save();

          const postMedia = new PostMedia({
            Post: newPost._id,
            media: media._id,
            Community: isCommunityPost ? communityId : null,
          });
          await postMedia.save();

          mediaIds.push(media._id);
        }
      };

      // Lưu từng loại media nếu có
      await saveMedia(req.files?.image || [], 'image');
      await saveMedia(req.files?.video || [], 'video');

      // Cập nhật media vào post
      newPost.media = mediaIds;
      await newPost.save();

      return res.render('index');
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({
      error: 'An error occurred while creating the post',
      details: error.message,
    });
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
