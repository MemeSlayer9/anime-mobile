import React, { createContext, useContext, useRef } from 'react';

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const videoRef = useRef(null);

  const handlePauseVideo = async () => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
        console.log("Video paused");
      } else {
        console.log("Video is already paused");
      }
    } else {
      console.log("Video reference is null");
    }
  };

  return (
    <VideoContext.Provider value={{ videoRef, handlePauseVideo }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  return useContext(VideoContext);
};
