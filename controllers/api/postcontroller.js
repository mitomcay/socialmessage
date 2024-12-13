const { default: mongoose } = require('mongoose');
const Post = require('../../models/post/post');
const postlike = require('../../models/post/postlike');
const postmedia = require('../../models/post/postmedia');
const Friend = require('../../models/user/userfriends');
const { getBaseURL } = require('../../lib/BaseURL');
const { getPostLikeDetails } = require('../../lib/PostLikeLib');

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
      // Thêm lookup để kiểm tra xem người dùng đã like bài viết hay chưa 
      {
        $lookup: {
          from: "postlike", // Tên collection `postlike` 
          localField: "_id", // Trường `_id` trong bảng `post` 
          foreignField: "post", // Trường `post` trong bảng `postlike` 
          as: "likes",
        },
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

    // Sử dụng hàm getPostLikeDetails cho từng post 
    const postsWithLikeDetails = await Promise.all(
      mypost.map(async (post) => {
        const likeDetails = await getPostLikeDetails(post._id, userId);
        return {
          ...post,
          likeCount: likeDetails.likeCount,
          isLiked: likeDetails.isLiked,
        };
      })
    );
    if (postsWithLikeDetails.length === 0) {
      return res.status(400).json({ message: 'No post found' });
    }

    res.status(200).json(postsWithLikeDetails);
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
    const { postId } = req.params;
    const BaseURL = await getBaseURL(req);
    const userId = req.session.userId;
    const mypost = await Post.aggregate([
      // Lọc bài viết theo _id
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },

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
            $concat: [BaseURL, "$mediaDetails.filepath"],
          },
        },
      },

      // Thêm lookup để kiểm tra xem người dùng đã like bài viết hay chưa
      {
        $lookup: {
          from: "postlike", // Tên collection `postlike`
          localField: "_id", // Trường `_id` trong bảng `post`
          foreignField: "post", // Trường `post` trong bảng `postlike`
          as: "likes",
        },
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
    // Sử dụng hàm getPostLikeDetails cho từng post 
    const postsWithLikeDetails = await Promise.all(
      mypost.map(async (post) => {
        const likeDetails = await getPostLikeDetails(post._id, userId);
        return {
          ...post,
          likeCount: likeDetails.likeCount,
          isLiked: likeDetails.isLiked,
        };
      })
    );
    if (postsWithLikeDetails.length === 0) {
      return res.status(400).json({ message: 'No post found' });
    }

    res.status(200).json(postsWithLikeDetails[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};



exports.searchPost = async (req, res) => {
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
    const { query = "", page = 1, limit = 20 } = req.params;
    // Bước 4: Tạo pipeline để phân trang và sắp xếp theo thời gian
    const mypost = await Post.aggregate([
      // Lọc bài viết (ví dụ: lọc theo Author hoặc điều kiện khác)
      {
        $match: {
          Author: { $in: excludeIds },
          content: { $regex: query, $options: 'i' }
        }
      },

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

    // Sử dụng hàm getPostLikeDetails cho từng post 
    const postsWithLikeDetails = await Promise.all(
      mypost.map(async (post) => {
        const likeDetails = await getPostLikeDetails(post._id, userId);
        return {
          ...post,
          likeCount: likeDetails.likeCount,
          isLiked: likeDetails.isLiked,
        };
      })
    );
    if (postsWithLikeDetails.length === 0) {
      return res.status(400).json({ message: 'No post found' });
    }

    res.status(200).json(postsWithLikeDetails);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}

exports.getUserPost = async (req, res) => {
  try {
    const BaseURL = await getBaseURL(req);
    const { userId } = req.params;
    const mypost = await Post.aggregate([
      // Lọc bài viết theo _id
      { $match: { Author: new mongoose.Types.ObjectId(userId) } },

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
            $concat: [BaseURL, "$mediaDetails.filepath"],
          },
        },
      },

      // Thêm lookup để kiểm tra xem người dùng đã like bài viết hay chưa
      {
        $lookup: {
          from: "postlike", // Tên collection `postlike`
          localField: "_id", // Trường `_id` trong bảng `post`
          foreignField: "post", // Trường `post` trong bảng `postlike`
          as: "likes",
        },
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
    // Sử dụng hàm getPostLikeDetails cho từng post 
    const postsWithLikeDetails = await Promise.all(
      mypost.map(async (post) => {
        const likeDetails = await getPostLikeDetails(post._id, userId);
        return {
          ...post,
          likeCount: likeDetails.likeCount,
          isLiked: likeDetails.isLiked,
        };
      })
    );
    if (postsWithLikeDetails.length === 0) {
      return res.status(400).json({ message: 'No post found' });
    }

    res.status(200).json(postsWithLikeDetails);
  } catch (error) {
    console.error(error);
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
    const { postId } = req.params;

    // Check if the post is already liked by the user
    const existinglikepost = await postlike.findOne({
      post: postId,
      User: userId,
    });

    if (existinglikepost) {
      // If it is already liked, remove the like
      await existinglikepost.remove();
      return res.status(200).json({ message: 'unlike post success' });
    }

    // If it is not liked yet, add a new like
    const newlikepost = new postlike({
      post: postId,
      User: userId,
    });
    await newlikepost.save();

    res.status(200).json({ message: 'like post success' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};


exports.unlikepost = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { postId } = req.params;
    const existinglikepost = await postlike.findOne({
      post: postId,
      User: userId,
    })
    if (existinglikepost) {
      // chay ham xoa like
      await postlike.deleteOne({ _id: existinglikepost._id });
      res.status(200).json({ message: 'unlike post success' });
    } else {
      res.status(404).json({ message: 'You have not liked this article yet.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}
