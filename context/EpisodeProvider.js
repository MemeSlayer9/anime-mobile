import React, { createContext, useContext, useState } from 'react';

const EpisodeContext = createContext();
 
export const EpisodeProvider = ({ children }) => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);

  return (
    <EpisodeContext.Provider value={{ selectedEpisodeId, setSelectedEpisodeId }}>
      {children}
    </EpisodeContext.Provider>
  );
};

export const useEpisode = () => {
  return useContext(EpisodeContext);
};

 