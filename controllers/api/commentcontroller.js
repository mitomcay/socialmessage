const { getCommentLikeDetails } = require('../../lib/CommentLike');
const Comment = require('../../models/comment/comment');
const CommentLike = require('../../models/comment/commentlike')

exports.getComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.userId;
    const comments = Comment.aggregate([
      { $match: { post: new mongoose.Types.ObjectId(postId) } },
      // Sắp xếp bài viết theo thời gian tạo
      { $sort: { createdAt: -1 } },
    ])
    // Sử dụng hàm getPostLikeDetails cho từng post 
    const commentsWithLikeDetails = await Promise.all(
      comments.map(async (comment) => {
        const likeDetails = await getCommentLikeDetails(comment._id, userId);
        return {
          ...comment,
          likeCount: likeDetails.likeCount,
          isLiked: likeDetails.isLiked,
        };
      })
    );
    if (commentsWithLikeDetails.length === 0) {
      return res.status(400).json({ message: 'No post found' });
    }
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
}

exports.pustComment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { postId, content } = req.body;

    const newComment = new Comment({
      Author: userId,
      post: postId,
      content: content
    });

    await newComment.save();
    return res.status(200).json({ message: 'Comment success' });

  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
}

exports.likeComment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { commentId } = req.params;
    // Check if the post is already liked by the user
    const existinglikecomment = await CommentLike.findOne({
      Comment: commentId,
      User: userId,
    });

    if (existinglikecomment) {
      // If it is already liked, remove the like
      await existinglikecomment.remove();
    }

    // If it is not liked yet, add a new like
    const newlikepost = new postlike({
      post: postId,
      User: userId,
    });
    await newlikepost.save();

    res.status(200).json({ message: 'like post success' });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
}

exports.unLikeComment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { commentId } = req.params;
    // Check if the post is already liked by the user
    const existinglikecomment = await CommentLike.findOne({
      Comment: commentId,
      User: userId,
    });

    if (existinglikecomment) {
      // If it is already liked, remove the like
      await existinglikecomment.remove();
      res.status(200).json({ message: 'unlike comment success' });
    }

    res.status(404).json({ message: 'Comment like not found' });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
}

