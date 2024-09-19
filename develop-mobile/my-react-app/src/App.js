// src/App.js
import React, { useState, useEffect } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import VideoPlayer from './components/VideoPlayer';
import VideoPage from './pages/VideoPage';
import './App.css';

function App() {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVideos, setFilteredVideos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/videos')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched videos:', data); // Kiểm tra dữ liệu nhận được
        setVideos(data);
      })
      .catch(error => console.error('Error fetching videos:', error));
  }, []);

  useEffect(() => {
    const filtered = videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log('Filtered videos:', filtered); // Kiểm tra dữ liệu đã lọc
    setFilteredVideos(filtered);
  }, [searchTerm, videos]);

  return (
    <div className="App">
      <Header />
      <main>
        <div className="video-grid">
          <Routes>
            <Route path="/" element={
              filteredVideos.length > 0 ? (
                filteredVideos.map(video => (
                  <div key={video.id} className="video-item">
                    <Link style={{textDecoration: 'none', color: 'black'}} to={`/video/${video.id}`}><h3>{video.title}</h3></Link>
                    {/* Không cần VideoPlayer ở đây nữa */}
                    <VideoPlayer url={video.url} />
                  </div>
                ))
              ) : (
                <p>No videos found</p>
              )
            } />
            <Route path="/video/:id" element={<VideoPage />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
