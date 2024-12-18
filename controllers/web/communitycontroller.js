const community = require("../../models/community/community");
const communitymember = require("../../models/community/communitymember");
const post = require('../../models/post/post');

exports.createcomunity = async (req, res) => {
  try {
    const { name, description, Isprivate } = req.body;
    const creatorId = req.session.userId; 

    const isPrivate = Isprivate === 'true'; 

    // Tạo cộng đồng mới
    const newcommunity = await community.create({ 
      name, description, Isprivate: isPrivate 
    });
    await newcommunity.save();

    // Tạo thành viên người tạo vào cộng đồng, người tạo là Admin
    const communityMember = await communitymember.create({
      User: creatorId,
      Community: newcommunity._id,
      CommunityMemberType: 'Admin'  // Người tạo cộng đồng mặc định là Admin
    });
    await communityMember.save();

    // Trả về kết quả
    res.status(201).redirect('/community/page');

  } catch (error) {
    res.status(500).json({ message: error });
  }
};


exports.getcommunity = async (req, res) => {
  try {
      const userId = req.session.userId;

      // Find the chat member for the current user
      const communityMember = await communitymember.find({ User: userId });
      
      if (!communityMember) {
        return res.status(200).json({ message: "No community member found", community: null});
      }

      // Find the chat by the chat ID in chatmember
      const foundcomunity = await community.find({ community: communityMember.Community});

      if (!foundcomunity) {
        return res.status(200).json({ message: "No community found", community: null });
      }

      // Send success response with chat name
      return res.status(200).json({ message: "Success", community: foundcomunity});

  } catch (error) {
      res.status(500).json({ message: "Error: " + error.message });
  }
};

exports.getcommunitypagemanager = async (req, res) => {
  try {
      const userId = req.session.userId;

      // Tìm thành viên cộng đồng cho người dùng hiện tại
      const communityMember = await communitymember.find({ User: userId });
      
      if (!communityMember) {
        return res.status(200).render('community', { community: null });
      }

      // Tìm cộng đồng dựa trên ID cộng đồng trong communityMember
      const foundCommunity = await community.find({ community: communityMember.Community});

      if (!foundCommunity) {
        return res.status(200).render('community', { community: null });
      }

      // Trả về trang render với dữ liệu cộng đồng
      return res.status(200).render('community', { community: foundCommunity });

  } catch (error) {
      res.status(500).json({ message: "Error: " + error.message });
  }
};

exports.joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.body;
    const userId = req.session.userId;

    // Kiểm tra nếu người dùng đã là thành viên
    const existingMember = await communitymember.findOne({
      User: userId,
      Community: communityId
    });

    if (existingMember) {
      return res.status(200).json({ message: "You are already a member of this community." });
    }

    // Tạo yêu cầu gia nhập cộng đồng
    const newCommunityMember = await communitymember.create({
      User: userId,
      Community: communityId,
      CommunityMemberType: 'Member'  // Người gia nhập là thành viên mặc định
    });

    res.status(200).json({ message: "Join request sent successfully", member: newCommunityMember });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};


exports.getMemberofCommunity = async (req, res) => {
  try {
    const { CommunityId } = req.body;

    // Find all chat members for the given chat ID
    const communityMembers = await communitymember.find({ Community: CommunityId })
      .populate('User', 'username email')  // Populate user details (e.g., username, email)
      .select('User chatmembertype');  // Select the necessary fields

    if (!communityMembers || communityMembers.length === 0) {
      return res.status(404).json({ message: "No members found for this community" });
    }

    res.status(200).json({ 
      message: 'Members retrieved successfully',
      member: communityMembers  
    });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};


exports.searchCommunity = async (req, res) => {
  try {
    // Lấy từ khóa tìm kiếm từ query parameters
    const { query } = req.query;

    // Kiểm tra nếu không có từ khóa tìm kiếm
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Tìm kiếm cộng đồng theo tên cộng đồng (hoặc các thuộc tính khác)
    const foundCommunities = await community.find({
      name: { $regex: query, $options: 'i' }  // Tìm kiếm không phân biệt hoa thường
    });

    // Nếu không tìm thấy cộng đồng nào
    if (foundCommunities.length === 0) {
      return res.status(200).json({ message: "No communities found", communities: [] });
    }

    // Lấy danh sách ID của các cộng đồng tìm được
    const communityIds = foundCommunities.map(cm => cm._id);

    // Tìm các bài viết thuộc về các cộng đồng tìm được
    const posts = await post.find({ community: { $in: communityIds } });

    // Trả về danh sách cộng đồng và bài viết
    return res.status(200).json({
      message: "Communities found",
      communities: foundCommunities,
      posts: posts
    });

  } catch (error) {
    // Xử lý lỗi
    res.status(500).json({ message: "Error: " + error.message });
  }
};


exports.deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.body;
    await community.findByIdAndDelete(communityId);
    res.redirect('/community/page');
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};

exports.getCommunityPage = async (req, res) => {
  try {
    const { communityId } = req.params;
    console.log(communityId);
    // Tìm cộng đồng theo ID
    const foundCommunity = await community.findById( communityId );
    if (!foundCommunity) {
      return res.status(404).json({ message: "Cộng đồng không tồn tại" });
    }

    // Tìm tất cả bài viết thuộc cộng đồng này
    const posts = await post.find({ Community: communityId });

    // Hiển thị trang cộng đồng với các bài viết
    res.render('communityPage', { community: foundCommunity, posts: posts });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};