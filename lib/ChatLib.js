const mongoose = require('mongoose');
const message = require('../models/message/message');
const messagemedia = require('../models/message/messagemedia');

const getLastedMessage = async (chatId) => {
    try {
        const latestMessage = await message.findOne({ chat: chatId }).sort({ createdAt: -1});
        return latestMessage;
    } catch (error) {
        console.error('Error in getLastedMessage:', error);
        throw error;
    }
};

const getChatMedia = async (Chat) => {
    try {
        const media = await messagemedia.find({ Chat: Chat });
        return media;
    } catch (error) {
        console.error('Error in getMessages:', error);
        throw error;
    }
}

module.exports = {
    getLastedMessage
};
