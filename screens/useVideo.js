import { useRef } from 'react';

const useVideo = () => {
  const videoRef = useRef(null);

  const handlePauseVideo = async () => {
    console.log('Attempting to pause the video');
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync();
        console.log('Video paused successfully');
      } catch (error) {
        console.error('Error pausing video:', error);
      }
    } else {
      console.log('Video ref is not set correctly');
    }
  };

  return { videoRef, handlePauseVideo };
};

export default useVideo;
