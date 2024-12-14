const Comment = require('../../models/comment/comment');
const commentlike = require('../../models/comment/commentlike');
const Commentlike = require('../../models/comment/commentlike')
const User = require('../../models/user/users');
const { post } = require('../../routes/web/comment');

exports.getComment = async(req, res) => {
  try{
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const postId = req.params.postId; // Lấy từ query thay vì body
    if (!postId) {
        return res.status(400).json({ error: 'postId is required' });
    }

    const comments = await Comment.find({ post: postId })
    .populate('Author', 'username') // Lấy thông tin tác giả
    .exec();

    res.status(200).json({ comments });
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
  }

}

exports.postComment = async(req, res) => {
  try{
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const postId = req.body.postId;
    if (!postId) {
        return res.status(400).json({ error: 'postId is required' });
    }

    const RepliedCommentNavigation = null ;

    const content = req.body.comment;
    if (!content) {
      return res.status(400).json({ error: 'postId is required' });
    }

    const comments = new Comment({
      content: content,
      post: postId,
      Author: userId,
      RepliedCommentNavigation: RepliedCommentNavigation ? null : RepliedCommentNavigation,
    });

    await comments.save();
    return res.status(200).json({ message: 'Comment added!' });
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}


exports.likeComment = async (req, res) => {
    try {
        const userId = req.session.userId;
        const commentId = req.params.commentId;

        if (!commentId) {
            return res.status(400).json({ error: 'commentId is required' });
        }

        // Logic để like comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Giả sử bạn có trường likes là array chứa userId
        const newcommentlike = new Commentlike({
          Comment: comment,
          User: userId,
        })

        await newcommentlike.save();
        res.status(200).json({ message: 'Comment liked', likes: comment.likes });
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
