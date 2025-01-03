import React, { createContext, useContext, useState } from 'react';

const DownloadedFilesContext = createContext();

export const DownloadedFilesProvider = ({ children }) => {
  const [downloadedFiles, setDownloadedFiles] = useState([]);

  return (
    <DownloadedFilesContext.Provider value={{ downloadedFiles, setDownloadedFiles }}>
      {children}
    </DownloadedFilesContext.Provider>
  );
};

export const useDownloadedFiles = () => {
  return useContext(DownloadedFilesContext);
};
