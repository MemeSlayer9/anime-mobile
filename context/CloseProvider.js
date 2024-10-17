import React, { createContext, useContext, useRef, useState } from 'react';

// Rename to CloseContext for clarity
const CloseContext = createContext();

export const CloseProvider = ({ children }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHello, setShowHello] = useState(false);

  // Centralized close function in the provider
  const handleClose = () => {
    console.log('Close action triggered');
    setIsPlaying(false); // Stop playback or any other close action
    setShowHello(false); // Close Hello component or any other component dependent on this
  };

  return (
    <CloseContext.Provider
      value={{
        videoRef,
        isPlaying,
        setIsPlaying,
        handleClose, // Provide the close function to be used across components
        showHello,
        setShowHello,
      }}
    >
      {children}
    </CloseContext.Provider>
  );
};

// Correctly named hook to use this context
export const useClose = () => useContext(CloseContext);
