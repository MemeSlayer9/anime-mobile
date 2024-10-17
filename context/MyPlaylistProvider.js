// PlaylistProvider.js
import React, { createContext, useContext, useState } from 'react';
import { useMyId } from './PlaylistProvider';
const PlaylistContext = createContext();

export const usePlaylist = () => useContext(PlaylistContext);

export const MyPlaylistProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
     const [item, setItem] = useState(null);
    const { MyListID, setsMyListID } = useMyId();  // Correct destructuring

  const addEpisodeToPlaylist = (episode) => {
    setPlaylist((prevPlaylist) => {
      const alreadyExists = prevPlaylist.some((e) => e.id === episode.id);
      if (!alreadyExists) {
        return [...prevPlaylist, episode];
      }
      return prevPlaylist;
    });
  };

  const clearPlaylist = () => {
    setPlaylist([]);
         setItem(null); // Reset item to avoid duplicate additions
          setsMyListID(null); // Reset the selectId to ensure it can be reused

  };

  return (
    <PlaylistContext.Provider value={{ playlist, addEpisodeToPlaylist, clearPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};
