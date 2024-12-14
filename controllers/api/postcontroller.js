const { default: mongoose } = require('mongoose');
const Post = require('../../models/post/post');
const postlike = require('../../models/post/postlike');
const postmedia = require('../../models/post/postmedia');
const Friend = require('../../models/user/userfriends');
const { getBaseURL } = require('../../lib/BaseURL');

exports.getNewPost = async (req, res) => {
  try {
    const BaseURL = await getBaseURL(req);
    const userId = req.session.userId;
    // Bước 1: Lấy danh sách bạn bè của userId
    const listFriends = await Friend.find({ $or: [{ User1: userId }, { User2: userId }] });

    // Bước 2: Tạo mảng chứa User2 của các tài liệu trong listFriends
    const excludeIds = listFriends.map(friend =>
      friend.User1 === userId ? friend.User2 : friend.User1
    );

    // Bước 3: Lấy trang và giới hạn từ query
    const { page = 1, limit = 20 } = req.params;
    console.log(excludeIds)
    // Bước 4: Tạo pipeline để phân trang và sắp xếp theo thời gian
    const mypost = await Post.aggregate([
      // Lọc bài viết (ví dụ: lọc theo Author hoặc điều kiện khác)
      { $match: { Author: { $in: excludeIds } } },

      // Sắp xếp bài viết theo thời gian tạo
      { $sort: { CreatedAt: -1 } },

      // Phân trang
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
      // Kết nối với bảng postmedia để tìm media liên quan
      {
        $lookup: {
          from: "postmedias", // Tên collection `postmedia`
          localField: "_id", // Trường `_id` trong bảng `post`
          foreignField: "Post", // Trường `Post` trong bảng `postmedia`
          as: "postMedia", // Tên field mới chứa dữ liệu liên kết
        },
      },

      // Unwind để trải postMedia thành các đối tượng riêng biệt
      { $unwind: "$postMedia" },
      // Kết nối từ postMedia sang bảng media để lấy chi tiết media
      {
        $lookup: {
          from: "media", // Tên collection `media`
          localField: "postMedia.media", // Trường `media` trong `postmedia`
          foreignField: "_id", // Trường `_id` trong `media`
          as: "mediaDetails", // Tên field mới chứa chi tiết media
        },
      },
      // Unwind để trải mediaDetails thành các đối tượng riêng biệt
      { $unwind: "$mediaDetails" },
      // Thêm chuỗi 'http://123.com/' vào trước filepath
      {
        $addFields: {
          "mediaDetails.filepath": {
            $concat: [BaseURL, "$mediaDetails.filepath"]
          }
        }
      },
      // Tùy chọn: Chỉ giữ lại các trường cần thiết
      {
        $project: {
          _id: 1,
          Author: 1,
          content: 1,
          CreatedAt: 1,
          IsCommunityPost: 1,
          mediaDetails: 1, // Chi tiết media được kết nối
        },
      },
    ]);

    console.log(mypost);

    if (mypost.length === 0) {
      return res.status(400).json({ message: 'No post found' });
    }

    res.status(200).json({ post: mypost });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
/*
exports.getNewPost = async (req, res) => {
  try {
    const userId = req.session.userId;
    // Bước 1: Lấy danh sách bạn bè của userId
    const listFriends = await Friend.find({ $or: [{ User1: userId }, { User2: userId }] });
    // Bước 2: Tạo mảng chứa User2 của các tài liệu trong listFriends
    const excludeIds = listFriends.filter(friend =>
      friend.User1.toString() === userId.toString() ? friend.User2 : friend.User1
    ).map(friend => friend.id);

    const mypost = await Post.aggregate({
      $match: {
        Author: { $in: excludeIds}
      },
      $sample: { size: 20 }, // giới hạn số lượng
    });
    if (!mypost) {
      res.status(400).json({ message: 'No post found' });
    }

    res.status(200).json({ message: 'List your post', post: mypost });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
*/


exports.getpost = async (req, res) => {
  try {
    const userId = req.session.userId;
    const mypost = await Post.findOne({
      Author: userId,
    });

    if (!mypost) {
      res.status(400).json({ message: 'No post found' });
    }

    res.status(200).json({ message: 'List your post', post: mypost });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.getUserPost = async (req, res) => {
  try {
    const { UserId } = req.params.userId;
    const userPost = await Post.findOne({
      Author: userId,
    });

    if (!userPost) {
      res.status(400).json({ message: 'No post found' });
    }

    res.status(200).json({ message: 'List your post', post: userPost });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};


exports.pushpost = async (req, res) => {
  try {
    const userId = req.session.userId;

    const { content, mediaIds, communityId, IsCommunityPost } = req.body;
    // Kiểm tra nếu là bài viết vào cộng đồng
    if (IsCommunityPost) {
      if (!communityId) {
        return res.status(400).json({ message: 'Community ID is required for community posts.' });
      }

      const newPost = new Post({
        Author: userId,
        content: content,
        IsCommunityPost: IsCommunityPost,
        Community: communityId // Thêm cộng đồng khi bài là post cộng đồng
      });

      if (mediaIds && mediaIds.length > 0) {
        await Promise.all(mediaIds.map(async (mediaId) => {
          return await postmedia.create({
            Community: communityId,
            media: mediaId,
            Post: newPost._id
          });
        }));
      }
      await newPost.save();
      return res.status(200).json({ message: 'Community post success' });
    }

    // Nếu không phải post cộng đồng
    const newPost = new Post({
      Author: userId,
      content: content,
      IsCommunityPost: IsCommunityPost
    });

    if (mediaIds && mediaIds.length > 0) {
      await Promise.all(mediaIds.map(async (mediaId) => {
        return await postmedia.create({
          media: mediaId,
          Post: newPost._id
        });
      }));
    }

    await newPost.save();
    return res.status(200).json({ message: 'Personal post success' });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.likepost = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { postId } = req.body;
    const existinglikepost = await postlike.findOne({
      post: postId,
      User: userId,
    })
    if (existinglikepost) {
      // chay ham xoa like
      await postlike.Delete(existinglikepost);
    }

    const newlikepost = new postlike({
      post: postId,
      User: userId,
    });
    await newlikepost.save();

    res.status(200).json({ message: 'like post success' });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};  
