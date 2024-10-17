import React, { createContext, useState, useContext, useCallback } from 'react';
import { useEpisode } from './EpisodeProvider';

// Create the context
const EpisodeHistoryContext = createContext();

// Export a custom hook to use the context
export const useEpisodeHistory = () => useContext(EpisodeHistoryContext);

export const EpisodeHistoryProvider = ({ children }) => {
  const [selectedEpisodesList, setSelectedEpisodesList] = useState([]);
  const [episode2, setEpisodes2] = useState(null); // Episode details
  const { setSelectedEpisodeId } = useEpisode(); // Use your hook in a functional component
 const addEpisode = (episode) => {
    // Log the episode being added
 
    // Ensure the episode has the necessary properties
    if (!episode || !episode.id || !episode.seriesId) {
      console.error('Invalid episode:', episode);
      return;
    }

    // Check for duplicates using a more explicit comparison
    const exists = selectedEpisodesList.some(ep => 
      ep.id === episode.id && ep.seriesId === episode.seriesId
    );

    if (!exists) {
      // If it does not exist, add it to the list
      setSelectedEpisodesList((prevEpisodes) => [...prevEpisodes, episode]);
      console.log("Episode added:", episode);
    } else {
      // If it exists, log that information
     }
  };



  const clearEpisodeHistory = useCallback(() => {
    setSelectedEpisodesList([]);
    setSelectedEpisodeId(null);
    setEpisodes2(null);
  }, [setSelectedEpisodeId]);

  return (
    <EpisodeHistoryContext.Provider
      value={{
        selectedEpisodesList,
        addEpisode,
        clearEpisodeHistory,
      }}
    >
      {children}
    </EpisodeHistoryContext.Provider>
  );
};

export default EpisodeHistoryProvider;
