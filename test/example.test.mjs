import * as chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import app from '../bin/www';
import chatController from '../controllers/web/chatcontroller.js';
import chat from '../models/chat/chat.js';
import chatmember from '../models/chat/chatmember.js';
import User from '../models/user/users.js';

chai.use(chaiHttp); // Ensure chai-http is used

describe('Chat Controller', () => {
    let server;
    let userId;
    let chatId;
  
    before(async (done) => {
    //   // Kết nối đến MongoDB (cần cấu hình cho môi trường test)
    //   await mongoose.connect('mongodb://localhost:27017/testdb').then(() => {
    //     console.log('Connected to MongoDB');
    //   }).catch((error) => {
    //     console.error('MongoDB connection error:', error);
    //   });
  
      // Khởi động server
      server = app.listen(3000);
      
      // Tạo người dùng và chat mẫu
    //   const user = await User.create({ username: 'testuser', email: 'test@example.com', password: '14523618', phone: '080439278' });
    //   userId = user._id;
  
    //   const newChat = await chat.create({ name: 'Test Chat' });
    //   chatId = newChat._id;
  
    //   await chatmember.create({ User: userId, Chat: chatId, chatmembertype: 'Admin' });
        done();
    });
  
    after(async () => {
      // Đóng kết nối và xóa dữ liệu sau khi test
      await chatmember.deleteMany({});
      await chat.deleteMany({});
      await User.deleteMany({});
      await mongoose.connection.close();
      server.close();
    });
  
    describe('GET /chat', () => {
      it('should return chat name and id when chat member is found', async () => {
        const res = await chai.request(server)
          .get('/chat')
          .set('Cookie', `connect.sid=sessId;`) // Giả lập session đã đăng nhập
        
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'Success');
        expect(res.body).to.have.property('chatname');
        expect(res.body).to.have.property('chatid', chatId.toString());
      });
  
      it('should return 400 if no chat member found', async () => {
        // Xóa chat member để test trường hợp không tìm thấy
        await chatmember.deleteMany({});
        const res = await chai.request(server).get('/chat').set('Cookie', `connect.sid=sessId;`);
  
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message', 'No chat member found');
      });
  
      it('should return 400 if no chat found', async () => {
        // Xóa chat để test trường hợp không tìm thấy chat
        await chat.deleteMany({});
        const res = await chai.request(server)
          .get('/chat')
          .set('Cookie', `connect.sid=sessId;`);
  
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message', 'No chat found');
      });
    });
  
    describe('POST /chat', () => {
      it('should create a new chat and return success message', async () => {
        const res = await chai.request(server)
          .post('/chat')
          .set('Cookie', `connect.sid=sessId;`)
          .send({ name: 'New Chat', members: [{ userId: userId, role: 'Member' }] });
  
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('message', 'Chat created successfully');
        expect(res.body.chat).to.have.property('name', 'New Chat');
      });
  
      it('should return 500 if an error occurs', async () => {
        // Giả lập lỗi bằng cách truyền dữ liệu không hợp lệ
        const res = await chai.request(server)
          .post('/chat')
          .set('Cookie', `connect.sid=sessId;`)
          .send({}); // Gửi dữ liệu trống
  
        expect(res).to.have.status(500);
      });
    });
  
    describe('POST /chat/changeMemberRole', () => {
      it('should change member role successfully', async () => {
        const res = await chai.request(server)
          .post('/chat/changeMemberRole')
          .set('Cookie', `connect.sid=sessId;`)
          .send({ chatId, memberId: userId, newRole: 'Member' });
  
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'Member role updated successfully');
      });
  
      it('should return 403 if requester is not an Admin', async () => {
        // Thay đổi role của một thành viên không phải Admin
        await chatmember.create({ User: 'anotherUserId', Chat: chatId, chatmembertype: 'Member' });
        const res = await chai.request(server)
          .post('/chat/changeMemberRole')
          .set('Cookie', `connect.sid=sessId;`)
          .send({ chatId, memberId: userId, newRole: 'Admin' });
  
        expect(res).to.have.status(403);
        expect(res.body).to.have.property('message', 'Only admins can change member roles.');
      });
    });
  
    describe('POST /chat/members', () => {
      it('should retrieve members successfully', async () => {
        const res = await chai.request(server)
          .post('/chat/members')
          .set('Cookie', `connect.sid=sessId;`)
          .send({ chatId });
  
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'Members retrieved successfully');
        expect(res.body.members).to.be.an('array').that.is.not.empty;
      });
  
      it('should return 404 if no members found for this chat', async () => {
        await chatmember.deleteMany({});
        const res = await chai.request(server)
          .post('/chat/members')
          .set('Cookie', `connect.sid=sessId;`)
          .send({ chatId });
  
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('message', "No members found for this chat");
      });
    });
  });