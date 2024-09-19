// src/pages/VideoPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';

function VideoPage() {
  const { id } = useParams(); // Lấy id từ URL
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    // Fetch video data by id
    fetch(`http://localhost:5000/api/videos/${id}`)
      .then(response => response.json())
      .then(data => {
        setVideoUrl(data.url);
        console.log('url', data.url);
      })
      .catch(error => console.error('Error fetching video:', error));
  }, [id]);

  return (
    <div>
      <h1>Video Page</h1>
      <VideoPlayer url={videoUrl} />
    </div>
  );
}

export default VideoPage;
