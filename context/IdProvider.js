import React, { createContext, useContext, useState } from 'react';

const IdContext = createContext();

export const IdProvider = ({ children }) => {
  const [selectId, setselectid] = useState(null);  // Same structure as EpisodeContext

  return (
    <IdContext.Provider value={{ selectId, setselectid }}>
      {children}
    </IdContext.Provider>
  );
};

export const useID = () => {
  return useContext(IdContext);  // Same hook structure
};
