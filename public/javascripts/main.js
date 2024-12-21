$('document').ready(function () {
    setInterval(fetchPosts, 1000);
});

function fetchPosts() {
    try {
        $.ajax({
            url: '/post',
            method: 'GET',
            success: function (data) {
                const postContainer = $('#all-post'); // Chọn container
                if (!postContainer) return;

                postContainer.empty();
                if (data.posts && data.posts.length > 0) {
                    data.posts.forEach(({ post, media, likecount }) => {
                        //console.log(post, media, likecount);

                        const mediaContent = media && media.length > 0
                            ? media.map(item => {
                                if (item.MediaType === 'Image') {
                                    return `<div class="media-item image">
                                                <img class="media-image" src="${item.filepath}" alt="${item.filename}" />
                                            </div>`;
                                } else if (item.MediaType === 'Video') {
                                    return `<div class="media-item video">
                                                <video class="media-video" controls>
                                                    <source src="${item.filepath}" type="video/mp4">
                                                </video>
                                            </div>`;
                                } else if (item.MediaType === 'Audio') {
                                    return `<div class="media-item audio">
                                                <audio class="media-audio" controls>
                                                    <source src="${item.filepath}" type="audio/mp3">
                                                </audio>
                                            </div>`;
                                } else {
                                    return '';
                                }
                            }).join('') // Kết hợp các media thành một chuỗi
                            : '';

                        let postContent = `<div style="border: 1px solid black; border-radius: 10px; padding: 10px; margin: 10px 0%;">
                            ${ post.Community?._id != '67651ab7d883a8fa98ebfac4' && post.IsCommunityPost 
                                ? `<div id="communtity">
                                    <a style=" text-decoration: none; color: black;" href="/community/${post.Community?._id}" >
                                        <h4>${post.Community?.name}</h4>
                                    </a>
                                </div>` 
                                : ''
                            }
                            <div id="username">
                                <a style=" text-decoration: none; color: black;" href="/profile/friend/${post.Author?._id}" >
                                    <h6>${post.Author?.username}</h6>
                                </a>
                            </div>
                            <div id="content">
                                <p style="">${post.content}</p>  
                            </div>

                            <!-- media -->
                            ${mediaContent}
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px;">
                                <!-- Hiển thị lượt thích -->
                                <div id="likes" style="display: flex; align-items: center;">
                                    <button class="like-btn" onclick="likepost('${post._id}')">
                                        ${likecount} <i class="fa fa-heart"></i>
                                    </button>
                                </div>

                                <!-- Nút truy cập bình luận -->
                                <div id="comments">
                                    <a class="btn-danger" href="/post/${post._id}" style="text-decoration: none; color: white; padding: 5px 10px; border-radius: 5px; background-color: #d9534f;" target="_blank">
                                        Comment
                                    </a>
                                </div>
                            </div>
                        </div>`;

                        postContainer.append(postContent);    
                    });
                } else {
                    postContainer.innerHTML = `<p>No posts available.</p>`;
                }
            },
            error: function (error) {
                console.error('Error fetching posts:', error);
                const postContainer = $('#all-post');
                if (postContainer) {
                    postContainer.html(`<p>Unable to load posts. Please try again later.</p>`);
                }
            },
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function likepost(postId) {
    console.log(postId);
    $.ajax({
        url: '/post/like',
        method: 'POST',
        data: JSON.stringify({ postId }),  // Chuyển postId sang JSON
        contentType: 'application/json',
        success: function (data) {
            if (data.isLiked === true) {
                //alert('You liked the post!');
                const likeCountElement = document.getElementById(`likes-${postId}`);
                if (likeCountElement) {
                    likeCountElement.textContent = `${data.likeCount} <i class="fa fa-heart" style="color: red;"></i>`;
                }
            } else {
                //alert('You unliked the post!');
            }
        },
        error: function (error) {
            console.error('Error liking post:', error);
        }
    });
}

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
            //alert('Post created successfully!');
            fetchPosts(); // Reload posts
        } else {
            alert('Failed to create post.');
        }
    } catch (err) {
        console.error('Error creating post:', err);
    }
});

