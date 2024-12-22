const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
require('dotenv').config();  // Để sử dụng biến môi trường từ .env file

const openai = new OpenAI({
  apiKey: '',  // Lấy API key từ biến môi trường
});

router.post('/', async (req, res) => {
    const userMessage = req.body.text;  // Tin nhắn của người dùng

    // Kiểm tra xem có tin nhắn người dùng không
    if (!userMessage || userMessage.trim() === '') {
        return res.status(400).json({ reply: 'Please provide a valid message.' });
    }

    try {
        // Gọi API OpenAI để trả lời câu hỏi
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',  // Hoặc 'gpt-4' nếu bạn có quyền truy cập
            messages: [{ role: 'user', content: userMessage }],
            max_tokens: 100,  
        });

        const botReply = response.choices[0].message.content;
        console.log(botReply);
        
        res.json({ reply: botReply });  // Gửi câu trả lời từ bot trở lại frontend
    } catch (error) {
        console.error('Error:', error);
        // Xử lý lỗi khi gặp phải vấn đề với API OpenAI
        res.status(500).json({ reply: 'Sorry, something went wrong.', error: error.message });
    }
});

module.exports = router;
