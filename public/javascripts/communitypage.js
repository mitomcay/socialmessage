async function toggleForm() {
    const btn1 = document.getElementById('btn-1');
    btn1.style.display = 'none';
    const formContainer = document.getElementById('form');
    // Check if the form is already present
    if (formContainer.innerHTML === '') {
      formContainer.innerHTML = `
        <form id="postForm" enctype="multipart/form-data">
          <textarea name="content" cols="30" rows="10" placeholder="Nhập nội dung bài viết"></textarea>
          <div id="uploadForm">
            <label for="image">Hình ảnh:</label>
            <input type="file" id="mediaInput" name="media" accept="image/*, video/*" multiple>
          </div>
          <button type="submit">Đăng bài</button>
        </form>`;
      
      // Attach event listener after the form is added to the DOM
      document.getElementById('postForm').addEventListener('submit', async function (e) {
          e.preventDefault();

          const content = this.querySelector('textarea[name="content"]').value;
          let mediaInput = document.getElementById('mediaInput').files;
          const communityId = document.getElementById('communityId').innerText;
          console.log(communityId);
          let mediaIds = [];
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
              const postResponse = await fetch('/post', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      content,
                      community: communityId, // Send communityId
                      mediaIds: mediaIds,
                  }),
              });

              if (postResponse.ok) {
                  alert('Post created successfully!');
                  window.location.reload(); // Reload posts
              } else {
                  alert('Failed to create post.');
              }
          } catch (err) {
              console.error('Error creating post:', err);
          }
      });
    } else {
      formContainer.innerHTML = ''; // Clear the form if it already exists
    }
  }