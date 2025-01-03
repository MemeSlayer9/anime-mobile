import React, { createContext, useContext, useState } from 'react';

// Create a context for episodes
const EpisodeContext = createContext();

// Provide the context to children components
export const EpisodeProvider = ({ children }) => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState(null);

  return (
    <EpisodeContext.Provider
      value={{
        selectedEpisodeId,
        setSelectedEpisodeId,
        selectedEpisodeNumber,
        setSelectedEpisodeNumber,
      }}
    >
      {children}
    </EpisodeContext.Provider>
  );
};

// Custom hook to use the EpisodeContext
export const useEpisode = () => {
  return useContext(EpisodeContext);
};
