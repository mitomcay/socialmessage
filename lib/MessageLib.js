const mongoose = require('mongoose');
const message = require('../models/message/message');
const messagemedia = require('../models/message/messagemedia');

const getMessages = async (chatId) => {
    try {
        const messages = await message.find({ chat: chatId }).sort({ createdAt: -1 });
        // Sử dụng hàm getPostLikeDetails cho từng post 
        const messagesWithMedia = await Promise.all(
            messages.map(async (message) => {
                const medias = await getMessageMedia(message._id);
                return {
                    ...message,
                    medias: medias
                };
            })
        );

        return messagesWithMedia;
    } catch (error) {
        console.error('Error in getMessages:', error);
        throw error;
    }
};

const getMessageMedia = async (messageId) => {
    try {
        const media = await messagemedia.find({ message: messageId }).map(item => item.media);
        return media;
    } catch (error) {
        console.error('Error in getMessages:', error);
        throw error;
    }
}

module.exports = {
    getMessages
};
