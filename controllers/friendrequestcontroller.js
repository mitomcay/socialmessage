const bcrypt = require('bcrypt');
const User = require('../models/users');
const FriendRequest = require('../models/friendrequest');
const Friend = require('../models/friends'); // Correct capitalization

exports.listfriend = async (req, res) => {
    try {
        const userId = req.session.userId;
        console.log(userId);
        // Find the user by their ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find all friend requests where the user is either the sender or the receiver
        const friends = await Friend.find({
            $or: [{ user: userId }, { friend: userId }],
            status: 'pending'
        }).populate('user friend', 'username email'); // Sử dụng populate để lấy thông tin người dùng

        // Render trang danh sách bạn bè
        res.render('friend', { title: 'List of Friends', friends: friends, loggedInUserId: userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addfriend = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        console.log(senderId,receiverId);

        if (senderId === receiverId) {
            return res.status(400).json({ message: 'Cannot send a friend request to yourself' });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Sender or receiver not found' });
        }

        const existingRequest = await Friend.findOne({
            user: senderId,
            friend: receiverId
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already exists' });
        }

        const newFriendRequest = new Friend({ user: senderId, friend: receiverId, status: 'pending' });
        await newFriendRequest.save();

        res.status(200).json({ message: 'requested' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.acceptfriend = async (req, res) => {
    try {
        const { requestId } = req.body; // Lấy requestId từ body

        // Tìm yêu cầu kết bạn theo requestId
        const friendRequest = await Friend.findById(requestId);

        if (!friendRequest || friendRequest.status !== 'pending') {
            return res.status(404).json({ message: 'Friend request not found or already processed' });
        }

        const { user: senderId, friend: receiverId } = friendRequest;

        // Tìm người gửi và người nhận
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Sender or receiver not found' });
        }

        // Thêm người vào danh sách bạn bè của nhau
        if (!sender.friends.includes(receiverId)) {
            sender.friends.push(receiverId);
        }
        if (!receiver.friends.includes(senderId)) {
            receiver.friends.push(senderId);
        }

        await sender.save();
        await receiver.save();

        // Cập nhật trạng thái của yêu cầu kết bạn
        friendRequest.status = 'accepted';
        await friendRequest.save();

        // Trả về thông báo và URL để chuyển hướng
        res.status(200).json({ message: 'Friend request accepted successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeFriend = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        // Xóa yêu cầu kết bạn từ cơ sở dữ liệu
        await Friend.deleteOne({
            $or: [
                { user: senderId, friend: receiverId },
                { user: receiverId, friend: senderId }
            ],
            status: 'accepted'
        });

        res.status(200).json({ message: 'Friend removed successfully', redirectUrl: '/user/management' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
