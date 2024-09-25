const message = require('../models/message/message');
const messagemedia = require('../models/message/messagemedia');
const messagelike = require('../models/message/messagelike');
const media = require('../models/media/media');
const chatmember = require('../models/chat/chatmember');

exports.sendMessage = async (req, res) => {
  try {
    const { content, chatId, repliedMessageId, mediaIds } = req.body;
    const senderId = req.session.userId;

    // Create the message
    const newMessage = await message.create({
        content,
        senderId,
        chat: chatId,
        repliedmessage: repliedMessageId || null,
    });

    // If there is media attached, create messagemedia entries
    if (mediaIds && mediaIds.length > 0) {
        const mediaEntries = await Promise.all(mediaIds.map(async (mediaId) => {
            return await messagemedia.create({
                Chat: chatId,
                media: mediaId,
                message: newMessage._id
            });
        }));
    }

    res.status(201).json({ 
      message: 'Message sent successfully',
      data: newMessage 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessage = async (req, res) => {
  try {
    const user1 = req.session.userId;
    const { user2, chatId } = req.body;

    // Find all messages in the specified chat between user1 and user2
    const messages = await message.find({
        chat: chatId,
        $or: [
            { senderId: user1 },
            { senderId: user2 }
        ]
    }).populate('repliedmessage');

    res.status(200).json({ message: "Success", data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likeMessage = async (req, res) => {
    try {
        const { messageId } = req.body;
        const userId = req.session.userId;

        // Find the chat member
        const chatMember = await chatmember.findOne({ User: userId });

        if (!chatMember) {
            return res.status(404).json({ message: 'Chat member not found' });
        }

        // Create a like for the message
        const like = await messagelike.create({
            message: messageId,
            chatmember: chatMember._id,
        });

        res.status(201).json({ message: 'Message liked successfully', data: like });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
