import React, { createContext, useContext, useState } from 'react';

// Context for Download ID
const DownloadIDContext = createContext();

export const DownloadIDProvider = ({ children }) => {
  const [downloadedID, setDownloadedID] = useState(null);  // Fixed typo here

  return (
    <DownloadIDContext.Provider value={{ downloadedID, setDownloadedID }}>
      {children}
    </DownloadIDContext.Provider>
  );
};

export const useDownloadedID = () => {
  return useContext(DownloadIDContext);
};

// Context for Download Episode ID
const DownloadEpisodeIDContext = createContext();
 
export const DownloadEpisodeIDProvider = ({ children }) => {  // Changed provider name here
  const [downloadedEpisodeID, setDownloadedEpisodeID] = useState(null);

  return (
    <DownloadEpisodeIDContext.Provider value={{ downloadedEpisodeID, setDownloadedEpisodeID }}>
      {children}
    </DownloadEpisodeIDContext.Provider>
  );
};

export const useDownloadedEpisodeID = () => {
  return useContext(DownloadEpisodeIDContext);
};
