import React, { createContext, useState, useContext, useCallback } from 'react';

const EpisodeHistoryContext = createContext();

export const useEpisodeHistory = () => useContext(EpisodeHistoryContext);

export const EpisodeHistoryProvider = ({ children }) => {
  const [selectedEpisodesList, setSelectedEpisodesList] = useState([]);

  const moveEpisodeToTop = (episode) => {
    console.log('Before move:', selectedEpisodesList);
    setSelectedEpisodesList((prevHistory) => {
      const newHistory = [episode, ...prevHistory.filter((ep) => ep.episode_id !== episode.episode_id)];
      console.log('After move:', newHistory);
      return newHistory;
    });
  };

  const addEpisode = (episode) => {
    if (!episode || !episode.episode_id) {
      console.error('Invalid episode:', episode);
      return;
    }
    const exists = selectedEpisodesList.some((ep) => ep.episode_id === episode.episode_id);
    if (!exists) {
      setSelectedEpisodesList((prev) => [...prev, episode]);
    }
  };

  const clearEpisodeHistory = useCallback(() => {
    setSelectedEpisodesList([]);
  }, []);

  return (
    <EpisodeHistoryContext.Provider
      value={{
        selectedEpisodesList,
        addEpisode,
        moveEpisodeToTop,
        clearEpisodeHistory,
      }}
    >
      {children}
    </EpisodeHistoryContext.Provider>
  );
};
