const mongoose = require('mongoose');
const message = require('../models/message/message');

const getLastedMessage = async (chatId) => {
    try {
        const latestMessage = await message.findOne({ chat: chatId }).sort({ createdAt: -1});
        return latestMessage;
    } catch (error) {
        console.error('Error in getLastedMessage:', error);
        throw error;
    }
};

module.exports = {
    getLastedMessage
};
