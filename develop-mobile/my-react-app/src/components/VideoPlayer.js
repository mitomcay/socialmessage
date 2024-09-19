import React from 'react';
import ReactPlayer from 'react-player';
import './VideoPlayer.css'; // Nếu có

function VideoPlayer({ url }) {
  return (
    <div className="video-player">
      <ReactPlayer 
        url={url} 
        width="100%" 
        height="100%" 
        controls 
      />
    </div>
  );
}

export default VideoPlayer;
