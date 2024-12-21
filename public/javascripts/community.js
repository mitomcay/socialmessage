document.getElementById('searchInput').addEventListener('input', async function () {
    const query = this.value;
    const searchResultsContainer = document.getElementById('searchResults');
    try {
        // Gửi yêu cầu tìm kiếm đến API
        const response = await fetch(`/community/search?query=${query}`);
        const data = await response.json();
        // Kiểm tra có cộng đồng nào tìm thấy không
        if (data.communities && data.communities.length > 0 ) {
            searchResultsContainer.innerHTML = data.communities.map(cm => {
                if (cm._id !== "67651ab7d883a8fa98ebfac4") {
                    return `
                        <div class="search-result-item">
                            <form action="/community/page/${cm._id}" method="get">
                                <button type="submit"><label>${cm.name}</label></button>
                            </form>
                        </div>
                    `;
                }
        }).join('');
        } else {
            searchResultsContainer.innerHTML = '<p>Không tìm thấy cộng đồng nào.</p>';
        }
    } catch (error) {
        searchResultsContainer.innerHTML = '<p>Đã xảy ra lỗi khi tìm kiếm cộng đồng.</p>';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('postForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = this.querySelector('input[name="name"]').value;
        const description = this.querySelector('textarea[name="description"]').value;
        let mediaInput = document.getElementById('mediaInput').files;
        const isPrivate = this.querySelector('input[name="Isprivate"]').checked;

        let mediaIds = []; // Khai báo mảng mediaIds để lưu trữ id của các media đã tải lên

        if (mediaInput.length > 0) {
            const uploadPromises = Array.from(mediaInput).map(async (file) => {
                const formData = new FormData();
                formData.append('media', file);
                let mediaType = '';
                if (file.type.startsWith('image/')) {
                    mediaType = 'Image';
                } else if (file.type.startsWith('video/')) {
                    mediaType = 'Video';
                } else if (file.type.startsWith('audio/')) {
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
                        mediaIds.push(media._id); // Lưu id của media vào mảng mediaIds
                    } else {
                        alert(`Failed to upload media: ${result.error}`);
                    }
                } catch (err) {
                    console.error('Error uploading file:', err);
                }
            });

            await Promise.all(uploadPromises); // Chờ tất cả các upload hoàn thành
        }

        // Gửi dữ liệu cộng đồng lên server
        try {
            const postResponse = await fetch('/community/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    description,
                    Isprivate: isPrivate, // Gửi giá trị checkbox isPrivate
                    CommunityPicture: mediaIds, // Gửi id của các media đã tải lên
                }),
            });

            if (postResponse.ok) {
                alert('Post created successfully!');
                window.location.reload();
            } else {
                alert('Failed to create post.');
            }
        } catch (err) {
            console.error('Error creating post:', err);
        }
    });
});
