const { getCommentLikeDetails } = require('../../lib/CommentLike');
const { default: mongoose } = require('mongoose');
const Comment = require('../../models/comment/comment');
const CommentLike = require('../../models/comment/commentlike');
const commentlike = require('../../models/comment/commentlike');

exports.getComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.userId;
    const comments = await Comment.aggregate([
      { $match: { post: new mongoose.Types.ObjectId(postId) } },
      // Sắp xếp bài viết theo thời gian tạo
      { $sort: { createdAt: -1 } },
    ])
    console.log(comments);
    // Sử dụng hàm commentsWithLikeDetails để lấy giá trị like cho từng comment
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
      return res.status(400).json({ message: 'No comment found' });
    }
    return res.status(200).json(commentsWithLikeDetails);
  } catch (error) {
    console.log('get comment error:', error);
    res.status(500).json({ message: "Error: " + error.message });
  }
}

exports.createComment = async (req, res) => {
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
    const newlikecomment = new commentlike({
      Comment: commentId,
      User: userId,
    });
    await newlikecomment.save();

    res.status(200).json({ message: 'like post success' });
  } catch (error) {
    console.log(error);
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
      await CommentLike.deleteOne({ _id: existinglikecomment._id });
      return res.status(200).json({ message: 'unlike comment success' });
    }

    return res.status(404).json({ message: 'Comment like not found' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error: " + error.message });
  }
}

