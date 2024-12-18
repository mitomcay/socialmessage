const message = require('../../models/message/message');
const messagemedia = require('../../models/message/messagemedia');
const messagelike = require('../../models/message/messagelike');
const media = require('../../models/media/media');
const chatmember = require('../../models/chat/chatmember');
const chat = require('../../models/chat/chat');




exports.sendMessage = async (req, res) => {
  try {
    const { content, chatId, repliedMessageId, mediaIds } = req.body;
    const senderId = req.session.userId;

    if (content.length > 500) {
      return res.status(400).json({ message: "Tin nhắn vượt quá giới hạn ký tự, vui lòng rút ngắn tin nhắn" });
    }

    if (content.length <= 0) {
      return res.status(400).json({ message: "Bạn chưa nhập nội dung tin nhắn" });
    }

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

    const foundChat = await chat.findById(chatId);
    if (!foundChat) {
      return res.status(400).json({
        message: 'Group not found'
      });
    }
    // Gửi tin nhắn mới đến tất cả các client trong chat
    const io = req.app.get('socketio');
    io.to(chatId).emit('newMessage', newMessage); // Phát sự kiện mới cho tất cả các client trong chat

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.getMessage = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { chatId } = req.body;

    // Tìm chat
    const findchat = await chat.findById(chatId);
    if (!findchat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Lấy thông tin đoạn chat, thành viên, tin nhắn mới nhất, và trạng thái đã đọc
    const chats = await chat.aggregate([
      // Lấy thông tin đoạn chat nằm trong chatIds
      { $match: { _id: findchat._id } },

      // Liên kết với bảng ChatMember để lấy thông tin thành viên
      {
        $lookup: {
          from: 'chatmembers', // Đảm bảo đúng tên collection
          localField: '_id',
          foreignField: 'Chat',
          as: 'members',
        },
      },

      // Dự án chỉ những trường cần thiết và lấy userId trong member
      {
        $project: {
          _id: 1,
          Chatpicture: 1,
          name: 1,
          createdAt: 1,
          updatedAt: 1,
          Isgroup: 1,
          members: {
            $map: {
              input: '$members',
              as: 'member',
              in: '$$member.User'
            },
          },
          readBy: 1,
        },
      },
    ]);

    // Gán tin nhắn vào chat 
    const chatWithMessages = await Promise.all(chats.map(async chat => { 
      const messages = await getMessages(chat._id); 
      return { ...chat, messages }; 
    }));

    return res.status(200)(chatWithMessages);
    
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

exports.deletemessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    const userid = req.session.userId;

    const usermessage = await message.findone(messageId);
    if (usermessage.senderId !== userid) {
      return res.status(400).json({ message: 'khong the xoa tin nhan cua nguoi khac' });
    }
    await message.Delete(usermessage);
    await message.save();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