document.getElementById('searchInput').addEventListener('input', async function () {
    const query = this.value;
    const postsContainer = document.getElementById('search-post-result');
    
    if (query.length > 0) {
        const response = await fetch(`/post/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        postsContainer.innerHTML = '';
        //console.log(data);
        if(response.ok){
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
        }else{
            postsContainer.innerHTML = '';
            fetchPosts();
        }
    } else {
        postsContainer.innerHTML = '';
        fetchPosts(); // Reload all posts if search is cleared
    }
});

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

// async function checkIfPostLiked(postId) {
//     try {
//         const response = await fetch('/post/getlike', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ postId }),
//         });
//         const data = await response.json();
//         return data.isLiked; // returns true or false based on the API response
//     } catch (error) {
//         console.error('Error checking like status:', error);
//         return false; // Assume not liked if there's an error
//     }
// }

// document.addEventListener('submit', async function (e) {
//     if (e.target.tagName === 'FORM' && e.target.querySelector('[id^="commentInput"]')) {
//         e.preventDefault();

//         const postId = e.target.querySelector('input[name="postId"]').value;
//         const commentContent = e.target.querySelector(`#commentInput-${postId}`).value;

//         if (!commentContent.trim()) {
//             alert('Comment không được để trống.');
//             return;
//         }

//         try {
//             const response = await fetch(`/comment/add`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ postId, content: commentContent }),
//             });

//             if (response.ok) {
//                 const newComment = await response.json();
//                 const commentContainer = document.getElementById(`comment-${postId}`);
//                 const newCommentHTML = `<p><strong>${newComment.author.username}:</strong> ${newComment.content}</p>`;
//                 commentContainer.innerHTML += newCommentHTML;

//                 // Xóa nội dung input sau khi gửi
//                 e.target.querySelector(`#commentInput-${postId}`).value = '';
//             } else {
//                 alert('Thêm comment thất bại.');
//             }
//         } catch (error) {
//             console.error('Error adding comment:', error);
//         }
//     }
// });

  

// async function pushcomment(postId) {
//     const commentInput = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
//     const comment = commentInput.value;
//     console.log('postId :', postId);
//     // Gửi yêu cầu bình luận
//     try {
//         const response = await fetch(`/comment`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ comment, postId }),
//         });
//         if (response.ok) {
//             const data = await response.json();
//             const message = data.message;
//             alert(message);
//             commentInput.value = ''; // Xóa nội dung ô nhập
//             fetchComments(postId); // Tải lại bình luận
//         } else {
//             const errorData = await response.json();
//             alert(`Error: ${errorData.error || 'Something went wrong' || 'Failed to add comment.'}`);
//         }
//     } catch (err) {
//         console.error('Error adding comment:', err);
//     }
// }


// async function toggleCommentOpen(event) {
//     event.preventDefault();  // Ngăn chặn hành vi mặc định nếu cần
//     const comment = document.getElementById("comment");
//     comment.style.display = "flex"; // Hiển thị phần tử ở giữa màn hình

// }

// async function toggleCommentClose(event) {
//     event.preventDefault();  // Ngăn chặn hành vi mặc định nếu cần
//     const comment = document.getElementById("comment");
//     comment.style.display = "none"; // Ẩn phần tử khi đã hiển thị
//     const commentlist = document.querySelectorAll(".comment-list");
//     commentlist.forEach(function(comment) {
//         comment.innerHTML = "";  // Xóa toàn bộ nội dung bên trong mỗi phần tử
//     });
// }

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

// document.addEventListener('click', async function (e) {
//     if (e.target.classList.contains('like-btn')) {
//         const postId = e.target.getAttribute('data-post-id');
//         const button = e.target;
//         // Gửi yêu cầu thích bài viết
//         try {
//             const response = await fetch(`/post/like/${postId}`, { method: 'POST' });
//             if (response.ok) {
//                 const data = await response.json();
//                 const notification = data.message;
//                 alert(notification);
//                 button.classList.toggle('liked');
//             } else {
//                 alert('Failed to like the post.');
//             }
//         } catch (err) {
//             console.error('Error liking post:', err);
//         }
//     }

// });

// // Hàm để lấy và hiển thị bình luận
// async function fetchComments(postId) {
//     try {
//         const response = await fetch(`/comment/getcomment`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ postId }),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to fetch comments');
//         }

//         const data = await response.json();
//         const commentContainer = document.getElementById(`comment-${postId}`);
//         commentContainer.innerHTML = '';

//         data.comments.forEach(comment => {
//             const commentHTML = `<p><strong>${comment.author?.username}:</strong> ${comment.content}</p>`;
//             commentContainer.innerHTML += commentHTML;
//         });
//     } catch (error) {
//         console.error('Error fetching comments:', error);
//     }
// }