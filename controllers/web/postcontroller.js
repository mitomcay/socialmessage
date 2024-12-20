const { urlencoded } = require('express');
const Post = require('../../models/post/post');
const postlike = require('../../models/post/postlike');
const postmedia = require('../../models/post/postmedia');
const Media = require('../../models/media/media'); // Assuming you have this model for media files
const path = require('path'); 
const { post } = require('../../routes/web/post');

exports.getallpost = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Lấy tất cả bài viết cùng tác giả và cộng đồng
    const mypost = await Post.find()
      .populate('Author', 'username') // Lấy thông tin tác giả
      .populate('Community', 'name') // Lấy thông tin cộng đồng (chỉ tên)
      .exec();

    //console.log('Posts:', mypost); // In ra danh sách bài viết

    if (!mypost || mypost.length === 0) {
      return res.status(400).json({ message: 'No post found' });
    }

    let postsWithMedia = [];

    for (let post of mypost) {
      // Lấy tất cả media liên quan đến bài viết
      const postMedia = await postmedia.find({
        Post: post._id
      }).populate('media', 'filename filepath MediaType').exec();

      //console.log('Post Media:', postMedia); // In ra thông tin media của bài viết

      let media = [];
      postMedia.forEach(postMediaItem => {
        media.push({
          filename: postMediaItem.media.filename,
          filepath: postMediaItem.media.filepath.replace(/\\/g, '/'), // Fix đường dẫn
          MediaType: postMediaItem.media.MediaType
        });
      });
      
      // Thêm thông tin bài viết, media và cộng đồng
      postsWithMedia.push({
        post: post,
        media: media,
      });
      //console.log(postsWithMedia);
    }

    return res.status(200).json({ message: 'List your post', posts: postsWithMedia });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Internal Server Error', error });
  }
};

exports.getmypost = async (req, res) => {
  try {
    const userId = req.session.userId;
    const mypost = await Post.find({ Author: userId })
    .populate('Author', 'username') // Lấy thông tin tác giả
    .exec(); 

    if (!mypost || mypost.length === 0) {
      return res.status(400).json({ message: 'No post found' });
    }
    
    let postsWithMedia = [];

    for (let post of mypost) {
      const postMedia = await postmedia.find({
        Post: post._id
      }).populate('media', 'filename filepath MediaType').exec();

      let media = [];
      postMedia.forEach(postMediaItem => {
        media.push({
          filename: postMediaItem.media.filename,
          filepath: postMediaItem.media.filepath.replace(/\\/g, '/'), // Fix path separator
          MediaType: postMediaItem.media.MediaType
        });
      });

      postsWithMedia.push({
        post: post,
        media: media
      });
      //console.log(post);
    }

    return res.status(200).json({ message: 'List your post', posts: postsWithMedia });
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


exports.pushpost = async (req, res) => {
  try {
    const userId = req.session.userId; // Lấy ID người dùng từ session
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }

    const { content } = req.body;
    const community = req.body.community.trim();

    let { mediaIds } = req.body;
    //console.log(content, community);

    // Tạo bài post mới
    const newPost = new Post({
      Author: userId,
      Community: community,
      content: content,
      IsCommunityPost: community != null ? true : false,
    });

    await newPost.save();

    if (Array.isArray(mediaIds)) {
    
      mediaIds.forEach(mediaId => {
      const newPostMedia = new postmedia({
        Post: newPost._id,  // Liên kết với bài đăng
        media: mediaId,  // Liên kết với media
        Community: community,
      });
  
      newPostMedia.save();
    });
    } else {
        console.log('No media files to process.');
    }

    return res.status(200).json({
      message: 'Post created successfully',
    });

  } catch (error) {
    console.error('Error creating post:', error);
  }
};

exports.getlikepost = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { postId } = req.body;
    
    // Check if the user has already liked the post
    const existinglikepost = await postlike.findOne({
      post: postId,
      User: userId,
    });

    if (existinglikepost) {
      return res.status(200).json({ isLiked: true });
    }


    return res.status(200).json({ isLiked: false });
  } catch (error) {
    console.log(error);
    return res.status(500).send('Internal Server Error');
  }
};

exports.likepost = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { postId } = req.body;
    
    // Check if the user has already liked the post
    const existinglikepost = await postlike.findOne({
      post: postId,
      User: userId,
    });

    if (existinglikepost) {
      // Remove like if it already exists
      await postlike.deleteOne(existinglikepost);
      return res.status(200).json({ message: 'You disliked the post successfully', isLiked: false });
    }

    // Add a new like to the post if not already liked
    const newlikepost = new postlike({
      post: postId,
      User: userId,
    });
    await newlikepost.save();

    return res.status(200).json({ message: 'You liked the post successfully', isLiked: true });
  } catch (error) {
    console.log(error);
    return res.status(500).send('Internal Server Error');
  }
};

exports.searchpost = async (req, res) => {
  try{
    const { query } = req.query;
    //console.log(query);

    const findpost = await Post.find({ content: { $regex: query, $options: 'i' }})
    .populate('Author','username')
    .populate('Community','name')
    .exec();

    if (findpost.length === 0) {
      return res.status(404).json({ message: 'No posts found', posts: [] });
    }
    //console.log(findpost);
    
    return res.status(200).json({message:'sucess', posts: findpost});
  }catch(error){
    console.log(error);
    return res.status(500).send('Internal Server Error');
  }
 
}