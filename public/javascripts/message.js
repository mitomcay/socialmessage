const socket = io(); // Kết nối với server thông qua Socket.IO
let currentChatId = null; // Theo dõi chat hiện tại

// Hàm tham gia nhóm chat và tải tin nhắn cũ qua WebSocket
async function chat(chatId) {
    console.log(currentChatId);
    if (currentChatId !== chatId) {
        // Nếu ID chat khác với nhóm hiện tại, thực hiện các bước sau
        if (currentChatId) {
            socket.emit('leaveChat', currentChatId); // Rời khỏi nhóm chat hiện tại
        }
        
        currentChatId = chatId;  // Cập nhật ID nhóm chat hiện tại
        socket.emit('joinChat', chatId); // Tham gia nhóm chat mới qua WebSocket
        
        // Cập nhật giao diện nút gửi tin nhắn
        const btn = document.getElementById('btn');
        btn.innerHTML = '';  // Xóa các phần tử cũ (nếu có)
        btn.innerHTML += '<input id="message" type="text" placeholder="Nhập tin nhắn" class="message-input">';
        btn.innerHTML += '<button type="submit" onclick="sendmessage(\'' + currentChatId + '\')" class="send-button">Send</button>';
        
        // Lắng nghe tin nhắn cũ
        socket.once('oldMessages', (messages) => {
            const messageChat = document.getElementById('message-chat');
            messageChat.innerHTML = ''; // Xóa các tin nhắn cũ

            if (Array.isArray(messages) && messages.length > 0) {
                messages.forEach(message => {
                    appendMessage(message.content); // Thêm từng tin nhắn vào giao diện
                });
            } else {
                messageChat.innerHTML = '<p style="display: none;">Không có tin nhắn nào trong nhóm này.</p>';
            }
        });
    }
}

// Hàm gửi tin nhắn qua WebSocket
async function sendmessage(chatId) {
    const content = document.getElementById('message').value; // Lấy nội dung tin nhắn
    const repliedMessageId = null;
    const mediaIds = [];
    if (content.length > 0 && content.length <= 500) {
        // Gửi tin nhắn qua WebSocket
        fetch('/message/sendmessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content, chatId, repliedMessageId, mediaIds }),
        })
        .then(response => response.json())
        .then(data => {
            appendMessage(data.data.content);
            socket.emit('newMessage', data.data); // Gửi tin nhắn mới đến các client khác
            document.getElementById('message').value = '';
        })
        .catch(error => console.error(error));
    } else {
        console.error('Tin nhắn không hợp lệ');
    }
}

// Hàm thêm tin nhắn vào giao diện
function appendMessage(content) {
    const messageChat = document.getElementById('message-chat');
    const messageElement = document.createElement('p');
    messageElement.textContent = content;
    messageChat.appendChild(messageElement); // Thêm tin nhắn vào danh sách
    messageChat.scrollTop = messageChat.scrollHeight; // Cuộn xuống cuối
}

socket.on('Messages', async (message) => {
    if (message.chat === currentChatId) {
        appendMessage(message.content); // Chỉ thêm tin nhắn nếu đúng nhóm chat
    }
});