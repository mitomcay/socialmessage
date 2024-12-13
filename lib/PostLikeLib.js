const mongoose = require('mongoose');
const PostLike = require('../models/post/postlike'); // Ensure this path is correct

const getPostLikeDetails = async (postId, userId) => {
    try {
        const likeCount = await PostLike.countDocuments({ post: new mongoose.Types.ObjectId(postId) });

        const isLiked = await PostLike.exists({
            post: new mongoose.Types.ObjectId(postId),
            User: new mongoose.Types.ObjectId(userId)
        });

        return {
            likeCount,
            isLiked: !!isLiked // Chuyển đổi thành boolean
        };
    } catch (error) {
        console.error('Error in getPostLikeDetails:', error);
        throw error;
    }
};

module.exports = {
    getPostLikeDetails
};
