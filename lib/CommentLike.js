const mongoose = require('mongoose');
const CommentLike = require('../models/comment/commentlike')

const getCommentLikeDetails = async (commentId, userId) => {
    try {
        const likeCount = await CommentLike.countDocuments({ Comment: new mongoose.Types.ObjectId(commentId) });

        const isLiked = await CommentLike.exists({
            Comment: new mongoose.Types.ObjectId(commentId),
            User: new mongoose.Types.ObjectId(userId)
        });

        return {
            likeCount,
            isLiked: !!isLiked // Chuyển đổi thành boolean
        };
    } catch (error) {
        console.error('Error in getCommentLikeDetails:', error);
        throw error;
    }
};

module.exports = {
    getCommentLikeDetails
};
