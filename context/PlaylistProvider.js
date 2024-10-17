import React, { createContext, useContext, useState } from 'react';

const MyListIDContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [MyListID, setsMyListID] = useState(null);  // Same structure as EpisodeContext

  return (
    <MyListIDContext.Provider value={{ MyListID, setsMyListID }}>
      {children}
    </MyListIDContext.Provider>
  );
};

export const useMyId = () => {
  return useContext(MyListIDContext);  // Same hook structure
};
