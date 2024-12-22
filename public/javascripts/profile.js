$(document).ready(function () {
    setInterval(fetchPosts, 1000);
    // Fetch user data
    // $.ajax({
    // url: '/api/users',
    // method: 'GET',
    // success: function (response) {
    //     let userList = $('#user-list');
    //     userList.empty();
    //     if (response.length > 0) {
    //     response.forEach((user) => {
    //         userList.append(
    //         '<p>User ID: ' + user.id + ', Name: ' + user.name + '</p>'
    //         );
    //     });
    //     } else {
    //     $('.no-users').show();
    //     }
    // },
    // error: function (err) {
    //     console.error('Error fetching users:', err);
    // },
    // });

    // Fetch posts data
});

function fetchPosts() {
    try {
        $.ajax({
            url: '/post/mypost',
            method: 'GET',
            success: function (data) {
                const postContainer = $('#posts-container'); // Chọn container
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
                                <a style=" text-decoration: none; color: black;" href="/profile" >
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
                const postContainer = $('#posts-container');
                if (postContainer) {
                    postContainer.html(`<p>No posts available.</p>`);
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
                alert('You liked the post!');
                const likeCountElement = document.getElementById(`likes-${postId}`);
                if (likeCountElement) {
                    likeCountElement.textContent = `${data.likeCount} <i class="fa fa-heart" style="color: red;"></i>`;
                }
            } else {
                alert('You unliked the post!');
            }
        },
        error: function (error) {
            console.error('Error liking post:', error);
        }
    });
}

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

//     if (e.target.classList.contains('comment-btn')) {
//         const postId = e.target.getAttribute('data-post-id');
//         //console.log(postId);
//         fetchComments(postId);
//     }

//     if (e.target.classList.contains('comment-btn-2')) {
//         const postId = e.target.getAttribute('data-post-id');
//         const commentInput = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
//         const comment = commentInput.value;
        
//         // Gửi yêu cầu bình luận
//         try {
//             const response = await fetch(`/comment`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ comment, postId }),
//             });
//             if (response.ok) {
//                 const data = await response.json();
//                 const message = data.message;
//                 alert(message);
//                 commentInput.value = ''; // Xóa nội dung ô nhập
//                 fetchComments(postId); // Tải lại bình luận
//             } else {
//                 const errorData = await response.json();
//                 alert(`Error: ${errorData.error || 'Something went wrong' || 'Failed to add comment.'}`);
//             }
//         } catch (err) {
//             console.error('Error adding comment:', err);
//         }
//     }
// });

// // Hàm để lấy và hiển thị bình luận
// async function fetchComments(postId) {
//     try {
//         const response = await fetch(`/comment/getcomment`,{
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
//         const commentList = document.getElementById(`comments-${postId}`);

//         data.comments.forEach(comment => {
//             let cm = document.createElement('p');
//             cm.textContent = `${comment.Author.username}: ${comment.content}`;
//             commentList.appendChild(cm);
//         });
//     } catch (error) {
//         console.error('Error fetching comments:', error);
//     }
// }

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
