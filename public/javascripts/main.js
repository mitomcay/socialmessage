async function fetchPosts() {
    try {
        const response = await fetch('/post');
        const data = await response.json();
        const postContainer = document.querySelector('.posts');

        if (data.posts && data.posts.length > 0) {
            //console.log(data.posts);
            data.posts.forEach(async ({ post, media }) => {
                const isLiked = await checkIfPostLiked(post._id);
                //const community = postData.post.Community._id;
                //console.log(community);
                //console.log(postData.post);
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.innerHTML = `
                    <div class="post-header">
                        <strong>${post.Author?.username}</strong> 
                        ${post.IsCommunityPost && post.Community?._id !== '67651ab7d883a8fa98ebfac4' ? `<span>trong cộng đồng <em>${post.Community?.name}</em></span>` : ''}
                    </div>
                    <div class="post-content">
                        <p>${post.content}</p>
                    </div>
                    <div id = "media-${post._id}"></div>
                    <div class="post-footer">
                        <small>Đăng lúc: ${new Date(post.CreatedAt).toLocaleString()}</small>
                    </div>
                    <div class="comments">
                        <h4 style="display: flex;"> 
                                <button class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post._id}">
                                <i class="far fa-heart"></i> Like
                            </button>
                            <button class="comment-btn" data-post-id="${post._id}" onclick="toggleCommentOpen(event)"><i class="fas fa-comment"></i>comments</button>
                        </h4>
                        <div id="comment" style="display: none;">
                            <div class="comment-container">
                                <textarea placeholder="Add a comment..." class="comment-input" data-post-id="${post._id}"></textarea>
                                <button onclick="pushcomment('${post._id}')" class="comment-btn-2" data-post-id="${post._id}">Comment</button>
                                <button onclick="toggleCommentClose(event)">Đóng</button>
                                <div>Comment:</div>
                                <div class="comments">
                                    <div style="display: block;" class="comment-list" id="comments-${post._id}"></div>
                                </div>
                            </div> 
                        </div>
                    </div>
                `;

                postContainer.appendChild(postElement);
                // Get the media container for this specific post
                const mediaContainer = document.getElementById(`media-${post._id}`);

                if (media && media.length > 0) {
                    media.forEach(postMedia => {
                        let mediaContent = '';
                        //console.log(postMedia.MediaType, postMedia.filepath );
                        if (postMedia.MediaType === 'Image') {
                            mediaContent = `<img style = "width: 100%;" src="..${postMedia.filepath}" alt="media" />`;
                        } else if (postMedia.MediaType === 'Video') {
                            mediaContent = `<video style = "width: 100%;" controls><source src="..${postMedia.filepath}" type="video/mp4"></video>`;
                        } else if (postMedia.MediaType === 'Audio') {
                            mediaContent = `<audio style = "width: 100%;" controls><source src="..${postMedia.filepath}" type="audio/mp3"></audio>`;
                        }
                        mediaContainer.innerHTML += mediaContent;
                    });
                }
            });
        } else {
            postsContainer.innerHTML = `<p>No posts available.</p>`;
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

window.onload = function () {
    fetchPosts();
    //fetchCommunities(); // Gọi hàm để tải danh sách cộng đồng
};

let mediaIds = [];
document.getElementById('postForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const content = this.querySelector('textarea[name="content"]').value;
    let mediaInput = document.getElementById('mediaInput').files;
    let community = '67651ab7d883a8fa98ebfac4';

    if (mediaInput.length > 0) {
        const uploadPromises = Array.from(mediaInput).map(async (file) => {
            const formData = new FormData();
            formData.append('media', file);
            let mediaType = '';
            if (file.type.startsWith('image/')) {
                mediaType = 'Image';
            } else if (file.type.startsWith('video/')) {
                mediaType = 'video';
            }
            else if (file.type.startsWith('Audio/')) {
                mediaType = 'Audio';
            }
            formData.append('MediaType', mediaType);

            try {
                const response = await fetch('/api/media/upload', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    const media = result.data;

                    //console.log(media._id); // The media object
                    
                    mediaIds.push(media._id);
                } else {
                    alert(`Failed to upload media: ${result.error}`);
                }
            } catch (err) {
                console.error('Error uploading file:', err);
            }
        });

        await Promise.all(uploadPromises); // Wait for all uploads to complete
    }

    try {
        //console.log(mediaIds);
        const postResponse = await fetch('/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                community: community,
                mediaIds: mediaIds,
            }),
        });

        if (postResponse.ok) {
            alert('Post created successfully!');
            fetchPosts(); // Reload posts
        } else {
            alert('Failed to create post.');
        }
    } catch (err) {
        console.error('Error creating post:', err);
    }
});

