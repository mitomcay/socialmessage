const chat = require('../../models/chat/chat');
const chatmember = require('../../models/chat/chatmember');
const User = require('../../models/user/users');
const { getLastedMessage } = require('../../lib/ChatLib');

exports.getChat = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Lấy danh sách các đoạn chat mà người dùng tham gia
    const chatMembers = await chatmember.find({ User: userId });

    // Kiểm tra xem chatMembers có phải là một mảng không
    if (!Array.isArray(chatMembers)) {
      return res.status(500).json({ message: 'Server error: chatMembers is not an array.' });
    }

    // Tách lấy phần ID đoạn chat
    const chatIds = chatMembers.map(chatmember => chatmember.Chat);

    // Lấy thông tin đoạn chat, thành viên, tin nhắn mới nhất, và trạng thái đã đọc
    const chats = await chat.aggregate([
      // Lấy thông tin đoạn chat nằm trong chatIds
      { $match: { _id: { $in: chatIds } } },

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

    // Kết hợp thông tin đoạn chat với tin nhắn mới nhất 
    if (!chats || chats.length === 0) {
      return res.status(400).json({ message: 'No chat found' });
    }
    // Sử dụng hàm getLastedMessage để lấy tin nhắn mới nhất
    const chatWithLastedMsg = await Promise.all(
      chats.map(async (chat) => {
        const lastmsg = await getLastedMessage(chat._id);
        return {
          ...chat,
          latestMessage: lastmsg,
        }
      })
    );

    // Sắp xếp các đoạn chat theo latestMessage.createdAt 
    chatWithLastedMsg.sort((a, b) => {
      if (a.latestMessage && b.latestMessage) {
        return new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt);
      }
      return 0;
    });
    res.status(200).json(chatWithLastedMsg);
  } catch (error) {
    console.log('get chat error:', error);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.read = async (req, res) => {
  try {

  } catch (error) {
    console.log('read message error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
/*
app.put('/messages/:id/read', async (req, res) => {
  try {
    const { userId } = req.body;  // Lấy userId từ body request
    const messageId = req.params.id;
    await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } });  // Thêm userId vào mảng readBy nếu chưa có
    res.status(200).send({ message: 'Message marked as read.' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to update message status.' });
  }
});
*/

exports.createGroupChat = async (req, res) => {

};

exports.addMember = async (req, res) => {

};

exports.removeMember = async (req, res) => {

};

exports.changeNameGroup = async (req, res) => {

};

exports.createChat = async (req, res) => {
  try {
    const { name, members } = req.body;
    // members is an array of objects { userId, role }

    const creatorId = req.session.userId;

    // Create the chat
    const newChat = await chat.create({ name });

    const creatorChatMember = await chatmember.create({
      User: creatorId,
      Chat: newChat._id,
      chatmembertype: 'Admin',
      Isgroup: true,
      // Creator is Admin by default
    });

    // Iterate over each member and create chatmember entries
    const chatMembers = await Promise.all(members.map(async (member) => {
      const newChatMember = await chatmember.create({
        User: member.userId,
        Chat: newChat._id,
        chatmembertype: member.role || 'Member'  // Default role is 'Member'
      });
      return newChatMember;
    }));

    res.status(201).json({
      message: 'Chat created successfully',
      chat: newChat,
      creator: creatorChatMember,
      members: chatMembers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changeMemberRole = async (req, res) => {
  try {
    const { chatId, memberId, newRole } = req.body;
    const adminId = req.session.userId;

    // Check if the requester is an Admin
    const adminMember = await chatmember.findOne({
      User: adminId,
      Chat: chatId,
      chatmembertype: 'Admin'
    });

    if (!adminMember) {
      return res.status(403).json({ message: 'Only admins can change member roles.' });
    }

    // Find the chat member whose role needs to be updated
    const memberToUpdate = await chatmember.findOne({
      User: memberId,
      Chat: chatId
    });

    if (!memberToUpdate) {
      return res.status(404).json({ message: 'Member not found in the chat.' });
    }

    // Update the role
    memberToUpdate.chatmembertype = newRole;
    await memberToUpdate.save();

    res.status(200).json({ message: 'Member role updated successfully', member: memberToUpdate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const { chatId } = req.body;

    // Find all chat members for the given chat ID
    const chatMembers = await chatmember.find({ Chat: chatId })
      .populate('User', 'username email')  // Populate user details (e.g., username, email)
      .select('User chatmembertype');  // Select the necessary fields

    if (!chatMembers || chatMembers.length === 0) {
      return res.status(404).json({ message: "No members found for this chat" });
    }

    res.status(200).json({
      message: 'Members retrieved successfully',
      members: chatMembers
    });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};
