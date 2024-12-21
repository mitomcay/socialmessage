const CommunityMember = require("../../models/community/communitymember");
const Community = require("../../models/community/community");
const Media = require("../../models/media/media");
const { getBaseURL } = require("../../lib/BaseURL");
const community = require("../../models/community/community");
const media = require("../../models/media/media");


// tạo cộng đồng
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, isprivate, communityPicture } = req.body;

    // Giả định rằng bạn có `creatorId` từ phiên session
    const creatorId = req.session.userId;

    // Tạo community mới
    const newCommunity = new Community({
      name: name,
      description: description,
      CommunityPicture: communityPicture,
      isprivate: isprivate
    });

    // Lưu community mới vào cơ sở dữ liệu
    await newCommunity.save();

    // Tạo community member mới
    const communityMember = new CommunityMember({
      User: creatorId,
      Community: newCommunity._id,
      CommunityMemberType: 'Admin'  // Creator is Admin by default
    });

    await communityMember.save();

    // Trả về phản hồi thành công
    res.status(201).json({
      message: 'Community created successfully',
      Community: newCommunity,
    });

  } catch (error) {
    console.log('create community error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getMyCommunity = async (req, res) => {
  try {
    const userId = req.session.userId;
    const baseUrl = await getBaseURL(req);
    // Tìm tất cả các cộng đồng mà người dùng là thành viên
    const communityMembers = await CommunityMember.find({ User: userId }).sort({ createdAt: -1 });

    if (!communityMembers || communityMembers.length === 0) {
      return res.status(400).json({ message: "No community member found" });
    }

    // Lấy danh sách các `communityIds` từ `communityMembers`
    const communityIds = communityMembers.map(member => member.Community);
    const foundCommunities = await Community.find({ _id: { $in: communityIds } });

    if (!foundCommunities || foundCommunities.length === 0) {
      return res.status(400).json({ message: "No community found" });
    }

    // Lấy thông tin `CommunityMemberType` từ `communityMembers` và thêm vào `foundCommunities` 
    const communitiesWithMemberType = await Promise.all(foundCommunities.map(async community => {
      /*
      // lấy thông tin người dùng 
      const memberInfo = communityMembers.find(member => member.Community.toString() === community._id.toString());
      */
      // lấy thông tin ảnh nhóm
      const media = await Media.findOne({ _id: community.CommunityPicture });
      const mediaUrl = media ? baseUrl + media.filepath : null;
      return {
        ...community._doc,
        // trả về giá trị member type
        // CommunityMemberType: memberInfo ? memberInfo.CommunityMemberType : null,
        CommunityPictureUrl: mediaUrl,
      };
    }));

    // Trả về thông tin các cộng đồng mà người dùng thuộc về kèm theo loại thành viên
    res.status(200).json(communitiesWithMemberType);

  } catch (error) {
    console.log('get my community error:', error);
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// lấy thông tin cộng đồng
exports.getcommunity = async (req, res) => {

}

// thêm thành viên vào cộng đồng
exports.addMember = async (req, res) => {

}

// xóa thành viên khỏi cộng đồng - rời cộng đồng
exports.removeMember = async (req, res) => {

}

// lấy bài viết trong cộng đồng
exports.getPostCommunity = async (req, res) => {

}

// lấy media trong cộng đồng
exports.getMediaCommunity = async (req, res) => {

}

exports.getMemberOfCommunity = async (req, res) => {
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