document.addEventListener('click', async function (e) {
    if (e.target.classList.contains('like-btn')) {
        const postId = e.target.getAttribute('data-post-id');
        const button = e.target;
        // Gửi yêu cầu thích bài viết
        try {
            const response = await fetch(`/post/like/${postId}`, { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                const notification = data.message;
                alert(notification);
                button.classList.toggle('liked');
            } else {
                alert('Failed to like the post.');
            }
        } catch (err) {
            console.error('Error liking post:', err);
        }
    }

    if (e.target.classList.contains('comment-btn')) {
        const postId = e.target.getAttribute('data-post-id');
        const commentContainer = document.getElementById(`comments-${postId}`);
        
        if (!commentContainer.hasAttribute('data-loaded')) { 
            // Chỉ tải comment nếu chưa được tải
            await fetchComments(postId);
        }
    }

});

// Hàm để lấy và hiển thị bình luận
async function fetchComments(postId) {
    try {
        const response = await fetch(`/comment/getcomment`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId }),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        //console.log(data);
        const commentList = document.getElementById(`comments-${postId}`);
        if (!commentList) {
            console.error(`No comment section found for postId: ${postId}`);
            return;
        }
        commentList.innerHTML = '';
        data.comments.forEach(comment => {
            commentList.innerHTML += `<p>${comment.Author.username}: ${comment.content} </p>`;
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

document.getElementById('searchInput').addEventListener('input', async function () {
    const query = this.value;
    if (query.length > 0) {
        const response = await fetch(`/post/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        const postsContainer = document.querySelector('.posts');
        postsContainer.innerHTML = '';

        console.log(data);

        data.posts.forEach(postData => {
            if (postData?.IsCommunityPost){
                postsContainer.innerHTML += `
                    <div class="post">
                        ${postData.community?._id == "67651ab7d883a8fa98ebfac4" ? `<p><strong>Community: ${postData.Community?.name}</strong></p>` : ''}
                        <h3>${postData.Author?.username}</h3>
                        <p>${postData.content}</p>
                        <div class="media" id="media-${postData._id}"></div>
                    </div>`;
            }
            else{
                postsContainer.innerHTML += `
                <div class="post">
                    <h3>${postData.Author?.username}</h3>
                    <p>${postData.content}</p>
                    <div class="media" id="media-${postData._id}"></div>
                </div>`;
            }
            
        });
    } else {
        fetchPosts(); // Reload all posts if search is cleared
    }
});

async function toggleCommentOpen(event) {
    event.preventDefault();  // Ngăn chặn hành vi mặc định nếu cần
    const comment = document.getElementById("comment");
    comment.style.display = "flex"; // Hiển thị phần tử ở giữa màn hình

}

async function toggleCommentClose(event) {
    event.preventDefault();  // Ngăn chặn hành vi mặc định nếu cần
    const comment = document.getElementById("comment");
    comment.style.display = "none"; // Ẩn phần tử khi đã hiển thị
    const commentlist = document.querySelectorAll(".comment-list");
    commentlist.forEach(function(comment) {
        comment.innerHTML = "";  // Xóa toàn bộ nội dung bên trong mỗi phần tử
    });
}

// async function fetchCommunities() {
//     try {
//         const response = await fetch('/community'); // API lấy danh sách cộng đồng
//         const data = await response.json();

//         const communitySelect = document.getElementById('community-select');
        
//         data.community.forEach(cm => {
//             const option = document.createElement('option');
//             option.value = cm._id; // ID của cộng đồng
//             option.textContent = cm.name; // Tên của cộng đồng
//             communitySelect.appendChild(option);
//         });
//     } catch (error) {
//         console.error('Error fetching communities:', error);
//     }
// }

async function checkIfPostLiked(postId) {
    try {
        const response = await fetch('/post/getlike', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId }),
        });
        const data = await response.json();
        return data.isLiked; // returns true or false based on the API response
    } catch (error) {
        console.error('Error checking like status:', error);
        return false; // Assume not liked if there's an error
    }
}

function searchFriends() {
    const searchInput = document.getElementById('friend-search').value;

    if (!searchInput) {
        alert('Please enter a name to search.');
        return;
    }

    fetch(`/friend/search?name=${encodeURIComponent(searchInput)}`)
    .then(response => response.json())
    .then(data => {
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = '';

        if (data.length === 0) {
            resultsDiv.innerHTML = '<p>No friends found.</p>';
            return;
        }

        console.log(data);

        data.forEach(friend => {
            if (!friend.isFriend){
                const friendElement = document.createElement('div');
                friendElement.classList.add('friend-item');
                friendElement.innerHTML = `
                    <div style="display: flex; width: 100%; margin: 5px 0%;">
                        <div style= "width: 50%;">${friend.username}</div>
                        <button style="border-radius: 7px; width: 30%;" onclick="sendFriendRequest('${friend._id}')">Ket ban</button>
                    </div>
                    
                `;
                resultsDiv.appendChild(friendElement);
            }
            else{
                const friendElement = document.createElement('div');
                friendElement.classList.add('friend-item');
                friendElement.innerHTML = `
                    <div style="display: flex; width: 100%; margin: 5px 0%;">
                        <div style= "width: 50%;">${friend.username}</div>
                        <button style="border-radius: 7px; width: 30%;" onclick="sendFriendRequest('${friend._id}')" disabled >Da ket ban</button>
                    </div>
                `;
                resultsDiv.appendChild(friendElement);
            }
        });
    })
    .catch(error => {
        console.error('Error searching for friends:', error);
    });
}

function sendFriendRequest(receiverId) {
    fetch('/friend/addfriend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) { // Kiểm tra thông báo thành công từ server
            alert(data.message);
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error sending friend request:', error);
    });
}

async function pushcomment(postId) {
    const commentInput = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
    const comment = commentInput.value;
    console.log('postId :', postId);
    // Gửi yêu cầu bình luận
    try {
        const response = await fetch(`/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment, postId }),
        });
        if (response.ok) {
            const data = await response.json();
            const message = data.message;
            alert(message);
            commentInput.value = ''; // Xóa nội dung ô nhập
            fetchComments(postId); // Tải lại bình luận
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error || 'Something went wrong' || 'Failed to add comment.'}`);
        }
    } catch (err) {
        console.error('Error adding comment:', err);
    }
}
