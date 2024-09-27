const message = require('../models/message/message');
const messagemedia = require('../models/message/messagemedia');
const messagelike = require('../models/message/messagelike');
const media = require('../models/media/media');
const chatmember = require('../models/chat/chatmember');
const chat = require('../models/chat/chat');

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
      await Promise.all(mediaIds.map(async (mediaId) => {
        return await messagemedia.create({
          Chat: chatId,
          media: mediaId,
          message: newMessage._id
        });
      }));
    }

    // Gửi tin nhắn mới đến tất cả các client trong chat
    const io = req.app.get('socketio');
    io.to(chatId).emit('newMessage', newMessage); // Phát sự kiện mới cho tất cả các client trong chat

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
    const { chatId } = req.body;

    // Tìm chat
    const findchat = await chat.findById(chatId);
    if (!findchat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Lấy danh sách các thành viên trong chat
    const chatMembers = await chatmember.find({ Chat: chatId }).select('User'); 
    const memberIds = chatMembers.map(member => member.User);

    // Lấy 20 tin nhắn gần nhất của mỗi thành viên
    const messagePromises = memberIds.map(async (memberId) => {
      return await message.find({
        chat: chatId,
        senderId: memberId
      })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian (tin mới nhất trước)
      // .limit(20) // Giới hạn số lượng tin nhắn mỗi thành viên là 20
      .populate('repliedmessage'); // Populate nếu cần thiết
    });

    // Chờ tất cả các lời hứa (promise) hoàn thành
    const messages = await Promise.all(messagePromises);

    // Gộp tất cả các tin nhắn vào một mảng
    const allMessages = messages.flat(); // Gộp mảng 2D thành 1D

    // Sắp xếp lại theo thời gian (nếu cần), từ tin nhắn cũ đến mới
    const sortedMessages = allMessages.sort((a, b) => a.createdAt - b.createdAt);

    res.status(200).json({
      message: "Success",
      data: sortedMessages
    });
  } catch (error) {
    res.status(500).json({ message: "loi" + error.message });
  }
};

exports.likeMessage = async (req, res) => {
  try {
      const { messageId } = req.body;
      const userId = req.session.userId;
      const io = req.app.get('socketio'); 

      // Tìm chat member
      const chatMember = await chatmember.findOne({ User: userId });
      if (!chatMember) {
          return res.status(404).json({ message: 'Chat member not found' });
      }

      // Tạo like cho tin nhắn
      const like = await messagelike.create({
          message: messageId,
          chatmember: chatMember._id,
      });

      // Phát sự kiện messageLiked đến phòng chat
      io.to(chatMember.Chat).emit('messageLiked', { messageId, userId });

      res.status(201).json({ message: 'Message liked successfully', data: like });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
