const Post = require('../models/post/post');
const postlike = require('../models/post/postlike');


exports.getpost = async (req,res) => {
  try {
    const userId = req.session.userId;
    const mypost = await Post.findOne({
      Author: userId,
    });

    if(!mypost) {
      res.status(400).json({ message: 'No post found'});
    }

    res.status(200).json({ message: 'List your post', post: mypost});
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.pushpost = async (req,res) => {
  try {
    const userId = req.session.userId;

    const{ content } = req.body;
    const IsCommunityPost = req.params.IsCommunityPost;

    const newpost = new Post({
      Author: userId,
      content: content,
      IsCommunityPost: IsCommunityPost,
    });

    await newpost.save();
    res.status(200).json({ message: 'post success'});
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
    })
    if (existinglikepost){
      // chay ham xoa like
      await postlike.Delete(existinglikepost);
    }

    const newlikepost = new postlike({
      post: postId,
      User: userId,      
    });
    await newlikepost.save();

    res.status(200).json({ message: 'like post success'});
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};  
